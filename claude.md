# CLAUDE.md

Guidance for Claude Code (and any contributor) working in this repo.

## What this is

The operator panel for KiGo's tournaments — registrations, teams, fixtures, the
knockout bracket, referees, resident companies. UI language is Uzbek.

It is a **front end for the KiGo API and nothing else.** There is no database,
no ORM, no migrations. Every screen is rendered per request from
`BOT_API_URL` using the signed-in operator's bearer token.

If you are about to add a table, a Prisma/TypeORM schema, or a "cache this
locally" table — stop. The platform owns this data; duplicating it here creates
a second source of truth that silently drifts.

## Tech stack

- **Next.js 16 (App Router)** — Server Components for reads, Server Actions for
  writes, one Route Handler for the xlsx export (a Server Action can't return a
  file).
- **Tailwind 4 + shadcn/ui on Base UI** — generated from a preset; don't
  hand-edit `components.json` theme values.
- **NextAuth v5** — credentials provider that delegates to the platform's
  `POST /api/admin/auth/login/`. There is no local user table.

## Layout

```
app/
  login/                  sign-in page and its Server Action
  (app)/                  everything behind a session
    actions.ts            every mutation, in one file
    tournaments/ participants/ teams/ matches/ bracket/
    referees/ residents/
  api/auth/[...nextauth]/ NextAuth's own callbacks
  api/tournaments/[id]/export/  proxies the xlsx download with the token
lib/
  bot-api/                the ONLY place that talks to the platform
  auth/                   NextAuth config and session guards
  bracket.ts              reconstructs the knockout tree from flat fixtures
  scope.ts                resolves the tournament the header points at
components/ui/            shadcn primitives (generated)
components/app/           shared pieces specific to this panel
```

## Rules that came from real bugs

- **The API token lives in the session, never in the environment.** It
  authenticates a person. `lib/bot-api/client.ts` reads it from `auth()`.
- **Never cache an admin response.** They are per-operator; a shared cache entry
  leaks one operator's view to another. `client.ts` forces `no-store` whenever a
  session token is present.
- **Never pass the `Button` component to a Base UI `render` prop.** Both set
  `data-slot`, and which wins differs between server render and hydration. Use
  `components/app/trigger-button.tsx`.
- **Match `nativeButton` to what you actually render.** A `<tr>` trigger needs
  `nativeButton={false}`; a real button needs `true`. Base UI warns either way.
- **Format dates by hand, not through `Intl` with a locale.** Browsers ship
  without `uz-UZ` date data and fall back to the root locale, so the server and
  the client disagree. See `lib/format.ts`.
- **Confirm before any write that can't be undone.** The API has no "clear the
  schedule" call, and `force` deletes existing fixtures *and their results*.
- **Don't re-implement platform logic.** Winner advancement through the bracket
  is the backend's `advance_winner`; this app only records the result.

## Working against a local backend

The KiGo backend runs locally from its own repo (`docker/docker-compose.yml`:
db, redis, minio, backend). Point `BOT_API_URL` at it and you are off
production. Two things that cost time the first go:

- Compose **merges** `ports` lists rather than replacing them — use `!override`
  in a port-remapping file if the defaults collide with other projects.
- `docker compose config` and `exec` validate every service's `env_file`,
  including the bots', so run management commands with plain `docker exec`.

Production data is the default. Treat every click in this panel as real unless
you have checked `BOT_API_URL`.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
docker compose up --build
```
