"use client"

import { useState } from "react"

import { BracketBoard, type BoardRound } from "./bracket-board"

/**
 * The demo bracket, played out locally.
 *
 * Fully interactive on purpose -- a demo where nothing responds demonstrates
 * nothing. Picking a winner advances them exactly the way the platform would,
 * so the mechanic is visible, but the result lives in React state and no
 * request is ever made.
 *
 * The advancement rule mirrors the backend's own: the winner of fixture `i`
 * takes the home slot of fixture `i / 2` in the next round when `i` is even,
 * and the away slot when it is odd.
 */
export function DemoBoard({ initial }: { initial: BoardRound[] }) {
  const [rounds, setRounds] = useState(initial)

  function applyResult({
    matchId,
    homeScore,
    awayScore,
    winnerId,
  }: {
    matchId: string
    homeScore: number
    awayScore: number
    winnerId: string | null
  }) {
    setRounds((previous) => {
      const next = previous.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({ ...match })),
      }))

      let roundIndex = -1
      let matchIndex = -1
      for (let r = 0; r < next.length; r += 1) {
        const found = next[r].matches.findIndex((m) => m.id === matchId)
        if (found !== -1) {
          roundIndex = r
          matchIndex = found
          break
        }
      }
      if (roundIndex === -1) return previous

      const played = next[roundIndex].matches[matchIndex]
      played.homeScore = homeScore
      played.awayScore = awayScore
      played.winner = winnerId
      played.status = "finished"

      const nextRound = next[roundIndex + 1]
      if (nextRound && winnerId) {
        const target = nextRound.matches[Math.floor(matchIndex / 2)]
        if (target) {
          const name =
            winnerId === played.homeTeam
              ? played.homeTeamName
              : played.awayTeamName
          if (matchIndex % 2 === 0) {
            target.homeTeam = winnerId
            target.homeTeamName = name
          } else {
            target.awayTeam = winnerId
            target.awayTeamName = name
          }
        }
      }

      return next
    })
  }

  return (
    <BracketBoard
      rounds={rounds}
      tournamentId="demo"
      onResult={applyResult}
    />
  )
}
