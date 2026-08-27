"use client"

import { useActionState, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"

import { Field } from "@/components/app/field"
import { SubmitButton } from "@/components/app/submit-button"
import { Input } from "@/components/ui/input"
import { idleState } from "@/lib/action-result"

import { signInWithCredentials } from "./actions"

export function LoginForm() {
  const [state, formAction] = useActionState(signInWithCredentials, idleState)
  const [visible, setVisible] = useState(false)

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        label="Ish emaili"
        htmlFor="email"
        error={state.fieldErrors?.email}
        required
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@kigo.uz"
          required
          aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
        />
      </Field>

      <Field
        label="Parol"
        htmlFor="password"
        error={state.fieldErrors?.password}
        required
      >
        {/* A keyboard layout is the usual reason a password is "wrong" here,
            and revealing it is the fastest way to see that. */}
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-9"
            aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
          />
          <button
            type="button"
            onClick={() => setVisible((shown) => !shown)}
            aria-label={visible ? "Parolni yashirish" : "Parolni koʻrsatish"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <HugeiconsIcon
              icon={visible ? ViewOffSlashIcon : ViewIcon}
              className="size-4"
            />
          </button>
        </div>
      </Field>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Kirilmoqda…" className="w-full">
        Kirish
      </SubmitButton>
    </form>
  )
}
