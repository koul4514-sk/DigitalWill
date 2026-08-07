import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Plus, Search, Trash2, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetModal } from "@/components/modals/AssetModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import {
  deleteAssetRecord,
  getEstateState,
  subscribeToStateChanges,
  type AssetRecord,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/assets")({
  component: AssetsPage,
});

const ASSET_TYPES = [
  "All",
  "Financial",
  "Subscriptions",
  "Social Accounts",
  "Developer Accounts",
  "Cloud Storage",
  "Insurance",
  "Property",
  "Creative",
];

function AssetsPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  const filteredAssets = useMemo(() => {
    return estateState.assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.notes.toLowerCase().includes(search.toLowerCase()) ||
        asset.type.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === "All" || asset.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [estateState.assets, search, typeFilter]);

  function handleDeleteConfirm() {
    if (deleteAssetId) {
      const updated = deleteAssetRecord(deleteAssetId);
      setEstateState(updated);
      toast.success("Asset removed from register.");
      setDeleteAssetId(null);
    }
  }

  function handleOpenEdit(asset: AssetRecord) {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  }

  function handleOpenCreate() {
    setEditingAsset(null);
    setAssetModalOpen(true);
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title="Digital assets"
        description="Track each account, policy, subscription, or property that must be handled after your passing."
        actions={
          <Button variant="hero" onClick={handleOpenCreate}>
            <Plus className="size-4" /> Add Asset
          </Button>
        }
      />

      {/* Controls Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredAssets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="glass border-none transition-all hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="size-4 text-primary" /> {asset.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(asset)}
                    title="Edit asset"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteAssetId(asset.id)}
                    title="Delete asset"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {asset.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Value / Reference</span>
                  <span className="font-medium text-foreground">{asset.value}</span>
                </div>
                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Handover Instruction
                  </p>
                  <p className="mt-1 text-sm text-foreground">{asset.notes}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No digital assets registered"
          description={
            search || typeFilter !== "All"
              ? "No assets match your search criteria."
              : "Register your subscriptions, financial accounts, and cloud services to ensure nothing is lost."
          }
          action={
            <Button variant="outline" size="sm" onClick={handleOpenCreate}>
              Register an asset
            </Button>
          }
        />
      )}

      <AssetModal
        open={assetModalOpen}
        onOpenChange={setAssetModalOpen}
        assetToEdit={editingAsset}
        onSuccess={() => setEstateState(getEstateState())}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteAssetId)}
        onOpenChange={(open) => !open && setDeleteAssetId(null)}
        title="Delete Asset Record"
        description="Are you sure you want to remove this asset from your digital estate register?"
        onConfirm={handleDeleteConfirm}
      />
    </AppShell>
  );
}
