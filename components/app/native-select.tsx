import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A plain `<select>` wearing the design system's input styling.
 *
 * Deliberately native: these live inside forms that post to Server Actions and
 * inside filter bars that submit on change, so they must work as real form
 * controls without shipping any client JavaScript.
 */
function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat py-1 pr-8 pl-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%221.5%22%3E%3Cpath d=%22M4 6l4 4 4-4%22/%3E%3C/svg%3E')]",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
