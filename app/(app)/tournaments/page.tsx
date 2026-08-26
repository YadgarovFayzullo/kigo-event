import type { Metadata } from "next"

import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { StatusPill } from "@/components/app/status-pill"
import { TriggerButton } from "@/components/app/trigger-button"
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
import { listSports, listTournaments, sportName } from "@/lib/bot-api/tournaments"
import { formatDate, formatNumber } from "@/lib/format"
import { one } from "@/lib/scope"

import { SectionHeader } from "../section-header"
import { TournamentDialog } from "./tournament-dialog"

export const metadata: Metadata = { title: "Turnirlar" }

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const selected = one(params, "t") ?? null

  const [result, sports] = await Promise.all([listTournaments(), listSports()])
  const sportOptions = sports.ok
    ? sports.data.items.map((sport) => ({ id: sport.id, name: sportName(sport) }))
    : null

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Turnirlar"
        tournaments={result.ok ? result.data.items.map((t) => ({ id: t.id, name: t.name })) : []}
        selected={selected}
        actions={
          <TournamentDialog
            sports={sportOptions}
            trigger={<TriggerButton>+ Yangi turnir</TriggerButton>}
          />
        }
      />

      {!result.ok ? (
        <BotDataNotice error={result.error} />
      ) : result.data.items.length === 0 ? (
        <EmptyState title="Maʼlumot yoʻq" />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Sanalar</TableHead>
                    <TableHead>Jamoalar</TableHead>
                    <TableHead>Ishtirokchilar</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.items.map((tournament, index) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tournament.name}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={tournament.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(tournament.starts_on)} –{" "}
                        {formatDate(tournament.ends_on)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(tournament.teams_count ?? 0)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(tournament.participants_count ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <TournamentDialog
                          sports={sportOptions}
                          values={{
                            id: tournament.id,
                            name: tournament.name,
                            sport: tournament.sport,
                            status: tournament.status,
                            starts_on: tournament.starts_on,
                            ends_on: tournament.ends_on,
                            registration_deadline:
                              tournament.registration_deadline,
                            team_size: tournament.team_size,
                            max_teams: tournament.max_teams,
                            group_size: tournament.group_size,
                            advance_per_group: tournament.advance_per_group,
                            privacy_notice_uz: tournament.privacy_notice_uz,
                            privacy_notice_ru: tournament.privacy_notice_ru,
                            privacy_notice_en: tournament.privacy_notice_en,
                            passport_note_uz: tournament.passport_note_uz,
                            passport_note_ru: tournament.passport_note_ru,
                            passport_note_en: tournament.passport_note_en,
                          }}
                          trigger={
                            <TriggerButton
                              variant="outline"
                              size="icon-sm"
                              aria-label="Tahrirlash"
                            >
                              <HugeiconsIcon icon={PencilEdit02Icon} />
                            </TriggerButton>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
