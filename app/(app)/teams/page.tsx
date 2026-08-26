import type { Metadata } from "next"

import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { Pager } from "@/components/app/pager"
import { StatusPill } from "@/components/app/status-pill"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireUser } from "@/lib/auth/guards"
import { listTeams } from "@/lib/bot-api/tournaments"
import { one, resolveScope } from "@/lib/scope"

import { SectionHeader } from "../section-header"
import { TeamDialog } from "./team-dialog"

export const metadata: Metadata = { title: "Jamoalar" }

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const scope = await resolveScope(params)
  const page = Number(one(params, "page") ?? 1) || 1

  const result = scope.selected
    ? await listTeams(scope.selected.id, { page })
    : null

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Jamoalar"
        tournaments={scope.tournaments}
        selected={scope.selected?.id ?? null}
      />

      {scope.error ? (
        <BotDataNotice error={{ kind: "unauthorized", message: scope.error }} />
      ) : !scope.selected ? (
        <EmptyState title="Maʼlumot yoʻq" description="Avval turnir yarating." />
      ) : !result?.ok ? (
        result ? <BotDataNotice error={result.error} /> : null
      ) : result.data.items.length === 0 ? (
        <EmptyState title="Maʼlumot yoʻq" />
      ) : (
        <>
          <Card className="overflow-hidden py-0">
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Kompaniya</TableHead>
                      <TableHead>Kapitan</TableHead>
                      <TableHead>Guruh</TableHead>
                      <TableHead>Aʼzolar</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.items.map((team, index) => (
                      <TableRow key={team.id}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {(result.data.page - 1) * 15 + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {team.join_code ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {team.company?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {team.captain_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {team.group_name ?? "—"}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {team.members_count ?? 0}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={team.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <TeamDialog
                            tournamentId={scope.selected!.id}
                            team={{
                              id: team.id,
                              name: team.name,
                              status: team.status ?? null,
                              reason: team.rejection_reason ?? null,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Pager
            page={result.data.page}
            pages={result.data.pages}
            basePath="/teams"
            params={{ t: scope.selected.id }}
          />
        </>
      )}
    </div>
  )
}
