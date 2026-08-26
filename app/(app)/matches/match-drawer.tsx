"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { NativeSelect } from "@/components/app/native-select"
import { ConfirmButton } from "@/components/app/confirm-button"
import { StatusPill } from "@/components/app/status-pill"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/format"

import { submitResultAction, updateMatchAction } from "../actions"

export type MatchRow = {
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
  status: string | null
  homeScore: number | null
  awayScore: number | null
  winner: string | null
}

/** `2026-05-01T18:00:00Z` -> the `datetime-local` value in the local zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function MatchDrawer({
  tournamentId,
  match,
  referees,
  trigger,
  number,
}: {
  tournamentId: string
  match: MatchRow
  referees: { id: string; name: string }[]
  /** Row number, shown only by the default table-row trigger. */
  number?: number
  /**
   * What opens the sheet. The matches table passes its own row; the bracket
   * passes a small button. Omitted, it falls back to the table row -- the
   * editor itself is identical either way, which is the point of the prop.
   */
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [kickoff, setKickoff] = useState(toLocalInput(match.scheduledAt))
  const [referee, setReferee] = useState(match.referee ?? "")
  const [home, setHome] = useState(match.homeScore?.toString() ?? "")
  const [away, setAway] = useState(match.awayScore?.toString() ?? "")
  const [winner, setWinner] = useState(match.winner ?? "")

  // Only a level play-off tie needs an explicit winner; the backend works the
  // rest out from the score.
  const needsWinner =
    match.stage === "playoff" && home !== "" && home === away

  function saveMeta() {
    startTransition(async () => {
      const result = await updateMatchAction(tournamentId, match.id, {
        scheduled_at: kickoff ? new Date(kickoff).toISOString() : null,
        referee: referee ? Number(referee) : null,
      })
      if (result.ok) {
        toast.success("Saqlandi.")
        setOpen(false)
      } else {
        toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
      }
    })
  }

  function saveScore() {
    if (home === "" || away === "") return
    startTransition(async () => {
      const result = await submitResultAction(tournamentId, match.id, {
        home_score: Number(home),
        away_score: Number(away),
        winner_id: winner ? Number(winner) : undefined,
      })
      if (result.ok) {
        toast.success("Saqlandi.")
        setOpen(false)
      } else {
        toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
      }
    })
  }

  const stageLabel = match.stage === "playoff" ? "Pley-off" : "Guruh"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        // The fallback trigger is a table row; a supplied trigger is a real
        // button. Base UI warns either way if this doesn't match.
        nativeButton={Boolean(trigger)}
        render={
          trigger ?? (
          <TableRow className="cursor-pointer">
            <TableCell className="text-muted-foreground tabular-nums">
              {number}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {stageLabel}
            </TableCell>
            <TableCell className="text-sm">{match.groupName ?? "—"}</TableCell>
            <TableCell className="text-sm tabular-nums">
              {match.roundNumber ?? "—"}
            </TableCell>
            <TableCell className="text-sm">{match.homeTeamName ?? "—"}</TableCell>
            <TableCell className="text-sm">{match.awayTeamName ?? "—"}</TableCell>
            <TableCell className="font-mono tabular-nums">
              {match.homeScore === null || match.awayScore === null
                ? "—"
                : `${match.homeScore}:${match.awayScore}`}
            </TableCell>
            <TableCell className="text-sm whitespace-nowrap">
              {formatDateTime(match.scheduledAt)}
            </TableCell>
            <TableCell className="text-sm">{match.refereeName ?? "—"}</TableCell>
            <TableCell>
              <StatusPill status={match.status} />
            </TableCell>
          </TableRow>
          )
        }
      />

      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2 pr-12">
            {match.homeTeamName ?? "—"} – {match.awayTeamName ?? "—"}
            <StatusPill status={match.status} />
          </SheetTitle>
        </SheetHeader>

        <div className="grid gap-4 px-4 pb-6">
          <dl className="divide-y text-sm">
            {[
              ["Bosqich", stageLabel],
              ["Guruh", match.groupName],
              ["Tur", match.roundNumber],
            ].map(([label, value]) => (
              <div key={String(label)} className="grid grid-cols-[6rem_1fr] gap-2 py-1.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value ?? "—"}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-1.5">
            <label htmlFor="kickoff" className="text-sm font-medium">
              Vaqti
            </label>
            <Input
              id="kickoff"
              type="datetime-local"
              value={kickoff}
              onChange={(event) => setKickoff(event.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="referee" className="text-sm font-medium">
              Hakam
            </label>
            <NativeSelect
              id="referee"
              value={referee}
              onChange={(event) => setReferee(event.target.value)}
            >
              <option value="">—</option>
              {referees.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="home" className="text-sm font-medium">
                Uy
              </label>
              <Input
                id="home"
                type="number"
                min={0}
                value={home}
                onChange={(event) => setHome(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="away" className="text-sm font-medium">
                Mehmon
              </label>
              <Input
                id="away"
                type="number"
                min={0}
                value={away}
                onChange={(event) => setAway(event.target.value)}
              />
            </div>
          </div>

          {needsWinner ? (
            <div className="grid gap-1.5">
              <label htmlFor="winner" className="text-sm font-medium">
                Gʻolib
              </label>
              <NativeSelect
                id="winner"
                value={winner}
                onChange={(event) => setWinner(event.target.value)}
              >
                <option value="">—</option>
                {match.homeTeam ? (
                  <option value={match.homeTeam}>{match.homeTeamName}</option>
                ) : null}
                {match.awayTeam ? (
                  <option value={match.awayTeam}>{match.awayTeamName}</option>
                ) : null}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">
                Pley-offda durang boʻlsa gʻolibni tanlang.
              </p>
            </div>
          ) : null}

          <div className="flex gap-2">
            <ConfirmButton
              className="flex-1"
              disabled={pending || home === "" || away === ""}
              title="Hisob kiritilsinmi?"
              description={`${match.homeTeamName ?? "—"} ${home || "—"} : ${away || "—"} ${match.awayTeamName ?? "—"}. Natija turnir jadvalini oʻzgartiradi.`}
              confirmLabel="Kiritish"
              onConfirm={saveScore}
            >
              Hisobni kiritish
            </ConfirmButton>
            <ConfirmButton
              variant="outline"
              className="flex-1"
              disabled={pending}
              title="Oʻzgarishlar saqlansinmi?"
              description="Uchrashuv vaqti va hakami yangilanadi."
              confirmLabel="Saqlash"
              onConfirm={saveMeta}
            >
              Saqlash
            </ConfirmButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
