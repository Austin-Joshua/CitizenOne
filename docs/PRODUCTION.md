# Citizen One — production readiness

This document lists what the repository implements for a **government-style production cut** and what operators must still supply (WAF, SOC, identity federation, etc.).

## Implemented in code

- **PostgreSQL** (optional): Set `DATABASE_URL` to use Postgres for users, refresh tokens (hashed, indexed, revocable), password-reset and email-verification tokens (hashed at rest), `audit_log`, and JSON document collections (`json_collections`). Without `DATABASE_URL`, the API keeps using `backend/src/data/*.json` for local development.
- **Migrations**: `backend/migrations/001_initial.sql` applied via `npm run db:migrate` (or Docker Compose command). **Import** demo JSON into Postgres: `npm run db:import-json` after migrate.
- **SMTP / transactional email**: Nodemailer with `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and optional `SMTP_USER` / `SMTP_PASS`. Verification and password-reset links use `PUBLIC_APP_URL`. **No reset or verification tokens are returned in API responses** or written to stdout. Optional `ALLOW_EMAIL_DEBUG_LINKS=true` adds a JSON field for diagnostics only in non-hardened environments.
- **Strict production gate**: On `node src/app.js` with `NODE_ENV=production`, `assertProductionConfig()` enforces `DATABASE_URL`, `JWT_SECRET` (≥32), `CORS_ORIGIN`, `PUBLIC_APP_URL`, and configured SMTP—unless `STRICT_PRODUCTION_CONFIG=false` (demo / staged rollout only).
- **MFA (TOTP)**: `POST /api/auth/mfa/totp/setup|enable|disable`, `POST /api/auth/login/mfa` after password step. Secrets are not returned on `/me` or in JWTs.
- **Stripe**: `POST /api/billing/checkout-session` (authenticated) and **raw-body** webhooks at `POST /api/webhooks/stripe` and `/api/v1/webhooks/stripe` (requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`). Idempotency via `stripe_processed_events`.
- **Institutional onboarding**: `POST /api/institutions/apply` (organisation role), admin `GET/PATCH /api/institutions/onboarding` — **PostgreSQL only**.
- **Audit export**: `GET /api/audit/export` (admin) streams **NDJSON** for SIEM ingestion; supports `since` and `limit`.
- **Readiness**: `GET /ready` returns a `checks` array (name, `ok`, optional `latencyMs`). **Postgres** is exercised when `DATABASE_URL` is set; when unset, readiness still succeeds with `database: "disabled"`. **Redis**: if `REDIS_URL` is set, `/ready` pings Redis via the shared cache client—failure yields `503` (treat Redis as required whenever you configure it). This does not relax the strict production gate: **`NODE_ENV=production` still requires** `JWT_SECRET` (≥32 chars), `CORS_ORIGIN`, `PUBLIC_APP_URL`, `DATABASE_URL`, and SMTP unless **`STRICT_PRODUCTION_CONFIG=false`** (controlled demos only, e.g. Docker Compose).
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs **`npm test` in `backend/`** (Jest) and **`npm run build` in `frontend/`**. From the repo root you can run **`npm test`** to execute backend tests only.
- **Layered backend**, **SSE** (`/api/events/stream`), **rate limits**, **Helmet**, **structured logging**, **X-Request-Id** — see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Minimum environment (production)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV=production` | Safer errors, strict startup checks. |
| `JWT_SECRET` | **≥ 32 characters**. |
| `CORS_ORIGIN` | Comma-separated allowed browser origins (HTTPS portal). |
| `PUBLIC_APP_URL` | HTTPS URL used in verification and password-reset links. |
| `DATABASE_URL` | PostgreSQL connection string (required for strict production). |

## Email (production)

| Variable | Purpose |
|--------|---------|
| `SMTP_HOST` | SMTP server hostname. |
| `SMTP_PORT` | Usually `587` (STARTTLS) or `465` (TLS). |
| `SMTP_SECURE` | `true` for TLS on port 465. |
| `SMTP_FROM` | RFC5322 From (e.g. `Citizen One <noreply@example.gov>`). |
| `SMTP_USER` / `SMTP_PASS` | Auth when required. |

UK Notify / other HTTP APIs: implement an adapter beside `infrastructure/email/mailer.js` and call it from the auth routes instead of Nodemailer.

## Stripe (optional)

| Variable | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Server secret. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for webhook endpoint. |
| `STRIPE_PRICE_PREMIUM` | Price ID for checkout sessions. |

Subscribe flow: Stripe Checkout → webhook updates `billing_subscriptions` and `users.plan`. Ensure subscription/metadata includes `userId`.

## Other variables

| Variable | Purpose |
|----------|---------|
| `JWT_ACCESS_EXPIRES` | Access JWT TTL (default `15m`). |
| `JWT_REFRESH_DAYS` | Refresh sliding window (default `7`). |
| `STRICT_PRODUCTION_CONFIG` | `false` only for demos or incremental hardening. |
| `ALLOW_EMAIL_DEBUG_LINKS` | `true` to include verification URL in JSON (avoid in real prod). |
| `ENABLE_HELMET_CSP` | `true` after validating the SPA. |
| `PG_POOL_MAX` | Postgres pool size cap. |
| `REDIS_URL` | Optional. When set, plans catalog and other cache users use **Redis** (`ioredis`) instead of in-memory cache; required for multi-instance cache coherence. |
| `PLANS_CACHE_TTL_SEC` / `CACHE_*` | Cache TTL and in-memory `CACHE_MAX_ENTRIES` when Redis is not used. |

Design references: [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md), [`MODULES_AND_SCALING.md`](./MODULES_AND_SCALING.md), [`API_STANDARDS.md`](./API_STANDARDS.md), [`SECURITY_REVIEW.md`](./SECURITY_REVIEW.md).

## SSE vs WebSockets

Real-time updates use **SSE** plus an in-process `eventHub`. For horizontally scaled APIs, replace the hub with **Redis (or NATS) pub/sub**; WebSockets are unnecessary unless you need full-duplex client streaming.

## WAF, dependency review, E2E

- **WAF / DDoS**: Configure at the edge (Cloudflare, AWS WAF, Azure Front Door, etc.); not expressible purely in app code.
- **Dependency review**: Run `npm audit` / `npm run security:audit` in `backend/`; pin versions in CI; enable Dependabot or equivalent.
- **E2E**: Root `npm run e2e` (Playwright) — starts the Vite dev server unless `E2E_SKIP_WEBSERVER=1`.

## Verification checklist

- [ ] `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, `PUBLIC_APP_URL` set; secrets not committed  
- [ ] Migrations applied; restore drills performed  
- [ ] SMTP (or gov notify) verified end-to-end for signup + reset  
- [ ] Stripe webhooks registered to `/api/webhooks/stripe` with raw body  
- [ ] Staff/admin MFA policy enforced organisationally  
- [ ] WAF, TLS, backup retention, and accessibility review per policy  
