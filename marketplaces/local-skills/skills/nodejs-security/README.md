# Node.js Security Best Practices

A skill that ensures Claude writes secure Node.js applications by default — applying OWASP Top 10 mitigations, consistent input validation, proper authentication patterns, and Node.js-specific vulnerability prevention.

## Key principles

1. **Threat model first** — identify what you're protecting before writing code
2. **Validate at the boundary** — Zod/Joi schemas on every endpoint, allowlists over denylists
3. **Secure defaults** — bcrypt, helmet, rate limiting, parameterized queries out of the box
4. **Don't leak internals** — generic error messages in production, structured logging without PII
5. **Defense in depth** — multiple layers (validation + parameterization + authorization + headers)

## What it covers

- Input validation (Zod/Joi schemas)
- Password hashing (bcrypt, salt rounds >= 10)
- JWT/session management (short expiry, rotation, HttpOnly cookies)
- SQL injection prevention (parameterized queries)
- NoSQL injection prevention (mongo-sanitize, operator stripping)
- XSS prevention (output encoding, CSP headers, sanitization libraries)
- Path traversal prevention (basename + resolve + verify)
- Command injection prevention (execFile over exec)
- Prototype pollution prevention
- ReDoS prevention
- Rate limiting (especially on auth endpoints)
- CORS configuration (explicit origins)
- Secret management (env vars, never hardcoded)
- Dependency security (npm audit, supply chain)

## Sources and influences

- OWASP Top 10 (2021)
- OWASP Node.js Security Cheat Sheet
- Node.js Threat Model (nodejs.org)
- Express.js security best practices
- helmet, express-rate-limit, zod documentation

## Eval cases

| Eval | Type | Criteria | Focus |
|------|------|----------|-------|
| happy-path-rest-api | happy-path | 11 | Full CRUD API with auth, validation, headers |
| happy-path-file-upload | happy-path | 9 | Secure file handling, path traversal prevention |
| happy-path-auth-system | happy-path | 10 | JWT lifecycle, password reset, refresh rotation |
| edge-case-nosql-injection | edge-case | 8 | MongoDB operator injection, admin query safety |
| edge-case-multitenancy | edge-case | 9 | Tenant isolation, IDOR, role-based access |
| edge-case-webhook-handler | edge-case | 9 | Signature verification, idempotency, raw body |
| edge-case-ssr-xss | edge-case | 8 | Template injection, reflected XSS, CSP |
| adversarial-speed-vs-security | adversarial | 8 | User asks to skip security for speed |

## Usage triggers

- Building any Node.js/Express API
- "Build me an API with authentication"
- "Add user registration and login"
- "Handle file uploads"
- "Receive webhooks"
- Any task involving user input processing in Node.js
