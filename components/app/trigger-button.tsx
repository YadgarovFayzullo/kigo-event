import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A plain `<button>` wearing the design system's button styling, for use in a
 * Base UI `render` prop.
 *
 * Passing the `<Button>` component to a trigger's `render` puts two components
 * that both set `data-slot` on the same element. Which one wins differs between
 * the server render and hydration, so React reports a mismatch. A plain element
 * has no `data-slot` of its own, leaving the trigger's — identical on both
 * sides — while `buttonVariants` keeps the appearance exactly the same.
 */
export function TriggerButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> &
  Parameters<typeof buttonVariants>[0]) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
