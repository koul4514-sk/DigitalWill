import { createFileRoute } from "@tanstack/react-router";
import { Download, FileLock2, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadDocumentModal } from "@/components/modals/UploadDocumentModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import {
  deleteDocumentRecord,
  downloadDocumentFile,
  getEstateState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

const CATEGORIES = [
  "All",
  "Legal",
  "Finance",
  "Insurance",
  "Identity",
  "Property",
  "Medical",
  "Technology",
];

function VaultPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  const filteredDocs = useMemo(() => {
    return estateState.documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || doc.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [estateState.documents, search, categoryFilter]);

  function handleDownload(id: string, title: string) {
    toast.info(`Decrypting & downloading "${title}" from MySQL Vault...`);
    downloadDocumentFile(id, title);
    toast.success(`Downloaded "${title}" safely.`);
  }

  function handleDeleteConfirm() {
    if (deleteDocId) {
      const updated = deleteDocumentRecord(deleteDocId);
      setEstateState(updated);
      toast.success("Document removed from vault.");
      setDeleteDocId(null);
    }
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title="Digital vault"
        description="Every document is client-side encrypted, permissioned, and ready for hand-off when needed."
        actions={
          <Button variant="hero" onClick={() => setUploadModalOpen(true)}>
            <Plus className="size-4" /> Upload Document
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass border-none">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <CardTitle className="flex items-center gap-2">
                <FileLock2 className="size-4 text-primary" /> Stored Documents (
                {filteredDocs.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vault..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((document) => (
                <div
                  key={document.id}
                  className="group flex flex-col justify-between gap-3 rounded-2xl border border-border bg-background/50 p-4 transition-all hover:border-primary/30 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{document.title}</p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {document.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added on {document.createdAt} • Size: {document.sizeLabel} • Encrypted
                      (AES-256)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document.id, document.title)}
                      title="Download decrypted document"
                    >
                      <Download className="size-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteDocId(document.id)}
                      title="Delete document"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FileLock2}
                title="No documents found"
                description={
                  search || categoryFilter !== "All"
                    ? "Try adjusting your search query or category filter."
                    : "Your vault is empty. Click 'Upload Document' to add your first encrypted file."
                }
                action={
                  <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
                    Upload document
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Security Posture Panel */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Security Posture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Encryption Engine</p>
              <p className="mt-1 font-medium text-foreground">
                {estateState.settings.encryptionMode}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Payloads are ciphered with random IVs and GCM authentication tags.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Auto-Lock Protection</p>
              <p className="mt-1 font-medium text-foreground">
                {estateState.settings.autoLock ? "Active (15 Min Inactivity)" : "Disabled"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Nominee Handover Status</p>
              <p className="mt-1 font-medium text-foreground">
                {estateState.settings.requireReview
                  ? "Requires Owner/Executor Review"
                  : "Instant Release"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSuccess={() => setEstateState(getEstateState())}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteDocId)}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
        title="Delete Document"
        description="Are you sure you want to delete this document from your vault? Assigned nominees will lose access."
        onConfirm={handleDeleteConfirm}
      />
    </AppShell>
  );
}
