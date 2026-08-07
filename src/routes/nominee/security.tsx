import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/security")({
  component: NomineeSecurityPage,
});

function NomineeSecurityPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Security" description="Nominee activity is limited to the owner-approved scope." />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Access controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>All access is tied to the owner’s policy and can be revoked at any time.</p>
          <p>Audit events are recorded so every action remains transparent.</p>
          <p>Your view is read-only; you cannot alter the owner’s instructions or documents.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
