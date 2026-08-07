import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
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

export const Route = createFileRoute("/nominee/access")({
  component: NomineeAccessPage,
});

function NomineeAccessPage() {
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
        title="My access privileges"
        description="A transparent matrix of all resource permissions granted to your account by the owner."
      />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" /> Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(nominee?.permissions ?? {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3.5"
            >
              <div>
                <span className="font-medium text-foreground capitalize">{key} Module</span>
                <p className="text-xs text-muted-foreground">
                  {value ? `Access granted to ${key} data.` : `Access disabled by owner.`}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  value ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {value ? "Granted" : "Not Granted"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
