import type { Metadata } from "next"

import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { LinkButton } from "@/components/app/link-button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireUser } from "@/lib/auth/guards"
import { listMatches, listReferees } from "@/lib/bot-api/tournaments"
import { one, resolveScope } from "@/lib/scope"
import { cn } from "@/lib/utils"

import { SectionHeader } from "../section-header"
import { DrawButtons } from "./draw-buttons"
import { MatchDrawer } from "./match-drawer"

export const metadata: Metadata = { title: "Oʻyinlar" }

const STAGES = [
  { value: "", label: "Hammasi" },
  { value: "group", label: "Guruh" },
  { value: "playoff", label: "Pley-off" },
]

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const scope = await resolveScope(params)
  const stage = one(params, "stage") ?? ""

  const [result, referees] = await Promise.all([
    scope.selected ? listMatches(scope.selected.id, { stage }) : null,
    listReferees(),
  ])

  const refereeOptions = referees.ok
    ? referees.data.items
        .filter((referee) => referee.is_active !== false)
        .map((referee) => ({ id: referee.id, name: referee.full_name }))
    : []

  const stageHref = (value: string) => {
    const next = new URLSearchParams()
    if (scope.selected) next.set("t", scope.selected.id)
    if (value) next.set("stage", value)
    return `/matches?${next.toString()}`
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Oʻyinlar"
        tournaments={scope.tournaments}
        selected={scope.selected?.id ?? null}
      />

      {scope.error ? (
        <BotDataNotice error={{ kind: "unauthorized", message: scope.error }} />
      ) : !scope.selected ? (
        <EmptyState title="Maʼlumot yoʻq" description="Avval turnir yarating." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {STAGES.map((option) => (
                <LinkButton
                  key={option.value || "all"}
                  href={stageHref(option.value)}
                  size="sm"
                  variant={stage === option.value ? "default" : "outline"}
                  className={cn(stage === option.value && "pointer-events-none")}
                >
                  {option.label}
                </LinkButton>
              ))}
            </div>

            <DrawButtons
              tournamentId={scope.selected.id}
              hasMatches={Boolean(result?.ok && result.data.items.length > 0)}
            />
          </div>

          {!result?.ok ? (
            result ? <BotDataNotice error={result.error} /> : null
          ) : result.data.items.length === 0 ? (
            <EmptyState
              title="Maʼlumot yoʻq"
              description="Qurʼa tashlang — jadval shundan keyin paydo boʻladi."
            />
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Bosqich</TableHead>
                        <TableHead>Guruh</TableHead>
                        <TableHead>Tur</TableHead>
                        <TableHead>Mezbonlar</TableHead>
                        <TableHead>Mehmonlar</TableHead>
                        <TableHead>Hisob</TableHead>
                        <TableHead>Vaqti</TableHead>
                        <TableHead>Hakam</TableHead>
                        <TableHead>Holat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.items.map((match, index) => (
                        <MatchDrawer
                          key={match.id}
                          number={index + 1}
                          tournamentId={scope.selected!.id}
                          referees={refereeOptions}
                          match={{
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
                            status: match.status ?? null,
                            homeScore: match.home_score ?? null,
                            awayScore: match.away_score ?? null,
                            winner: match.winner ?? null,
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
