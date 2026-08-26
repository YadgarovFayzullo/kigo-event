import type { BracketRound } from "@/lib/bracket"
import type { TournamentMatch } from "@/lib/bot-api/tournaments"

/**
 * A worked example of a knockout bracket, for looking at how the page behaves
 * without touching the live tournament.
 *
 * Every name is obviously invented, and the page renders this read-only: demo
 * mode never calls the API. It exists because the only data this app has is
 * production data -- there is no staging environment to click around in.
 */

const TEAMS = [
  "Demo Alfa",
  "Demo Beta",
  "Demo Gamma",
  "Demo Delta",
  "Demo Epsilon",
  "Demo Zeta",
  "Demo Eta",
  "Demo Teta",
]

function match(
  id: number,
  round: number,
  home: string | null,
  away: string | null,
  scores?: [number, number]
): TournamentMatch {
  const decided = scores !== undefined
  const homeWon = decided && scores[0] > scores[1]
  return {
    id: String(id),
    stage: "playoff",
    group: null,
    group_name: null,
    round_number: round,
    home_team: home ? `t-${home}` : null,
    home_team_name: home,
    away_team: away ? `t-${away}` : null,
    away_team_name: away,
    scheduled_at: id % 2 === 0 ? "2026-09-12T15:00:00Z" : null,
    club: null,
    referee: null,
    referee_name: id % 2 === 0 ? "Demo hakam" : null,
    status: decided ? "finished" : "scheduled",
    home_score: decided ? scores[0] : null,
    away_score: decided ? scores[1] : null,
    winner: decided ? `t-${homeWon ? home : away}` : null,
  }
}

/**
 * Eight teams, three rounds. The quarter-finals are played, one semi-final is
 * played and the other is waiting, so the page shows all three states at once:
 * decided, ready to decide, and not yet determined.
 */
export function demoBracket(): BracketRound[] {
  const [a, b, c, d, e, f, g, h] = TEAMS

  return [
    {
      roundNumber: 1,
      title: "Chorak final",
      subtitle: "1/4",
      matches: [
        match(101, 1, a, h, [3, 1]),
        match(102, 1, d, e, [0, 2]),
        match(103, 1, b, g, [1, 1]),
        match(104, 1, c, f, [2, 4]),
      ].map((m, index) => ({ match: m, index })),
    },
    {
      roundNumber: 2,
      title: "Yarim final",
      subtitle: "1/2",
      // Winners above: Alfa, Epsilon, Beta (on penalties), Zeta.
      matches: [
        match(201, 2, a, e, [2, 0]),
        match(202, 2, b, f),
      ].map((m, index) => ({ match: m, index })),
    },
    {
      roundNumber: 3,
      title: "Final",
      subtitle: "",
      matches: [match(301, 3, a, null)].map((m, index) => ({
        match: m,
        index,
      })),
    },
  ]
}
