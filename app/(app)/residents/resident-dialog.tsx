"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Field } from "@/components/app/field"
import { Button } from "@/components/ui/button"
import { TriggerButton } from "@/components/app/trigger-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { idleState, type ActionState } from "@/lib/action-result"

import { createResidentAction } from "../actions"

export function ResidentDialog() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ActionState>(idleState)
  const [pending, startTransition] = useTransition()

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await createResidentAction(idleState, formData)
      setState(result)
      if (result.status === "success") {
        toast.success(result.message ?? "Saqlandi.")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<TriggerButton>+ Yangi rezident</TriggerButton>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi rezident</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <Field label="Nomi" htmlFor="name" error={state.fieldErrors?.name} required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="STIR" htmlFor="tin" error={state.fieldErrors?.tin}>
            <Input id="tin" name="tin" />
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
