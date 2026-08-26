"use client"

import { useActionState } from "react"

import { Field } from "@/components/app/field"
import { SubmitButton } from "@/components/app/submit-button"
import { Input } from "@/components/ui/input"
import { idleState } from "@/lib/action-result"

import { signInWithCredentials } from "./actions"

export function LoginForm() {
  const [state, formAction] = useActionState(signInWithCredentials, idleState)

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
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password) || undefined}
        />
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
