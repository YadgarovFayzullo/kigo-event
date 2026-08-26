import type { Metadata } from "next"

import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
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
import { listReferees } from "@/lib/bot-api/tournaments"

import { SectionHeader } from "../section-header"
import { RefereeActiveToggle, RefereeDialog } from "./referee-controls"

export const metadata: Metadata = { title: "Hakamlar" }

export default async function RefereesPage() {
  await requireUser()
  const result = await listReferees()

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Hakamlar"
        tournaments={[]}
        selected={null}
        scoped={false}
        actions={
          <RefereeDialog trigger={<TriggerButton>+ Yangi hakam</TriggerButton>} />
        }
      />

      {!result.ok ? (
        <BotDataNotice error={result.error} />
      ) : result.data.items.length === 0 ? (
        <EmptyState title="Ma'lumot yo'q" />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>F.I.Sh.</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Telegram</TableHead>
                    <TableHead>Reyting</TableHead>
                    <TableHead>Faol</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.items.map((referee, index) => (
                    <TableRow key={referee.id}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {referee.full_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {referee.phone ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {referee.telegram_id ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {referee.rating_avg
                          ? `${referee.rating_avg} (${referee.rating_count ?? 0})`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <RefereeActiveToggle
                          refereeId={referee.id}
                          isActive={referee.is_active !== false}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <RefereeDialog
                            values={{
                              id: referee.id,
                              full_name: referee.full_name,
                              phone: referee.phone ?? "",
                              telegram_id: referee.telegram_id ?? "",
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
                        </div>
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
