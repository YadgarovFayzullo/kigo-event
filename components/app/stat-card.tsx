import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  chart,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  /** Optional plot below the number, e.g. a sparkline of the same measure. */
  chart?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("gap-0", className)}>
      <CardContent className="grid gap-1 py-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {chart ? <div className="mt-2">{chart}</div> : null}
      </CardContent>
    </Card>
  )
}
