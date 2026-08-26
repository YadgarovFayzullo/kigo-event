"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { ConfirmButton } from "@/components/app/confirm-button"
import { NativeSelect } from "@/components/app/native-select"
import { Button } from "@/components/ui/button"
import { TriggerButton } from "@/components/app/trigger-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { STATUS_LABELS } from "@/components/app/status-pill"

import { updateTeamAction } from "../actions"

const STATUSES = ["forming", "submitted", "approved", "rejected"] as const

export function TeamDialog({
  tournamentId,
  team,
}: {
  tournamentId: string
  team: { id: string; name: string; status: string | null; reason: string | null }
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(team.status ?? "forming")
  const [reason, setReason] = useState(team.reason ?? "")
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateTeamAction(tournamentId, team.id, status, reason)
      if (result.ok) {
        toast.success("Saqlandi.")
        setOpen(false)
      } else {
        toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <TriggerButton
            variant="outline"
            size="icon-sm"
            aria-label="Tahrirlash"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} />
          </TriggerButton>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="team-status" className="text-sm font-medium">
              Holat
            </label>
            <NativeSelect
              id="team-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value] ?? value}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="team-reason" className="text-sm font-medium">
              Sabab
            </label>
            <Textarea
              id="team-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <ConfirmButton
              disabled={pending}
              title="Jamoa holati oʻzgartirilsinmi?"
              description={`${team.name} uchun yangi holat saqlanadi.`}
              confirmLabel="Saqlash"
              onConfirm={save}
            >
              Saqlash
            </ConfirmButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
