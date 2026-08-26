"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { generateDrawAction } from "../actions"

/**
 * Draw and play-off generation.
 *
 * Both paths confirm first. Regenerating is destructive (the API deletes the
 * existing fixtures and groups before rebuilding), and even the first draw is
 * not casually undoable -- the API has no "clear the schedule" call -- so a
 * mis-click should never be one click away.
 */
export function DrawButtons({
  tournamentId,
  hasMatches,
}: {
  tournamentId: string
  hasMatches: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState<"draw" | "playoff" | null>(null)

  function run(kind: "draw" | "playoff") {
    startTransition(async () => {
      const result = await generateDrawAction(tournamentId, kind, hasMatches)
      if (result.ok) {
        toast.success(`Bajarildi: ${result.created ?? 0} ta oʻyin.`)
        setConfirming(null)
      } else {
        toast.error(result.message ?? "Amalni bajarib boʻlmadi.")
      }
    })
  }

  function click(kind: "draw" | "playoff") {
    setConfirming(kind)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" disabled={pending} onClick={() => click("draw")}>
          Qurʼa tashlash
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => click("playoff")}
        >
          Pley-off
        </Button>
      </div>

      <Dialog
        open={confirming !== null}
        onOpenChange={(next) => !next && setConfirming(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasMatches ? "Qayta yaratilsinmi?" : "Jadval yaratilsinmi?"}
            </DialogTitle>
            <DialogDescription>
              {hasMatches
                ? "Mavjud jadval va uning natijalari oʻchiriladi, soʻng jadval qaytadan tuziladi. Bu amalni ortga qaytarib boʻlmaydi."
                : "Jamoalar guruhlarga taqsimlanadi va oʻyinlar jadvali tuziladi. Jadvalni keyin faqat qayta yaratish mumkin — bekor qilib boʻlmaydi."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => confirming && run(confirming)}
            >
              Ha, davom etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
