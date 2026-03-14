# Multi-Tenant Task Manager

A multi-tenant task management application with a Cloudflare Workers API and a React frontend.

Each tenant has isolated data — a user from `tenant_a` can never read or modify data from `tenant_b`.

## Tech Stack

**Backend:** Hono, Cloudflare Workers, Drizzle ORM, Neon Postgres, Zod v4

**Frontend:** React 19, TypeScript, TailwindCSS 4, TanStack Query, Axios, shadcn (base-ui)

**Tooling:** Bun, Vitest, Wrangler, Vite, ESLint, Prettier

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- A [Neon](https://neon.tech) Postgres database

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd multi-tenant-task-manager
```

### 2. Configure environment variables

Copy the example file and fill in your values **before** running setup:

```bash
cp .env.example .env
```

```env
# Database (Neon Postgres)
DATABASE_URL=postgres://user:password@host/db?sslmode=require

# Auth tokens (server-side only)
TENANT_A_TOKEN=token-tenant-a
TENANT_B_TOKEN=token-tenant-b

# Frontend
VITE_API_URL=http://localhost:8787

# Optional — only needed for branch management and production protection
NEON_PROJECT_ID=your-neon-project-id
NEON_PRODUCTION_ENDPOINT=your-production-endpoint
```

### 3. Setup

Installs dependencies and runs database migrations:

```bash
bun run setup
```

> **Important:** If you set `NEON_PRODUCTION_ENDPOINT` and your `DATABASE_URL` points to the production branch, the migration will be blocked. Make sure your `DATABASE_URL` points to a **development branch** in Neon. See [Database Branch Protection](#database-branch-protection) for details.

### 4. Start the development servers

```bash
bun run dev
```

- **API:** http://localhost:8787
- **Web:** http://localhost:5173

### 5. Run tests

```bash
bun run test
```

## Project Structure

```
multi-tenant-task-manager/
├── apps/
│   ├── api/                    # Cloudflare Workers API (Hono)
│   │   ├── src/
│   │   │   ├── db/             # Drizzle schema and client
│   │   │   ├── middleware/     # Auth and rate limiting
│   │   │   └── modules/tasks/  # Controller, service, repository, schema
│   │   └── wrangler.jsonc
│   └── web/                    # React SPA (Vite)
│       └── src/
│           ├── api/            # API service layer (Axios + Zod)
│           ├── components/     # UI components (shadcn) + layout
│           ├── config/         # API and tenant configuration
│           ├── contexts/       # Auth context (tenant switching)
│           └── pages/tasks/    # Task page, components, hooks
├── .env.example
└── package.json                # Workspace root
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run setup` | Install dependencies and run migrations |
| `bun run dev` | Start API and Web concurrently |
| `bun run test` | Run API tests (Vitest) |
| `bun run build` | Build the frontend for production |
| `bun run db:migrate` | Run Drizzle migrations |

### API-specific (`apps/api`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Wrangler dev server |
| `bun run test` | Run unit tests |
| `bun run deploy` | Run tests + deploy to Cloudflare |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run Drizzle migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:branch` | List or switch Neon database branches |

## Architecture Decisions

**Layered backend architecture with singleton lifecycle** — Routes → Controller → Service → Repository. Each layer has a single responsibility, making the code testable and easy to follow. The factory pattern (`createTaskRepository`, `createTaskService`, `createTaskController`) enables dependency injection for testing. The entire dependency graph (db → repository → service → controller) is created lazily on the first request and cached as a **singleton** at module level. Subsequent requests skip all instantiation and reuse the warm instance — this acts as a natural **warmup**, eliminating repeated object allocation and database client setup on every request, which is especially beneficial in serverless/edge runtimes like Cloudflare Workers where cold starts matter.

**Tenant isolation at query level (no RLS)** — Every database query includes a `WHERE tenant_id = ?` clause. The `tenantId` is extracted from the Bearer token in the auth middleware and propagated through the context — it never comes from the request body or URL params. Postgres Row Level Security (RLS) was intentionally **not** used for the following reasons:

- **Performance overhead** — RLS adds an implicit filter on every query, which can degrade performance especially on large tables, since the policy is evaluated per-row by the database engine regardless of whether the application already filters correctly.
- **More verbose and complex setup** — RLS requires defining policies per table, managing `SET` or `SET LOCAL` for `current_setting` variables on every connection/transaction, and keeping policies in sync with schema changes — all adding operational complexity.
- **Connection-level state management** — RLS typically relies on setting a session variable (e.g. `SET app.tenant_id`) before each query. In serverless/edge environments with connection pooling (like Neon), ensuring this state is correctly set and never leaks between requests adds fragility.
- **Harder to test and debug** — RLS policies are invisible at the query level, making it harder to understand, test, and debug data access behavior. Application-level filtering is explicit and directly visible in the code and tests.
- **Unnecessary for this architecture** — Since tenant isolation is enforced at the repository layer with explicit `WHERE` clauses, and the `tenantId` is derived from a trusted source (auth middleware), RLS would be a redundant second enforcement layer without meaningful security gain.

**Static tokens** — Authentication uses simple token-to-tenant mapping via environment variables. This is intentional for a demo application and avoids unnecessary complexity (JWT, sessions, etc.).

**In-memory rate limiting** — The `POST /tasks` endpoint is rate-limited to **10 requests per minute per tenant**. An in-memory `Map` is used since Cloudflare Workers instances are short-lived. All responses from the POST endpoint include standard headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`). For production, a durable store (KV, Durable Objects, or [Cloudflare Rate Limiting Rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)) would be more appropriate.

**No client-side routing** — The frontend is a single-page app with one view. React Router was intentionally omitted as there's only one page, keeping the bundle smaller and the code simpler.

**Frontend tenant switching** — Instead of a login form, the UI provides a dropdown to switch between tenants. The selected tenant's token is stored in `localStorage` and attached to every API request via an Axios interceptor.

## Development Workflow

### Database Branch Protection

The project includes a safety mechanism to prevent running migrations or schema pushes against the **production** Neon database branch locally.

The `drizzle.config.ts` checks if the `DATABASE_URL` points to the production endpoint (via `NEON_PRODUCTION_ENDPOINT` env var). If it does, Drizzle Kit commands (`db:generate`, `db:migrate`, `db:push`) are **blocked** with an error message.

To work locally, switch to a development branch:

```bash
cd apps/api

# List available branches
bun run db:branch

# Switch to a dev branch
bun run db:branch <branch-name>
```

This updates the `DATABASE_URL` in `.env` to point to the selected Neon branch. Production migrations should only run through CI/CD.

### Schema Changes

If you modify the schema (`apps/api/src/db/schema.ts`), generate a new migration and apply it:

```bash
cd apps/api
bun run db:generate
bun run db:migrate
```

### CI/CD — Production Migrations

A GitHub Actions workflow (`.github/workflows/migrate-production.yml`) automatically runs database migrations on every push to `main` that changes files in `apps/api/drizzle/`.

This is a **security measure** — migrations never run manually against production. Combined with the local [branch protection](#database-branch-protection) in `drizzle.config.ts`, this ensures that production schema changes only happen through a controlled, auditable pipeline.

In a real-world team environment, this would be complemented by **branch protection rules** on `main` — requiring pull request reviews and approvals from one or more team members before any merge. This way, no migration reaches production without code review, reducing the risk of destructive or unintended schema changes.

To enable this in your fork:

1. Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NEON_DATABASE_URL`
4. Value: your **production** Neon connection string (e.g. `postgres://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`)

> Secrets are encrypted by GitHub and never exposed in logs or to collaborators — only the workflow has access to the value at runtime.

## Assumptions

- Bun is used as the package manager (the project uses Bun workspaces)
- The Neon database is already provisioned and the connection string is available
- Static Bearer tokens are acceptable for authentication (as specified in the challenge)
- Two tenants (`tenant_a`, `tenant_b`) are sufficient for demonstration
- In-memory rate limiting is acceptable (resets on worker restart)
