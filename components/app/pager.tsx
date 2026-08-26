import { LinkButton } from "@/components/app/link-button"
import { Button } from "@/components/ui/button"

/**
 * Back · page · forward.
 *
 * Driven by the URL rather than state, so a page of results is a real address
 * you can share or reload. Both arrows are always rendered -- disabled at the
 * ends rather than removed -- so the row doesn't shift as you page through.
 */
export function Pager({
  page,
  pages,
  basePath,
  params,
}: {
  page: number
  pages: number
  basePath: string
  /** Current query string, minus `page`, which this component sets. */
  params: Record<string, string | undefined>
}) {
  if (pages <= 1) return null

  const href = (nextPage: number) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value)
    }
    next.set("page", String(nextPage))
    return `${basePath}?${next.toString()}`
  }

  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Sahifalar"
    >
      {page > 1 ? (
        <LinkButton
          href={href(page - 1)}
          variant="outline"
          size="icon-sm"
          aria-label="Oldingi sahifa"
        >
          ‹
        </LinkButton>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Oldingi sahifa">
          ‹
        </Button>
      )}

      <span className="text-sm text-muted-foreground tabular-nums">
        {page} / {pages}
      </span>

      {page < pages ? (
        <LinkButton
          href={href(page + 1)}
          variant="outline"
          size="icon-sm"
          aria-label="Keyingi sahifa"
        >
          ›
        </LinkButton>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Keyingi sahifa">
          ›
        </Button>
      )}
    </nav>
  )
}
