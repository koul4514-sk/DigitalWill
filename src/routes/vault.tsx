import { createFileRoute } from "@tanstack/react-router";
import { FileLock2, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState } from "@/lib/estate-data";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

function VaultPage() {
  const state = getEstateState();

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="Digital vault"
        description="Every document is encrypted, permissioned, and ready for hand-off when the time comes."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileLock2 className="size-4 text-primary" /> Stored documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-muted-foreground">{document.category} • {document.createdAt}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {document.sizeLabel}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Security posture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Encryption mode</p>
              <p className="mt-1 font-medium">{state.settings.encryptionMode}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Auto-lock</p>
              <p className="mt-1 font-medium">{state.settings.autoLock ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Review requirements</p>
              <p className="mt-1 font-medium">{state.settings.requireReview ? "Required before access" : "Not required"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
