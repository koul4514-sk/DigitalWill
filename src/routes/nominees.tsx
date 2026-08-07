import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominees")({
  component: NomineesPage,
});

function NomineesPage() {
  const state = getEstateState();

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="Nominee access"
        description="Securely assign exactly the resources each nominee can see and use."
      />

      <div className="grid gap-4">
        {state.nominees.map((nominee) => (
          <Card key={nominee.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-primary" /> {nominee.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {nominee.relationship}
                </span>
                <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-medium">
                  {nominee.status}
                </span>
              </div>
              <p>{nominee.email}</p>
              <div className="rounded-2xl border border-border bg-background/50 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Granted access</p>
                <p className="mt-2 text-sm text-foreground">
                  {Object.entries(nominee.permissions)
                    .filter(([, value]) => value)
                    .map(([key]) => key)
                    .join(", ") || "None"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
