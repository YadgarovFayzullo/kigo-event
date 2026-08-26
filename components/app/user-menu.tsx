"use client"

import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TriggerButton } from "@/components/app/trigger-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/lib/auth/actions"
import { initials } from "@/lib/format"

export function UserMenu({ name, email }: { name: string; email: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TriggerButton
            variant="ghost"
            className="h-auto w-full justify-start gap-2.5 px-2 py-2 text-left"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">
            {initials(name || email)}
          </AvatarFallback>
        </Avatar>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-medium">{name || email}</span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </span>
        <HugeiconsIcon
          icon={MoreVerticalIcon}
          className="size-4 text-muted-foreground"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid gap-0.5">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? "Yorugʻ mavzu" : "Qorongʻi mavzu"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void signOutAction()
          }}
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
          Chiqish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
