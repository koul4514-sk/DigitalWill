import { createFileRoute } from "@tanstack/react-router";
import { Activity, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import {
  nomineeNav,
  filterNavByPermissions,
  type NomineePermission,
} from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEstateState,
  getSessionState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/timeline")({
  component: NomineeTimelinePage,
});

function NomineeTimelinePage() {
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
  const isGranted = Boolean(nominee?.permissions.timeline);

  if (!isGranted) {
    return (
      <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
        <PageHeader
          title="Estate timeline"
          description="Permission required to view audit trail."
        />
        <Card className="glass border-none">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The estate owner ({estateState.ownerName}) has disabled Estate Timeline access for
              your account.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
      <PageHeader
        title="Estate timeline"
        description="Transparent audit log recording every view, access event, and estate activity."
      />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-primary" /> Security & Access Audit Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {estateState.audit.length > 0 ? (
            estateState.audit.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-primary">{entry.actor}</span>
                  <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Activity}
              title="No audit events recorded"
              description="No security events have been logged yet."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
