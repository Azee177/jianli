# Resume Copilot Codebase Architecture

> Target: single-company, single-role resume tailoring workflow driven by OCR, JD ingestion, and LLM-assisted rewriting (per `brief.md`). Frontend UX references the provided dashboard layout.

## 1. Product Goals
- Deliver an end-to-end "deep research" resume tailoring experience that always locks to exactly one confirmed target role.
- Provide guided, multi-turn collaboration between user and LLM: intent collection, JD analysis, resume rewrites, interview prep, and export.
- Preserve factual accuracy while accelerating delivery of company-specific narratives and preparation materials.

### Non-goals
- Scoring or ranking resumes.
- Managing multi-target campaigns in parallel.
- Running server-side ATS submissions beyond providing official links and reminders.

## 2. High-Level Architecture

```
+---------------------------------------------------------------+
|                           Web App                            |
|  Next.js + React Query + XState                              |
+---------------^------------------------------+---------------+
                | GraphQL / HTTPS               | WebSocket chat
                |                               |
+---------------+------------------------------v---------------+
|                API Gateway (NestJS GraphQL + REST)           |
+---------------^----------------------------------------------+
                |
        Temporal/workflow RPC
                |
+---------------+---------------------+------------------------+
| Workflow Orchestrator (Temporal workers)                     |
+---------------^---------------------+------------------------+
                |                     |
   Redis queues |                     | Tool calls
                |                     v
+---------------+----------------------+-----------------------+
| LLM Orchestrator (LangChain router + prompts)                |
+---------------^--------------+----------------------+--------+
                |              |                      |
                |              |                      |
        +-------+-----+  +-----+--------+      +------+--------+
        | Document Svc |  | JD Fetcher  |      | Export Svc   |
        | OCR + AST    |  | Crawl/clean |      | PDF/DOCX     |
        +-------^------+  +-----^--------+      +------+--------+
                |              |                      |
        +-------+------+  +----+-----+         +------+--------+
        | PostgreSQL   |  | Redis   |         | Object Store  |
        +--------------+  +----------+        +---------------+
```

### Key Concepts
- State Machine Enforcement: XState on the client mirrors server workflow transitions guarded by the orchestrator.
- Async Tooling: OCR, JD scraping, company quarter rewrite, and export run as background jobs with streamed status.
- LLM Safety: Prompt templates enforce single-target context with guardrails for factual confirmation.

## 3. Technology Choices
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI, Zustand for local editor state, XState for the journey, React Query for data fetching, Socket.IO client for realtime updates.
- Backend: NestJS monorepo exposing GraphQL (queries/mutations) and REST (uploads/exports).
- Workflow Engine: Temporal.io (TypeScript SDK) for idempotent, resumable steps.
- LLM Layer: LangChain (Node) with semantic router across prompt templates; supports OpenAI/Azure and local fallback.
- Data: PostgreSQL for relational data, Redis for cache and queues, S3-compatible storage (MinIO local, AWS S3 production) for files.
- Ancillary: Playwright crawler for JD pages, DocxTemplater + pdf-lib for exports, pnpm workspace tooling.

## 4. Frontend Application Design
- Layout: Three-column grid replicating the screenshot - left intent and JD explorer, center resume diff editor, right company deliverables.
- State Management:
  - `targetWizardMachine` (XState) covers states from `UPLOAD` through `SUBMISSION_TRACKING`.
  - `resumeEditorStore` (Zustand) tracks selection, diff display, optimisitic edits.
  - Workflow events stream over Socket.IO using `journeyId`.
- Feature Modules:
  - `upload`: drag-and-drop, OCR status, avatar preview.
  - `intent`: conversational Q/A, single-confirm role cards.
  - `jd`: fetch status, JD viewer, editable common dimension checkboxes.
  - `resume`: Monaco diff editor, suggestion sidebar, selection-to-chat actions.
  - `companyQuarter`: locked one-quarter block composer with template prompts.
  - `prep`: curated learning plan, resource links, tracking toggles.
  - `interview`: generated question tree, note-taking.
  - `export`: format selector, download center, submission board hook.
- Error Handling: `JourneyGuard` listens to workflow transitions and enforces reselection resets when target role changes.

## 5. Backend Modules

### 5.1 API Gateway (`apps/api`)
- GraphQL schema enforces a single `target_role` per journey.
- File upload REST endpoints for resume PDF and JD screenshot.
- Clerk/Auth0 backed authentication with per-journey rate limiting.

### 5.2 Workflow Orchestrator (`packages/orchestrator`)
- Temporal workflows per `journeyId` manage OCR, JD ingestion, rewrite loops, export jobs.
- Emits transition events to Redis Pub/Sub for realtime pushes.
- Handles reselection logic by clearing downstream data while preserving OCR artifacts.

### 5.3 LLM Orchestrator (`packages/llm-agent`)
- Prompt catalog aligned with brief: JD commonization, draft v1, rewrite iterations, company quarter, prep kit, interview tree.
- Toolset bindings for resume AST queries, JD snippet retrieval, metrics validation, job link lookup.
- Implements yellow-flag confirmations before committing high-impact changes.

### 5.4 Document Service (`packages/documents`)
- OCR pipeline: pdf2image -> Tesseract -> LayoutParser -> AST normalization (`resume_ast.json`).
- Template manager stores resume layouts and avatar placement metadata.

### 5.5 JD Fetcher (`packages/jd-fetcher`)
- Pulls official JD by stored URL, falls back to Bing search or manual paste with OCR.
- Normalizes to schema `{company, role, level, location, duties[], requirements[], niceToHave[], kpiHints[]}`.

### 5.6 Export Service (`packages/export-service`)
- Generates DOCX and PDF from locked resume version with avatar embedding.
- Writes artifacts to object storage and returns signed URLs.
- Drives submission board updates for reminders and logs.

## 6. Data Model Sketch (PostgreSQL)

```
users
|- id (uuid PK)
|- email
`- profile_jsonb

journeys
|- id (uuid PK)
|- user_id (FK)
|- status enum (UPLOAD|PARSE_OK|...|SUBMISSION_TRACKING)
|- target_role jsonb
|- locked_common_dims jsonb
|- resume_version_id (FK)
|- created_at
`- updated_at

resume_versions
|- id
|- journey_id
|- type enum (ORIGINAL|DRAFT_V1|ITERATION|COMPANY_QUARTER|FINAL)
|- ast jsonb
|- diff_meta jsonb
`- created_at

jd_sources
|- id
|- journey_id
|- source_type enum (URL|UPLOAD|MANUAL)
|- raw_content text
|- normalized jsonb
`- fetched_at

prep_kits, interview_trees, export_jobs, submission_logs...
```

Redis keys:
- `journey:{id}:state` cached snapshot for fast gating.
- `journey:{id}:queue` job coordination.
- `socket:{sessionId}` handshake tokens.

Object storage layout:
- `uploads/{journeyId}/resume-original.pdf`
- `ast/{journeyId}/resume_ast.json`
- `exports/{journeyId}/final-resume.docx|pdf`

## 7. API Surface

| Operation | Type | Description |
|-----------|------|-------------|
| `mutation uploadResume(file)` | REST | Returns `journeyId`, triggers OCR workflow. |
| `query journey(id)` | GraphQL | Fetches state, target role, progress markers. |
| `mutation confirmTarget(input)` | GraphQL | Locks single target and resets downstream data. |
| `subscription journeyEvents(journeyId)` | GraphQL WS | Streams state changes and tool status updates. |
| `mutation lockCommonDimensions(dims)` | GraphQL | Persists curated JD common factors. |
| `mutation requestDraftVersion(input)` | GraphQL | Starts draft workflow and returns job id. |
| `mutation applyRewrite(selection, prompt)` | GraphQL | Enqueues rewrite job and returns diff when ready. |
| `mutation finalizeCompanyQuarter(input)` | GraphQL | Stores locked company quarter block. |
| `mutation generatePrepKit()` | GraphQL | Produces learning plan resources. |
| `mutation generateInterviewTree()` | GraphQL | Generates interview question tree. |
| `mutation exportResume(format)` | REST | Creates export job and delivers signed URL. |
| `mutation reselectTarget(confirm)` | GraphQL | Performs hard reset after user confirmation. |

REST webhooks (internal) notify the API when Temporal activities complete and when export jobs finish.

## 8. Repository Structure

```
.
|- apps/
|  |- web/                 # Next.js frontend
|  |  |- app/              # Routes (wizard pages, diff editor)
|  |  |- components/
|  |  |- machines/         # XState definitions
|  |  |- hooks/
|  |  |- lib/              # GraphQL client, formatters
|  |  |- styles/
|  |- api/                 # NestJS GraphQL/REST gateway
|  |  |- src/
|  |  |  |- modules/       # upload, intent, jd, resume, export
|  |  |  |- schema/        # GraphQL resolvers/types
|  |  |  |- main.ts
|  |  |- test/
|  |- realtime/            # Socket.IO gateway for streaming events
|     |- src/
|- packages/
|  |- orchestrator/        # Temporal workflows and activities
|  |- llm-agent/           # Prompt templates and tool runners
|  |- documents/           # OCR and resume AST normalizer
|  |- jd-fetcher/          # JD crawling and normalization
|  |- export-service/      # DOCX/PDF generator
|  |- shared-db/           # Prisma schema and migrations
|  |- ui-kit/              # Shared design system components
|- infra/
|  |- docker/              # Local stack (Postgres, Redis, MinIO, Temporal)
|  |- terraform/           # Cloud provisioning
|  |- github-actions/
|- docs/
|  |- architecture.md
|  |- prompts/             # Versioned prompt templates
|- scripts/
|  |- bootstrap.ts
|  |- seed-demo.ts
|- package.json            # pnpm workspace root
|- pnpm-workspace.yaml
```

## 9. Workflow Mapping

| State | Trigger | Activities | Outputs |
|-------|---------|------------|---------|
| `UPLOAD` | resume upload | OCR -> AST, avatar extraction | `resume_ast.json`, `user_avatar` |
| `PARSE_OK` | OCR completed | - | user enters intent wizard |
| `TARGET_CONFIRMED` | `confirmTarget` | reset downstream data | `target_role` row |
| `JD_FETCHED` | `fetchJD` job | crawling -> cleaning | `jd_clean.json` |
| `COMMON_DIMS_LOCKED` | user locks dims | persist dims | `common_dims.json` |
| `DRAFT_V1` | `requestDraftVersion` | LLM rewrite, diff compute | `rewrite_v1.json`, `gap_suggestions` |
| `REWRITE_LOOP` | iterative edits | selection rewrite, validations | `rewrite_versions[]` |
| `COMPANY_QUARTER_DONE` | finalize block | prompt plus review | `company_quarter_block` |
| `PREP_READY` | generate prep kit | LLM plus link aggregator | `prep_kit.json` |
| `INTERVIEW_READY` | generate interview tree | LLM question tree | `interview_tree.json` |
| `EXPORTABLE` | export job | DOCX/PDF render | stored artifacts |
| `SUBMISSION_TRACKING` | board update | log submission | `submission_logs` |

## 10. Observability and Safety
- Structured logging (pino) with journey and step tags.
- Metrics: state transition success rate, LLM token usage, OCR accuracy, export latency.
- Alerts on stalled Temporal workflows, repeated JD fetch failures, or export retries.
- Audit log for every LLM-generated change with diff snapshots to support rollbacks.

## 11. Development Flow
- pnpm workspaces with shared ESLint and Prettier configs.
- Storybook for UI kit components that implement the dashboard layout.
- Playwright end-to-end tests for the happy path (upload through export).
- Contract tests for GraphQL schema against orchestrator activities.

## 12. Future Extensions
- Support for multi-target backlogs (requires new UX and state model).
- ATS autofill bots (needs compliance and user consent review).
- Offline resume editing sync with conflict resolution.

This architecture keeps the single-target invariant at every layer, enforces the state machine defined in `brief.md`, and structures the codebase to scale modularly across OCR, LLM orchestration, and export services.

