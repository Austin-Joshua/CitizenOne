# Citizen One

Citizen One is a full-stack web application built for organisations that need a structured digital workspace around public programmes: residents explore schemes, hold documents, submit service requests, and staff or administrators work queues on the same system. The codebase is meant to be forked, hardened, and connected to your own identity provider, database, and notification channels—not dropped onto the internet without that work.

---

## What the application does

**Public and authenticated areas**

- Landing, registration, and a two-step sign-in (portal role, then credentials). Password recovery runs over dedicated pages with request → verification code → new password → confirmation.
- Signed-in **dashboard** with activity summaries and entry points into the workspace.
- **Profile** with display name, accessibility preferences, and a scheme-eligibility profile used by benefit matching.
- **Benefit discovery** backed by scheme intelligence APIs: filters, life-event tags, saved items, applications, and a guidance panel per scheme.
- **Document vault**: list and create document records (demo payloads; swap for real upload/storage in deployment).
- **Opportunities** list with “pursue” creating an application row.
- **Service desk**: citizens submit requests; staff and admins update status; organisations see a restricted view of the queue. The UI refreshes from **Server-Sent Events** when the API broadcasts changes, with a slow poll as backup.
- **Applications** queue for staff-facing review of scheme and opportunity applications.
- **Notifications**, **activity** history, **alerts** module, **billing/plans** UI (plan selection updates the user profile; no payment processor is wired).
- **Admin hub** (role-gated) with operational metrics and audit log access for administrators.
- **Theme** (light/dark) persisted in the browser; optional large text / high contrast / simplified language flags on the profile.

**Roles in the API**

Roles are normalised in **`backend/src/domain/user/RoleBehavior.js`** (still re-exported from `lib/roles.js` for older imports). Typical mappings: citizen, student, staff (including legacy `service_provider`), organisation, admin. Service-desk and application queues use a **`Principal`** object built from the JWT so permissions stay in one policy table.

Backend layering (routes → application services → domain → repositories) is summarised in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The same HTTP surface is mounted at **`/api`** (SPA default) and **`/api/v1`** for version-stable clients; requests carry optional **`X-Request-Id`** for support correlation.

---

## Security and session behaviour (as implemented)

This is what the repository actually contains today. It is not a certification or penetration-test report.

| Topic | Behaviour |
|--------|-----------|
| **Passwords** | Stored with bcrypt. If you ever hand-edit `users.json` with plaintext passwords, run `node scripts/migrate-passwords.js` under `backend/`. |
| **Access tokens** | Short-lived JWTs (default **15 minutes**, overridable with `JWT_ACCESS_EXPIRES`). |
| **Refresh tokens** | Opaque tokens, **HMAC-hashed** with `JWT_SECRET`, stored in `backend/src/data/refreshTokens.json`, **rotated** on each successful refresh. The SPA keeps the refresh token beside the access token and retries failed API calls once after `POST /api/auth/refresh`. |
| **Logout** | `POST /api/auth/logout` (authenticated) revokes the supplied refresh token; the client clears local/session storage. |
| **Sign-in** | Optional portal-role check so the chosen entrance matches the account type; failed attempts are rate-limited. |
| **Email verification** | New accounts are created with `emailVerified: false` until `GET /api/auth/verify-email?token=` succeeds. Resend is available from the profile when still unverified. In development, verification links are written to the server log; production must use your mail or messaging infrastructure. |
| **Password reset** | Token store in `passwordResets.json`, expiry enforced server-side. Successful reset revokes refresh tokens for that user. Do not enable token-in-response flags in real production. |
| **Transport** | You are responsible for **HTTPS** in front of Node (reverse proxy, load balancer, or platform ingress). |
| **HTTP API** | JSON body size capped (256 KB). Helmet is applied; optional **Content Security Policy** via `ENABLE_HELMET_CSP=true` after you verify the SPA still loads all assets. |
| **CORS** | Restrict with `CORS_ORIGIN` in production (comma-separated origins). |
| **Rate limiting** | Applied to login, signup, password-reset, refresh, and a general API window (`middlewares/rateLimits.js`). |
| **Audit** | Sensitive actions append to `auditLog.json`; admins can read recent entries through the API. |
| **Client idle** | After **30 minutes** without input, the SPA signs the user out and sends them back to sign-in. This does not replace server-side token expiry. |
| **Input handling** | Sanitisation helpers are used on selected payloads (e.g. service requests); extend this pattern as you add fields. |

Production scaling gaps (database instead of JSON files, MFA, WAF, SIEM export, real email) are spelled out in [`docs/PRODUCTION.md`](docs/PRODUCTION.md).

---

## Repository layout

```
CitizenOne/
├── frontend/                 # React (Vite), Tailwind, route-based code splitting
│   └── src/
│       ├── pages/            # Screens including WorkspaceViews and workspace module catalog
│       ├── components/       # Layout, UI primitives, public auth shell
│       ├── context/          # Auth, theme, notifications
│       └── lib/              # API client (refresh retry), search helpers
├── backend/
│   ├── src/
│   │   ├── domain/           # user policies, workflow state machines, scheme + eligibility seams
│   │   ├── application/      # service desk & application processing use cases
│   │   ├── infrastructure/   # JSON repositories, audit façade
│   │   ├── interfaces/http/  # shared HTTP error mapping
│   │   ├── routes/           # thin controllers → application services
│   │   ├── middlewares/      # JWT auth, validation, rate limits
│   │   ├── lib/              # passwords, refresh store, re-exports, low-level helpers
│   │   └── data/             # JSON persistence (replace in production)
│   └── scripts/              # e.g. password migration
├── docs/
│   ├── ARCHITECTURE.md       # Layering, domain boundaries, scalability notes
│   ├── DATABASE_SCHEMA.md    # Target relational model, indexes, partitioning
│   ├── MODULES_AND_SCALING.md # Logical modules, cache, horizontal scale, DR
│   ├── API_STANDARDS.md      # Versioning, errors, rate limits, idempotency
│   ├── SECURITY_REVIEW.md    # Operator checklist (WAF, audit, dependencies)
│   └── PRODUCTION.md         # PostgreSQL, SMTP, Stripe, MFA, strict env gates
├── docker-compose.yml        # Optional: nginx + API (see PRODUCTION.md)
└── README.md
```

---

## Running it locally

**Backend** (port **5000** by default):

```bash
cd backend
npm install
npm start
```

**Frontend** (port **5173** by default; proxies `/api` to the backend—see `frontend/vite.config.js`):

```bash
cd frontend
npm install
npm run dev
```

Copy `backend/.env.example` to `.env` and set at least `JWT_SECRET` before treating the API as non-development.

**Quality checks on the frontend:**

```bash
cd frontend
npm run lint
npm run build
```

**Backend unit tests** (Jest; also run in CI):

```bash
cd backend
npm test
```

From the **repository root**, `npm test` runs the same backend suite (`npm --prefix backend test`). See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for automated backend tests and frontend production build.

---

## Configuration reference (short)

| Variable | Role |
|----------|------|
| `NODE_ENV` | Use `production` for strict JWT rules and generic 500 responses. |
| `JWT_SECRET` | Required strength in production (≥ 32 characters). |
| `JWT_ACCESS_EXPIRES` | Access JWT lifetime (default `15m`). |
| `JWT_REFRESH_DAYS` | Refresh token lifetime (default `7`). |
| `CORS_ORIGIN` | Allowed browser origins. |
| `PUBLIC_APP_URL` | Where email-verification redirects should send the user. |
| `ENABLE_HELMET_CSP` | Enable only after testing the built SPA. |

Full tables and a go-live checklist are in [`docs/PRODUCTION.md`](docs/PRODUCTION.md).

---

## Maintenance notes

- **Data**: Users, refresh tokens, service requests, applications, audit entries, and related JSON files under `backend/src/data/` are convenient for development; they are not a substitute for a database with backups and access control.
- **Billing**: The subscription screen changes the user’s plan in profile data only. Card payments and institutional contracts are out of scope here.
- **SSE**: Real-time updates use an in-process event bus. If you run multiple API instances, you will need a shared pub/sub layer (see `docs/PRODUCTION.md`).

---

## Contributing and reuse

Treat this repository as a starting point: replace storage, wire your organisation’s identity and messaging, run your own security review, and adjust copy and jurisdiction-specific content before exposing it to the public.

If you improve something worth upstreaming, small, focused changes with clear intent are easier to review than large refactors mixed with unrelated edits.
