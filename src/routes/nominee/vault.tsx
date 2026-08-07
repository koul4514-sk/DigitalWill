import { createFileRoute } from "@tanstack/react-router";
import { Download, FileLock2, Lock, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import {
  nomineeNav,
  filterNavByPermissions,
  type NomineePermission,
} from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  downloadDocumentFile,
  getEstateState,
  getSessionState,
  subscribeToStateChanges,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/vault")({
  component: NomineeVaultPage,
});

function NomineeVaultPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const [search, setSearch] = useState("");
  const session = getSessionState();

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  const nominee =
    estateState.nominees.find((item) => item.id === session?.nomineeId) ?? estateState.nominees[0];

  const grantedPermissions = Object.entries(nominee?.permissions ?? {})
    .filter(([, value]) => value)
    .map(([key]) => key) as NomineePermission[];

  const navGroups = filterNavByPermissions(nomineeNav, grantedPermissions);
  const isVaultGranted = Boolean(nominee?.permissions.vault);

  const filteredDocs = useMemo(() => {
    return estateState.documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [estateState.documents, search]);

  function handleDownload(id: string, title: string) {
    toast.info(`Decrypting & downloading "${title}" from MySQL Vault...`);
    downloadDocumentFile(id, title);
    toast.success(`Downloaded "${title}" safely.`);
  }

  if (!isVaultGranted) {
    return (
      <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
        <PageHeader title="Encrypted vault" description="Permission required to view documents." />
        <Card className="glass border-none">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The estate owner ({estateState.ownerName}) has disabled Digital Vault access for your
              account.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell groups={navGroups} roleLabel="Nominee Portal" userName={nominee?.name ?? "Nominee"}>
      <PageHeader
        title="Encrypted vault"
        description="View and download encrypted estate documents granted by the owner."
      />

      <Card className="glass border-none">
        <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2">
            <FileLock2 className="size-4 text-primary" /> Stored Documents ({filteredDocs.length})
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{document.title}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {document.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added on {document.createdAt} • Size: {document.sizeLabel}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(document.id, document.title)}
                  title="Download document"
                >
                  <Download className="size-4" /> Download
                </Button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={FileLock2}
              title="No documents found"
              description="No documents match your search query."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
