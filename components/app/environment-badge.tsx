import "server-only"

import { Badge } from "@/components/ui/badge"

/**
 * Says out loud which backend this session is writing to.
 *
 * `BOT_API_URL` is the only thing that decides it -- localhost in development,
 * the platform in production -- and the two look identical once you are inside
 * the panel. Every action here is real and most cannot be undone, so a session
 * pointed somewhere other than production says so, permanently, in the sidebar.
 *
 * Deliberately the wrong way round: production is the quiet default and
 * anything else is flagged, so a missing badge never means "probably safe".
 */
export function EnvironmentBadge() {
  const raw = process.env.BOT_API_URL
  if (!raw) {
    return (
      <Badge variant="destructive" className="w-full justify-center">
        API sozlanmagan
      </Badge>
    )
  }

  let host: string
  try {
    host = new URL(raw).hostname
  } catch {
    return (
      <Badge variant="destructive" className="w-full justify-center">
        API manzili notoʻgʻri
      </Badge>
    )
  }

  const isProduction = host === "api.kigo.uz"
  if (isProduction) return null

  const isLocal = host === "localhost" || host === "127.0.0.1"

  return (
    <Badge
      variant="outline"
      className="w-full justify-center border-amber-500/40 bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
      title={raw}
    >
      {isLocal ? "Lokal server" : host}
    </Badge>
  )
}
