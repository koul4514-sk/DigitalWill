import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NomineeModal } from "@/components/modals/NomineeModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import {
  deleteNomineeRecord,
  getEstateState,
  subscribeToStateChanges,
  updateNomineePermissions,
  type NomineeRecord,
  type PermissionKey,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominees")({
  component: NomineesPage,
});

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  vault: "Digital Vault",
  instructions: "Instructions",
  financial: "Financial Overview",
  checklist: "Executor Checklist",
  timeline: "Audit Timeline",
};

function NomineesPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const [nomineeModalOpen, setNomineeModalOpen] = useState(false);
  const [editingNominee, setEditingNominee] = useState<NomineeRecord | null>(null);
  const [deleteNomineeId, setDeleteNomineeId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  function handleQuickPermissionToggle(nominee: NomineeRecord, key: PermissionKey, value: boolean) {
    const newPerms = { ...nominee.permissions, [key]: value };
    const updated = updateNomineePermissions(nominee.id, newPerms);
    setEstateState(updated);
    toast.success(`Updated ${PERMISSION_LABELS[key]} access for ${nominee.name}`);

    // Trigger API call for audit log recording
    void fetch("/api/permissions/update", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nomineeId: nominee.id, permission: key, value }),
    });
  }

  function handleDeleteConfirm() {
    if (deleteNomineeId) {
      const updated = deleteNomineeRecord(deleteNomineeId);
      setEstateState(updated);
      toast.success("Nominee access revoked and removed.");
      setDeleteNomineeId(null);
    }
  }

  function handleOpenEdit(nominee: NomineeRecord) {
    setEditingNominee(nominee);
    setNomineeModalOpen(true);
  }

  function handleOpenCreate() {
    setEditingNominee(null);
    setNomineeModalOpen(true);
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title="Nominee management"
        description="Securely add trusted individuals and assign exact resource access permissions."
        actions={
          <Button variant="hero" onClick={handleOpenCreate}>
            <Plus className="size-4" /> Invite Nominee
          </Button>
        }
      />

      {estateState.nominees.length > 0 ? (
        <div className="grid gap-6">
          {estateState.nominees.map((nominee) => (
            <Card
              key={nominee.id}
              className="glass border-none transition-all hover:border-primary/30"
            >
              <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{nominee.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{nominee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {nominee.relationship}
                  </span>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success capitalize">
                    {nominee.status}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(nominee)}>
                    <KeyRound className="size-3.5" /> Edit Permissions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteNomineeId(nominee.id)}
                    title="Revoke nominee access"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary" /> Live Resource Access Control
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(Object.keys(PERMISSION_LABELS) as PermissionKey[]).map((key) => {
                      const isGranted = Boolean(nominee.permissions[key]);
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-border/70 bg-background/30 p-3"
                        >
                          <span className="text-xs font-medium text-foreground">
                            {PERMISSION_LABELS[key]}
                          </span>
                          <Switch
                            checked={isGranted}
                            onCheckedChange={(checked) =>
                              handleQuickPermissionToggle(nominee, key, checked)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No nominees registered"
          description="Nominees are trusted individuals who will receive access to your estate according to your rules."
          action={
            <Button variant="hero" size="sm" onClick={handleOpenCreate}>
              Invite first nominee
            </Button>
          }
        />
      )}

      <NomineeModal
        open={nomineeModalOpen}
        onOpenChange={setNomineeModalOpen}
        nomineeToEdit={editingNominee}
        onSuccess={() => setEstateState(getEstateState())}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteNomineeId)}
        onOpenChange={(open) => !open && setDeleteNomineeId(null)}
        title="Revoke Nominee Access"
        description="Are you sure you want to remove this nominee? They will immediately lose all permissions and access to your estate portal."
        onConfirm={handleDeleteConfirm}
      />
    </AppShell>
  );
}
