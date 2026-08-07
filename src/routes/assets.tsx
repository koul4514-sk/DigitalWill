import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState } from "@/lib/estate-data";

export const Route = createFileRoute("/assets")({
  component: AssetsPage,
});

function AssetsPage() {
  const state = getEstateState();

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="Digital assets"
        description="Track each account, policy, or subscription that must be handled after your passing."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {state.assets.map((asset) => (
          <Card key={asset.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4 text-primary" /> {asset.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Type</span>
                <span className="font-medium text-foreground">{asset.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Value</span>
                <span className="font-medium text-foreground">{asset.value}</span>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Instruction</p>
                <p className="mt-1 text-sm text-foreground">{asset.notes}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
