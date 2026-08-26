import { Suspense } from "react"

import { TournamentPicker } from "@/components/app/tournament-picker"

/**
 * Title on the left, tournament selector and export on the right.
 *
 * The selector is hidden on the sections that aren't scoped to a tournament
 * (referees and resident companies are platform-wide).
 */
export function SectionHeader({
  title,
  tournaments,
  selected,
  scoped = true,
  actions,
}: {
  title: string
  tournaments: { id: string; name: string }[]
  selected: string | null
  scoped?: boolean
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {scoped ? (
          <Suspense fallback={null}>
            <TournamentPicker
              tournaments={tournaments}
              selected={selected}
              showExport
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}
