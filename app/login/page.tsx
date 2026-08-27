import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth/guards"
import { missingConfig } from "@/lib/config-check"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Kirish" }

export default async function LoginPage() {
  // Checked before touching NextAuth: without AUTH_SECRET it throws on every
  // call, and the resulting 500 says nothing about which variable is missing.
  const missing = missingConfig()

  // Already signed in? Skip the form.
  if (missing.length === 0 && (await getSessionUser())) redirect("/tournaments")

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
            {missing.length > 0 ? (
              <div className="grid gap-3 text-sm">
                <p className="font-medium text-destructive">
                  Server sozlanmagan
                </p>
                <p className="text-muted-foreground">
                  Quyidagi oʻzgaruvchilar berilmagan, shuning uchun kirish
                  ishlamaydi:
                </p>
                <ul className="grid gap-2">
                  {missing.map((item) => (
                    <li key={item.name} className="rounded-md bg-muted px-3 py-2">
                      <code className="font-mono text-xs font-semibold">
                        {item.name}
                      </code>
                      <span className="block text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <LoginForm />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
