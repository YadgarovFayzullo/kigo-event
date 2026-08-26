"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

/**
 * Catches anything a page throws -- including `ForbiddenError` from a Server
 * Action when someone tries an operation their role doesn't allow.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <h1 className="font-heading text-xl font-semibold">
        Xatolik yuz berdi
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <Button variant="outline" onClick={reset}>
        Qayta urinish
      </Button>
    </div>
  )
}
