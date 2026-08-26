import { z } from "zod"

/**
 * Mirrors the `tournaments` section of the KiGo API's OpenAPI schema
 * (https://api.kigo.uz/api/schema/).
 *
 * Permissive on purpose: unknown fields are ignored and optional ones may be
 * missing, so an API deploy that adds something never breaks a CRM page.
 */

const id = z.union([z.string(), z.number()]).transform(String)
const isoDate = z.string().nullish()

export const TOURNAMENT_STATUSES = [
  "draft",
  "registration",
  "scheduled",
  "running",
  "finished",
] as const
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number]

export const PARTICIPANT_STATUSES = ["pending", "verified", "rejected"] as const
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number]

export const TEAM_STATUSES = [
  "forming",
  "submitted",
  "approved",
  "rejected",
] as const
export type TeamStatus = (typeof TEAM_STATUSES)[number]

export const MATCH_STATUSES = [
  "scheduled",
  "live",
  "finished",
  "cancelled",
] as const
export type MatchStatus = (typeof MATCH_STATUSES)[number]

export const MATCH_STAGES = ["group", "playoff"] as const
export type MatchStage = (typeof MATCH_STAGES)[number]

/** Unknown enum values are kept as-is rather than failing the whole row. */
const looseEnum = <T extends readonly string[]>(values: T) =>
  z
    .string()
    .transform((value) =>
      values.includes(value) ? (value as T[number]) : value
    )

export const residentSchema = z.object({
  id: id,
  name: z.string(),
  tin: z.string().nullish(),
  is_active: z.boolean().nullish(),
})

export const tournamentSchema = z.object({
  id: id,
  name: z.string(),
  sport: z.union([z.string(), z.number()]).transform(String).nullish(),
  status: looseEnum(TOURNAMENT_STATUSES).nullish(),
  starts_on: isoDate,
  ends_on: isoDate,
  registration_deadline: isoDate,
  is_registration_open: z.boolean().nullish(),
  team_size: z.number().nullish(),
  max_teams: z.number().nullish(),
  group_size: z.number().nullish(),
  advance_per_group: z.number().nullish(),
  passport_note_uz: z.string().nullish(),
  passport_note_ru: z.string().nullish(),
  passport_note_en: z.string().nullish(),
  privacy_notice_uz: z.string().nullish(),
  privacy_notice_ru: z.string().nullish(),
  privacy_notice_en: z.string().nullish(),
  teams_count: z.number().nullish(),
  participants_count: z.number().nullish(),
  created_at: isoDate,
})

export const participantSchema = z.object({
  id: id,
  full_name: z.string(),
  phone: z.string().nullish(),
  telegram_id: z.union([z.string(), z.number()]).transform(String).nullish(),
  telegram_username: z.string().nullish(),
  location_name: z.string().nullish(),
  passport_series: z.string().nullish(),
  passport_copy_url: z.string().nullish(),
  company: residentSchema.nullish(),
  /** Free-text company the applicant typed when none matched. */
  company_input: z.string().nullish(),
  team: z.union([z.string(), z.number()]).transform(String).nullish(),
  team_name: z.string().nullish(),
  is_captain: z.boolean().nullish(),
  status: looseEnum(PARTICIPANT_STATUSES).nullish(),
  rejection_reason: z.string().nullish(),
  consent_accepted_at: isoDate,
  created_at: isoDate,
})

export const teamSchema = z.object({
  id: id,
  name: z.string(),
  join_code: z.string().nullish(),
  company: residentSchema.nullish(),
  captain_name: z.string().nullish(),
  group_name: z.string().nullish(),
  members_count: z.number().nullish(),
  status: looseEnum(TEAM_STATUSES).nullish(),
  is_open: z.boolean().nullish(),
  rejection_reason: z.string().nullish(),
  created_at: isoDate,
})

export const matchSchema = z.object({
  id: id,
  stage: looseEnum(MATCH_STAGES).nullish(),
  group: z.union([z.string(), z.number()]).transform(String).nullish(),
  group_name: z.string().nullish(),
  round_number: z.number().nullish(),
  home_team: z.union([z.string(), z.number()]).transform(String).nullish(),
  home_team_name: z.string().nullish(),
  away_team: z.union([z.string(), z.number()]).transform(String).nullish(),
  away_team_name: z.string().nullish(),
  scheduled_at: isoDate,
  club: z.union([z.string(), z.number()]).transform(String).nullish(),
  referee: z.union([z.string(), z.number()]).transform(String).nullish(),
  referee_name: z.string().nullish(),
  status: looseEnum(MATCH_STATUSES).nullish(),
  home_score: z.number().nullish(),
  away_score: z.number().nullish(),
  winner: z.union([z.string(), z.number()]).transform(String).nullish(),
})

export const refereeSchema = z.object({
  id: id,
  full_name: z.string(),
  phone: z.string().nullish(),
  telegram_id: z.union([z.string(), z.number()]).transform(String).nullish(),
  is_active: z.boolean().nullish(),
  rating_avg: z.union([z.string(), z.number()]).nullish(),
  rating_count: z.number().nullish(),
})

export const standingRowSchema = z.object({
  position: z.number(),
  team_id: z.union([z.string(), z.number()]).transform(String),
  team_name: z.string(),
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goals_for: z.number(),
  goals_against: z.number(),
  goal_difference: z.number(),
  points: z.number(),
})

export const groupStandingSchema = z.object({
  group_id: z.union([z.string(), z.number()]).transform(String),
  group_name: z.string(),
  rows: z.array(standingRowSchema),
})

export const sportSchema = z.object({
  id: id,
  code: z.string().nullish(),
  name_uz: z.string().nullish(),
  name_ru: z.string().nullish(),
  name_en: z.string().nullish(),
})

export type Tournament = z.infer<typeof tournamentSchema>
export type TournamentParticipant = z.infer<typeof participantSchema>
export type TournamentTeam = z.infer<typeof teamSchema>
export type TournamentMatch = z.infer<typeof matchSchema>
export type Referee = z.infer<typeof refereeSchema>
export type Resident = z.infer<typeof residentSchema>
export type GroupStanding = z.infer<typeof groupStandingSchema>
export type StandingRow = z.infer<typeof standingRowSchema>
export type ApiSport = z.infer<typeof sportSchema>

export type Page<T> = {
  items: T[]
  page: number
  pages: number
  total: number
  /** Rows the API returned that this app could not read. */
  skipped: number
}

/**
 * Collection parser.
 *
 * Some endpoints page (`{ items, page, pages, total }`), others return a bare
 * array; both shapes are accepted so a caller never has to care. Rows that
 * fail to parse are dropped and counted rather than failing the whole page --
 * partial data still renders something useful.
 */
export function parsePage<T>(schema: z.ZodType<T>) {
  return (body: unknown): Page<T> => {
    const envelope = z
      .union([
        z.array(z.unknown()),
        z.object({
          items: z.array(z.unknown()),
          page: z.number().nullish(),
          pages: z.number().nullish(),
          total: z.number().nullish(),
        }),
        z.object({
          results: z.array(z.unknown()),
          count: z.number().nullish(),
        }),
      ])
      .parse(body ?? [])

    const rows = Array.isArray(envelope)
      ? envelope
      : "items" in envelope
        ? envelope.items
        : envelope.results

    const items: T[] = []
    let skipped = 0
    for (const row of rows) {
      const parsed = schema.safeParse(row)
      if (parsed.success) items.push(parsed.data)
      else skipped += 1
    }

    if (Array.isArray(envelope)) {
      return { items, page: 1, pages: 1, total: items.length, skipped }
    }
    if ("items" in envelope) {
      return {
        items,
        page: envelope.page ?? 1,
        pages: envelope.pages ?? 1,
        total: envelope.total ?? items.length,
        skipped,
      }
    }
    return {
      items,
      page: 1,
      pages: 1,
      total: envelope.count ?? items.length,
      skipped,
    }
  }
}
