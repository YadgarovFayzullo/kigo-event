"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { NativeSelect } from "@/components/app/native-select"
import { Button } from "@/components/ui/button"

/**
 * The header's tournament selector.
 *
 * The choice lives in the query string rather than component state, so a
 * scoped view is shareable, survives a reload, and can be read on the server
 * without a round trip.
 */
export function TournamentPicker({
  tournaments,
  selected,
  showExport,
}: {
  tournaments: { id: string; name: string }[]
  selected: string | null
  showExport: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  if (tournaments.length === 0) return null

  function choose(id: string) {
    const next = new URLSearchParams(params.toString())
    if (id) next.set("t", id)
    else next.delete("t")
    // A different tournament means a different result set -- start at page 1.
    next.delete("page")
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="tournament" className="sr-only">
        Turnir
      </label>
      <NativeSelect
        id="tournament"
        className="w-56"
        value={selected ?? ""}
        disabled={pending}
        onChange={(event) => choose(event.target.value)}
      >
        {tournaments.map((tournament) => (
          <option key={tournament.id} value={tournament.id}>
            {tournament.name}
          </option>
        ))}
      </NativeSelect>

      {showExport && selected ? (
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <a
              href={`/api/tournaments/${encodeURIComponent(selected)}/export/`}
            />
          }
        >
          Eksport
        </Button>
      ) : null}
    </div>
  )
}
