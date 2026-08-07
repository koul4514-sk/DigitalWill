import { createFileRoute } from "@tanstack/react-router";
import { FileLock2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/vault")({
  component: NomineeVaultPage,
});

function NomineeVaultPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Encrypted vault" description="The owner has granted you permission to view these documents." />

      <Card className="glass border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileLock2 className="size-4 text-primary" /> Visible documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="font-medium">{document.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{document.category} • {document.sizeLabel}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
