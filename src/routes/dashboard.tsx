import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileLock2,
  FolderLock,
  Plus,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDocumentModal } from "@/components/modals/UploadDocumentModal";
import { AssetModal } from "@/components/modals/AssetModal";
import { NomineeModal } from "@/components/modals/NomineeModal";
import { InstructionModal } from "@/components/modals/InstructionModal";
import {
  clearSessionState,
  getEstateState,
  resetEstateState,
  saveSessionState,
  subscribeToStateChanges,
  toggleChecklistItem,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [nomineeModalOpen, setNomineeModalOpen] = useState(false);
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);

  useEffect(() => {
    saveSessionState({ role: "owner", email: estateState.email });
  }, [estateState.email]);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  const checklistProgress = useMemo(() => {
    if (estateState.checklist.length === 0) return 100;
    const completed = estateState.checklist.filter((item) => item.completed).length;
    return Math.round((completed / estateState.checklist.length) * 100);
  }, [estateState.checklist]);

  const digitalHealthScore = useMemo(() => {
    let score = 40;
    if (estateState.documents.length > 0) score += 20;
    if (estateState.assets.length > 0) score += 15;
    if (estateState.nominees.length > 0) score += 15;
    if (estateState.instructions.length > 0) score += 10;
    return Math.min(100, score);
  }, [estateState]);

  const stats = useMemo(
    () => [
      {
        label: "Protected documents",
        value: estateState.documents.length,
        hint: "Encrypted and ready for hand-off",
        icon: FileLock2,
        trend: "up" as const,
      },
      {
        label: "Active nominees",
        value: estateState.nominees.filter((item) => item.status === "active").length,
        hint: "Permission-aware access",
        icon: Users,
        trend: "up" as const,
      },
      {
        label: "Checklist progress",
        value: `${checklistProgress}%`,
        hint: "Executor readiness steps",
        icon: CheckCircle2,
        trend: "neutral" as const,
      },
    ],
    [estateState, checklistProgress],
  );

  function handleToggleChecklist(id: string) {
    const updated = toggleChecklistItem(id);
    setEstateState(updated);
    toast.success("Checklist status updated.");
  }

  function handleResetDemo() {
    clearSessionState();
    resetEstateState();
    setEstateState(getEstateState());
    toast.info("Demo state restored to defaults.");
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title={`${estateState.estateName}`}
        description="A calm, secure command center for your digital estate and every access hand-off."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" size="sm" onClick={() => setUploadModalOpen(true)}>
              <Plus className="size-4" /> Add Document
            </Button>
            <Button variant="glass" size="sm" onClick={() => setNomineeModalOpen(true)}>
              <Plus className="size-4" /> Invite Nominee
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {/* Estate Status & Health Score */}
          <Card className="glass border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <FolderLock className="size-4 text-primary" /> Digital Legacy Readiness
              </CardTitle>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                Health Score: {digitalHealthScore}%
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{estateState.estateName}</p>
                  <span className="text-xs text-muted-foreground">{estateState.email}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Encryption Mode:{" "}
                  <span className="font-medium text-foreground">
                    {estateState.settings.encryptionMode}
                  </span>{" "}
                  • Auto-Lock:{" "}
                  <span className="font-medium text-foreground">
                    {estateState.settings.autoLock ? "On" : "Off"}
                  </span>
                </p>
              </div>

              {/* Executor Readiness Checklist */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Executor Readiness Checklist
                </p>
                {estateState.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 bg-background/40 p-3 transition-colors hover:bg-background/70"
                  >
                    <span
                      className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.completed ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"}`}
                    >
                      {item.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Audit Log */}
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Recent Estate Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {estateState.audit.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/30 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.summary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Quick Estate Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Upload Vault Document",
                detail: "Add legal, financial or identity files with AES encryption.",
                icon: FileLock2,
                onClick: () => setUploadModalOpen(true),
              },
              {
                title: "Register Digital Asset",
                detail: "Record online accounts, subscriptions, or property.",
                icon: Wallet,
                onClick: () => setAssetModalOpen(true),
              },
              {
                title: "Invite / Edit Nominee",
                detail: "Assign trusted nominees with resource permission controls.",
                icon: Users,
                onClick: () => setNomineeModalOpen(true),
              },
              {
                title: "Write Digital Instruction",
                detail: "Provide step-by-step guidance for executor hand-off.",
                icon: ScrollText,
                onClick: () => setInstructionModalOpen(true),
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={item.onClick}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-background/50 p-4 transition-all hover:border-primary/40 hover:bg-background/80"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            ))}

            <div className="pt-2">
              <Button variant="outline" className="w-full text-xs" onClick={handleResetDemo}>
                Reset Demo Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modals */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />
      <AssetModal
        open={assetModalOpen}
        onOpenChange={setAssetModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />
      <NomineeModal
        open={nomineeModalOpen}
        onOpenChange={setNomineeModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />
      <InstructionModal
        open={instructionModalOpen}
        onOpenChange={setInstructionModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />
    </AppShell>
  );
}
