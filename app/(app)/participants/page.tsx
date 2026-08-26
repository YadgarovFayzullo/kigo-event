import type { Metadata } from "next"

import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { Sparkline } from "@/components/app/sparkline"
import { StatCard } from "@/components/app/stat-card"
import { requireUser } from "@/lib/auth/guards"
import { listParticipants, listTeams } from "@/lib/bot-api/tournaments"
import { formatNumber } from "@/lib/format"
import { one, resolveScope } from "@/lib/scope"
import { cumulativeByDay } from "@/lib/series"

import { SectionHeader } from "../section-header"
import { ParticipantsTable } from "./participants-table"

export const metadata: Metadata = { title: "Zayavkalar" }

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const scope = await resolveScope(params)

  /**
   * One pull, then all filtering and paging happens in the browser.
   *
   * The API can only filter by status and name, so team and company have to be
   * handled here anyway -- and these responses carry the operator's own token,
   * so they can't be cached and every URL-driven page change would mean another
   * round trip to the platform.
   */
  const [all, teams] = await Promise.all([
    scope.selected
      ? listParticipants(scope.selected.id, { pageSize: 500 })
      : null,
    scope.selected ? listTeams(scope.selected.id, { pageSize: 500 }) : null,
  ])

  const everyone = all?.ok ? all.data.items : []
  const truncated = all?.ok ? all.data.total > everyone.length : false

  const rows = everyone.map((participant) => ({
    id: participant.id,
    fullName: participant.full_name,
    phone: participant.phone ?? null,
    companyName: participant.company?.name ?? null,
    companyInput: participant.company_input ?? null,
    locationName: participant.location_name ?? null,
    teamName: participant.team_name ?? null,
    passportSeries: participant.passport_series ?? null,
    passportUrl: participant.passport_copy_url ?? null,
    telegram: participant.telegram_username
      ? `@${participant.telegram_username.replace(/^@/, "")}`
      : (participant.telegram_id ?? null),
    status: participant.status ?? null,
    rejectionReason: participant.rejection_reason ?? null,
    createdAt: participant.created_at ?? null,
  }))

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Zayavkalar"
        tournaments={scope.tournaments}
        selected={scope.selected?.id ?? null}
      />

      {scope.error ? (
        <BotDataNotice error={{ kind: "unauthorized", message: scope.error }} />
      ) : !scope.selected ? (
        <EmptyState title="Maʼlumot yoʻq" description="Avval turnir yarating." />
      ) : !all?.ok ? (
        all ? <BotDataNotice error={all.error} /> : null
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Ishtirokchilar"
              value={formatNumber(scope.selected.participants_count ?? 0)}
              chart={
                <Sparkline
                  points={cumulativeByDay(everyone.map((p) => p.created_at))}
                  ariaLabel="Ishtirokchilar sonining oʻsishi"
                />
              }
            />
            <StatCard
              label="Jamoalar"
              value={formatNumber(scope.selected.teams_count ?? 0)}
              chart={
                <Sparkline
                  points={
                    teams?.ok
                      ? cumulativeByDay(
                          teams.data.items.map((t) => t.created_at)
                        )
                      : []
                  }
                  ariaLabel="Jamoalar sonining oʻsishi"
                />
              }
            />
            <StatCard label="Jamoada" value={scope.selected.team_size ?? "—"} />
            <StatCard
              label="Jamoa limiti"
              value={scope.selected.max_teams ?? "—"}
            />
          </section>

          {truncated ? (
            <p className="text-xs text-muted-foreground">
              Jami {formatNumber(all.data.total)} ta zayavka bor, filtrlar
              birinchi {formatNumber(everyone.length)} tasiga qoʻllanmoqda.
            </p>
          ) : null}

          <ParticipantsTable
            tournamentId={scope.selected.id}
            participants={rows}
            initial={{
              status: one(params, "status") ?? "",
              team: one(params, "team") ?? "",
              company: one(params, "company") ?? "",
              q: one(params, "q") ?? "",
            }}
          />
        </>
      )}
    </div>
  )
}
