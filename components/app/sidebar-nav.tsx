"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

/**
 * The six top-level sections, mirroring the reference operator panel.
 *
 * Participants, teams and matches are sections in their own right rather than
 * tabs inside a tournament -- the tournament is chosen once in the header and
 * scopes all of them, which is how operators actually work.
 */
export const SECTIONS = [
  { href: "/tournaments", label: "Turnirlar" },
  { href: "/participants", label: "Zayavkalar" },
  { href: "/teams", label: "Jamoalar" },
  { href: "/matches", label: "Oʻyinlar" },
  { href: "/bracket", label: "Setka" },
  { href: "/referees", label: "Hakamlar" },
  { href: "/residents", label: "Rezidentlar" },
] as const

/** Sections scoped by the selected tournament keep it in the query string. */
export const SCOPED = new Set<string>([
  "/participants",
  "/teams",
  "/matches",
  "/bracket",
  "/tournaments",
])

export function SidebarNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal"
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const tournament = params.get("t")

  return (
    <nav
      className={cn(orientation === "vertical" ? "grid gap-0.5" : "flex gap-1")}
      aria-label="Asosiy"
    >
      {SECTIONS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        // Carry the chosen tournament across the sections it applies to.
        const href =
          tournament && SCOPED.has(item.href)
            ? `${item.href}?t=${encodeURIComponent(tournament)}`
            : item.href
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              orientation === "horizontal" && "shrink-0 whitespace-nowrap",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
