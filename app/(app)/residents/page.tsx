import type { Metadata } from "next"

import { BotDataNotice } from "@/components/app/bot-data-notice"
import { EmptyState } from "@/components/app/empty-state"
import { Pager } from "@/components/app/pager"
import { StatusPill } from "@/components/app/status-pill"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireUser } from "@/lib/auth/guards"
import { listResidents } from "@/lib/bot-api/tournaments"
import { one } from "@/lib/scope"

import { SectionHeader } from "../section-header"
import { ResidentDialog } from "./resident-dialog"

export const metadata: Metadata = { title: "Rezidentlar" }

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireUser()
  const params = await searchParams
  const query = one(params, "q") ?? ""
  const page = Number(one(params, "page") ?? 1) || 1

  const result = await listResidents({ page, q: query })

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Rezidentlar"
        tournaments={[]}
        selected={null}
        scoped={false}
        actions={<ResidentDialog />}
      />

      <form method="GET" action="/residents" className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Qidirish
        </label>
        <Input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Qidirish…"
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Qidirish
        </Button>
      </form>

      {!result.ok ? (
        <BotDataNotice error={result.error} />
      ) : result.data.items.length === 0 ? (
        <EmptyState title="Ma'lumot yo'q" />
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
                      <TableHead>STIR</TableHead>
                      <TableHead>Faol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.items.map((resident, index) => (
                      <TableRow key={resident.id}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {(result.data.page - 1) * 15 + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {resident.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {resident.tin ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            status={resident.is_active === false ? "forming" : "approved"}
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
            basePath="/residents"
            params={{ q: query || undefined }}
          />
        </>
      )}
    </div>
  )
}
