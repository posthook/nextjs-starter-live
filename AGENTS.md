# Posthook Next.js Starter — Live Demo

## What This Is
Live demo of the [posthook/nextjs-starter](https://github.com/posthook/nextjs-starter) patterns.
Deployed at nextjs-starter.posthook.io. Built with Next.js 16 App Router,
Postgres (Drizzle ORM), OpenAI, and shadcn/ui.

This repo = starter base + demo layer (sessions, seeding, UI, rate limits).

## Architecture

### Starter base (shared with posthook/nextjs-starter)
- `lib/posthook.ts` — Posthook client (lazy singleton for build safety)
- `lib/db/` — Drizzle ORM + Postgres
- `lib/store.ts` — Data access layer (session-scoped queries, `inArray` conditional updates)
- `lib/tasks.ts` — Task state machine and Posthook scheduling
- `lib/types.ts` — All TypeScript types (one payload type per webhook route)
- `app/api/webhooks/remind/route.ts` — Reminder callback handler
- `app/api/webhooks/expire/route.ts` — Expiration callback handler
- `app/api/tasks/` — Task CRUD API

### Demo layer (this repo only)
- `lib/ai.ts` — OpenAI generation with mock fallback
- `lib/demo/session.ts` — Session cookie management (30min TTL)
- `lib/demo/seed.ts` — Pre-written seed tasks per session
- `lib/demo/limits.ts` — Rate limiting (10 tasks per session)
- `app/page.tsx` — Landing page
- `app/(demo)/layout.tsx` — Demo banner + poller (route group)
- `app/(demo)/dashboard/page.tsx` — Task list with countdowns + activity feed
- `app/(demo)/tasks/[id]/page.tsx` — Task detail with Posthook timing
- `app/api/sessions/route.ts` — Session creation + seeding
- `app/api/webhooks/cleanup/route.ts` — Posthook-scheduled session cleanup
- `proxy.ts` — Next.js 16 proxy, redirects to landing if no session
- `components/` — UI components (shadcn/ui + custom)

## Key Patterns
- Search for `// POSTHOOK:` to find all Posthook integration points
- One route per hook type under `webhooks/`
- Schedule hooks BEFORE committing state (see PATTERNS.md)
- State verification: hooks check task state on delivery, not on action
- Epoch-based snooze: new hook + epoch increment, old hooks self-disarm
- Conditional updates: `WHERE status IN (...)` via `inArray` prevents race conditions
- Session scoping: all queries filter by `session_id`, webhooks use `getTaskById` (no cookie)
- Client-side time formatting: `LocalTime`/`LocalDateTime` components for correct timezone

## Do Not Change
- Signature verification pattern in webhook handlers (security-critical)
- The `runtime = 'nodejs'` export on webhook routes (SDK requires Node.js, not Edge)
- Store abstraction interface (change implementation, not interface)
- Session cookie name and TTL (defined in `lib/demo/session.ts`)

## Local Development
```bash
docker compose up -d db           # Start Postgres
npm run db:push                    # Create tables
cp .env.example .env.local         # Add your keys
npm run dev                        # Start Next.js
npx posthook listen --forward http://localhost:3000  # Forward webhooks
```

Use `SEED_REMINDER_DELAY=45s SEED_EXPIRATION_DELAY=3m npm run dev` for fast seed timers.

## Environment Variables
- `POSTHOOK_API_KEY` — required, starts with `phk_`
- `POSTHOOK_SIGNING_KEY` — required, starts with `phs_`
- `DATABASE_URL` — required, Postgres connection string
- `OPENAI_API_KEY` — optional, falls back to simulated drafts
- `REMINDER_DELAY` — optional, default `1h` (format: `30s`, `5m`, `1h`, `7d`)
- `EXPIRATION_DELAY` — optional, default `24h`
- `SEED_REMINDER_DELAY` — optional, default `45s`
- `SEED_EXPIRATION_DELAY` — optional, default `3m`

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Version Note
This project uses Next.js 16 which has breaking changes from earlier versions.
Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
Heed deprecation notices. Key changes: `params` is a Promise, `cookies()`/`headers()` are async,
`middleware.ts` is renamed to `proxy.ts`.
<!-- END:nextjs-agent-rules -->
