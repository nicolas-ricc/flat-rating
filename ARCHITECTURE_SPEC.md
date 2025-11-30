# Flat Rating - Architecture Specification

## Overview

A web application for apartment building reviews with AI-generated summaries. Built as a **modular monolith** with **event-driven async summarization**.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 15 + React 19 | Already configured, server actions for API calls |
| Backend | Express.js + TypeScript | Lightweight, explicit routing, no decorator magic |
| Database | PostgreSQL 16 | Relational data, ACID, full-text search |
| Interpreter | Python + http.server | Minimal deps, single responsibility |
| LLM | Phi-3-mini-4k-instruct | Open source, runs locally, 4k context sufficient |
| Orchestration | Docker Compose | Local development, service isolation |

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND                                    │
│                         Next.js (Port 3000)                            │
│                                                                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│   │  Home Page   │  │  Building    │  │  Add Building / Comment  │   │
│   │  + Search    │  │  Detail      │  │  Forms                   │   │
│   └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│                                                                        │
│                        Server Actions                                  │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                     │
│                       Express.js (Port 3001)                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                        Router Layer                            │  │
│   │   /api/buildings    /api/buildings/:id/comments    /api/...    │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                       Module Layer                             │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │
│   │  │   Building   │  │   Comment    │  │       Summary        │ │  │
│   │  │   Module     │  │   Module     │  │       Module         │ │  │
│   │  │              │  │              │  │                      │ │  │
│   │  │ controller   │  │ controller   │  │ controller           │ │  │
│   │  │ service      │  │ service ─────┼──┼─▶ event emission     │ │  │
│   │  │ repository   │  │ repository   │  │ service              │ │  │
│   │  └──────────────┘  └──────────────┘  │ repository           │ │  │
│   │                                      └──────────────────────┘ │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                    Infrastructure Layer                        │  │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │
│   │  │   Database   │  │  Event Bus   │  │      Config          │ │  │
│   │  │   (pg pool)  │  │ (EventEmitter)│  │   (env vars)        │ │  │
│   │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
                          PostgreSQL (Port 5432)
                               │
┌──────────────────────────────┼─────────────────────────────────────────┐
│                              │                                         │
│            Event: COMMENT_ADDED ──────▶ HTTP POST /api/summarize      │
│                                                   │                    │
│                                                   ▼                    │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                        INTERPRETER                             │  │
│   │                    Python (Port 8001)                          │  │
│   │                                                                │  │
│   │   ┌────────────────┐    ┌────────────────────────────────┐    │  │
│   │   │  HTTP Handler  │───▶│  Summarizer (Phi-3-mini-4k)    │    │  │
│   │   └────────────────┘    └────────────────────────────────┘    │  │
│   │           │                                                    │  │
│   │           │  1. GET /api/buildings/:id/comments (from Back)   │  │
│   │           │  2. Generate summary with LLM                      │  │
│   │           │  3. PUT /api/summaries/:id (to Back)              │  │
│   │           ▼                                                    │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Entity Relationship

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    buildings    │       │    comments     │       │    summaries    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ building_id (FK)│       │ building_id(PK) │
│ name            │       │ id (PK)         │       │ content         │
│ address         │       │ rating          │       │ average_rating  │
│ address_search  │       │ content         │       │ comment_count   │
│ price_range     │       │ created_at      │       │ last_updated    │
│ description     │       └─────────────────┘       └─────────────────┘
│ created_at      │               │                         │
│ updated_at      │◄──────────────┴─────────────────────────┘
└─────────────────┘                    1:1
        1:N
```

### PostgreSQL Schema

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Buildings table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    address_search TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', address || ' ' || name)) STORED,
    price_range VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_buildings_address_search ON buildings USING GIN(address_search);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_building_id ON comments(building_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Summaries table (one per building, updated async)
CREATE TABLE summaries (
    building_id UUID PRIMARY KEY REFERENCES buildings(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    average_rating DECIMAL(2,1) DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Directory Structure

```
flat-rating/
├── docker-compose.yml
├── ARCHITECTURE_SPEC.md
│
├── back/
│   ├── migrations/
│   │   └── 001_init.sql
│   │
│   ├── rating-crud/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.ts                      # Entry point
│   │       ├── server.ts                     # Express app setup
│   │       │
│   │       ├── modules/
│   │       │   ├── building/
│   │       │   │   ├── building.controller.ts
│   │       │   │   ├── building.service.ts
│   │       │   │   ├── building.repository.ts
│   │       │   │   └── building.types.ts
│   │       │   │
│   │       │   ├── comment/
│   │       │   │   ├── comment.controller.ts
│   │       │   │   ├── comment.service.ts
│   │       │   │   ├── comment.repository.ts
│   │       │   │   └── comment.types.ts
│   │       │   │
│   │       │   └── summary/
│   │       │       ├── summary.controller.ts
│   │       │       ├── summary.service.ts
│   │       │       ├── summary.repository.ts
│   │       │       └── summary.types.ts
│   │       │
│   │       └── infrastructure/
│   │           ├── database/
│   │           │   ├── connection.ts         # pg Pool singleton
│   │           │   └── types.ts              # Row type definitions
│   │           │
│   │           ├── events/
│   │           │   ├── event-bus.ts          # Typed EventEmitter
│   │           │   ├── event-types.ts        # Event payload types
│   │           │   └── handlers.ts           # Event handler registration
│   │           │
│   │           └── config/
│   │               └── index.ts              # Environment config
│   │
│   └── interpreter/
│       ├── pyproject.toml
│       ├── Dockerfile
│       └── interpreter/
│           ├── __init__.py
│           ├── main.py                       # HTTP server entry
│           ├── config.py                     # Environment config
│           ├── summarizer.py                 # LLM wrapper
│           └── handlers.py                   # Request handlers
│
└── front/
    └── src/
        ├── app/
        │   ├── page.tsx                      # Home (search + list)
        │   ├── apartment/[id]/page.tsx       # Building detail
        │   ├── add-apartment/page.tsx        # Add building form
        │   └── actions/
        │       ├── buildings.ts              # Server actions
        │       └── comments.ts               # Server actions
        │
        └── lib/
            └── api.ts                        # API client helpers
```

---

## API Specification

### Backend REST API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/buildings` | List/search buildings | Query: `?search=` | `Building[]` |
| GET | `/api/buildings/:id` | Get building with summary | - | `BuildingDetail` |
| POST | `/api/buildings` | Create building | `CreateBuilding` | `Building` |
| GET | `/api/buildings/:id/comments` | Get building comments | Query: `?limit=&offset=` | `Comment[]` |
| POST | `/api/buildings/:id/comments` | Add comment | `CreateComment` | `Comment` |
| PUT | `/api/summaries/:buildingId` | Update summary (internal) | `UpdateSummary` | `Summary` |

### Interpreter API

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/summarize` | Trigger summarization | `{ buildingId: string }` |

### Type Definitions

```typescript
// Building types
interface Building {
  id: string;
  name: string;
  address: string;
  priceRange: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BuildingDetail extends Building {
  summary: Summary | null;
  recentComments: Comment[];
}

interface CreateBuilding {
  name: string;
  address: string;
  priceRange?: string;
  description?: string;
}

// Comment types
interface Comment {
  id: string;
  buildingId: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface CreateComment {
  rating: number;
  content: string;
}

// Summary types
interface Summary {
  buildingId: string;
  content: string;
  averageRating: number;
  commentCount: number;
  lastUpdated: string;
}

interface UpdateSummary {
  content: string;
  averageRating: number;
  commentCount: number;
}
```

---

## Event System

### Event Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Comment POST   │────▶│ CommentService  │────▶│   Event Bus     │
│  /api/.../      │     │   .create()     │     │ COMMENT_ADDED   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   Interpreter   │◀────│  Event Handler  │
                        │  HTTP POST      │     │  (async, fire   │
                        │  /api/summarize │     │   and forget)   │
                        └────────┬────────┘     └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ GET comments    │     │ Generate        │     │ PUT summary     │
│ from Backend    │     │ summary (LLM)   │     │ to Backend      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Event Types

```typescript
// back/rating-crud/src/infrastructure/events/event-types.ts

export const EventTypes = {
  COMMENT_ADDED: 'COMMENT_ADDED',
} as const;

export interface EventPayloads {
  COMMENT_ADDED: {
    buildingId: string;
    commentId: string;
  };
}
```

---

## Implementation Plan

### Phase 1: Infrastructure Setup

**Step 1.1: Docker Compose Configuration**
- Configure PostgreSQL service
- Configure network for service communication
- Set up volume for database persistence

**Step 1.2: Database Migration**
- Create `back/migrations/001_init.sql` with schema
- Configure auto-execution on container startup

**Step 1.3: Backend Project Setup**
- Initialize package.json with dependencies
- Configure TypeScript
- Create environment configuration

### Phase 2: Backend Infrastructure Layer

**Step 2.1: Database Connection**
- Create pg Pool singleton
- Implement connection configuration from env
- Add graceful shutdown handling

**Step 2.2: Event Bus**
- Implement typed EventEmitter wrapper
- Define event types and payloads
- Create handler registration system

**Step 2.3: Configuration Module**
- Centralize environment variable access
- Add validation for required variables

### Phase 3: Backend Module Layer

**Step 3.1: Building Module**
- Repository: CRUD operations + search query
- Service: Business logic + validation
- Controller: Route handlers
- Wire up routes in Express

**Step 3.2: Comment Module**
- Repository: CRUD operations
- Service: Create with event emission
- Controller: Route handlers
- Wire up routes in Express

**Step 3.3: Summary Module**
- Repository: Upsert operation
- Service: Update logic
- Controller: PUT endpoint (internal)
- Wire up routes in Express

### Phase 4: Event Handler Integration

**Step 4.1: Interpreter Webhook Handler**
- Register COMMENT_ADDED handler
- Implement HTTP POST to interpreter
- Add error handling (log and continue)

### Phase 5: Interpreter Service

**Step 5.1: HTTP Server**
- Implement minimal http.server
- Create POST /api/summarize endpoint
- Add health check endpoint

**Step 5.2: Summarizer Module**
- Load Phi-3-mini-4k-instruct model
- Implement prompt template
- Create generation function

**Step 5.3: Integration Logic**
- Fetch comments from backend
- Generate summary
- POST summary to backend

### Phase 6: Frontend Integration

**Step 6.1: Server Actions**
- Create building actions (list, get, create)
- Create comment actions (list, create)
- Handle errors consistently

**Step 6.2: Update Pages**
- Replace mock data in home page
- Replace mock data in building detail page
- Connect form submissions to actions

**Step 6.3: Search Implementation**
- Add search input to home page
- Implement debounced search
- Display search results

### Phase 7: Docker Integration

**Step 7.1: Backend Dockerfile**
- Multi-stage build for smaller image
- Production dependencies only

**Step 7.2: Interpreter Dockerfile**
- Python base with CUDA support
- Model caching strategy

**Step 7.3: Frontend Dockerfile**
- Next.js standalone build
- Environment variable injection

**Step 7.4: Full Stack Testing**
- Verify all services communicate
- Test event flow end-to-end
- Validate summary generation

---

## Dependencies

### Backend (back/rating-crud/package.json)

```json
{
  "name": "rating-crud",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "pg": "^8.13.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.11.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

### Interpreter (back/interpreter/pyproject.toml)

```toml
[tool.poetry]
name = "interpreter"
version = "0.1.0"
description = "Summarization service for flat-rating"
authors = ["nicolas-ricc <nicolas.riccomini@gmail.com>"]

[tool.poetry.dependencies]
python = ">=3.12,<3.14"
transformers = "^4.44.0"
torch = "^2.4.0"
accelerate = "^0.33.0"
requests = "^2.32.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Frontend (already configured)

No changes needed. Current dependencies sufficient.

---

## Configuration

### Backend Environment Variables

```bash
# back/rating-crud/.env
PORT=3001
DATABASE_URL=postgres://flatrating:flatrating_dev@localhost:5432/flatrating
INTERPRETER_URL=http://localhost:8001
```

### Interpreter Environment Variables

```bash
# back/interpreter/.env
PORT=8001
BACK_API_URL=http://localhost:3001
MODEL_NAME=microsoft/Phi-3-mini-4k-instruct
```

### Frontend Environment Variables

```bash
# front/.env.local
BACK_API_URL=http://localhost:3001
```

---

## SOLID Principles Mapping

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each module (building, comment, summary) handles one domain. Repository handles data, Service handles logic, Controller handles HTTP. |
| **Open/Closed** | Event system allows new handlers without modifying CommentService. New event types can be added to EventTypes. |
| **Liskov Substitution** | Repository interfaces allow test doubles. Services depend on repository contracts. |
| **Interface Segregation** | Controllers expose only needed endpoints. Services expose only needed methods to controllers. |
| **Dependency Inversion** | Services receive repositories via constructor. Event handlers depend on EventBus interface. |

---

## Error Handling Strategy

### Backend
- Controllers catch service errors and return appropriate HTTP status
- Services throw typed errors (NotFoundError, ValidationError)
- Repository errors bubble up as database errors
- Event handler errors are logged but don't affect response

### Interpreter
- HTTP errors return 500 with error message
- Model loading errors prevent startup
- Backend communication errors are logged, summarization skipped

### Frontend
- Server actions return Result type `{ data, error }`
- Components display error state when needed
- Form submissions show loading/error states
