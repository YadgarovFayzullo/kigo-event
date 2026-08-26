"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireOperator } from "@/lib/auth/guards"
import {
  createReferee,
  createResident,
  createTournament,
  deactivateReferee,
  decideParticipant,
  generateDraw,
  submitMatchResult,
  TOURNAMENT_TAGS,
  updateMatch,
  updateReferee,
  updateTeam,
  updateTournament,
} from "@/lib/bot-api/tournaments"
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/action-result"

/**
 * Every mutation the operator panel performs.
 *
 * These write to the KiGo API, not to a database here. The session check runs
 * first so an unauthenticated caller is redirected rather than relayed a 401,
 * and `updateTag` refreshes the affected reads with read-your-own-writes
 * semantics.
 */

type Result = { ok: boolean; message?: string }

const invalid = (error: z.ZodError) =>
  errorState(
    "Belgilangan maydonlarni toʻgʻrilang.",
    z.flattenError(error).fieldErrors as Record<string, string[]>
  )

// --- tournaments -----------------------------------------------------------

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? undefined : v))
    .optional()

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()

const optionalInt = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(z.number().int().min(min).max(max).optional())

const tournamentSchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 ta belgi").max(200),
  sport: optionalInt(1, 1_000_000),
  status: optionalText(30),
  starts_on: optionalDate,
  ends_on: optionalDate,
  registration_deadline: optionalDate,
  team_size: optionalInt(1, 100),
  max_teams: optionalInt(1, 10_000),
  group_size: optionalInt(2, 100),
  advance_per_group: optionalInt(1, 100),
  privacy_notice_uz: optionalText(4000),
  privacy_notice_ru: optionalText(4000),
  privacy_notice_en: optionalText(4000),
  passport_note_uz: optionalText(2000),
  passport_note_ru: optionalText(2000),
  passport_note_en: optionalText(2000),
})

function readTournament(formData: FormData) {
  const f = (name: string) => (formData.get(name) ?? "").toString()
  return tournamentSchema.safeParse({
    name: f("name"),
    sport: f("sport"),
    status: f("status"),
    starts_on: f("starts_on"),
    ends_on: f("ends_on"),
    registration_deadline: f("registration_deadline"),
    team_size: f("team_size"),
    max_teams: f("max_teams"),
    group_size: f("group_size"),
    advance_per_group: f("advance_per_group"),
    privacy_notice_uz: f("privacy_notice_uz"),
    privacy_notice_ru: f("privacy_notice_ru"),
    privacy_notice_en: f("privacy_notice_en"),
    passport_note_uz: f("passport_note_uz"),
    passport_note_ru: f("passport_note_ru"),
    passport_note_en: f("passport_note_en"),
  })
}

export async function saveTournamentAction(
  tournamentId: string | null,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOperator()

  const parsed = readTournament(formData)
  if (!parsed.success) return invalid(parsed.error)

  const result = tournamentId
    ? await updateTournament(tournamentId, parsed.data)
    : await createTournament(parsed.data)
  if (!result.ok) return errorState(result.error.message)

  updateTag(TOURNAMENT_TAGS.all)
  if (tournamentId) updateTag(TOURNAMENT_TAGS.one(tournamentId))
  if (!tournamentId) redirect(`/tournaments?t=${result.data.id}`)
  return successState("Saqlandi.")
}

// --- participants ----------------------------------------------------------

export async function decideParticipantAction(
  tournamentId: string,
  participantId: string,
  status: "verified" | "rejected",
  reason: string
): Promise<Result> {
  await requireOperator()

  if (status === "rejected" && reason.trim() === "") {
    return { ok: false, message: "Rad etish sababini yozing." }
  }

  const result = await decideParticipant(tournamentId, participantId, {
    status,
    rejection_reason: status === "rejected" ? reason.trim() : "",
  })
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.one(tournamentId))
  return { ok: true }
}

// --- teams -----------------------------------------------------------------

export async function updateTeamAction(
  tournamentId: string,
  teamId: string,
  status: string,
  reason: string
): Promise<Result> {
  await requireOperator()

  const parsed = z
    .enum(["forming", "submitted", "approved", "rejected"])
    .safeParse(status)
  if (!parsed.success) return { ok: false, message: "Notoʻgʻri holat." }

  const result = await updateTeam(tournamentId, teamId, {
    status: parsed.data,
    rejection_reason: reason.trim(),
  })
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.one(tournamentId))
  return { ok: true }
}

// --- matches ---------------------------------------------------------------

export async function updateMatchAction(
  tournamentId: string,
  matchId: string,
  input: { scheduled_at: string | null; referee: number | null }
): Promise<Result> {
  await requireOperator()

  const result = await updateMatch(tournamentId, matchId, input)
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.one(tournamentId))
  return { ok: true }
}

export async function submitResultAction(
  tournamentId: string,
  matchId: string,
  input: { home_score: number; away_score: number; winner_id?: number }
): Promise<Result> {
  await requireOperator()

  const parsed = z
    .object({
      home_score: z.number().int().min(0).max(999),
      away_score: z.number().int().min(0).max(999),
      winner_id: z.number().int().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Notoʻgʻri hisob." }

  const result = await submitMatchResult(tournamentId, matchId, parsed.data)
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.one(tournamentId))
  return { ok: true }
}

/** `force` discards the existing schedule -- the UI confirms before sending it. */
export async function generateDrawAction(
  tournamentId: string,
  kind: "draw" | "playoff",
  force: boolean
): Promise<Result & { created?: number }> {
  await requireOperator()

  const result = await generateDraw(tournamentId, kind, force)
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.one(tournamentId))
  return { ok: true, created: result.data.items.length }
}

// --- referees --------------------------------------------------------------

const refereeSchema = z.object({
  full_name: z.string().trim().min(2, "Ism kamida 2 ta belgi").max(200),
  phone: optionalText(40),
  telegram_id: optionalInt(1, Number.MAX_SAFE_INTEGER),
})

export async function saveRefereeAction(
  refereeId: string | null,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOperator()

  const parsed = refereeSchema.safeParse({
    full_name: (formData.get("full_name") ?? "").toString(),
    phone: (formData.get("phone") ?? "").toString(),
    telegram_id: (formData.get("telegram_id") ?? "").toString(),
  })
  if (!parsed.success) return invalid(parsed.error)

  const result = refereeId
    ? await updateReferee(refereeId, parsed.data)
    : await createReferee(parsed.data)
  if (!result.ok) return errorState(result.error.message)

  updateTag(TOURNAMENT_TAGS.referees)
  return successState("Saqlandi.")
}

/**
 * Turn a referee on or off.
 *
 * The API models the two directions differently: `DELETE` deactivates (it never
 * really deletes -- past matches keep pointing at whoever took them), and
 * re-activation is a `PATCH` of the flag. Both live behind one call so the UI
 * can just be a toggle.
 */
export async function setRefereeActiveAction(
  refereeId: string,
  isActive: boolean
): Promise<Result> {
  await requireOperator()

  const result = isActive
    ? await updateReferee(refereeId, { is_active: true })
    : await deactivateReferee(refereeId)
  if (!result.ok) return { ok: false, message: result.error.message }

  updateTag(TOURNAMENT_TAGS.referees)
  return { ok: true }
}

// --- residents -------------------------------------------------------------

const residentSchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 ta belgi").max(255),
  tin: optionalText(20),
})

export async function createResidentAction(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOperator()

  const parsed = residentSchema.safeParse({
    name: (formData.get("name") ?? "").toString(),
    tin: (formData.get("tin") ?? "").toString(),
  })
  if (!parsed.success) return invalid(parsed.error)

  const result = await createResident(parsed.data)
  if (!result.ok) return errorState(result.error.message)

  updateTag(TOURNAMENT_TAGS.residents)
  return successState("Saqlandi.")
}
