import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
// Imported so the module augmentation below has a module to attach to.
import type { JWT } from "next-auth/jwt"

import { loginToKigo } from "@/lib/bot-api/admin-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      /** KiGo bearer token, used for every `admin/*` call this app makes. */
      apiToken: string
    } & DefaultSession["user"]
  }

  interface User {
    apiToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    apiToken: string
  }
}

// Referenced so the `JWT` import above is not elided as unused.
export type StaffJWT = JWT

const credentialsSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
})

/**
 * Sign-in is delegated to the KiGo API.
 *
 * This app has no user table of its own: `POST /admin/auth/login/` verifies the
 * operator and returns the bearer token that every other `admin/*` endpoint
 * requires. That token is the session -- it lives in the encrypted JWT cookie
 * and is read back out by `lib/bot-api/client.ts`, so no long-lived service
 * token is needed anywhere.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials sign-in requires JWT sessions -- there is no session table.
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Login", type: "text" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)
        if (!parsed.success) return null

        const result = await loginToKigo(
          parsed.data.email,
          parsed.data.password
        )
        if (!result.ok) {
          // Log the API's own reason: the form deliberately stays vague, but an
          // operator debugging a failed sign-in needs the real message.
          console.error(`[login] ${result.kind}: ${result.message}`)
          // `null` becomes "wrong email or password" in the form. A role that
          // cannot use this panel, or an outage, is thrown so the form can say
          // what actually happened.
          if (result.kind === "credentials") return null
          throw new Error(result.message)
        }

        const { admin, token } = result
        return {
          id: admin.id,
          email: admin.email ?? parsed.data.email,
          name:
            admin.full_name ||
            [admin.name, admin.surname].filter(Boolean).join(" ") ||
            admin.email ||
            parsed.data.email,
          apiToken: token,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.apiToken = user.apiToken
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.apiToken = token.apiToken
      return session
    },
  },
})
