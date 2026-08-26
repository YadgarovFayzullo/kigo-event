import "server-only"

import { z } from "zod"

/**
 * Sign-in against the KiGo API's operator login.
 *
 * `POST /api/admin/auth/login/` is the only endpoint that works
 * unauthenticated -- it hands back the bearer token every other `admin/*` call
 * needs. That token belongs to the person signing in, so the CRM keeps it in
 * their session rather than in an environment variable.
 *
 * Deliberately a plain `fetch` rather than `botFetch`: the shared client reads
 * the token out of the session, and the session doesn't exist yet here.
 */

/** `role` comes back as `{ code, name_uz, name_ru, name_en }`, not a string. */
const roleSchema = z.object({
  code: z.string(),
  name_uz: z.string().nullish(),
  name_ru: z.string().nullish(),
  name_en: z.string().nullish(),
})

const adminSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  full_name: z.string().nullish(),
  name: z.string().nullish(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  role: roleSchema.nullish(),
})

const loginSchema = z.object({
  token: z.string().min(1),
  admin: adminSchema,
})

export type KigoAdmin = z.infer<typeof adminSchema>

export type LoginResult =
  | { ok: true; token: string; admin: KigoAdmin }
  | { ok: false; kind: "credentials" | "forbidden" | "unavailable"; message: string }

/**
 * The API answers with two different error shapes:
 *   - domain errors: `[{ code: 5001, messages: ["..."] }]`
 *   - DRF field validation: `{ "email": ["Enter a valid email address."] }`
 * Read both, so a mistyped address says so instead of masquerading as a wrong
 * password.
 */
function readApiError(body: unknown): { code?: number; message?: string } {
  const entries = Array.isArray(body) ? body : [body]
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue
    const record = entry as Record<string, unknown>

    if (Array.isArray(record.messages)) {
      const message = record.messages.find((m): m is string => typeof m === "string")
      return {
        code: typeof record.code === "number" ? record.code : undefined,
        message,
      }
    }

    // Field errors: take the first message from the first offending field.
    for (const [field, value] of Object.entries(record)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        return { message: `${field}: ${value[0]}` }
      }
    }
  }
  return {}
}

function apiUrl(path: string): URL | null {
  const baseUrl = process.env.BOT_API_URL
  if (!baseUrl) return null
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`)
}

export async function loginToKigo(
  email: string,
  password: string
): Promise<LoginResult> {
  const url = apiUrl("admin/auth/login/")
  if (!url) {
    return { ok: false, kind: "unavailable", message: "BOT_API_URL sozlanmagan." }
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "uz",
      },
      // The serializer takes `email` and `password`; anything else is ignored.
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    })
  } catch {
    return { ok: false, kind: "unavailable", message: "KiGo API javob bermadi." }
  }

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    /* an empty or non-JSON body is handled below */
  }

  if (!response.ok) {
    const { code, message } = readApiError(body)
    // 5001 is "no such account, inactive, or wrong password". A 400 is field
    // validation -- most often an address that isn't a valid email.
    const isCredentials =
      code === 5001 ||
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    return {
      ok: false,
      kind: isCredentials ? "credentials" : "unavailable",
      message: message ?? `KiGo API ${response.status} qaytardi.`,
    }
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return {
      ok: false,
      kind: "unavailable",
      message: "KiGo API kutilmagan javob qaytardi.",
    }
  }

  // Login is open to `admin` and `club_staff`, but every tournament endpoint is
  // behind `IsAdminStaff`. Refusing here with a clear reason beats letting a
  // club_staff in to meet a 403 on every single page.
  const roleCode = parsed.data.admin.role?.code
  if (roleCode && roleCode !== "admin") {
    return {
      ok: false,
      kind: "forbidden",
      message:
        "Turnir paneliga faqat administrator kira oladi. Sizning rolingiz: " +
        (parsed.data.admin.role?.name_uz ?? roleCode) +
        ".",
    }
  }

  return { ok: true, token: parsed.data.token, admin: parsed.data.admin }
}

/** Best-effort logout; the session is dropped locally regardless. */
export async function logoutFromKigo(token: string): Promise<void> {
  const url = apiUrl("admin/auth/logout/")
  if (!url) return
  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
    })
  } catch {
    /* signing out locally is what matters */
  }
}
