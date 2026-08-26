import { handlers } from "@/lib/auth"

/**
 * NextAuth's own callback endpoints. This is the one place a route handler is
 * required instead of a Server Action -- the sign-in flow is driven by the auth
 * library itself, not by our UI.
 */
export const { GET, POST } = handlers
