"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

/** Submit button that disables itself while its form is in flight. */
export function SubmitButton({
  children,
  pendingLabel,
  variant,
  className,
}: {
  children: React.ReactNode
  pendingLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant={variant} className={className}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  )
}
