import { createFileRoute } from "@tanstack/react-router";
import { Lock, ScrollText } from "lucide-react";
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

export const Route = createFileRoute("/nominee/instructions")({
  component: NomineeInstructionsPage,
});

function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "High":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
}

function NomineeInstructionsPage() {
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
  const isGranted = Boolean(nominee?.permissions.instructions);

  if (!isGranted) {
    return (
      <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
        <PageHeader
          title="Digital instructions"
          description="Permission required to view directions."
        />
        <Card className="glass border-none">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The estate owner ({estateState.ownerName}) has disabled Digital Instructions access
              for your account.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
      <PageHeader
        title="Digital instructions"
        description="Follow the clear directions prepared by the estate owner for execution steps."
      />

      {estateState.instructions.length > 0 ? (
        <div className="grid gap-4">
          {estateState.instructions.map((instruction) => (
            <Card key={instruction.id} className="glass border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScrollText className="size-4 text-primary" /> {instruction.title}
                </CardTitle>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                    instruction.priority,
                  )}`}
                >
                  {instruction.priority} Priority
                </span>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="leading-relaxed text-foreground">{instruction.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ScrollText}
          title="No instructions available"
          description="The estate owner has not added any specific digital instructions."
        />
      )}
    </AppShell>
  );
}
