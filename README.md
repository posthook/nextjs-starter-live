# Posthook Next.js Starter — Live Demo

Live demo of the [posthook/nextjs-starter](https://github.com/posthook/nextjs-starter) pattern. Shows how to schedule delayed tasks in Next.js using [Posthook](https://posthook.io) for durable per-event timing — no cron, no queues, no workflow engines.

**Live at**: [nextjs-starter.posthook.io](https://nextjs-starter.posthook.io)

## What This Adds on Top of the Starter

The [starter repo](https://github.com/posthook/nextjs-starter) has the backend patterns. This demo adds:

- **Landing page** explaining the patterns and linking to the starter
- **Interactive UI** with shadcn/ui (dashboard, task detail, actions)
- **Session isolation** — each visitor gets their own sandbox (30-min TTL)
- **Seeded data** — 3 pre-created tasks in different states on first visit
- **Live countdowns** — watch the reminder and expiration timers tick
- **Activity feed** — structured event details showing Posthook verification steps
- **Rate limits** — max 10 tasks per session
- **Session cleanup** — Posthook-scheduled cleanup hook at T+30min (dogfooding!)
- **5-second polling** — see task status changes in real time when hooks fire

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/posthook/nextjs-starter-live.git
cd nextjs-starter-live
npm install

# 2. Start local Postgres
docker compose up -d db

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Posthook API key and signing key

# 4. Create database tables
npm run db:push

# 5. Start the dev server
SEED_REMINDER_DELAY=45s SEED_EXPIRATION_DELAY=3m npm run dev

# 6. In another terminal, forward Posthook deliveries to localhost
npx posthook listen --forward http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) and click "Try the demo."

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `POSTHOOK_API_KEY` | Yes | Posthook API key (`phk_...`) |
| `POSTHOOK_SIGNING_KEY` | Yes | Posthook signing key (`phs_...`) |
| `OPENAI_API_KEY` | No | OpenAI key (falls back to simulated drafts) |
| `REMINDER_DELAY` | No | Default reminder delay for new tasks (default: `1h`) |
| `EXPIRATION_DELAY` | No | Default expiration delay for new tasks (default: `24h`) |
| `SEED_REMINDER_DELAY` | No | Seed task reminder delay (default: `45s`) |
| `SEED_EXPIRATION_DELAY` | No | Seed task expiration delay (default: `3m`) |

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [Posthook](https://posthook.io) for durable per-event scheduling
- [OpenAI](https://openai.com) for AI content generation
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS

## Related

- **[posthook/nextjs-starter](https://github.com/posthook/nextjs-starter)** — The backend patterns. Start here if you want to build your own.
- **[posthook.io](https://posthook.io)** — Durable scheduling API.

## License

MIT
