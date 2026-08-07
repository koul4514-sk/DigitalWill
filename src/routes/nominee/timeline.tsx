import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/timeline")({
  component: NomineeTimelinePage,
});

function NomineeTimelinePage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Estate timeline" description="Track the audit history and the actions taken around the estate." />

      <div className="space-y-4">
        {state.audit.map((event) => (
          <Card key={event.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-primary" /> {event.action}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{event.summary}</p>
              <p className="mt-2 text-xs uppercase tracking-wide">{event.actor} • {event.timestamp}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
