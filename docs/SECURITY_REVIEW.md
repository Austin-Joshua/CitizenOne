# Security review checklist (operator)

Use this as a **repeatable governance** aid—not a substitute for independent penetration testing or formal accreditation.

## Authentication & session

- [ ] Short-lived access JWT + rotating refresh tokens (DB-backed in production).  
- [ ] Password reset and email verification tokens are **hashed at rest** and never returned in HTTP JSON.  
- [ ] MFA (TOTP) available; policy for staff/admin enforced by organisation (not only optional UX).  
- [ ] Idle sign-out and server-side token expiry understood by helpdesk.

## Transport & edge

- [ ] **HTTPS** everywhere; HSTS at ingress.  
- [ ] **WAF** with OWASP-oriented ruleset and tuned false-positive handling.  
- [ ] Rate limits reviewed against expected citizen traffic and attack volume.

## Data & audit

- [ ] PostgreSQL backups, retention, and restore tested.  
- [ ] `GET /api/audit/export` integrated with SIEM or cold storage on a schedule.  
- [ ] PII minimisation in logs (`structuredLogger` must not log bodies or tokens).

## Dependencies & supply chain

- [ ] `npm audit` / OSV scanning in CI; critical vulns patched within organisational SLA.  
- [ ] Lockfiles committed; installs reproducible.

## WebAuthn / passkeys

- [ ] Not yet implemented in API beyond schema placeholder (`webauthn_credentials`). Plan `@simplewebauthn/server`, challenge storage, and attestation policy before enabling.

## Stripe

- [ ] Webhook signature verification enabled; keys in secret manager.  
- [ ] Test mode vs live mode separation; no test keys in production configs.
