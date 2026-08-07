import { createFileRoute } from "@tanstack/react-router";
import { Gauge, KeyRound, ScrollText, ShieldCheck, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/dashboard")({
  component: NomineeDashboardPage,
});

function NomineeDashboardPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];
  const granted = Object.entries(nominee.permissions)
    .filter(([, value]) => value)
    .map(([key]) => key);

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader
        title={`Welcome, ${nominee.name}`}
        description="You can only access the resources that the owner has explicitly granted."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Granted areas" value={granted.length} icon={KeyRound} hint="Permissioned by owner" />
        <StatCard label="Active instructions" value={state.instructions.length} icon={ScrollText} hint="Structured hand-off" />
        <StatCard label="Your role" value="Trusted nominee" icon={Users} hint={session?.email} />
      </section>

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Your authorized view
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="font-medium text-foreground">Shared access summary</p>
            <p className="mt-2">{granted.join(", ") || "No permissions granted yet"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="font-medium text-foreground">Security note</p>
            <p className="mt-2">The portal is intentionally limited to the authorized resources. Any non-granted area remains hidden.</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
