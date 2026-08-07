import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  toggleChecklistItem,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/checklist")({
  component: NomineeChecklistPage,
});

function NomineeChecklistPage() {
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
  const isGranted = Boolean(nominee?.permissions.checklist);

  function handleToggle(id: string) {
    const updated = toggleChecklistItem(id);
    setEstateState(updated);
    toast.success("Checklist task status updated.");
  }

  if (!isGranted) {
    return (
      <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
        <PageHeader
          title="Executor checklist"
          description="Permission required to view execution tasks."
        />
        <Card className="glass border-none">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The estate owner ({estateState.ownerName}) has disabled Executor Checklist access for
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
        title="Executor checklist"
        description="Interactive step-by-step tasks to guide you through carrying out the owner's estate directions."
      />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-primary" /> Execution Tasks (
            {estateState.checklist.filter((i) => i.completed).length} /{" "}
            {estateState.checklist.length} Completed)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {estateState.checklist.length > 0 ? (
            estateState.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/50 p-4 transition-colors hover:bg-background/80"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="size-4 accent-primary"
                  />
                  <span
                    className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "font-medium text-foreground"}`}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.completed
                      ? "bg-success/15 text-success"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {item.completed ? "Completed" : "Pending"}
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No checklist tasks"
              description="No checklist tasks have been configured for this estate."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
