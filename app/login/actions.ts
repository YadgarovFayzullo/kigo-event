"use server"

import { AuthError } from "next-auth"
import { z } from "zod"

import { signIn } from "@/lib/auth"
import { errorState, type ActionState } from "@/lib/action-result"

const schema = z.object({
  email: z.email("Toʻgʻri email kiriting"),
  password: z.string().min(1, "Parolingizni kiriting"),
})

export async function signInWithCredentials(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = schema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  })
  if (!parsed.success) {
    return errorState(
      "Maʼlumotlarni tekshirib, qayta urinib koʻring.",
      z.flattenError(parsed.error).fieldErrors as Record<string, string[]>
    )
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/tournaments",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      // Bad email or password: stay deliberately vague so the form can't be
      // used to discover which staff emails exist.
      if (error.type === "CredentialsSignin") {
        return errorState("Email yoki parol notoʻgʻri.")
      }
      // Anything else carries a real reason from the API -- a role that can't
      // use this panel, or an outage. Show it: it tells the operator what to
      // do, which "try again later" does not.
      console.error("[login] sign-in failed:", error)
      const reason = (error.cause as Error | undefined)?.message
      return errorState(
        reason ||
          "Tizimga kirish vaqtincha ishlamayapti. Qayta urinib koʻring yoki administratorga xabar bering."
      )
    }
    // `signIn` signals a successful redirect by throwing -- let that through.
    throw error
  }

  return { status: "success" }
}
