import { createFileRoute } from "@tanstack/react-router";
import { Lock, Wallet } from "lucide-react";
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

export const Route = createFileRoute("/nominee/financial")({
  component: NomineeFinancialPage,
});

function NomineeFinancialPage() {
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
  const isGranted = Boolean(nominee?.permissions.financial);

  if (!isGranted) {
    return (
      <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
        <PageHeader
          title="Financial overview"
          description="Permission required to view financial register."
        />
        <Card className="glass border-none">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The estate owner ({estateState.ownerName}) has disabled Financial Overview access for
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
        title="Financial overview"
        description="Review financial holdings, accounts, and policies registered for execution."
      />

      {estateState.assets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {estateState.assets.map((asset) => (
            <Card key={asset.id} className="glass border-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="size-4 text-primary" /> {asset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {asset.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Value / Reference</span>
                  <span className="font-medium text-foreground">{asset.value}</span>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Handover Instruction
                  </p>
                  <p className="mt-1 text-sm text-foreground">{asset.notes}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No financial assets registered"
          description="There are currently no financial assets listed in the estate register."
        />
      )}
    </AppShell>
  );
}
