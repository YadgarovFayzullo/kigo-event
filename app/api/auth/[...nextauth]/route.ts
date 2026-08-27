import type { NextRequest } from "next/server"

import { handlers } from "@/lib/auth"

/**
 * NextAuth's own callback endpoints, with one thing taken out of the response.
 *
 * The session carries the operator's KiGo bearer token so server code can call
 * the platform with it. `GET /api/auth/session` would hand that same object to
 * the browser, which puts a live platform credential within reach of any script
 * on the page — exactly what keeping it in an httpOnly cookie was meant to
 * prevent.
 *
 * Server-side `auth()` reads the JWT directly and is unaffected; only what goes
 * over the wire is trimmed. Nothing in this app calls the session endpoint from
 * the client.
 */
export const POST = handlers.POST

export async function GET(request: NextRequest): Promise<Response> {
  const response = await handlers.GET(request)

  if (!new URL(request.url).pathname.endsWith("/session")) {
    return response
  }

  let session: unknown
  try {
    session = await response.clone().json()
  } catch {
    // Not JSON (an empty session is `null`); pass it through untouched.
    return response
  }

  if (session && typeof session === "object" && "user" in session) {
    const user = (session as { user?: Record<string, unknown> }).user
    if (user && typeof user === "object") delete user.apiToken
  }

  // Rebuild rather than mutate: the original headers carry Set-Cookie.
  return new Response(JSON.stringify(session), {
    status: response.status,
    headers: response.headers,
  })
}
