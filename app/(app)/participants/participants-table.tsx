"use client"

import { useMemo, useState } from "react"

import { EmptyState } from "@/components/app/empty-state"
import { NativeSelect } from "@/components/app/native-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ParticipantRowItem, type ParticipantRow } from "./participant-row"

const STATUS_FILTERS = [
  { value: "", label: "Hammasi" },
  { value: "pending", label: "Koʻrib chiqilmoqda" },
  { value: "verified", label: "Tasdiqlangan" },
  { value: "rejected", label: "Rad etilgan" },
]

const PER_PAGE = 15

/**
 * Filtering and paging happen here, in the browser, over one already-fetched
 * list.
 *
 * Doing it through the URL meant every page change re-ran the server component
 * and re-fetched from the API -- and these responses can't be cached, because
 * they carry the signed-in operator's own token. One fetch per visit, then
 * instant paging, is both faster and fewer calls on the platform.
 *
 * The URL is still kept in sync via `history.replaceState`, so a filtered view
 * survives a refresh and can be shared -- but without triggering a round trip.
 */
export function ParticipantsTable({
  tournamentId,
  participants,
  initial,
}: {
  tournamentId: string
  participants: ParticipantRow[]
  initial: { status: string; team: string; company: string; q: string }
}) {
  const [status, setStatus] = useState(initial.status)
  const [team, setTeam] = useState(initial.team)
  const [company, setCompany] = useState(initial.company)
  const [query, setQuery] = useState(initial.q)
  const [page, setPage] = useState(1)

  const teamOptions = useMemo(
    () =>
      [...new Set(participants.map((p) => p.teamName).filter(Boolean))].sort(
        (a, b) => String(a).localeCompare(String(b))
      ) as string[],
    [participants]
  )
  const companyOptions = useMemo(
    () =>
      [
        ...new Set(
          participants
            .map((p) => p.companyName ?? p.companyInput)
            .filter(Boolean)
        ),
      ].sort((a, b) => String(a).localeCompare(String(b))) as string[],
    [participants]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return participants.filter((participant) => {
      if (status && participant.status !== status) return false
      if (team && participant.teamName !== team) return false
      if (
        company &&
        (participant.companyName ?? participant.companyInput) !== company
      ) {
        return false
      }
      if (needle) {
        const haystack = [participant.fullName, participant.phone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
  }, [participants, status, team, company, query])

  const pages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1)
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  /** Shallow URL sync: no navigation, so no server round trip. */
  function syncUrl(next: Partial<Record<string, string>>) {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    params.set("t", tournamentId)
    for (const [key, value] of Object.entries({
      status,
      team,
      company,
      q: query,
      ...next,
    })) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete("page")
    window.history.replaceState(null, "", `?${params.toString()}`)
  }

  function change(key: string, value: string, set: (v: string) => void) {
    set(value)
    setPage(1)
    syncUrl({ [key]: value })
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1.5">
          <label htmlFor="status" className="text-xs text-muted-foreground">
            Holat
          </label>
          <NativeSelect
            id="status"
            value={status}
            className="w-52"
            onChange={(event) =>
              change("status", event.target.value, setStatus)
            }
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value || "all"} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="team" className="text-xs text-muted-foreground">
            Jamoa
          </label>
          <NativeSelect
            id="team"
            value={team}
            className="w-52"
            onChange={(event) => change("team", event.target.value, setTeam)}
          >
            <option value="">Barcha jamoalar</option>
            {teamOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="company" className="text-xs text-muted-foreground">
            Kompaniya
          </label>
          <NativeSelect
            id="company"
            value={company}
            className="w-52"
            onChange={(event) =>
              change("company", event.target.value, setCompany)
            }
          >
            <option value="">Barcha kompaniyalar</option>
            {companyOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            Qidirish
          </label>
          <Input
            id="q"
            value={query}
            placeholder="Ism yoki telefon…"
            className="w-56"
            onChange={(event) => change("q", event.target.value, setQuery)}
          />
        </div>

        {status || team || company || query ? (
          <Button
            variant="ghost"
            onClick={() => {
              setStatus("")
              setTeam("")
              setCompany("")
              setQuery("")
              setPage(1)
              syncUrl({ status: "", team: "", company: "", q: "" })
            }}
          >
            Tozalash
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
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
                      <TableHead>F.I.Sh.</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Kompaniya</TableHead>
                      <TableHead>Maydoncha</TableHead>
                      <TableHead>Jamoa</TableHead>
                      <TableHead>Holat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((participant, index) => (
                      <ParticipantRowItem
                        key={participant.id}
                        tournamentId={tournamentId}
                        participant={participant}
                        number={(current - 1) * PER_PAGE + index + 1}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <nav
            className="flex items-center justify-center gap-3"
            aria-label="Sahifalar"
          >
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Oldingi sahifa"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              ‹
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {current} / {pages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Keyingi sahifa"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
            >
              ›
            </Button>
          </nav>
        </>
      )}
    </div>
  )
}
