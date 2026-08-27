import "server-only"

/**
 * The two variables the app cannot run without.
 *
 * Without `AUTH_SECRET`, NextAuth fails every request with "There was a problem
 * with the server configuration" -- a message that names neither the variable
 * nor the file, and that arrives as a 500 on the sign-in callback rather than
 * anywhere a person is looking. This turns that into a plain sentence on the
 * login screen, which is where someone finds out anyway.
 */
export type MissingConfig = { name: string; hint: string }

export function missingConfig(): MissingConfig[] {
  const missing: MissingConfig[] = []

  if (!process.env.AUTH_SECRET) {
    missing.push({
      name: "AUTH_SECRET",
      hint: "Sessiya cookie’sini shifrlaydi. Yarating: openssl rand -base64 32",
    })
  }

  if (!process.env.BOT_API_URL) {
    missing.push({
      name: "BOT_API_URL",
      hint: "KiGo API manzili, masalan https://api.kigo.uz/api/",
    })
  }

  return missing
}
