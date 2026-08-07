import { createFileRoute } from "@tanstack/react-router";
import { Plus, ScrollText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstructionModal } from "@/components/modals/InstructionModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import {
  deleteInstructionRecord,
  getEstateState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/instructions")({
  component: InstructionsPage,
});

function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "High":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
}

function InstructionsPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteInstId, setDeleteInstId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  function handleDeleteConfirm() {
    if (deleteInstId) {
      const updated = deleteInstructionRecord(deleteInstId);
      setEstateState(updated);
      toast.success("Instruction removed.");
      setDeleteInstId(null);
    }
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title="Digital instructions"
        description="Leave clear, structured guidance that your nominee or executor can follow without ambiguity."
        actions={
          <Button variant="hero" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> Add Instruction
          </Button>
        }
      />

      {estateState.instructions.length > 0 ? (
        <div className="grid gap-4">
          {estateState.instructions.map((instruction) => (
            <Card
              key={instruction.id}
              className="glass border-none transition-all hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScrollText className="size-4 text-primary" /> {instruction.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                      instruction.priority,
                    )}`}
                  >
                    {instruction.priority} Priority
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteInstId(instruction.id)}
                    title="Delete instruction"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="leading-relaxed text-foreground">{instruction.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ScrollText}
          title="No instructions written yet"
          description="Create prioritized instructions so your nominee knows exactly what steps to execute first."
          action={
            <Button variant="hero" size="sm" onClick={() => setModalOpen(true)}>
              Write first instruction
            </Button>
          }
        />
      )}

      <InstructionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteInstId)}
        onOpenChange={(open) => !open && setDeleteInstId(null)}
        title="Delete Instruction"
        description="Are you sure you want to remove this digital instruction direction?"
        onConfirm={handleDeleteConfirm}
      />
    </AppShell>
  );
}
