import Link from "next/link"
import { Suspense } from "react"

import { SidebarNav } from "@/components/app/sidebar-nav"
import { UserMenu } from "@/components/app/user-menu"
import { requireUser } from "@/lib/auth/guards"

/**
 * The operator shell.
 *
 * Every page in this group sits behind the session check below. The KiGo API
 * re-checks the token on every call of its own, so this is the outer gate, not
 * the only one.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-58 shrink-0 flex-col justify-between border-r bg-sidebar p-3 md:flex">
        <div className="grid gap-6">
          <Link href="/tournaments" className="flex items-center gap-2 px-2 py-1">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              K
            </span>
            <span className="font-heading text-sm font-semibold tracking-tight">
              KiGo Kubogi
            </span>
          </Link>
          {/* useSearchParams needs a suspense boundary during prerender. */}
          <Suspense fallback={null}>
            <SidebarNav />
          </Suspense>
        </div>
        <UserMenu name={user.name} email={user.email} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2 md:hidden">
          <Link href="/tournaments" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              K
            </span>
            <span className="font-heading text-sm font-semibold">KiGo</span>
          </Link>
          <div className="w-44">
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>
        <nav className="overflow-x-auto border-b px-3 py-2 md:hidden">
          <Suspense fallback={null}>
            <SidebarNav orientation="horizontal" />
          </Suspense>
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
