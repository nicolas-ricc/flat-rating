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

### Phase 3: Interpreter Service ⏳ PENDING

- [ ] `back/interpreter/interpreter/main.py` - HTTP server
- [ ] `back/interpreter/interpreter/config.py` - Environment config
- [ ] `back/interpreter/interpreter/summarizer.py` - Phi-3 wrapper
- [ ] `back/interpreter/interpreter/handlers.py` - Request handlers
- [ ] Update `pyproject.toml` with minimal dependencies

---

### Phase 4: Frontend Integration ⏳ PENDING

- [ ] `front/src/app/actions/buildings.ts` - Server actions
- [ ] `front/src/app/actions/comments.ts` - Server actions
- [ ] Update `front/src/app/page.tsx` - Replace mock data
- [ ] Update `front/src/app/apartment/[id]/page.tsx` - Replace mock data
- [ ] Update `front/src/app/add-apartment/page.tsx` - Connect to API

---

### Phase 5: Docker Integration ⏳ PENDING

- [ ] `back/rating-crud/Dockerfile`
- [ ] `back/interpreter/Dockerfile`
- [ ] `front/Dockerfile`
- [ ] Update `docker-compose.yml` with all services

---

## Quick Commands

```bash
# Start PostgreSQL
docker compose up -d postgres

# Backend development
cd back/rating-crud && npm run dev

# Frontend development
cd front && npm run dev

# Type check backend
cd back/rating-crud && npx tsc --noEmit
```

---

## Project Structure (Current)

```
flat-rating/
├── ARCHITECTURE_SPEC.md          # Full architecture documentation
├── CLAUDE.md                     # This file - development progress
├── docker-compose.yml            # PostgreSQL service
│
├── back/
│   ├── migrations/
│   │   └── 001_init.sql          # Database schema
│   │
│   ├── rating-crud/              # Express backend ✅ COMPLETE
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
│   │       └── modules/          # ✅ Complete
│   │           ├── building/     # types, repository, service, controller
│   │           ├── comment/      # types, repository, service, controller
│   │           └── summary/      # types, repository, service, controller
│   │
│   └── interpreter/              # ⏳ Pending Phase 3
│
└── front/                        # ⏳ Has mock data, pending Phase 4
```

---

## API Endpoints

| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/api/buildings` | ✅ |
| GET | `/api/buildings/:id` | ✅ |
| POST | `/api/buildings` | ✅ |
| GET | `/api/buildings/:id/comments` | ✅ |
| POST | `/api/buildings/:id/comments` | ✅ |
| PUT | `/api/summaries/:buildingId` | ✅ |
| GET | `/api/summaries/:buildingId` | ✅ |

---

## Event Flow

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
              Event Handler
                    │
                    ▼
         POST to Interpreter /api/summarize
              (fire and forget)
```

---

## Notes

- Using raw SQL with pg (no ORM) for simplicity
- Event bus uses Node.js EventEmitter (no external deps)
- Interpreter communicates via HTTP webhooks
- Frontend uses Next.js Server Actions for API calls
- All modules follow same pattern: types → repository → service → controller
- Validation and NotFound errors handled consistently in controllers
