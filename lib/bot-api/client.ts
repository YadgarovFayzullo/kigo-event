import "server-only"

import { auth } from "@/lib/auth"

/**
 * The single place where the CRM talks to the KiGo bot's backend.
 *
 * Everything the bot owns -- Telegram users, bookings, payments, venues --
 * comes through here over HTTP. The CRM never opens a connection to the bot's
 * database.
 *
 * Two rules this module enforces for callers:
 *   1. Responses are cached (Next.js `fetch` cache) so CRM pages don't hammer
 *      the bot on every render.
 *   2. Failures never throw into a page. Callers get a discriminated result
 *      and render a degraded panel instead of a 500.
 */

/** Bot API is external and may be down, slow, or partial. Model that. */
export type BotResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BotApiError }

export type BotApiErrorKind =
  | "not_configured"
  | "timeout"
  | "network"
  | "http"
  | "unauthorized"
  | "invalid_response"

export type BotApiError = {
  kind: BotApiErrorKind
  message: string
  status?: number
}

const DEFAULT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS ?? 8000)

/** Default cache window. Short enough to feel live, long enough to be kind. */
export const BOT_CACHE_SECONDS = Number(process.env.BOT_API_REVALIDATE ?? 60)

/** Cache tags, so mutations elsewhere can invalidate bot reads deliberately. */
export const BOT_TAGS = {
  venues: "bot:venues",
  bookings: "bot:bookings",
  stats: "bot:stats",
  tournaments: "bot:tournaments",
  referees: "bot:referees",
  residents: "bot:residents",
  sports: "bot:sports",
} as const

export type BotFetchOptions = {
  /** Query string parameters; `undefined` values are dropped. */
  searchParams?: Record<string, string | number | boolean | undefined>
  /** Seconds to cache. `0` opts out of caching for this call. */
  revalidate?: number
  tags?: string[]
  timeoutMs?: number
  /** HTTP method. Anything other than GET is never cached. */
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  /** JSON request body, for mutating calls. */
  body?: unknown
  /** Extra headers merged over the defaults. */
  headers?: Record<string, string>
}

/**
 * Bearer token for the API's `admin/*` endpoints.
 *
 * The API authenticates a *person*, so the token is whatever the signed-in
 * operator received from `admin/auth/login/`. It is read out of their session
 * rather than an environment variable, which means two operators act as
 * themselves and nothing long-lived sits in the deployment config.
 */
async function authToken(): Promise<string | undefined> {
  const session = await auth()
  return session?.user?.apiToken || process.env.BOT_API_KEY || undefined
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function botApiConfigured(): boolean {
  return Boolean(process.env.BOT_API_URL)
}

/**
 * Fetch and validate one bot API endpoint.
 *
 * `parse` receives the decoded JSON body and should narrow it to `T`, throwing
 * on anything unexpected -- a bot deploy that changes a field shows up as a
 * handled `invalid_response`, not a crashed CRM page.
 */
export async function botFetch<T>(
  path: string,
  parse: (body: unknown) => T,
  options: BotFetchOptions = {}
): Promise<BotResult<T>> {
  const baseUrl = process.env.BOT_API_URL
  if (!baseUrl) {
    return {
      ok: false,
      error: {
        kind: "not_configured",
        message:
          "BOT_API_URL is not set, so bot data is unavailable. Set it in .env.local.",
      },
    }
  }

  const url = new URL(path.replace(/^\//, ""), ensureTrailingSlash(baseUrl))
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const method = options.method ?? "GET"
  // A mutation must never be cached. Neither must anything fetched with the
  // operator's own token -- a shared cache entry would leak one operator's
  // view to another.
  const perUser = Boolean((await auth())?.user?.apiToken)
  const revalidate =
    method === "GET" && !perUser ? (options.revalidate ?? BOT_CACHE_SECONDS) : 0
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const token = await authToken()

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
      // `no-store` when revalidate is 0, otherwise a time-based cache entry.
      ...(revalidate === 0
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags: options.tags } }),
    })
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError"
    return {
      ok: false,
      error: {
        kind: timedOut ? "timeout" : "network",
        message: timedOut
          ? `Bot API did not respond within ${timeoutMs}ms.`
          : `Could not reach the bot API: ${describe(error)}`,
      },
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        kind: response.status === 401 || response.status === 403
          ? "unauthorized"
          : "http",
        status: response.status,
        message: await describeHttpError(response),
      },
    }
  }

  try {
    // 204 No Content has no body to parse.
    if (response.status === 204) return { ok: true, data: parse(null) }
    return { ok: true, data: parse(await response.json()) }
  } catch (error) {
    return {
      ok: false,
      error: {
        kind: "invalid_response",
        message: `Unexpected response shape from the bot API: ${describe(error)}`,
      },
    }
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`
}

/**
 * The KiGo API reports errors as `[{ messages: ["..."] }]`. Surface that text
 * so a rejected mutation tells the user what actually went wrong.
 */
async function describeHttpError(response: Response): Promise<string> {
  const fallback = `API responded ${response.status} ${response.statusText}.`
  try {
    const body = await response.json()
    const entries = Array.isArray(body) ? body : [body]
    const messages = entries
      .flatMap((entry: unknown) =>
        entry && typeof entry === "object" && "messages" in entry
          ? ((entry as { messages?: unknown }).messages ?? [])
          : []
      )
      .filter((m): m is string => typeof m === "string")
    return messages.length > 0 ? messages.join(" ") : fallback
  } catch {
    return fallback
  }
}
