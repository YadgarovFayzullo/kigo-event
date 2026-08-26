"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Field } from "@/components/app/field"
import { NativeSelect } from "@/components/app/native-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { idleState, type ActionState } from "@/lib/action-result"
import { STATUS_LABELS } from "@/components/app/status-pill"

import { saveTournamentAction } from "../actions"

export type TournamentValues = {
  id?: string
  name?: string
  sport?: string | null
  status?: string | null
  starts_on?: string | null
  ends_on?: string | null
  registration_deadline?: string | null
  team_size?: number | null
  max_teams?: number | null
  group_size?: number | null
  advance_per_group?: number | null
  privacy_notice_uz?: string | null
  privacy_notice_ru?: string | null
  privacy_notice_en?: string | null
  passport_note_uz?: string | null
  passport_note_ru?: string | null
  passport_note_en?: string | null
}

const STATUSES = [
  "draft",
  "registration",
  "scheduled",
  "running",
  "finished",
] as const

export function TournamentDialog({
  trigger,
  values,
  sports,
}: {
  trigger: React.ReactElement
  values?: TournamentValues
  sports: { id: string; name: string }[] | null
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ActionState>(idleState)
  const [pending, startTransition] = useTransition()

  // Submitting through an event handler rather than `useActionState` keeps the
  // "close on success" decision out of an effect, where setting state is both
  // a lint error and a needless extra render.
  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await saveTournamentAction(
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {values?.id ? "Tahrirlash" : "Yangi turnir"}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <Field
            label="Nomi"
            htmlFor="name"
            error={state.fieldErrors?.name}
            required
          >
            <Input id="name" name="name" defaultValue={values?.name ?? ""} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sport turi" htmlFor="sport" error={state.fieldErrors?.sport}>
              {sports ? (
                <NativeSelect id="sport" name="sport" defaultValue={values?.sport ?? ""}>
                  <option value="">—</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </NativeSelect>
              ) : (
                <Input
                  id="sport"
                  name="sport"
                  type="number"
                  defaultValue={values?.sport ?? ""}
                />
              )}
            </Field>

            <Field label="Holat" htmlFor="status">
              <NativeSelect
                id="status"
                name="status"
                defaultValue={values?.status ?? "draft"}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] ?? status}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Boshlanishi" htmlFor="starts_on">
              <Input
                id="starts_on"
                name="starts_on"
                type="date"
                defaultValue={values?.starts_on ?? ""}
              />
            </Field>
            <Field label="Tugashi" htmlFor="ends_on">
              <Input
                id="ends_on"
                name="ends_on"
                type="date"
                defaultValue={values?.ends_on ?? ""}
              />
            </Field>
            <Field
              label="Roʻyxat muddati"
              htmlFor="registration_deadline"
              className="sm:col-span-2"
            >
              <Input
                id="registration_deadline"
                name="registration_deadline"
                type="date"
                defaultValue={values?.registration_deadline ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Jamoada" htmlFor="team_size">
              <Input
                id="team_size"
                name="team_size"
                type="number"
                min={1}
                defaultValue={values?.team_size ?? ""}
              />
            </Field>
            <Field label="Jamoa limiti" htmlFor="max_teams">
              <Input
                id="max_teams"
                name="max_teams"
                type="number"
                min={1}
                defaultValue={values?.max_teams ?? ""}
              />
            </Field>
            <Field label="Guruhda" htmlFor="group_size">
              <Input
                id="group_size"
                name="group_size"
                type="number"
                min={2}
                defaultValue={values?.group_size ?? ""}
              />
            </Field>
            <Field label="Chiqadi" htmlFor="advance_per_group">
              <Input
                id="advance_per_group"
                name="advance_per_group"
                type="number"
                min={1}
                defaultValue={values?.advance_per_group ?? ""}
              />
            </Field>
          </div>

          {(["uz", "ru", "en"] as const).map((lang) => (
            <Field
              key={`privacy_${lang}`}
              label={`Maxfiylik matni ${lang.toUpperCase()}`}
              htmlFor={`privacy_notice_${lang}`}
            >
              <Textarea
                id={`privacy_notice_${lang}`}
                name={`privacy_notice_${lang}`}
                rows={2}
                defaultValue={values?.[`privacy_notice_${lang}`] ?? ""}
              />
            </Field>
          ))}
          {(["uz", "ru", "en"] as const).map((lang) => (
            <Field
              key={`passport_${lang}`}
              label={`Passport izohi ${lang.toUpperCase()}`}
              htmlFor={`passport_note_${lang}`}
            >
              <Textarea
                id={`passport_note_${lang}`}
                name={`passport_note_${lang}`}
                rows={2}
                defaultValue={values?.[`passport_note_${lang}`] ?? ""}
              />
            </Field>
          ))}

          {state.status === "error" && state.message ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
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
