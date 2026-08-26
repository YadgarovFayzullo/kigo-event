"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import { Field } from "@/components/app/field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { idleState, type ActionState } from "@/lib/action-result"

import { saveRefereeAction, setRefereeActiveAction } from "../actions"

export type RefereeValues = {
  id?: string
  full_name?: string
  phone?: string | null
  telegram_id?: string | null
}

export function RefereeDialog({
  trigger,
  values,
}: {
  trigger: React.ReactElement
  values?: RefereeValues
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ActionState>(idleState)
  const [pending, startTransition] = useTransition()

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await saveRefereeAction(
        values?.id ?? null,
        idleState,
        formData
      )
      setState(result)
      if (result.status === "success") {
        toast.success(result.message ?? "Saqlandi.")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {values?.id ? values.full_name : "Yangi hakam"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <Field
            label="F.I.Sh."
            htmlFor="full_name"
            error={state.fieldErrors?.full_name}
            required
          >
            <Input
              id="full_name"
              name="full_name"
              defaultValue={values?.full_name ?? ""}
              required
            />
          </Field>
          <Field label="Telefon" htmlFor="phone" error={state.fieldErrors?.phone}>
            <Input id="phone" name="phone" defaultValue={values?.phone ?? ""} />
          </Field>
          <Field
            label="Telegram ID"
            htmlFor="telegram_id"
            error={state.fieldErrors?.telegram_id}
          >
            <Input
              id="telegram_id"
              name="telegram_id"
              type="number"
              defaultValue={values?.telegram_id ?? ""}
            />
          </Field>

          {state.status === "error" && state.message ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saqlanmoqda…" : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Activation switch.
 *
 * A switch rather than a confirmed button: this is the one action in the panel
 * that is fully reversible -- the API deactivates rather than deletes, and
 * flipping it back is a single call -- so asking "are you sure" every time
 * would be friction without a purpose.
 *
 * The switch shows the value it is being set to straight away and rolls back
 * if the API refuses, so the row never sits on a state the server rejected.
 */
export function RefereeActiveToggle({
  refereeId,
  isActive,
}: {
  refereeId: string
  isActive: boolean
}) {
  const [checked, setChecked] = useState(isActive)
  const [pending, startTransition] = useTransition()

  return (
    <Switch
      // Green when on: this switch reports a state, not a preference, and the
      // default black track read the same as every other control on the page.
      // Matches the green already used for "approved" elsewhere.
      className="data-checked:bg-emerald-600 dark:data-checked:bg-emerald-500"
      checked={checked}
      disabled={pending}
      onCheckedChange={(next) => {
        setChecked(next)
        startTransition(async () => {
          const result = await setRefereeActiveAction(refereeId, next)
          if (result.ok) {
            toast.success(next ? "Faollashtirildi." : "Faolsizlantirildi.")
          } else {
            setChecked(!next)
            toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
          }
        })
      }}
      aria-label={checked ? "Faolsizlantirish" : "Faollashtirish"}
    />
  )
}
