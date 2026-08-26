import "server-only"

import type { TournamentMatch } from "@/lib/bot-api/tournaments"

export type BracketMatch = {
  match: TournamentMatch
  /** Index of this fixture within its round, counting from the top. */
  index: number
}

export type BracketRound = {
  roundNumber: number
  /** "Chorak final", "Yarim final", "Final". */
  title: string
  /** The same round as a fraction -- "1/4", "1/2". Empty for the final. */
  subtitle: string
  matches: BracketMatch[]
}

/**
 * Arranges knockout fixtures into rounds, left to right.
 *
 * The API exposes `round_number` but not the link between a fixture and the one
 * it feeds, so the pairing is reconstructed from how the backend builds the
 * bracket: it creates the final first and works outwards, numbering rounds so
 * the opening round is 1 and the final is the highest. Within a round the
 * fixtures are created in bracket order, so ascending id *is* that order, and
 * fixture `i` feeds fixture `i / 2` of the next round.
 *
 * If that ever stops holding, the columns still render correctly -- only the
 * "feeds into" hint between them would be wrong.
 */
export function buildBracket(matches: TournamentMatch[]): BracketRound[] {
  const playoff = matches.filter((match) => match.stage === "playoff")
  if (playoff.length === 0) return []

  const byRound = new Map<number, TournamentMatch[]>()
  for (const match of playoff) {
    const round = match.round_number ?? 1
    const bucket = byRound.get(round)
    if (bucket) bucket.push(match)
    else byRound.set(round, [match])
  }

  const rounds = [...byRound.keys()].sort((a, b) => a - b)
  const lastRound = rounds[rounds.length - 1]

  return rounds.map((roundNumber) => ({
    roundNumber,
    title: roundTitle(roundNumber, lastRound),
    subtitle: roundFraction(roundNumber, lastRound),
    matches: (byRound.get(roundNumber) ?? [])
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((match, index) => ({ match, index })),
  }))
}

function roundTitle(roundNumber: number, lastRound: number): string {
  const fromEnd = lastRound - roundNumber
  if (fromEnd === 0) return "Final"
  if (fromEnd === 1) return "Yarim final"
  if (fromEnd === 2) return "Chorak final"
  return `${2 ** fromEnd} juftlik`
}

/**
 * The round as a fraction of the bracket. Shown beside the name because
 * "Chorak final" and "1/4" are how people refer to the same round
 * interchangeably, and the deeper rounds only have the fraction.
 */
function roundFraction(roundNumber: number, lastRound: number): string {
  const fromEnd = lastRound - roundNumber
  if (fromEnd === 0) return ""
  return `1/${2 ** fromEnd}`
}
