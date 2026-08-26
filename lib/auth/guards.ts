import "server-only"

import { redirect } from "next/navigation"

import { auth } from "./index"

export type SessionUser = {
  id: string
  name: string
  email: string
  /** KiGo bearer token for this operator. */
  apiToken: string
}

/**
 * Authorisation lives on the KiGo side.
 *
 * `admin/auth/login/` only issues a token to `role=admin`, and every endpoint
 * this app calls is behind `IsAdminStaff`. So there is exactly one privilege
 * level here: signed in, or not. There is no local user table to consult.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id || !session.user.apiToken) return null
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    apiToken: session.user.apiToken,
  }
}

/** Guard for pages and layouts: sends anonymous visitors to the login screen. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

/**
 * Guard for Server Actions and Route Handlers.
 *
 * The KiGo API is the real gate -- it rejects a missing or expired token -- but
 * checking here too means an unauthenticated caller gets a clean redirect
 * instead of a confusing 401 relayed from upstream.
 */
export const requireOperator = requireUser
