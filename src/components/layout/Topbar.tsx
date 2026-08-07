import { Bell, Menu, PanelLeftOpen, Search } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  actions,
}: {
  roleLabel: string;
  userName: string;
  collapsed?: boolean;
  onExpand?: () => void;
  onOpenMobileNav?: () => void;
  actions?: ReactNode;
}) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <Avatar className="size-9 border border-border">
          <AvatarFallback className="bg-surface-2 text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
