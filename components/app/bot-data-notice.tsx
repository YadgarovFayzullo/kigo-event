import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  CloudServerIcon,
  LockKeyIcon,
  Timer02Icon,
} from "@hugeicons/core-free-icons"

import type { BotApiError } from "@/lib/bot-api/client"

const ICONS: Record<BotApiError["kind"], typeof Alert01Icon> = {
  not_configured: CloudServerIcon,
  timeout: Timer02Icon,
  network: CloudServerIcon,
  http: Alert01Icon,
  unauthorized: LockKeyIcon,
  invalid_response: Alert01Icon,
}

const HEADLINES: Record<BotApiError["kind"], string> = {
  not_configured: "Bot API sozlanmagan",
  timeout: "Bot API javob bermadi",
  network: "Bot APIʼga ulanib boʻlmadi",
  http: "Bot API xatolik qaytardi",
  unauthorized: "Bot API kirish maʼlumotlarini rad etdi",
  invalid_response: "Bot APIʼdan kutilmagan maʼlumot",
}

/**
 * Shown in place of bot-sourced data when the bot's backend is unavailable.
 *
 * Bot data is fetched live from an external service, so any page that shows it
 * has to degrade rather than fail -- CRM-owned data on the same page keeps
 * rendering normally.
 */
export function BotDataNotice({ error }: { error: BotApiError }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-4 text-sm">
      <HugeiconsIcon
        icon={ICONS[error.kind]}
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="grid gap-0.5">
        <p className="font-medium">{HEADLINES[error.kind]}</p>
        <p className="text-muted-foreground">{error.message}</p>
        <p className="text-xs text-muted-foreground">
          Ushbu sahifadagi CRM maʼlumotlari oʻzgarmagan.
        </p>
      </div>
    </div>
  )
}

/** Small inline variant for KPI tiles that couldn't load. */
export function BotValueUnavailable() {
  return <span className="text-muted-foreground">—</span>
}
