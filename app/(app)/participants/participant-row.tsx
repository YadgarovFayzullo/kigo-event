"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { ConfirmButton } from "@/components/app/confirm-button"
import { StatusPill } from "@/components/app/status-pill"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"

import { decideParticipantAction } from "../actions"

export type ParticipantRow = {
  id: string
  fullName: string
  phone: string | null
  companyName: string | null
  companyInput: string | null
  locationName: string | null
  teamName: string | null
  passportSeries: string | null
  passportUrl: string | null
  telegram: string | null
  status: string | null
  rejectionReason: string | null
  createdAt: string | null
}

/**
 * A participant row that opens the review drawer.
 *
 * Approving is one click; rejecting needs a reason, because the platform shows
 * that reason to the applicant.
 */
export function ParticipantRowItem({
  tournamentId,
  participant,
  number,
}: {
  tournamentId: string
  participant: ParticipantRow
  /** Position in the whole filtered list, not just this page. */
  number: number
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(participant.rejectionReason ?? "")
  const [pending, startTransition] = useTransition()

  function decide(status: "verified" | "rejected") {
    startTransition(async () => {
      const result = await decideParticipantAction(
        tournamentId,
        participant.id,
        status,
        reason
      )
      if (result.ok) {
        toast.success("Bajarildi.")
        setOpen(false)
      } else {
        toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
      }
    })
  }

  const detail = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[7rem_1fr] gap-2 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        nativeButton={false}
        render={
          <TableRow className="cursor-pointer">
            <TableCell className="text-muted-foreground tabular-nums">
              {number}
            </TableCell>
            <TableCell className="font-medium">{participant.fullName}</TableCell>
            <TableCell className="text-sm">{participant.phone ?? "—"}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {participant.companyName ?? participant.companyInput ?? "—"}
            </TableCell>
            <TableCell className="text-sm">
              {participant.locationName ?? "—"}
            </TableCell>
            <TableCell className="text-sm">{participant.teamName ?? "—"}</TableCell>
            <TableCell>
              <StatusPill status={participant.status} />
            </TableCell>
          </TableRow>
        }
      />

      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2 pr-12">
            {participant.fullName}
            <StatusPill status={participant.status} />
          </SheetTitle>
        </SheetHeader>

        <div className="grid gap-4 px-4 pb-6">
          {participant.passportUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={participant.passportUrl}
              alt="Passport nusxasi"
              className="w-full rounded-lg border object-contain"
            />
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Passport nusxasi yuborilmagan
            </p>
          )}

          <dl className="divide-y">
            {detail("F.I.Sh.", participant.fullName)}
            {detail("Telefon", participant.phone)}
            {detail("Passport", participant.passportSeries)}
            {detail("Kompaniya", participant.companyName)}
            {detail("Yozilgan nomi", participant.companyInput)}
            {detail("Maydoncha", participant.locationName)}
            {detail("Jamoa", participant.teamName)}
            {detail("Telegram", participant.telegram)}
            {detail("Sana", formatDateTime(participant.createdAt))}
          </dl>

          <div className="grid gap-1.5">
            <label htmlFor={`reason-${participant.id}`} className="text-sm font-medium">
              Sabab
            </label>
            <Textarea
              id={`reason-${participant.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <ConfirmButton
              className="flex-1"
              disabled={pending}
              title="Zayavka tasdiqlansinmi?"
              description={`${participant.fullName} turnir ishtirokchisi sifatida tasdiqlanadi.`}
              confirmLabel="Tasdiqlash"
              onConfirm={() => decide("verified")}
            >
              Tasdiqlash
            </ConfirmButton>
            <ConfirmButton
              variant="destructive"
              confirmVariant="destructive"
              className="flex-1"
              disabled={pending}
              title="Zayavka rad etilsinmi?"
              description="Rad etish sababi ariza bergan kishiga koʻrsatiladi. Sababni yozganingizga ishonch hosil qiling."
              confirmLabel="Rad etish"
              onConfirm={() => decide("rejected")}
            >
              Rad etish
            </ConfirmButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
