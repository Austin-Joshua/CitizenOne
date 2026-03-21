# HTTP API standards

Applies to routes mounted at **`/api`** and **`/api/v1`** (identical behaviour).

## Conventions

| Topic | Rule |
|--------|------|
| **Method semantics** | GET safe/idempotent; POST create/actions; PATCH partial update; DELETE removal where supported |
| **Content-Type** | `application/json` for bodies |
| **Auth** | `Authorization: Bearer <access_jwt>` and/or `x-auth-token` (as implemented) |
| **Correlation** | Clients may send `X-Request-Id` (≤128 chars); server echoes it on the response |
| **Errors (4xx/5xx)** | JSON body with at least `{ "message": "..." }`; server errors may include `requestId` |

## Versioning

- Prefer **URL prefix** (`/api/v1`) for breaking changes; keep **previous** prefix for a deprecation window.
- Optional future: `Accept: application/vnd.citizenone.v1+json` for negotiation — not required if URL versioning is sufficient.

## Error envelope (evolution path)

Today:

```json
{ "message": "Human-readable reason" }
```

Recommended for new endpoints (additive):

```json
{
  "error": {
    "code": "DOMAIN_VALIDATION",
    "message": "Human-readable reason",
    "requestId": "uuid"
  }
}
```

Existing clients that read only `message` remain compatible. Domain errors currently return `{ message, requestId? }`.

## Rate limiting

Configured in `middlewares/rateLimits.js`. Clients should treat **429** as retryable with backoff. Response may include standard headers (`RateLimit-*`) depending on middleware version.

## Security

- Do not return stack traces in production (`NODE_ENV=production`).
- Do not leak internal hostnames or SQL in error text.
- Sensitive operations should appear in `audit` where applicable.

## Pagination (when adding list endpoints)

Use `?cursor=` opaque cursors or `?page=` + `?limit=` with a hard cap (e.g. 100). Include `nextCursor` or `total` only if needed for UX.

## Idempotency (POST that creates side effects)

Accept `Idempotency-Key` header for payment-adjacent or duplicate-prone operations; store key → response mapping in Redis/DB (TTL 24h typical).

## CORS

Production: set `CORS_ORIGIN` to explicit origins; credentials enabled for cookie-less JWT in header is still subject to browser rules — keep origins strict.
