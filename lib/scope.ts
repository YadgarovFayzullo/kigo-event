import "server-only"

import { listTournaments, type Tournament } from "@/lib/bot-api/tournaments"

export type Scope = {
  tournaments: { id: string; name: string }[]
  selected: Tournament | null
  /** Non-null when the tournament list itself could not be loaded. */
  error: string | null
}

/**
 * Resolves the tournament the header selector is pointing at.
 *
 * Every scoped section needs the same three things -- the list for the picker,
 * the chosen record, and a way to say "the API is unreachable" -- so they are
 * resolved once here instead of in each page.
 */
export async function resolveScope(
  searchParams: Record<string, string | string[] | undefined>
): Promise<Scope> {
  const raw = searchParams.t
  const requested = Array.isArray(raw) ? raw[0] : raw

  const result = await listTournaments()
  if (!result.ok) {
    return { tournaments: [], selected: null, error: result.error.message }
  }

  const items = result.data.items
  const selected =
    items.find((tournament) => tournament.id === requested) ?? items[0] ?? null

  return {
    tournaments: items.map((t) => ({ id: t.id, name: t.name })),
    selected,
    error: null,
  }
}

/** First value of a possibly-repeated query parameter. */
export function one(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key]
  const flat = Array.isArray(value) ? value[0] : value
  return flat?.trim() || undefined
}
