# Flat Rating - Development Progress

## Project Overview

Web application for apartment building reviews with AI-generated summaries.
- **Architecture**: Modular monolith + event-driven async summarization
- **Full spec**: See `ARCHITECTURE_SPEC.md`

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL 16 |
| Interpreter | Python + http.server |
| LLM | Phi-3-mini-4k-instruct |

---

## Implementation Progress

### Phase 1: Infrastructure Setup ✅ COMPLETE

**Step 1.1: Docker Compose Configuration** ✅
- File: `docker-compose.yml`
- PostgreSQL 16-alpine with healthcheck
- Volume for persistence, migrations auto-loaded

**Step 1.2: Database Migration** ✅
- File: `back/migrations/001_init.sql`
- Tables: buildings, comments, summaries
- Full-text search index on buildings (address + name)

**Step 1.3: Backend Project Setup** ✅
- Location: `back/rating-crud/`
- Dependencies: express, pg, dotenv (104 packages total)
- TypeScript configured (ES2022, NodeNext modules)
- Infrastructure layer complete:
  - `src/infrastructure/config/` - Environment config
  - `src/infrastructure/database/` - pg Pool + row types
  - `src/infrastructure/events/` - Typed EventBus + handlers

---

### Phase 2: Backend Module Layer ✅ COMPLETE

**Step 2.1: Building Module** ✅
- `src/modules/building/building.types.ts` - Building, BuildingWithSummary, CreateBuildingInput
- `src/modules/building/building.repository.ts` - findAll (with search), findById, findByIdWithSummary, create, exists
- `src/modules/building/building.service.ts` - list, getById, create, exists + ValidationError/NotFoundError
- `src/modules/building/building.controller.ts` - GET /, GET /:id, POST /

**Step 2.2: Comment Module** ✅
- `src/modules/comment/comment.types.ts` - Comment, CreateCommentInput, ListCommentsQuery
- `src/modules/comment/comment.repository.ts` - findByBuildingId, create, countByBuildingId, getAverageRatingByBuildingId
- `src/modules/comment/comment.service.ts` - listByBuildingId, create (emits COMMENT_ADDED event), getStats
- `src/modules/comment/comment.controller.ts` - GET /, POST /

**Step 2.3: Summary Module** ✅
- `src/modules/summary/summary.types.ts` - Summary, UpdateSummaryInput
- `src/modules/summary/summary.repository.ts` - findByBuildingId, upsert
- `src/modules/summary/summary.service.ts` - getByBuildingId, update
- `src/modules/summary/summary.controller.ts` - PUT /:buildingId, GET /:buildingId

**Step 2.4: Route Wiring** ✅
- Updated `src/server.ts` with all routers
- Routes: /api/buildings, /api/buildings/:buildingId/comments, /api/summaries

---

### Phase 3: Interpreter Service ✅ COMPLETE

**Step 3.1: Project Configuration** ✅
- `pyproject.toml` - Minimal dependencies (transformers, torch, accelerate, requests, python-dotenv)
- `.env` / `.env.example` - PORT, BACK_API_URL, MODEL_NAME

**Step 3.2: Config Module** ✅
- `interpreter/config.py` - Environment variable loading with validation

**Step 3.3: Summarizer Module** ✅
- `interpreter/summarizer.py` - Phi-3-mini-4k-instruct wrapper
- Singleton pattern for model instance
- Prompt template for apartment review summarization
- Lazy loading with explicit `load()` method

**Step 3.4: Handlers Module** ✅
- `interpreter/handlers.py` - Business logic for summarization
- Fetches comments from backend API
- Generates summary using LLM
- Updates summary via backend API
- Error handling for timeouts and connection errors

**Step 3.5: HTTP Server** ✅
- `interpreter/main.py` - Minimal http.server implementation
- `GET /health` - Health check endpoint
- `POST /api/summarize` - Trigger summarization for a building
- Model loaded at startup

---

### Phase 4: Frontend Integration ✅ COMPLETE

**Step 4.1: Server Actions** ✅
- `front/src/app/actions/buildings.ts` - getBuildings, getBuilding, createBuilding
- `front/src/app/actions/comments.ts` - getComments, createComment
- ActionResult<T> type for consistent error handling
- Backend API URL from BACKEND_URL env variable

**Step 4.2: Home Page** ✅
- `front/src/app/page.tsx` - Server component with real data
- `front/src/app/search-form.tsx` - Client component for search
- Building grid displays all buildings from database
- Search by address or building name
- Error handling for backend connection issues

**Step 4.3: Building Detail Page** ✅
- `front/src/app/apartment/[id]/page.tsx` - Server component with real data
- `front/src/app/apartment/[id]/feedback-form.tsx` - Client component for adding feedback
- Displays building info, AI summary, and recent comments
- Quick stats sidebar with review count and average rating
- notFound() handling for invalid building IDs

**Step 4.4: Add Apartment Page** ✅
- `front/src/app/add-apartment/page.tsx` - Connected to API
- Creates building first, then adds initial comment
- Star rating selector (1-5)
- Form validation with error display
- Redirects to new building page on success

---

### Phase 5: Docker Integration ✅ COMPLETE

**Step 5.1: Backend Dockerfile** ✅
- `back/rating-crud/Dockerfile` - Multi-stage build (builder + runner)
- Node 22 Alpine, TypeScript compiled to JS
- Non-root user for security
- `back/rating-crud/.dockerignore` - Excludes node_modules, tests, dist

**Step 5.2: Interpreter Dockerfile** ✅
- `back/interpreter/Dockerfile` - Python 3.12 slim
- Poetry for dependency management
- Non-root user for security
- `back/interpreter/.dockerignore` - Excludes __pycache__, venv, tests

**Step 5.3: Frontend Dockerfile** ✅
- `front/Dockerfile` - Multi-stage build (builder + runner)
- Node 22 Alpine, Next.js standalone output
- Non-root user for security
- `front/.dockerignore` - Excludes node_modules, .next
- Updated `next.config.ts` - Added `output: "standalone"`

**Step 5.4: Docker Compose** ✅
- Updated `docker-compose.yml` with all 4 services
- Service dependencies configured (postgres → backend → interpreter/frontend)
- Environment variables for inter-service communication
- Health checks for PostgreSQL

---

## Quick Commands

```bash
# === Docker (Production) ===

# Start all services
docker compose up -d

# Start all services and rebuild
docker compose up -d --build

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# === Local Development ===

# Start PostgreSQL only
docker compose up -d postgres

# Backend development
cd back/rating-crud && npm run dev

# Frontend development (set BACKEND_URL in .env.local)
# BACKEND_URL=http://localhost:3001
cd front && npm run dev

# Interpreter development (requires poetry install first)
cd back/interpreter && poetry install
cd back/interpreter && poetry run python -m interpreter.main

# Type check backend
cd back/rating-crud && npx tsc --noEmit

# Run backend tests
cd back/rating-crud && npm test
```

---

## Project Structure (Current)

```
flat-rating/
├── ARCHITECTURE_SPEC.md          # Full architecture documentation
├── CLAUDE.md                     # This file - development progress
├── docker-compose.yml            # All services orchestration
│
├── back/
│   ├── migrations/
│   │   └── 001_init.sql          # Database schema
│   │
│   ├── rating-crud/              # Express backend ✅ COMPLETE
│   │   ├── Dockerfile            # Multi-stage Node build
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts          # Entry point
│   │       ├── server.ts         # Express app + routes
│   │       ├── infrastructure/   # ✅ Complete
│   │       │   ├── config/
│   │       │   ├── database/
│   │       │   └── events/
│   │       ├── modules/          # ✅ Complete
│   │       │   ├── building/     # + building.test.ts
│   │       │   ├── comment/      # + comment.test.ts
│   │       │   └── summary/      # + summary.test.ts
│   │       └── test/             # ✅ Test infrastructure
│   │           ├── setup.ts
│   │           ├── mock-db.ts
│   │           └── helpers.ts
│   │
│   └── interpreter/              # Python summarizer ✅ COMPLETE
│       ├── Dockerfile            # Python 3.12 + Poetry
│       ├── .dockerignore
│       ├── pyproject.toml
│       ├── .env
│       └── interpreter/
│           ├── __init__.py
│           ├── main.py           # HTTP server (port 8001)
│           ├── config.py         # Environment config
│           ├── summarizer.py     # Phi-3 LLM wrapper
│           └── handlers.py       # Request handlers
│
└── front/                        # ✅ COMPLETE - Connected to backend
    ├── Dockerfile                # Multi-stage Next.js standalone
    ├── .dockerignore
    ├── next.config.ts            # output: "standalone"
    └── src/app/
        ├── actions/
        │   ├── buildings.ts      # Server actions for buildings API
        │   └── comments.ts       # Server actions for comments API
        ├── page.tsx              # Home page with real data
        ├── search-form.tsx       # Search client component
        ├── add-apartment/
        │   └── page.tsx          # Create building form
        └── apartment/[id]/
            ├── page.tsx          # Building detail page
            └── feedback-form.tsx # Add feedback client component
```

---

## Docker Services

| Service | Port | Base Image | Description |
|---------|------|------------|-------------|
| postgres | 5432 | postgres:16-alpine | Database with auto-migrations |
| backend | 3001 | node:22-alpine | Express API server |
| interpreter | 8001 | python:3.12-slim | LLM summarization service |
| frontend | 3000 | node:22-alpine | Next.js web application |

**Notes:**
- First startup of interpreter downloads Phi-3 model (~2.5GB)
- Backend waits for postgres healthcheck before starting
- All services use non-root users for security
- Environment variables configured in docker-compose.yml

---

## API Endpoints

### Backend (Express - Port 3001)

| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/api/buildings` | ✅ |
| GET | `/api/buildings/:id` | ✅ |
| POST | `/api/buildings` | ✅ |
| GET | `/api/buildings/:id/comments` | ✅ |
| POST | `/api/buildings/:id/comments` | ✅ |
| PUT | `/api/summaries/:buildingId` | ✅ |
| GET | `/api/summaries/:buildingId` | ✅ |

### Interpreter (Python - Port 8001)

| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/health` | ✅ |
| POST | `/api/summarize` | ✅ |

---

## Event Flow (Complete)

```
POST /api/buildings/:id/comments
         │
         ▼
   CommentService.create()
         │
         ├──▶ Save to DB
         │
         └──▶ eventBus.emit(COMMENT_ADDED)
                    │
                    ▼
              Event Handler (handlers.ts)
                    │
                    ▼
         POST to Interpreter /api/summarize
              { buildingId }
                    │
                    ▼
         ┌─────────────────────────────────┐
         │       Interpreter Service       │
         │  1. GET /api/buildings/:id/     │
         │     comments (from Backend)     │
         │  2. Generate summary (Phi-3)    │
         │  3. PUT /api/summaries/:id      │
         │     (to Backend)                │
         └─────────────────────────────────┘
```

---

## Testing

### Backend Unit Tests ✅

Using Node.js built-in test runner (`node:test`) with zero external dependencies.

**Test Files:**
- `src/modules/building/building.test.ts` - 13 tests
- `src/modules/comment/comment.test.ts` - 12 tests
- `src/modules/summary/summary.test.ts` - 11 tests

**Test Infrastructure:**
- `src/test/setup.ts` - Test server setup and HTTP request helper
- `src/test/mock-db.ts` - In-memory mock database (simulates pg Pool)
- `src/test/helpers.ts` - Additional test utilities

**Coverage:**
- Request/response structure validation
- Success scenarios for all endpoints
- Error handling (400, 404, 500)
- Input validation (required fields, value ranges)
- Pagination support

**Run Tests:**
```bash
cd back/rating-crud && npm test
```

---

## Notes

- Using raw SQL with pg (no ORM) for simplicity
- Event bus uses Node.js EventEmitter (no external deps)
- Interpreter communicates via HTTP webhooks
- Frontend uses Next.js Server Actions for API calls
- All modules follow same pattern: types → repository → service → controller
- Validation and NotFound errors handled consistently in controllers
- Interpreter uses singleton pattern for LLM model (loaded once at startup)
- Summarization is fire-and-forget (async, doesn't block comment creation)
- Tests use mock database - no PostgreSQL required for testing
