import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/access")({
  component: NomineeAccessPage,
});

function NomineeAccessPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="My access" description="A transparent view of the permissions the owner has granted you." />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" /> Permission matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(nominee.permissions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
              <span className="capitalize">{key}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${value ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"}`}>
                {value ? "Granted" : "Not granted"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
