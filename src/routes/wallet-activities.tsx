import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Search,
  Filter,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import {
  ownerNav,
  nomineeNav,
  filterNavByPermissions,
  type NomineePermission,
} from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  fetchWalletActivities,
  getEstateState,
  getSessionState,
  subscribeToStateChanges,
  type WalletActivity,
  type ActivityCounts,
  type EstateState,
} from "@/lib/estate-data";
import { ActivityDetailModal } from "@/components/wallet/ActivityDetailModal";

export const Route = createFileRoute("/wallet-activities")({
  component: WalletActivitiesPage,
});

const STATUS_FILTERS = ["All", "Completed", "Pending", "Under Review", "Rejected"];

function WalletActivitiesPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());
  const session = getSessionState();
  const isNomineeRole = session?.role === "nominee";

  const [roleFilter, setRoleFilter] = useState<"All" | "Owner" | "Nominee">("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [activities, setActivities] = useState<WalletActivity[]>([]);
  const [counts, setCounts] = useState<ActivityCounts>({
    totalCount: 0,
    filteredCount: 0,
    roleCounts: { owner: 0, nominee: 0 },
    statusCounts: { completed: 0, pending: 0, under_review: 0, rejected: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<WalletActivity | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
    });
  }, []);

  async function loadActivities() {
    setLoading(true);
    const res = await fetchWalletActivities({
      role: roleFilter,
      status: statusFilter,
      search,
    });
    setActivities(res.activities);
    setCounts(res.counts);
    setLoading(false);
  }

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, search]);

  const nominee = isNomineeRole
    ? (estateState.nominees.find((item) => item.id === session?.nomineeId) ??
      estateState.nominees[0])
    : null;

  const navGroups = useMemo(() => {
    if (isNomineeRole && nominee) {
      const grantedPermissions = Object.entries(nominee.permissions ?? {})
        .filter(([, value]) => value)
        .map(([key]) => key) as NomineePermission[];
      return filterNavByPermissions(nomineeNav, grantedPermissions);
    }
    return ownerNav;
  }, [isNomineeRole, nominee]);

  function getStatusBadge(status: string) {
    const lower = status.toLowerCase();
    if (lower === "completed") {
      return (
        <Badge
          variant="outline"
          className="border-success/40 bg-success/15 text-success gap-1 text-xs"
        >
          <CheckCircle2 className="size-3.5" /> Completed
        </Badge>
      );
    }
    if (lower === "pending") {
      return (
        <Badge
          variant="outline"
          className="border-warning/40 bg-warning/15 text-warning gap-1 text-xs"
        >
          <Clock className="size-3.5" /> Pending
        </Badge>
      );
    }
    if (lower.includes("review")) {
      return (
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/15 text-primary gap-1 text-xs"
        >
          <AlertCircle className="size-3.5" /> Under Review
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-destructive/40 bg-destructive/15 text-destructive gap-1 text-xs"
      >
        <XCircle className="size-3.5" /> Rejected
      </Badge>
    );
  }

  function handleOpenDetail(activity: WalletActivity) {
    setSelectedActivity(activity);
    setDetailModalOpen(true);
  }

  return (
    <AppShell
      groups={navGroups}
      roleLabel={isNomineeRole ? "Nominee Portal" : "Owner"}
      userName={isNomineeRole ? (nominee?.name ?? "Nominee") : estateState.ownerName}
    >
      <PageHeader
        title="Wallet Activities & Trust Register"
        description="Monitor estate transactions, verify supporting evidence attachments, and generate cryptographic Trust Receipts."
        actions={
          <Button
            variant="glass"
            size="sm"
            onClick={loadActivities}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      {/* BOUNTY 2: ROLE-AWARE FILTER CONTROL & REAL COUNTS */}
      <div className="space-y-4">
        {/* Role Tabs with Real Counts */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "All Activities", value: "All", count: counts.totalCount },
              { label: "Owner Activities", value: "Owner", count: counts.roleCounts.owner },
              { label: "Nominee Activities", value: "Nominee", count: counts.roleCounts.nominee },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value as "All" | "Owner" | "Nominee")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  roleFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-surface-2/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    roleFilter === tab.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            Displaying <span className="font-bold text-foreground">{counts.filteredCount}</span>{" "}
            activities found
          </div>
        </div>

        {/* Status Dropdowns & Search Filter */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="size-3.5" /> Status:
            </span>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-surface-2 text-foreground font-semibold border border-primary/40"
                    : "bg-background/40 text-muted-foreground hover:bg-surface-2/40 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, tx hash, or wallet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* ACTIVITIES LIST GRID */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-surface-2/40 animate-pulse" />
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map((act) => (
            <Card
              key={act.id}
              className="glass border-none transition-all hover:border-primary/40 cursor-pointer group"
              onClick={() => handleOpenDetail(act)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                      {act.title}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Type: <span className="font-medium text-foreground">{act.activityType}</span> •
                    Initiated by:{" "}
                    <span className="font-medium text-foreground">{act.createdBy}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {getStatusBadge(act.status)}
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    Role: {act.role}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/50 p-3">
                  <div>
                    <span className="text-muted-foreground">Amount & Token:</span>
                    <p className="font-bold text-foreground text-xs mt-0.5">
                      {act.amount || "N/A"} {act.currencyToken || ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network:</span>
                    <p className="font-medium text-foreground text-xs mt-0.5">
                      {act.network || "Ethereum"}
                    </p>
                  </div>
                </div>

                {/* Evidence Attachment Badge Status */}
                <div className="flex items-center justify-between pt-1">
                  {act.attachment ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <FileCheck className="size-4" />
                      <span className="truncate max-w-[200px]">{act.attachment.fileName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No supporting evidence attached
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 group-hover:text-primary"
                  >
                    View Details & Evidence{" "}
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No wallet activities found"
          description={
            search || roleFilter !== "All" || statusFilter !== "All"
              ? "No wallet activities match your filter or search criteria."
              : "Wallet activities will appear here when digital assets, settlements, or security events occur."
          }
          action={
            roleFilter !== "All" || statusFilter !== "All" || search ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRoleFilter("All");
                  setStatusFilter("All");
                  setSearch("");
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        activity={selectedActivity}
        onRefresh={() => {
          loadActivities();
          if (selectedActivity) {
            fetchWalletActivities().then((res) => {
              const updated = res.activities.find((a) => a.id === selectedActivity.id);
              if (updated) setSelectedActivity(updated);
            });
          }
        }}
      />
    </AppShell>
  );
}
