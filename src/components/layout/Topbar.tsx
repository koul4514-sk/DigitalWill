import { Bell, LogOut, Menu, PanelLeftOpen, Search, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Topbar — sticky glass header. Owns the mobile nav trigger, the collapse
 * toggle when the sidebar is in rail mode, global search and account chip.
 */
export function Topbar({
  roleLabel,
  userName,
  collapsed,
  onExpand,
  onOpenMobileNav,
  onSignOut,
  actions,
}: {
  roleLabel: string;
  userName: string;
  collapsed?: boolean;
  onExpand?: () => void;
  onOpenMobileNav?: () => void;
  onSignOut?: () => void;
  actions?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = mounted && userName ? userName : "User";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border",
        "bg-background/65 px-4 backdrop-blur-xl sm:px-6",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      {collapsed && onExpand && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={onExpand}
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="size-4" />
        </Button>
      )}

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search estate…"
          className="h-9 border-border bg-surface-1/60 pl-9"
          aria-label="Search estate"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {actions}
        <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
          {roleLabel}
        </Badge>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-9 rounded-full p-0 border border-border"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-surface-2 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-border">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onSignOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
