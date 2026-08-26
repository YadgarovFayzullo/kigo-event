import "server-only"

import { botFetch, type BotResult } from "./client"
import {
  groupStandingSchema,
  matchSchema,
  parsePage,
  participantSchema,
  refereeSchema,
  residentSchema,
  sportSchema,
  teamSchema,
  tournamentSchema,
  type ApiSport,
  type GroupStanding,
  type MatchStatus,
  type Page,
  type ParticipantStatus,
  type Referee,
  type Resident,
  type TeamStatus,
  type Tournament,
  type TournamentMatch,
  type TournamentParticipant,
} from "./tournament-schemas"

/**
 * The `admin/tournaments/*` surface of the KiGo API.
 *
 * Everything here belongs to the KiGo platform -- this app stores none of it.
 * Calls carry the signed-in operator's bearer token (see `client.ts`), so they
 * are never shared between users through the cache.
 */

const base = "tournaments/admin"

/** Cache tags, so a mutation can invalidate exactly what it changed. */
export const TOURNAMENT_TAGS = {
  all: "kigo:tournaments",
  one: (id: string) => `kigo:tournament:${id}`,
  referees: "kigo:referees",
  residents: "kigo:residents",
}

const PAGE_SIZE = 15

// --- tournaments -----------------------------------------------------------

export function listTournaments(): Promise<BotResult<Page<Tournament>>> {
  return botFetch(`${base}/`, parsePage(tournamentSchema), {
    searchParams: { pageSize: 100 },
    tags: [TOURNAMENT_TAGS.all],
  })
}

export function getTournament(id: string): Promise<BotResult<Tournament>> {
  return botFetch(
    `${base}/${encodeURIComponent(id)}/`,
    (body) => tournamentSchema.parse(body),
    { tags: [TOURNAMENT_TAGS.all, TOURNAMENT_TAGS.one(id)] }
  )
}

export type TournamentInput = {
  name: string
  sport?: number
  status?: string
  starts_on?: string | null
  ends_on?: string | null
  registration_deadline?: string | null
  team_size?: number
  max_teams?: number
  group_size?: number
  advance_per_group?: number
  passport_note_uz?: string
  passport_note_ru?: string
  passport_note_en?: string
  privacy_notice_uz?: string
  privacy_notice_ru?: string
  privacy_notice_en?: string
}

export function createTournament(
  input: TournamentInput
): Promise<BotResult<Tournament>> {
  return botFetch(`${base}/`, (body) => tournamentSchema.parse(body), {
    method: "POST",
    body: input,
  })
}

export function updateTournament(
  id: string,
  input: Partial<TournamentInput>
): Promise<BotResult<Tournament>> {
  return botFetch(
    `${base}/${encodeURIComponent(id)}/`,
    (body) => tournamentSchema.parse(body),
    { method: "PATCH", body: input }
  )
}

// --- participants ----------------------------------------------------------

export function listParticipants(
  tournamentId: string,
  query: { page?: number; status?: string; q?: string; pageSize?: number } = {}
): Promise<BotResult<Page<TournamentParticipant>>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/participants/`,
    parsePage(participantSchema),
    {
      searchParams: {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? PAGE_SIZE,
        status: query.status || undefined,
        q: query.q || undefined,
      },
      tags: [TOURNAMENT_TAGS.one(tournamentId)],
    }
  )
}

export function decideParticipant(
  tournamentId: string,
  participantId: string,
  input: { status: ParticipantStatus; rejection_reason?: string }
): Promise<BotResult<TournamentParticipant>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/participants/${encodeURIComponent(participantId)}/decision/`,
    (body) => participantSchema.parse(body),
    { method: "POST", body: input }
  )
}

// --- teams -----------------------------------------------------------------

export function listTeams(
  tournamentId: string,
  query: { page?: number; pageSize?: number } = {}
): Promise<BotResult<Page<import("./tournament-schemas").TournamentTeam>>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/teams/`,
    parsePage(teamSchema),
    {
      searchParams: { page: query.page ?? 1, pageSize: query.pageSize ?? PAGE_SIZE },
      tags: [TOURNAMENT_TAGS.one(tournamentId)],
    }
  )
}

export function updateTeam(
  tournamentId: string,
  teamId: string,
  input: { status?: TeamStatus; rejection_reason?: string; is_open?: boolean }
): Promise<BotResult<import("./tournament-schemas").TournamentTeam>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}/`,
    (body) => teamSchema.parse(body),
    { method: "PATCH", body: input }
  )
}

// --- matches ---------------------------------------------------------------

export function listMatches(
  tournamentId: string,
  query: { stage?: string } = {}
): Promise<BotResult<Page<TournamentMatch>>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/matches/`,
    parsePage(matchSchema),
    {
      searchParams: { stage: query.stage || undefined },
      tags: [TOURNAMENT_TAGS.one(tournamentId)],
    }
  )
}

export function updateMatch(
  tournamentId: string,
  matchId: string,
  input: {
    scheduled_at?: string | null
    referee?: number | null
    club?: number | null
    status?: MatchStatus
  }
): Promise<BotResult<TournamentMatch>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/matches/${encodeURIComponent(matchId)}/`,
    (body) => matchSchema.parse(body),
    { method: "PATCH", body: input }
  )
}

export function submitMatchResult(
  tournamentId: string,
  matchId: string,
  input: { home_score: number; away_score: number; winner_id?: number }
): Promise<BotResult<TournamentMatch>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/matches/${encodeURIComponent(matchId)}/result/`,
    (body) => matchSchema.parse(body),
    { method: "POST", body: input }
  )
}

/**
 * Generate the group draw or the play-off bracket.
 *
 * `force` regenerates over an existing schedule and **discards its fixtures**,
 * so the UI confirms before sending it.
 */
export function generateDraw(
  tournamentId: string,
  kind: "draw" | "playoff",
  force: boolean
): Promise<BotResult<Page<TournamentMatch>>> {
  return botFetch(
    `${base}/${encodeURIComponent(tournamentId)}/${kind}/`,
    parsePage(matchSchema),
    { method: "POST", body: { force } }
  )
}

// --- referees & residents --------------------------------------------------

export function listReferees(): Promise<BotResult<Page<Referee>>> {
  return botFetch(`${base}/referees/`, parsePage(refereeSchema), {
    tags: [TOURNAMENT_TAGS.referees],
  })
}

export function createReferee(input: {
  full_name: string
  phone?: string
  telegram_id?: number
}): Promise<BotResult<Referee>> {
  return botFetch(`${base}/referees/`, (body) => refereeSchema.parse(body), {
    method: "POST",
    body: input,
  })
}

export function updateReferee(
  refereeId: string,
  input: {
    full_name?: string
    phone?: string
    telegram_id?: number | null
    is_active?: boolean
  }
): Promise<BotResult<Referee>> {
  return botFetch(
    `${base}/referees/${encodeURIComponent(refereeId)}/`,
    (body) => refereeSchema.parse(body),
    { method: "PATCH", body: input }
  )
}

/** The API models removal as deactivation -- the referee stays on past matches. */
export function deactivateReferee(refereeId: string): Promise<BotResult<null>> {
  return botFetch(
    `${base}/referees/${encodeURIComponent(refereeId)}/`,
    () => null,
    { method: "DELETE" }
  )
}

export function listResidents(
  query: { page?: number; q?: string } = {}
): Promise<BotResult<Page<Resident>>> {
  return botFetch(`${base}/residents/`, parsePage(residentSchema), {
    searchParams: {
      page: query.page ?? 1,
      pageSize: PAGE_SIZE,
      q: query.q || undefined,
    },
    tags: [TOURNAMENT_TAGS.residents],
  })
}

export function createResident(input: {
  name: string
  tin?: string
}): Promise<BotResult<Resident>> {
  return botFetch(`${base}/residents/`, (body) => residentSchema.parse(body), {
    method: "POST",
    body: input,
  })
}

// --- misc ------------------------------------------------------------------

/** Prefers the Uzbek name, falling back to whatever the API actually has. */
export function sportName(sport: ApiSport): string {
  return (
    sport.name_uz || sport.name_en || sport.name_ru || sport.code || sport.id
  )
}

export function listSports(): Promise<BotResult<Page<ApiSport>>> {
  return botFetch("sports/", parsePage(sportSchema), { revalidate: 3600 })
}

/** Group standings (served by the bot surface -- the admin API has none). */
export function listStandings(): Promise<BotResult<Page<GroupStanding>>> {
  return botFetch("tournaments/bot/standings/", parsePage(groupStandingSchema), {
    headers: process.env.BOT_API_KEY
      ? { "X-Bot-Api-Key": process.env.BOT_API_KEY }
      : undefined,
  })
}

export type {
  ApiSport,
  GroupStanding,
  Page,
  ParticipantStatus,
  Referee,
  Resident,
  TeamStatus,
  Tournament,
  TournamentMatch,
  TournamentParticipant,
}
