import type { Metadata } from "next"

import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { requireUser } from "@/lib/auth/guards"
import {
  listMatches,
  listReferees,
  type TournamentMatch,
} from "@/lib/bot-api/tournaments"
import { buildBracket } from "@/lib/bracket"
import { demoBracket } from "@/lib/bracket-demo"
import { LinkButton } from "@/components/app/link-button"
import { one, resolveScope } from "@/lib/scope"

import { SectionHeader } from "../section-header"
import { BracketBoard } from "./bracket-board"
import { DemoBoard } from "./demo-board"

export const metadata: Metadata = { title: "Setka" }

/** API fixture -> the shape a bracket card renders. */
function toCell(match: TournamentMatch) {
  return {
    id: match.id,
    stage: match.stage ?? null,
    groupName: match.group_name ?? null,
    roundNumber: match.round_number ?? null,
    homeTeam: match.home_team ?? null,
    homeTeamName: match.home_team_name ?? null,
    awayTeam: match.away_team ?? null,
    awayTeamName: match.away_team_name ?? null,
    scheduledAt: match.scheduled_at ?? null,
    referee: match.referee ?? null,
    refereeName: match.referee_name ?? null,
    homeScore: match.home_score ?? null,
    awayScore: match.away_score ?? null,
    winner: match.winner ?? null,
    status: match.status ?? null,
  }
}

export default async function BracketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const scope = await resolveScope(params)

  // Demo mode renders an invented bracket and never calls the API. There is no
  // staging environment -- every other view here is live production data -- so
  // this is the one place to see how the page behaves without changing a real
  // tournament.
  const demo = one(params, "demo") === "1"

  const result =
    !demo && scope.selected
      ? await listMatches(scope.selected.id, { stage: "playoff" })
      : null

  /**
   * With no bracket yet, the useful thing to say is *why*. The platform builds
   * the play-off only once every group fixture has a result, so count what is
   * outstanding rather than leaving the operator guessing.
   */
  const groupStage =
    !demo && scope.selected && result?.ok && result.data.items.length === 0
      ? await listMatches(scope.selected.id, { stage: "group" })
      : null
  const groupTotal = groupStage?.ok ? groupStage.data.items.length : 0
  const groupLeft = groupStage?.ok
    ? groupStage.data.items.filter((match) => match.status !== "finished").length
    : 0

  const referees = await listReferees()
  const refereeOptions = referees.ok
    ? referees.data.items
        .filter((referee) => referee.is_active !== false)
        .map((referee) => ({ id: referee.id, name: referee.full_name }))
    : []

  const rounds = demo
    ? demoBracket()
    : result?.ok
      ? buildBracket(result.data.items)
      : []

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Pley-off setkasi"
        tournaments={scope.tournaments}
        selected={scope.selected?.id ?? null}
        actions={
          demo ? (
            <LinkButton
              href={`/bracket${scope.selected ? `?t=${scope.selected.id}` : ""}`}
              variant="outline"
            >
              Haqiqiy setka
            </LinkButton>
          ) : (
            <LinkButton
              href={`/bracket?demo=1${scope.selected ? `&t=${scope.selected.id}` : ""}`}
              variant="outline"
            >
              Namunani koʻrish
            </LinkButton>
          )
        }
      />

      {demo ? (
        <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm">
          <p className="font-medium">Namuna setka</p>
          <p className="text-muted-foreground">
            Bu oʻylab topilgan maʼlumot. Hech narsa saqlanmaydi va haqiqiy
            turnirga taʼsir qilmaydi — sahifa qanday ishlashini koʻrish uchun.
          </p>
        </div>
      ) : null}

      {!demo && scope.error ? (
        <BotDataNotice error={{ kind: "unauthorized", message: scope.error }} />
      ) : !demo && !scope.selected ? (
        <EmptyState title="Maʼlumot yoʻq" description="Avval turnir yarating." />
      ) : !demo && !result?.ok ? (
        result ? <BotDataNotice error={result.error} /> : null
      ) : rounds.length === 0 ? (
        <EmptyState
          title="Setka hali tuzilmagan"
          description={
            groupTotal === 0
              ? "Avval «Oʻyinlar» boʻlimida qurʼa tashlang — guruh bosqichi shundan boshlanadi."
              : groupLeft > 0
                ? `Guruh bosqichidagi ${groupTotal} ta oʻyindan ${groupLeft} tasi yakunlanmagan. Barcha natijalar kiritilgach, «Oʻyinlar» boʻlimida «Pley-off» tugmasi setkani tuzadi.`
                : "Guruh bosqichi tugagan. «Oʻyinlar» boʻlimida «Pley-off» tugmasini bosing."
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Gʻolibni tanlang va natijani saqlang — u keyingi bosqichga
            avtomatik oʻtadi.
          </p>

          {demo ? (
            <DemoBoard
              initial={rounds.map((round) => ({
                roundNumber: round.roundNumber,
                title: round.title,
                subtitle: round.subtitle,
                matches: round.matches.map(({ match }) => toCell(match)),
              }))}
            />
          ) : (
            <BracketBoard
              tournamentId={scope.selected?.id ?? ""}
              referees={refereeOptions}
              rounds={rounds.map((round) => ({
                roundNumber: round.roundNumber,
                title: round.title,
                subtitle: round.subtitle,
                matches: round.matches.map(({ match }) => toCell(match)),
              }))}
            />
          )}
        </>
      )}
    </div>
  )
}
