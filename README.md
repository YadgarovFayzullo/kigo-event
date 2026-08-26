# KiGo — turnir boshqaruv paneli

Operator panel for KiGo's tournaments: registrations, teams, fixtures, the
knockout bracket, referees and resident companies.

The interface is in Uzbek. Everything it shows belongs to the KiGo platform —
**this app has no database of its own.** It reads and writes through
`https://api.kigo.uz/api/`, using the token of whoever is signed in.

## Quick start

```bash
cp .env.example .env.local     # fill in BOT_API_URL and AUTH_SECRET
npm install
npm run dev
```

Sign in with your KiGo operator account. There is no separate user list here:
`POST /api/admin/auth/login/` verifies the account and returns the bearer token
every other call uses, so the session *is* that token.

Only `role=admin` gets in — every tournament endpoint sits behind the
platform's `IsAdminStaff`. A `club_staff` account is turned away at sign-in with
an explanation rather than being let in to meet a 403 on every page.

## Sections

| Route | What it does |
| --- | --- |
| `/tournaments` | List and edit tournaments |
| `/participants` | Registrations: approve, reject with a reason, filter, search |
| `/teams` | Teams, join codes, status moderation |
| `/matches` | Fixtures, kick-off time, referee, scores; draw and play-off |
| `/bracket` | The knockout bracket — pick a winner and they advance |
| `/referees` | Referee directory, activation toggle |
| `/residents` | Resident companies |

The tournament is chosen once in the header and scopes the first five sections.
It lives in the query string (`?t=…`), so a filtered view is a real address you
can share or reload.

`/bracket?demo=1` renders an invented bracket that is fully interactive but
never calls the API — the only way to explore the mechanics without touching a
real tournament.

## How it talks to the platform

Everything goes through `lib/bot-api/`:

- **The token comes from the session, not the environment.** The API
  authenticates a person, so two operators act as themselves and no long-lived
  credential sits in the deployment config.
- **Admin responses are never cached.** They carry the operator's own token; a
  shared cache entry would leak one operator's view to another. Only the
  bot-facing standings endpoint is cached.
- **Failures don't throw into a page.** Calls return a `BotResult` union, so an
  outage degrades one panel instead of a 500.
- **Responses are parsed leniently.** Unknown fields are ignored and unreadable
  rows are skipped and counted, so a platform deploy can't blank the panel.

Two things the API does *not* offer, worth knowing before you look for them:

- **No filtering by team or company.** `/participants/` takes only `status` and
  `q`, and `q` matches the name alone. So the list is fetched once and filtered
  in the browser — which also means paging is instant instead of a round trip.
- **No way to undo a draw.** `draw`/`playoff` with `force` delete the existing
  fixtures *and their results* before rebuilding, and nothing clears a schedule
  without regenerating it. Both buttons confirm first, including the very first
  draw.

## Data

Nothing is stored here. A finished tournament stays on the platform with
`status = finished`; its matches, scores and registrations are kept in the
KiGo database. `Eksport` in the header downloads a tournament as xlsx.

That export is a route handler rather than a plain link
(`app/api/tournaments/[id]/export`): a browser following a link wouldn't send
the bearer token. It's the one place a Route Handler is used, because a Server
Action can't return a file.

## Deploying

```bash
docker compose up --build
```

`AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_URL` and `BOT_API_URL` are
required — compose refuses to start without them. There is no database service
to run alongside the app.

In development leave `AUTH_URL` unset: the origin is taken from the request, so
sign-in works on whatever port the dev server picks.

## Commands

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |
