import Link from "next/link"

import { Button } from "@/components/ui/button"

/**
 * A Button that navigates.
 *
 * Base UI's Button assumes a native `<button>` unless told otherwise, and
 * warns (and drops button semantics) when the `render` prop supplies an
 * anchor. Rendering a link through this component keeps `nativeButton={false}`
 * in one place instead of at every call site.
 */
export function LinkButton({
  href,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string
}) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props}>
      {children}
    </Button>
  )
}
