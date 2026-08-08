import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileCheck,
  Upload,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { deleteActivityEvidence, type WalletActivity } from "@/lib/estate-data";
import { AttachmentModal } from "./AttachmentModal";
import { TrustReceiptModal } from "./TrustReceiptModal";

interface ActivityDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: WalletActivity | null;
  onRefresh: () => void;
}

export function ActivityDetailModal({
  open,
  onOpenChange,
  activity,
  onRefresh,
}: ActivityDetailModalProps) {
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [trustReceiptModalOpen, setTrustReceiptModalOpen] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!activity) return null;

  function handleCopyTxHash() {
    if (activity?.txHash) {
      navigator.clipboard.writeText(activity.txHash);
      setCopiedTx(true);
      toast.success("Transaction hash copied to clipboard!");
      setTimeout(() => setCopiedTx(false), 2000);
    }
  }

  async function handleRemoveAttachment() {
    if (!activity) return;
    const res = await deleteActivityEvidence(activity.id);
    if (res.ok) {
      toast.success("Supporting evidence attachment removed.");
      onRefresh();
    } else {
      toast.error(res.error || "Failed removing attachment.");
    }
  }

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-modal max-w-2xl border-border max-h-[90vh] overflow-y-auto sm:rounded-2xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                <DialogTitle className="text-lg font-bold">{activity.title}</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  Role: {activity.role}
                </Badge>
                {getStatusBadge(activity.status)}
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Activity Type:{" "}
              <span className="font-semibold text-foreground">{activity.activityType}</span> • ID:{" "}
              <span className="font-mono text-foreground">{activity.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Overview Card */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Amount & Token:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {activity.amount || "N/A"} {activity.currencyToken || ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Network:</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {activity.network || "Ethereum Mainnet"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Initiated By:</span>
                  <p className="font-medium text-foreground mt-0.5">{activity.createdBy}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created At:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {activity.createdAt || "N/A"}
                  </p>
                </div>
              </div>

              {activity.description && (
                <div className="border-t border-border/60 pt-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-xs text-foreground mt-1">{activity.description}</p>
                </div>
              )}
            </div>

            {/* Wallets & Blockchain Verification */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <ShieldCheck className="size-4" /> Blockchain & Party Wallets
                </span>
                {activity.blockNumber && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Block #{activity.blockNumber}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Sender Wallet Address:</span>
                  <p className="font-mono text-[11px] text-foreground break-all bg-surface-2/60 p-2 rounded-xl mt-1">
                    {activity.senderWallet || "Not available"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Receiver / Nominee Wallet:</span>
                  <p className="font-mono text-[11px] text-foreground break-all bg-surface-2/60 p-2 rounded-xl mt-1">
                    {activity.receiverWallet || "Not available"}
                  </p>
                </div>
                {activity.txHash && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <button
                        onClick={handleCopyTxHash}
                        className="text-[11px] text-primary flex items-center gap-1 hover:underline"
                      >
                        {copiedTx ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copiedTx ? "Copied" : "Copy Hash"}
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-primary break-all bg-primary/10 p-2 rounded-xl mt-1 border border-primary/20">
                      {activity.txHash}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Review & Reputation Section */}
            {activity.reviewerName && (
              <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-400" /> Review & Reputation Info
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Reviewer:</span>
                    <p className="font-medium text-foreground">{activity.reviewerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Review Status:</span>
                    <p className="font-medium text-foreground">
                      {activity.reviewStatus || "Approved"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reputation Score:</span>
                    <p className="font-semibold text-amber-400">
                      {activity.reputationScore ? `${activity.reputationScore}/100` : "N/A"}
                    </p>
                  </div>
                </div>
                {activity.reviewComment && (
                  <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-2 mt-1">
                    "{activity.reviewComment}"
                  </p>
                )}
              </div>
            )}

            {/* BOUNTY 1: EVIDENCE SECTION */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileCheck className="size-4" /> Supporting Evidence
                </span>
                {!activity.attachment && (
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => setAttachModalOpen(true)}
                    className="h-7 text-xs"
                  >
                    <Upload className="mr-1.5 size-3.5" /> Attach Evidence
                  </Button>
                )}
              </div>

              {activity.attachment ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {activity.attachment.type === "link" ? (
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary">
                          <ExternalLink className="size-5" />
                        </div>
                      ) : (
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary">
                          <FileText className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {activity.attachment.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {activity.attachment.type === "link"
                            ? "External Evidence URL"
                            : `Format: ${activity.attachment.mimeType} • Size: ${activity.attachment.fileSize ? Math.round(activity.attachment.fileSize / 1024) + " KB" : "Attached"}`}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAttachment}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10"
                      title="Remove or Change Attachment"
                    >
                      <Trash2 className="size-3.5 mr-1" /> Remove
                    </Button>
                  </div>

                  {activity.attachment.type === "link" ? (
                    <a
                      href={activity.attachment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <ExternalLink className="size-3.5" /> Open External Evidence
                    </a>
                  ) : (
                    <a
                      href={activity.attachment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <FileText className="size-3.5" /> View Attached Evidence
                    </a>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">No supporting evidence attached.</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    Attach exactly 1 supporting PDF, image, or link for this record.
                  </p>
                </div>
              )}
            </div>

            {/* BOUNTY 3: TRUST RECEIPT GENERATION BUTTON */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {activity.status.toLowerCase() === "completed"
                  ? "Completed activity verified. Trust Receipt ready for generation."
                  : "Trust Receipt generation requires a COMPLETED activity status."}
              </span>
              {activity.status.toLowerCase() === "completed" && (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setTrustReceiptModalOpen(true)}
                  className="w-full sm:w-auto gap-2 text-xs"
                >
                  <ShieldCheck className="size-4" /> Generate Trust Receipt
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Modal */}
      <AttachmentModal
        open={attachModalOpen}
        onOpenChange={setAttachModalOpen}
        activityId={activity.id}
        activityTitle={activity.title}
        onSuccess={() => {
          onRefresh();
          onOpenChange(false);
        }}
      />

      {/* Trust Receipt Modal */}
      <TrustReceiptModal
        open={trustReceiptModalOpen}
        onOpenChange={setTrustReceiptModalOpen}
        activityId={activity.id}
      />
    </>
  );
}
