import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import {
  nomineeNav,
  filterNavByPermissions,
  type NomineePermission,
} from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEstateState,
  getSessionState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/security")({
  component: NomineeSecurityPage,
});

function NomineeSecurityPage() {
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
        title="Nominee security posture"
        description="Review security principles, encryption guarantees, and active session safety."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Active Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3.5">
              <span>Authenticated Nominee</span>
              <span className="font-semibold text-foreground">{nominee?.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3.5">
              <span>Registered Email</span>
              <span className="font-medium text-foreground">{nominee?.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3.5">
              <span>Authentication Token</span>
              <span className="font-mono text-xs text-primary">JWT (HS256 Signed)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Security Commitments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium text-foreground">Zero Write Permissions</p>
              <p className="mt-1 text-xs leading-relaxed">
                Nominees can never edit or overwrite owner document stores, asset values, or
                permissions.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium text-foreground">Append-Only Audit Logging</p>
              <p className="mt-1 text-xs leading-relaxed">
                Every action taken in this portal is recorded in an immutable audit ledger visible
                to the owner.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
