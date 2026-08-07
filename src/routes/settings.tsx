import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState } from "@/lib/estate-data";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const state = getEstateState();

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="Estate settings"
        description="Tune the vault rules so your estate stays secure and reviewable."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { label: "Auto-lock enabled", value: state.settings.autoLock ? "Yes" : "No" },
          { label: "Review required", value: state.settings.requireReview ? "Yes" : "No" },
          { label: "Encryption mode", value: state.settings.encryptionMode },
          { label: "Primary owner", value: state.ownerName },
        ].map((item) => (
          <Card key={item.label} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-4 text-primary" /> {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
