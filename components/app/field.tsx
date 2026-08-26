import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Label + control + inline error, so every form in the CRM reports validation
 * the same way. `error` comes from the Server Action's `fieldErrors`.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string[]
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  const errorId = `${htmlFor}-error`
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint && !error?.length ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error?.length ? (
        <p id={errorId} className="text-xs text-destructive">
          {error[0]}
        </p>
      ) : null}
    </div>
  )
}
