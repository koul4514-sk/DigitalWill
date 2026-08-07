import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/checklist")({
  component: NomineeChecklistPage,
});

function NomineeChecklistPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Executor checklist" description="The owner’s review checklist is visible here for guided execution." />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-primary" /> Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.checklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3">
              <span>{item.label}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.completed ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"}`}>
                {item.completed ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
