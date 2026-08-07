import { createFileRoute } from "@tanstack/react-router";
import { Gauge, KeyRound, ScrollText, ShieldCheck, Users, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import {
  nomineeNav,
  filterNavByPermissions,
  type NomineePermission,
} from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEstateState,
  getSessionState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/dashboard")({
  component: NomineeDashboardPage,
});

function NomineeDashboardPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const session = getSessionState();

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  const nominee =
    estateState.nominees.find((item) => item.id === session?.nomineeId) ?? estateState.nominees[0];

  const grantedPermissions = Object.entries(nominee?.permissions ?? {})
    .filter(([, value]) => value)
    .map(([key]) => key) as NomineePermission[];

  const navGroups = filterNavByPermissions(nomineeNav, grantedPermissions);

  return (
    <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
      <PageHeader
        title={`Welcome, ${nominee?.name ?? "Nominee"}`}
        description="You have secure, permission-controlled access to the digital estate resources granted by the owner."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Granted Modules"
          value={grantedPermissions.length}
          icon={KeyRound}
          hint="Resource permission control"
        />
        <StatCard
          label="Available Instructions"
          value={nominee?.permissions.instructions ? estateState.instructions.length : 0}
          icon={ScrollText}
          hint={nominee?.permissions.instructions ? "Active handover guide" : "Access restricted"}
        />
        <StatCard label="Your Status" value="Verified Nominee" icon={Users} hint={nominee?.email} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Active Permissions Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Permissions are set individually by the estate owner ({estateState.ownerName}).
            </p>
            <div className="space-y-2">
              {Object.entries(nominee?.permissions ?? {}).map(([key, isGranted]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/40 p-3"
                >
                  <span className="font-medium text-foreground capitalize">{key} Module</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isGranted ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {isGranted ? "Granted" : "Disabled"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Security & Privacy Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium text-foreground">Read-Only Structural Guarantee</p>
              <p className="mt-1 text-xs leading-relaxed">
                Nominees can view granted resources and execute checklist tasks, but cannot modify
                owner estate rules or credentials.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium text-foreground">Real-Time Permission Sync</p>
              <p className="mt-1 text-xs leading-relaxed">
                If the owner updates or revokes permissions, your portal navigation updates
                dynamically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
