# Citizen One — backend architecture

This document describes the **layered layout** introduced for long-term maintenance and for swapping JSON persistence with a database without rewriting HTTP handlers or domain rules.

## Layers (dependency direction: top → bottom only)

```
interfaces/http     Express routes, error mapping → JSON
       ↓
application         Use cases (orchestration): ServiceDeskService, ApplicationProcessingService
       ↓
domain              Entities, role policies, workflow state machines, eligibility seams
       ↓
infrastructure      Repositories (JSON today), AuditService wrapper
       ↓
lib                 Low-level helpers kept for gradual migration (dataStore, userStore, sanitize, notify)
```

**Rules**

- Routes do not read `readCollection` / `writeCollection` directly for service desk or programme applications; they call **application services** and map `DomainError` subclasses to status codes.
- **Domain** has no Express imports and no knowledge of HTTP.
- **Repositories** are the only place that chooses how rows are stored (swap `JsonCollectionRepository` for SQL implementations later).

## Domain model (object-oriented)

### User / role

- **`RoleBehavior`** (`domain/user/RoleBehavior.js`): normalised role string plus a **policy object** per role (can submit service requests, can see queue, can review applications, etc.).
- **`Principal`** (`domain/user/Principal.js`): authenticated actor built from JWT payload; exposes permission getters used by application services.

Specialised “subtypes” are represented by **policy tables** rather than four classes, so adding a role is a data change plus tests, not a rewrite of inheritance trees.

### Workflows

- **`ServiceRequestWorkflow`**: allowed staff transitions between `draft`, `submitted`, `in_review`, `approved`, `rejected`. Unknown legacy statuses fall back to a permissive check so existing JSON rows keep working.
- **`ProgramApplicationWorkflow`**: staff review transitions; owner self-service patches validate against the published status vocabulary (including `draft` for future use).

### Government scheme

- **`GovernmentScheme`**: thin wrapper around a scheme DTO (identity, documents, SDG tags, optional `eligibilityRules`).
- **`EligibilityEvaluator`**: structured evaluation hook; extend or call into `routes/schemes.js` intelligence when you centralise scoring.

## Application services

| Service | Responsibility |
|---------|----------------|
| `ServiceDeskService` | List requests by principal, create citizen request, staff status transitions, audit + notify + SSE broadcast |
| `ApplicationProcessingService` | Queue listing, submit application, staff review, owner status patch |

Both accept optional **dependency injection** for unit tests (repositories, `notifyUser`, etc.).

## Security

- **Authentication** remains in JWT middleware (`middlewares/auth.js`).
- **Authorisation** is enforced in the application layer using `Principal` (derived from the same role policies as before).
- **`AuditService`** (`infrastructure/security/AuditService.js`) is the single façade for `appendAudit`; wire SIEM export there later.

## Scalability notes

- JSON files are **not** suitable for high concurrency or large volumes; repositories isolate that choice.
- In-process SSE (`eventHub`) does not span multiple API instances; see `PRODUCTION.md` for Redis-style fan-out.

## Frontend

The React app remains the **presentation layer**. It should continue to call the same REST paths; behavioural changes belong in domain/application services and repositories.

Dashboard and similar views use **TanStack Query** for cached fetches, retries, and deduplication (`frontend/src/lib/queryClient.js`). A **route error boundary** prevents a single render failure from blanking the whole shell.

## HTTP surface & observability

- **`createApiRouter()`** (`interfaces/http/apiRouter.js`) mounts all REST resources; **`app.js`** attaches the same router at **`/api`** and **`/api/v1`** for versioning readiness.
- **`requestContext`** assigns or forwards **`X-Request-Id`** for log correlation.
- **`structuredLogger`** emits JSON lines in production for centralised logging.

## Integration layer

- **`integration/cache`**: in-process TTL cache today; swap for Redis when running multiple API replicas (see `docs/MODULES_AND_SCALING.md`).
- **`integration/moduleBoundaries.js`**: documents logical modules for future service extraction.

Further API and database target design: `docs/API_STANDARDS.md`, `docs/DATABASE_SCHEMA.md`.
