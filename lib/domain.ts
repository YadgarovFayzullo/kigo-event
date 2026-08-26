/**
 * Display labels for the KiGo API's status codes.
 *
 * The backend sends English codes from model `TextChoices`, not from a
 * dictionary table, so the mapping belongs on this side. Kept free of
 * server-only imports so client components can use it too.
 */

// --- Tournaments -----------------------------------------------------------

export const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Qoralama",
  registration: "Roʻyxatga olish",
  scheduled: "Rejalashtirilgan",
  running: "Davom etmoqda",
  finished: "Yakunlangan",
}

export const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  verified: "Tasdiqlangan",
  rejected: "Rad etilgan",
}

export const TEAM_STATUS_LABELS: Record<string, string> = {
  forming: "Shakllanmoqda",
  submitted: "Yuborilgan",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
}

export const MATCH_STATUS_LABELS: Record<string, string> = {
  scheduled: "Rejalashtirilgan",
  live: "Jonli",
  finished: "Yakunlangan",
  cancelled: "Bekor qilingan",
}

export const MATCH_STAGE_LABELS: Record<string, string> = {
  group: "Guruh bosqichi",
  playoff: "Pley-off",
}

/** Falls back to the raw value so an unknown status still renders. */
export function labelFor(
  labels: Record<string, string>,
  value: string | null | undefined
): string {
  if (!value) return "—"
  return labels[value] ?? value
}
