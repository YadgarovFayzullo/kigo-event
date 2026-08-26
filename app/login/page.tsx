import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth/guards"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Kirish" }

export default async function LoginPage() {
  // Already signed in? Skip the form.
  if (await getSessionUser()) redirect("/tournaments")

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            K
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            KiGo CRM
          </span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Kirish</CardTitle>
            <CardDescription>
              Faqat xodimlar uchun. Kirish kerak boʻlsa, administratorga murojaat qiling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
