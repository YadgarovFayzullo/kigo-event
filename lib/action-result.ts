/**
 * Shared shape for Server Action results consumed by `useActionState`.
 * Client components never decide permissions -- they only render what the
 * server sent back.
 */
export type ActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Record<string, string[]>
}

export const idleState: ActionState = { status: "idle" }

export function errorState(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionState {
  return { status: "error", message, fieldErrors }
}

export function successState(message?: string): ActionState {
  return { status: "success", message }
}

/** Turns an unknown thrown value into a message safe to show a teammate. */
export function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}
