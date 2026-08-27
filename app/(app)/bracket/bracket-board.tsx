import { BracketCell, type BracketCellMatch } from "./bracket-cell"

export type BoardRound = {
  roundNumber: number
  title: string
  subtitle?: string
  matches: BracketCellMatch[]
}

/**
 * Column width, gutter between columns, and the vertical pitch of round one.
 *
 * ROW has to clear a whole card plus breathing room: cards are a fixed 168px
 * (see BracketCell), and a pitch smaller than that made neighbouring fixtures
 * overlap.
 */
const COL = 240
const GAP = 56
const CARD = 168
const ROW = CARD + 40

/**
 * The knockout bracket, drawn to scale.
 *
 * Each round halves in size, so a fixture sits exactly midway between the two
 * that feed it. Positions are computed rather than left to flexbox: that is
 * what lets the connector lines land on the right pixels, and it keeps the
 * board's height driven by the content instead of a container that has to
 * scroll internally and clips the last card.
 *
 * Cards are placed by their centre and pulled up half their own height, so a
 * taller card (one with the save button) still lines up with its connectors.
 */
export function BracketBoard({
  rounds,
  tournamentId,
  referees = [],
  onResult,
}: {
  rounds: BoardRound[]
  tournamentId: string
  referees?: { id: string; name: string; isActive: boolean }[]
  /** Demo mode: results are handled locally instead of being sent. */
  onResult?: (result: {
    matchId: string
    homeScore: number
    awayScore: number
    winnerId: string | null
  }) => void
}) {
  if (rounds.length === 0) return null

  const firstRoundSize = rounds[0].matches.length
  const height = Math.max(firstRoundSize, 1) * ROW
  const width = rounds.length * COL + (rounds.length - 1) * GAP

  // Vertical pitch doubles each round; centre of match j in round i.
  const pitch = (roundIndex: number) => ROW * 2 ** roundIndex
  const centerY = (roundIndex: number, matchIndex: number) =>
    pitch(roundIndex) * (matchIndex + 0.5)
  const colX = (roundIndex: number) => roundIndex * (COL + GAP)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative" style={{ width, height: height + 40 }}>
        {/* Round headings sit above the board. */}
        {rounds.map((round, index) => (
          <h2
            key={`title-${round.roundNumber}`}
            className="absolute top-0 flex items-baseline gap-1.5 text-sm font-semibold"
            style={{ left: colX(index), width: COL }}
          >
            {round.title}
            {round.subtitle ? (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {round.subtitle}
              </span>
            ) : null}
          </h2>
        ))}

        <div className="absolute inset-x-0" style={{ top: 40, height }}>
          {/* Connectors are drawn first so the cards sit on top of them. */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            {rounds.slice(1).map((round, offset) => {
              const target = offset + 1
              const source = offset
              const midX = colX(target) - GAP / 2
              return round.matches.map((_, matchIndex) => {
                const feeders = [matchIndex * 2, matchIndex * 2 + 1].filter(
                  (index) => index < rounds[source].matches.length
                )
                if (feeders.length === 0) return null
                const ys = feeders.map((index) => centerY(source, index))
                const toY = centerY(target, matchIndex)
                return (
                  <g
                    key={`c-${round.roundNumber}-${matchIndex}`}
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    {ys.map((y) => (
                      <path
                        key={y}
                        d={`M${colX(source) + COL},${y} H${midX}`}
                      />
                    ))}
                    {ys.length > 1 ? (
                      <path d={`M${midX},${ys[0]} V${ys[ys.length - 1]}`} />
                    ) : null}
                    <path d={`M${midX},${toY} H${colX(target)}`} />
                  </g>
                )
              })
            })}
          </svg>

          {rounds.map((round, roundIndex) =>
            round.matches.map((match, matchIndex) => (
              <div
                key={match.id}
                className="absolute -translate-y-1/2"
                style={{
                  left: colX(roundIndex),
                  top: centerY(roundIndex, matchIndex),
                  width: COL,
                }}
              >
                <BracketCell
                  tournamentId={tournamentId}
                  match={match}
                  referees={referees}
                  onResult={onResult}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
