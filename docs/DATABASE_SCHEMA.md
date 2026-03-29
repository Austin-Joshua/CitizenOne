# Relational schema (target state)

Citizen One currently persists to JSON files under `backend/src/data/`. This document defines a **normalised PostgreSQL-style model** you can migrate toward for national-scale workloads: millions of citizen profiles, applications, audit events, and notification rows.

## Design principles

- **Third normal form** for mutable business data; denormalised **read models** or materialised views only where profiling proves benefit.
- **Surrogate keys** (`BIGSERIAL` or UUID) on all tables; natural keys (email, national ID) are unique constraints, not primary keys.
- **Row-level security (RLS)** in PostgreSQL (or equivalent) for role-scoped reads; application layer still enforces `Principal` checks.
- **Soft delete** optional via `deleted_at`; hard delete only for GDPR erasure workflows with audit.

## Core entities

### Identity & access

| Table | Purpose |
|--------|---------|
| `users` | Account: email hash for lookup, status, `email_verified_at`, password hash, `created_at` |
| `user_roles` | `(user_id, role)` — users may hold multiple roles in some jurisdictions; else single role on `users` |
| `refresh_tokens` | Hashed token, `user_id`, `expires_at`, `revoked_at`, device metadata |
| `password_reset_tokens` | One-time tokens, expiry, consumption timestamp |
| `sessions` | Optional server-side session store if moving beyond pure JWT |

### Profile & eligibility

| Table | Purpose |
|--------|---------|
| `user_profiles` | Display name, accessibility flags, locale |
| `eligibility_profiles` | Normalised answers used by scheme matching (versioned JSONB or child tables) |

### Scheme intelligence

| Table | Purpose |
|--------|---------|
| `schemes` | Canonical programme record: level, name, description, status, effective dates |
| `scheme_criteria` | Structured eligibility rules (type, parameters) for evaluation engines |
| `user_scheme_interactions` | Saves, views, application intent (analytics + personalisation) |

### Workflows

| Table | Purpose |
|--------|---------|
| `service_requests` | Citizen service desk rows: status, assignee, payload JSONB, `updated_at` |
| `service_request_events` | Append-only transition history (from_status, to_status, actor_id, note) |
| `program_applications` | Scheme/opportunity applications: status, reviewer, payload |
| `program_application_events` | Same pattern as service requests |

### Documents & opportunities

| Table | Purpose |
|--------|---------|
| `documents` | Metadata; blob storage is S3/Blob with `storage_key` |
| `opportunities` | Catalogue rows |
| `opportunity_applications` | Link user ↔ opportunity if not merged into `program_applications` |

### Notifications & activity

| Table | Purpose |
|--------|---------|
| `notifications` | In-app feed; `read_at`, priority |
| `activity_feed` | Denormalised snippets for dashboard (or computed from events) |
| `audit_log` | Immutable administrative and security events (append-only, partitioned) |

### Billing (placeholder)

| Table | Purpose |
|--------|---------|
| `plans` | Plan catalogue |
| `subscriptions` | `user_id`, `plan_id`, status, period boundaries — integrate Stripe/Billing provider IDs |

## Strategic indexes

- `users(email)` UNIQUE — login path.
- `service_requests(user_id, status)` — citizen “my open requests”.
- `service_requests(status, updated_at)` WHERE status IN ('submitted','in_review') — staff queues.
- `program_applications(status, updated_at)` — application queue.
- `audit_log(created_at DESC)` — admin views; **partition by month** when volume grows.
- `notifications(user_id, read_at, created_at DESC)` — unread counts and feeds.
- GIN on `scheme_criteria` or `eligibility_profiles` only if you query inside JSONB with proven predicates.

## Referential integrity

- Foreign keys with `ON DELETE RESTRICT` for core references; `CASCADE` only for strictly owned child rows (e.g. events).
- **Optimistic concurrency**: `row_version` (`BIGINT` or `xmin` exposure via trigger) on `service_requests` and `program_applications` to detect stale updates.

## Horizontal growth

- **Partitioning**: time-range partitions on `audit_log`, `activity_feed`, `service_request_events`, `notifications` (monthly or weekly).
- **Sharding**: shard by `tenant_id` or geographic region if multi-tenant; keep cross-shard joins out of hot paths.
- **Read replicas**: route reporting, admin dashboards, and heavy list endpoints to replicas; writes to primary.
- **Connection pooling**: PgBouncer (transaction mode) in front of PostgreSQL.

## Backup & recovery

- Continuous archiving (WAL) + nightly logical dumps; test restores quarterly.
- RPO/RTO targets documented per jurisdiction; audit log retention aligned with law.

## Migration from JSON

Map each `JsonCollectionRepository` collection to the tables above; run dual-write or batch ETL, then cut reads over feature-flagged per module.
