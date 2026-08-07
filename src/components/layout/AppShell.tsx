import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import type { NavGroup } from "@/components/layout/nav-config";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clearSessionState } from "@/lib/estate-data";

/**
 * AppShell — the single layout used by both the owner app and the nominee
 * portal. It is role-agnostic: callers pass the nav groups they are allowed
 * to see, which is what makes permission-driven navigation trivial later.
 */
export function AppShell({
  groups,
  roleLabel,
  userName,
  children,
}: {
  groups: NavGroup[];
  roleLabel: string;
  userName: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSignOut() {
    clearSessionState();
    if (typeof window !== "undefined") {
      localStorage.removeItem("legacyvault-jwt");
    }
    toast.success("Signed out successfully.");
    window.location.assign("/");
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen w-full">
        <div className="sticky top-0 hidden h-screen lg:block">
          <AppSidebar
            groups={groups}
            collapsed={collapsed}
            onToggle={() => setCollapsed(true)}
            onSignOut={handleSignOut}
          />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 border-sidebar-border p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar groups={groups} onSignOut={handleSignOut} className="h-full w-full" />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            roleLabel={roleLabel}
            userName={userName}
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
            onOpenMobileNav={() => setMobileOpen(true)}
            onSignOut={handleSignOut}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl animate-rise-in space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
