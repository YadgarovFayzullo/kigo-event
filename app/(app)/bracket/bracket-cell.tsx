"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"

import { ConfirmButton } from "@/components/app/confirm-button"
import { TriggerButton } from "@/components/app/trigger-button"
import { Input } from "@/components/ui/input"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { MatchDrawer } from "../matches/match-drawer"
import { submitResultAction } from "../actions"

export type BracketCellMatch = {
  id: string
  stage: string | null
  groupName: string | null
  roundNumber: number | null
  homeTeam: string | null
  homeTeamName: string | null
  awayTeam: string | null
  awayTeamName: string | null
  scheduledAt: string | null
  referee: string | null
  refereeName: string | null
  homeScore: number | null
  awayScore: number | null
  winner: string | null
  status: string | null
}

/**
 * One fixture in the knockout bracket.
 *
 * Picking a side is the whole interaction: the platform moves the winner into
 * the next fixture itself (`advance_winner` on the backend), so this only has
 * to record the result and let the page refresh.
 *
 * Scores are optional. Enter them and the winner follows from the score; leave
 * them empty and the tie is recorded 0:0 with the chosen side going through,
 * which is exactly how the backend models a knockout settled on penalties.
 */
export function BracketCell({
  tournamentId,
  match,
  referees = [],
  onResult,
}: {
  tournamentId: string
  match: BracketCellMatch
  referees?: { id: string; name: string; isActive: boolean }[]
  /**
   * Demo mode. When supplied, the result is handed here instead of being sent
   * to the API -- the card stays fully interactive, which is the entire point
   * of a demo, it just never writes anything.
   */
  onResult?: (result: {
    matchId: string
    homeScore: number
    awayScore: number
    winnerId: string | null
  }) => void
}) {
  const [pending, startTransition] = useTransition()
  const [picked, setPicked] = useState<string | null>(match.winner)
  const [home, setHome] = useState(match.homeScore?.toString() ?? "")
  const [away, setAway] = useState(match.awayScore?.toString() ?? "")

  const demo = Boolean(onResult)
  const ready = Boolean(match.homeTeam && match.awayTeam)
  const decided = match.winner !== null
  const scoresEntered = home !== "" && away !== ""

  function save() {
    // No score means "settled on penalties": 0:0 plus an explicit winner, the
    // one shape the API accepts for a knockout tie.
    const homeScore = scoresEntered ? Number(home) : 0
    const awayScore = scoresEntered ? Number(away) : 0
    const tie = homeScore === awayScore

    if (tie && !picked) {
      toast.error("Gʻolibni tanlang.")
      return
    }

    const winnerId = tie
      ? picked
      : homeScore > awayScore
        ? match.homeTeam
        : match.awayTeam

    if (onResult) {
      onResult({ matchId: match.id, homeScore, awayScore, winnerId })
      toast.success("Namuna: gʻolib keyingi bosqichga oʻtdi (saqlanmadi).")
      return
    }

    startTransition(async () => {
      const result = await submitResultAction(tournamentId, match.id, {
        home_score: homeScore,
        away_score: awayScore,
        winner_id: tie && picked ? Number(picked) : undefined,
      })
      if (result.ok) toast.success("Natija saqlandi.")
      else toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
    })
  }

  const side = (
    teamId: string | null,
    name: string | null,
    score: string,
    setScore: (value: string) => void
  ) => {
    const isWinner = match.winner !== null && match.winner === teamId
    const isPicked = picked !== null && picked === teamId
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          isWinner && "bg-emerald-500/10 font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
          !isWinner && isPicked && "bg-muted font-medium"
        )}
      >
        <button
          type="button"
          disabled={!ready || decided || pending || !teamId}
          onClick={() => setPicked(teamId)}
          className="min-w-0 flex-1 truncate text-left disabled:cursor-default"
          aria-pressed={isPicked}
        >
          {name ?? <span className="text-muted-foreground">—</span>}
        </button>

        {decided ? (
          <span className="w-8 text-right font-mono tabular-nums">
            {score === "" ? "—" : score}
          </span>
        ) : (
          <Input
            value={score}
            onChange={(event) => setScore(event.target.value)}
            type="number"
            min={0}
            disabled={!ready || pending}
            aria-label={`${name ?? "Jamoa"} hisobi`}
            className="h-7 w-12 px-1.5 text-center"
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-[168px] flex-col justify-between gap-1 rounded-lg border bg-card p-2 shadow-xs">
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="truncate text-xs text-muted-foreground">
          {match.scheduledAt ? formatDateTime(match.scheduledAt) : "Vaqti yoʻq"}
          {match.refereeName ? ` · ${match.refereeName}` : ""}
        </span>
        {demo ? null : (
          <MatchDrawer
            tournamentId={tournamentId}
            referees={referees}
            match={{
              id: match.id,
              stage: match.stage,
              groupName: match.groupName,
              roundNumber: match.roundNumber,
              homeTeam: match.homeTeam,
              homeTeamName: match.homeTeamName,
              awayTeam: match.awayTeam,
              awayTeamName: match.awayTeamName,
              scheduledAt: match.scheduledAt,
              referee: match.referee,
              refereeName: match.refereeName,
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              winner: match.winner,
            }}
            trigger={
              <TriggerButton
                variant="ghost"
                size="icon-xs"
                aria-label="Tahrirlash"
                className="shrink-0"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} />
              </TriggerButton>
            }
          />
        )}
      </div>

      {side(match.homeTeam, match.homeTeamName, home, setHome)}
      {side(match.awayTeam, match.awayTeamName, away, setAway)}

      {decided ? (
        <p className="px-2 pt-0.5 text-xs text-muted-foreground">
          Gʻolib keyingi bosqichga oʻtdi
        </p>
      ) : !ready ? (
        <p className="px-2 pt-0.5 text-xs text-muted-foreground">
          {match.homeTeam || match.awayTeam
            ? "Raqib aniqlanmagan"
            : "Ishtirokchilar aniqlanmagan"}
        </p>
      ) : (
        <ConfirmButton
          size="sm"
          className="mt-1 w-full"
          disabled={pending}
          title="Natija saqlansinmi?"
          description={
            scoresEntered && home !== away
              ? `${match.homeTeamName ?? "—"} ${home} : ${away} ${match.awayTeamName ?? "—"}. Gʻolib keyingi bosqichga oʻtkaziladi.`
              : "Hisob teng, shuning uchun gʻolib penaltida aniqlangan deb yoziladi va keyingi bosqichga oʻtkaziladi."
          }
          confirmLabel="Saqlash"
          onConfirm={save}
        >
          {demo ? "Saqlash (namuna)" : "Saqlash"}
        </ConfirmButton>
      )}
    </div>
  )
}
