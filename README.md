# CodeQuest

CodeQuest turns learning to code into short, playful quests. The current build includes the landing page, language catalog, Python and JavaScript learning maps, Supabase email/Google auth screens, and the Prisma data foundation.

## Run locally

1. Install Node.js 20.19 or newer.
2. Copy `.env.example` to `.env`.
3. Add Supabase URL and anon key to enable sign-in. Add `DATABASE_URL` and `DIRECT_URL` to connect the Postgres catalog.
4. Run `npm install`, `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
5. Start the app with `npm run dev` and open `http://localhost:3000`.

The learning map falls back to the checked-in demo catalog when Postgres is not configured, so the interface can be explored without credentials. When configured, the map reads its language, unit, and lesson data from Prisma/Postgres.

## Supabase setup

- Enable email auth and Google as an OAuth provider in Supabase.
- Set the local callback URL to `http://localhost:3000/auth/callback` in the Supabase redirect allowlist.
- Apply the Prisma migration, then run `prisma/rls.sql` in the Supabase SQL editor.
- Keep service keys and all provider API keys server-side. Never use `NEXT_PUBLIC_` for secrets.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

The authoritative content sources are listed in `content/sources.allowlist.json`. Lesson explanations are original summaries and link to the source material.
