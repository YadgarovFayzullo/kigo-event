import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/auth/guards"

/**
 * Streams a tournament export.
 *
 * A Route Handler rather than a Server Action because this returns a file, and
 * a plain link straight to the KiGo API would not carry our bearer token. The
 * CRM's own role check still runs first, exactly as it does for every mutation.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Checked here rather than via `requireRole`: a route handler should answer
  // with a status code, not throw a 500 or redirect a file download.
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi." }, { status: 401 })
  }
  const { id } = await params
  const baseUrl = process.env.BOT_API_URL
  if (!baseUrl) {
    return NextResponse.json(
      { error: "BOT_API_URL sozlanmagan." },
      { status: 503 }
    )
  }

  // The operator's own token, exactly as every other admin call uses.
  const token = user.apiToken
  const url = new URL(
    `tournaments/admin/${encodeURIComponent(id)}/export/`,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  )

  let upstream: Response
  try {
    upstream = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { error: "Eksportni yuklab boʻlmadi: API javob bermadi." },
      { status: 504 }
    )
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `API xatolik qaytardi (${upstream.status}).` },
      { status: upstream.status === 401 ? 502 : upstream.status }
    )
  }

  // Pass the upstream file through untouched, but name it ourselves so the
  // browser saves something recognisable.
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition":
        upstream.headers.get("content-disposition") ??
        `attachment; filename="tournament-${id}-export.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
