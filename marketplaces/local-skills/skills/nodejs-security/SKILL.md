---
name: nodejs-security
description: Writes secure Node.js applications by default. Applies OWASP Top 10 mitigations, validates all inputs, handles authentication safely, and prevents common Node.js-specific vulnerabilities. Use when building Node.js APIs, handling authentication, processing user input, or reviewing code for security issues.
---
<!-- skill-version: v1 -->
<!-- version-notes: v1=Initial skill covering OWASP Top 10, Zod validation, bcrypt, helmet, rate limiting -->
# Node.js Security Best Practices

Write secure Node.js applications by default. Apply OWASP Top 10 mitigations, validate all inputs, handle authentication safely, and prevent common Node.js-specific vulnerabilities.

## When to use

TRIGGER when:
- Building a new Express/Fastify/Koa API or web application
- Writing authentication or authorization logic
- Handling user input, file uploads, or form data
- Building middleware or request processing pipelines
- Working with databases from Node.js (SQL or NoSQL)
- The user asks about security, hardening, or vulnerability prevention
- Reviewing existing Node.js code for security issues

DO NOT TRIGGER when:
- Working with client-side JavaScript only (no server)
- The user explicitly says security is out of scope (e.g., prototype/hackathon)
- Working in non-Node.js runtimes

## Security methodology

Always follow this order. Never skip step 1.

### Step 1: Threat model FIRST

Before writing code, identify what you're protecting and from whom:

```
Asset                    | Threat                        | Mitigation
-------------------------|-------------------------------|----------------------------------
User credentials         | Credential stuffing           | Rate limiting, bcrypt, MFA
Session tokens           | Session hijacking             | HttpOnly cookies, short expiry
Database                 | SQL/NoSQL injection           | Parameterized queries, ORM
User-submitted content   | XSS                           | Output encoding, CSP headers
File uploads             | Path traversal, malware       | Allowlist extensions, size limits
API endpoints            | Abuse, DDoS                   | Rate limiting, authentication
Secrets/keys             | Exposure in code/logs         | Env vars, secret manager, no logging
```

If the user hasn't specified threats, identify the obvious ones from context and call them out.

### Step 2: Input validation at the boundary

Validate ALL external input before it touches application logic. Use a schema validation library.

**Required pattern — validate then use:**
```javascript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).trim(),
  age: z.number().int().min(13).max(150).optional(),
});

app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // result.data is now typed and validated
  createUser(result.data);
});
```

**Rules:**
- Validate at the API boundary, not deep inside business logic
- Use allowlists (what IS valid) not denylists (what is NOT)
- Always set maximum lengths on strings — prevent memory exhaustion
- Reject unexpected fields — don't pass raw `req.body` to database operations
- Parse, don't validate — transform input into a typed, trusted form (Zod `.parse()`)

### Step 3: Authentication and session security

**Password storage — bcrypt only:**
```javascript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const valid = await bcrypt.compare(password, storedHash);
```

**Session/token rules:**
- JWTs: set short expiry (15min access, 7d refresh), validate `iss` and `aud`, use RS256 not HS256 for multi-service
- Cookies: always set `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- Never store session data in localStorage — XSS can steal it
- Implement token rotation for refresh tokens

**Authorization pattern — deny by default:**
```javascript
// Middleware: reject if no valid permission
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### Step 4: Database query safety

**SQL — always parameterize:**
```javascript
// CORRECT — parameterized
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND org_id = $2',
  [email, orgId]
);

// WRONG — string interpolation
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**NoSQL (MongoDB) — sanitize operators:**
```javascript
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize()); // Strips $ and . from req.body/query/params
```

**ORM usage:**
- Use parameterized queries even with ORMs — don't use `.raw()` or string templates
- Scope queries to the authenticated user's tenant/org
- Always add `LIMIT` to list queries — prevent unbounded result sets

### Step 5: HTTP security headers and middleware

Apply these on every response:

```javascript
import helmet from 'helmet';

app.use(helmet()); // Sets all recommended security headers

// Key headers helmet sets:
// Content-Security-Policy: default-src 'self'
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Rate limiting — always on public endpoints:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter limit on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/auth/', authLimiter);
```

**CORS — explicit origins, not wildcard:**
```javascript
import cors from 'cors';
app.use(cors({
  origin: ['https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
```

### Step 6: Secrets and configuration

**Rules:**
- Never hardcode secrets in source code
- Use environment variables for config, secret manager (AWS Secrets Manager, Vault) for production secrets
- Never log secrets, tokens, passwords, or PII
- Add `.env` to `.gitignore` — always
- Use different secrets per environment (dev/staging/prod)

```javascript
// CORRECT
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) throw new Error('DB_PASSWORD is required');

// WRONG
const dbPassword = 'super-secret-password-123';
```

### Step 7: Error handling — don't leak internals

```javascript
// Production error handler
app.use((err, req, res, next) => {
  console.error(err); // Log full error server-side
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});
```

**Rules:**
- Never return stack traces, SQL errors, or internal paths to the client
- Log errors with context (request ID, user ID) but sanitize PII from logs
- Use structured logging (pino, winston) — not `console.log` in production

## Common vulnerability patterns to block

### Path traversal
```javascript
import path from 'path';

// CORRECT — resolve and verify within allowed directory
const safePath = path.resolve(UPLOAD_DIR, path.basename(userInput));
if (!safePath.startsWith(UPLOAD_DIR)) {
  throw new Error('Invalid path');
}

// WRONG — direct concatenation
const filePath = `./uploads/${userInput}`;
```

### Prototype pollution
```javascript
// CORRECT — use Object.create(null) or Map for user-controlled keys
const config = Object.create(null);

// Or validate keys
const ALLOWED_KEYS = new Set(['theme', 'language', 'timezone']);
if (!ALLOWED_KEYS.has(key)) throw new Error('Invalid key');
```

### ReDoS (Regular Expression Denial of Service)
```javascript
// WRONG — catastrophic backtracking
const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

// CORRECT — use a validation library instead
import { z } from 'zod';
const email = z.string().email();
```

### Command injection
```javascript
// WRONG — shell injection via user input
const { exec } = require('child_process');
exec(`convert ${userFile} output.png`);

// CORRECT — use execFile with argument array (no shell)
const { execFile } = require('child_process');
execFile('convert', [userFile, 'output.png']);
```

## Dependency security

- Run `npm audit` regularly — fix critical and high vulnerabilities
- Use `npm audit --omit=dev` for production dependency audit
- Pin major versions in `package.json` — use `~` not `^` for security-sensitive deps
- Consider `socket.dev` or Snyk for supply chain monitoring
- Review new dependencies before adding — check download count, maintenance status, and permissions

## Anti-patterns to avoid

1. **Trusting client-side validation** — always re-validate on the server
2. **Storing passwords in plaintext or with MD5/SHA** — bcrypt only
3. **Using `eval()` or `new Function()` with user input** — never
4. **Disabling CORS with `origin: '*'`** when credentials are involved
5. **Catching errors silently** — `catch(e) {}` hides security failures
6. **Running as root** — use non-root user in containers, drop privileges
7. **Exposing detailed errors in production** — generic messages only
8. **Logging sensitive data** — passwords, tokens, credit cards, PII

## Output format

When building a Node.js application or API, always include:

1. **Threat model summary** — what assets, what threats, what mitigations
2. **Input validation schemas** — Zod/Joi schemas for every endpoint
3. **Security middleware stack** — helmet, rate limiting, CORS, sanitization
4. **Authentication implementation** — bcrypt, JWT/session config, authorization middleware
5. **Error handling** — production-safe error responses, structured logging
