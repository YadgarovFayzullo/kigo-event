/**
 * Display helpers shared by server and client components.
 *
 * Dates are formatted by hand rather than through `Intl.DateTimeFormat`.
 * The same string has to come out of both the server render and the browser,
 * and browsers routinely ship without `uz-UZ` date data -- falling back to the
 * root locale, which renders August as "M08". A fixed `dd.MM.yyyy` pattern is
 * unambiguous, identical everywhere, and can't cause a hydration mismatch.
 */

export function formatNumber(value: number): string {
  // Grouping is safe to localise: every locale groups digits the same way here.
  return new Intl.NumberFormat("uz-UZ").format(value)
}

function parse(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? null : date
}

const pad = (value: number) => String(value).padStart(2, "0")

export function formatDate(value: Date | string | null | undefined): string {
  const date = parse(value)
  if (!date) return "—"
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

export function formatDateTime(
  value: Date | string | null | undefined
): string {
  const date = parse(value)
  if (!date) return "—"
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** "Ro'ziyev Mirjalol" -> "RM". Used for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
