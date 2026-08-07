import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/financial")({
  component: NomineeFinancialPage,
});

function NomineeFinancialPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Financial overview" description="A restricted view of the financial assets relevant to your role." />

      <div className="grid gap-4 lg:grid-cols-2">
        {state.assets.map((asset) => (
          <Card key={asset.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" /> {asset.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Type: {asset.type}</p>
              <p>Value: {asset.value}</p>
              <p>Notes: {asset.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
