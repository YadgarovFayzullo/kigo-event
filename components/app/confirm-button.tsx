"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * A button that asks before it acts.
 *
 * Every write in this panel goes to the KiGo platform, and almost none of them
 * can be undone from here -- there is no "unapprove", no "clear the schedule".
 * So the confirm step is the safety net, and it lives in one component rather
 * than being re-implemented at each call site.
 *
 * Pass `onConfirm` for an imperative action, or `formId` to submit a form.
 */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  formId,
  disabled,
  variant,
  size,
  className,
  confirmVariant = "default",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm?: () => void
  /** `id` of a form to submit once confirmed. */
  formId?: string
  disabled?: boolean
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  confirmVariant?: React.ComponentProps<typeof Button>["variant"]
  "aria-label"?: string
}) {
  const [open, setOpen] = useState(false)

  function confirm() {
    setOpen(false)
    if (onConfirm) {
      onConfirm()
      return
    }
    if (formId) {
      const form = document.getElementById(formId)
      if (form instanceof HTMLFormElement) form.requestSubmit()
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant={confirmVariant} onClick={confirm}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
