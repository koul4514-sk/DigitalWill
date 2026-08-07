import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileLock2, FolderLock, ShieldCheck, Users } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { clearSessionState, getEstateState, saveEstateState, saveSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [state, setState] = useState(() => getEstateState());

  useEffect(() => {
    saveSessionState({ role: "owner", email: state.email });
  }, [state.email]);

  useEffect(() => {
    saveEstateState(state);
  }, [state]);

  const stats = useMemo(
    () => [
      {
        label: "Protected documents",
        value: state.documents.length,
        hint: "Encrypted and ready for hand-off",
        icon: FileLock2,
        trend: "up" as const,
      },
      {
        label: "Active nominees",
        value: state.nominees.filter((item) => item.status === "active").length,
        hint: "Permission-aware access",
        icon: Users,
        trend: "up" as const,
      },
      {
        label: "Checklist progress",
        value: `${Math.round((state.checklist.filter((item) => item.completed).length / state.checklist.length) * 100)}%`,
        hint: "Review before finalizing",
        icon: CheckCircle2,
        trend: "neutral" as const,
      },
    ],
    [state],
  );

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="LegacyVault dashboard"
        description="A calm, secure command center for your digital estate and every access hand-off."
        actions={
          <Button variant="hero" onClick={() => setState((current) => ({ ...current, checklist: current.checklist.map((item) => ({ ...item, completed: item.id === "check-3" ? true : item.completed })) }))}>
            Mark review complete
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderLock className="size-4 text-primary" /> Estate status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Primary vault</p>
              <p className="mt-2 font-display text-xl font-semibold">{state.estateName}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Encryption mode: <span className="text-foreground">{state.settings.encryptionMode}</span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-sm text-muted-foreground">Last audit event</p>
                <p className="mt-2 font-medium">{state.audit[0]?.action}</p>
                <p className="text-sm text-muted-foreground">{state.audit[0]?.timestamp}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-sm text-muted-foreground">Nominee readiness</p>
                <p className="mt-2 font-medium">{state.nominees.filter((item) => item.status === "active").length} active</p>
                <p className="text-sm text-muted-foreground">{state.nominees.length} invited overall</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Secure actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Review access policies", detail: "Grant or revoke nominee privileges in seconds." },
              { title: "Share instructions", detail: "Prepare a clear hand-off packet for your trusted circle." },
              { title: "Lock the vault", detail: "Disable all further permissions until you approve access." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => {
              clearSessionState();
              setState(getEstateState());
            }}>
              Reset demo session
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
