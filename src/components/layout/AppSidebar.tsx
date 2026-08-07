import { ChevronsLeft, LogOut } from "lucide-react";

import { AppLink, useIsActivePath } from "@/components/layout/AppLink";
import type { NavGroup, NavItem } from "@/components/layout/nav-config";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const active = useIsActivePath(item.url);

  const row = (
    <AppLink
      to={item.url}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <span
          className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[image:var(--gradient-primary)]"
          aria-hidden
        />
      )}
      <item.icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </AppLink>
  );

  if (!collapsed) return row;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

/**
 * AppSidebar — primary navigation. Collapses to an icon rail rather than
 * disappearing, so navigation is always reachable on desktop.
 */
export function AppSidebar({
  groups,
  collapsed = false,
  onToggle,
  onSignOut,
  footer,
  className,
}: {
  groups: NavGroup[];
  collapsed?: boolean;
  onToggle?: () => void;
  onSignOut?: () => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <AppLink to="/" aria-label="DigitalWill home">
          <Logo compact={collapsed} />
        </AppLink>
        {!collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavRow key={item.url} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {footer ?? (
          <Button
            variant="ghost"
            onClick={onSignOut}
            className={cn(
              "w-full text-sidebar-foreground/75 hover:bg-destructive/10 hover:text-destructive transition-colors",
              collapsed ? "justify-center px-0" : "justify-start",
            )}
          >
            <LogOut className="size-4" />
            {!collapsed && "Sign out"}
          </Button>
        )}
      </div>
    </aside>
  );
}
