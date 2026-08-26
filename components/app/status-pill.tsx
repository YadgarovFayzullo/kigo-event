import { Badge } from "@/components/ui/badge"
import { labelFor } from "@/lib/domain"

type Variant = React.ComponentProps<typeof Badge>["variant"]

/**
 * One pill for every status the API returns.
 *
 * The backend sends English codes from model `TextChoices`, not a dictionary
 * table, so the mapping lives here on the front end -- and an unknown code
 * still renders as itself rather than blanking out.
 */
const VARIANTS: Record<string, Variant> = {
  // participants
  pending: "secondary",
  verified: "default",
  rejected: "destructive",
  // teams
  forming: "secondary",
  submitted: "outline",
  approved: "default",
  // tournaments
  draft: "secondary",
  registration: "default",
  scheduled: "outline",
  running: "default",
  finished: "ghost",
  // matches
  live: "default",
  cancelled: "destructive",
}

const LABELS: Record<string, string> = {
  pending: "Koʻrib chiqilmoqda",
  verified: "Tasdiqlangan",
  rejected: "Rad etilgan",
  forming: "Toʻplanmoqda",
  submitted: "Yuborilgan",
  approved: "Tasdiqlangan",
  draft: "Qoralama",
  registration: "Roʻyxat ochiq",
  scheduled: "Rejalashtirilgan",
  running: "Ketmoqda",
  finished: "Tugagan",
  live: "Ketmoqda",
  cancelled: "Bekor qilingan",
}

/**
 * Per-status overrides for colours the badge variants don't cover.
 *
 * Built like the `destructive` variant that "Rejected" already uses -- a 10%
 * tint behind matching text -- so waiting / approved / rejected read as one
 * family: amber, green, red.
 *
 * The text steps (700 light, 300 dark) are not the tint's own step: they were
 * picked because the obvious 600/400 measured 3.0-3.6:1 against the composited
 * background, under the 4.5:1 a badge's small text needs. These clear it.
 */
const CLASSES: Record<string, string> = {
  pending:
    "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  verified:
    "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  approved:
    "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  scheduled:
    "border-transparent bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  // A team still gathering members: in progress, but nothing for an operator
  // to decide yet -- so a hue of its own, distinct from the amber that does
  // mean "review me".
  forming:
    "border-transparent bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
}

export function StatusPill({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  return (
    <Badge
      variant={VARIANTS[status] ?? "outline"}
      className={CLASSES[status]}
    >
      {labelFor(LABELS, status)}
    </Badge>
  )
}

export const STATUS_LABELS = LABELS
