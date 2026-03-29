# Modules, scaling, and failure isolation

This ties the **logical product modules** to HTTP surfaces, cache boundaries, and how you would split the monolith into services without changing the SPA’s contracts.

## Module map

Source of truth for path prefixes: `backend/src/integration/moduleBoundaries.js` (kept in sync with `interfaces/http/apiRouter.js`).

| Module | Routes (under `/api` and `/api/v1`) | Replaceable boundary |
|--------|----------------------------------------|----------------------|
| Authentication & identity | `/auth/*` | Issue tokens via IdP; swap `routes/auth` for OIDC callback + session |
| User profile | `/users/*` | Directory sync (SCIM) behind repository |
| Scheme intelligence | `/schemes/*` | Eligibility engine + catalogue CMS |
| Application workflow | `/applications/*`, `/service-requests/*` | Already uses application + domain layers |
| Notifications | `/notifications/*` | Queue + worker (email/SMS/push) |
| Subscription & billing | `/plans/*` | Payment provider webhooks |
| Administration | `/audit/*`, `/activity/*`, `/events/*` | SIEM export, SSE fan-out to message bus |

## API versioning

- **`/api`** — primary prefix used by the SPA today.
- **`/api/v1`** — same router instance; enables future deprecation: mount v2 only on `/api/v2` while v1 remains stable.

## Stateless API instances

- JWT access tokens + (optional) opaque refresh tokens require **no server session** for most routes.
- SSE (`/events`) is long-lived; scale with **sticky sessions** or move to WebSockets + Redis pub/sub.
- Upload and heavy jobs should become **async** (queue + worker) so API pods stay thin.

## Caching

| Data | Strategy | Invalidation |
|------|-----------|--------------|
| Plan catalogue | TTL cache (`plans` GET) | Lower `PLANS_CACHE_TTL_SEC` or restart; with DB, invalidate on admin update |
| Scheme reference data | TTL + ETag | Version column or `updated_at` in cache key |
| Session | Client-held JWT; optional Redis denylist on logout | TTL matches token expiry |
| Computed recommendations | Short TTL per user | User profile or scheme version change → bump key version |

Implementation today: `integration/cache/MemoryCacheAdapter.js` (single process). For multiple replicas, implement a **Redis** adapter behind the same `getCacheAdapter()` factory and use **key prefixes** per module.

## Load management

- **Horizontal scaling**: run N identical Node processes behind a load balancer; enable `trust proxy` (already set).
- **Rate limiting**: `express-rate-limit` is in-memory per instance; in production use **Redis store** so limits are global.
- **Avoid single points**: separate DB, cache, object storage, and ingress from app VMs/containers.

## Disaster recovery & degradation

- **Critical path**: auth, service requests, applications. **Non-critical**: recommendations, secondary analytics — feature-flag off under stress.
- **Backups**: see `docs/DATABASE_SCHEMA.md`; JSON demo data should be replaced with managed DB backups.
- **Health**: `GET /health` (liveness), `GET /ready` (extend with DB ping when wired).

## Observability

- **Structured logs**: `infrastructure/logging/structuredLogger.js` — ship stdout JSON to your log stack.
- **Request correlation**: `X-Request-Id` middleware; propagate the same header to downstream HTTP calls when you add them.
- **Metrics**: add RED metrics (rate, errors, duration) per route group in production (Prometheus/OpenTelemetry).

## E-governance alignment

- **Reliability** over feature churn: module boundaries allow turning off non-essential routes.
- **Transparency**: audit and activity modules feed public-sector reporting.
- **Interoperability**: integration layer (future) holds outbound adapters only — no domain logic in HTTP clients.
