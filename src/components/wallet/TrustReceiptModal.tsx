import { useEffect, useState } from "react";
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
  Download,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Star,
  ExternalLink,
  Calendar,
  Wallet as WalletIcon,
} from "lucide-react";
import { toast } from "sonner";
import { fetchTrustReceipt, type TrustReceiptPayload } from "@/lib/estate-data";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface TrustReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string | null;
}

export function TrustReceiptModal({ open, onOpenChange, activityId }: TrustReceiptModalProps) {
  const [receipt, setReceipt] = useState<TrustReceiptPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open && activityId) {
      setLoading(true);
      fetchTrustReceipt(activityId).then((res) => {
        setLoading(false);
        if (res.ok && res.receipt) {
          setReceipt(res.receipt);
        } else {
          toast.error(res.error || "Failed loading Trust Receipt.");
          onOpenChange(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activityId]);

  async function handleDownloadPdf() {
    if (!receipt) return;
    setDownloading(true);

    try {
      const receiptElement = document.getElementById("trust-receipt-print-area");
      if (!receiptElement) {
        throw new Error("Receipt render tree unavailable.");
      }

      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0d1117",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeFilename = `trust-receipt-${receipt.activity.id}.pdf`;
      pdf.save(safeFilename);

      toast.success(`Downloaded ${safeFilename}`);
    } catch (err: unknown) {
      console.error("PDF generation failed, falling back to print dialog:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  if (!open || !activityId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal max-w-3xl border-border max-h-[90vh] overflow-y-auto sm:rounded-2xl p-0">
        {loading || !receipt ? (
          <div className="p-12 text-center text-muted-foreground">
            <ShieldCheck className="mx-auto size-12 animate-pulse text-primary" />
            <p className="mt-4 text-sm font-medium">
              Generating Trust Receipt Cryptographic Proof...
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-0">
            {/* Action Bar Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-1/90 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span className="font-bold text-foreground text-base">Verified Trust Receipt</span>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="gap-2 text-xs"
              >
                <Download className="size-4" />
                {downloading ? "Generating PDF..." : "Download Trust Receipt"}
              </Button>
            </div>

            {/* PRINTABLE RECEIPT CONTENT AREA */}
            <div id="trust-receipt-print-area" className="p-8 bg-[#0d1117] text-white space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary font-bold">
                      LV
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {receipt.header.projectName}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Official Cryptographic & Immutable Activity Handover Certificate
                  </p>
                </div>
                <div className="sm:text-right">
                  <Badge
                    variant="outline"
                    className="border-primary/40 text-primary text-xs px-3 py-1 bg-primary/10"
                  >
                    {receipt.header.documentTitle}
                  </Badge>
                  <p className="mt-2 text-xs font-mono text-slate-300">
                    Receipt ID:{" "}
                    <span className="text-primary font-bold">{receipt.header.receiptId}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Generated: {receipt.header.generatedTimestamp}
                  </p>
                </div>
              </div>

              {/* Activity Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Activity Overview
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {receipt.activity.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Activity Title:</span>
                    <p className="font-semibold text-white mt-0.5">{receipt.activity.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Activity Type:</span>
                    <p className="font-semibold text-white mt-0.5">
                      {receipt.activity.activityType}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-400">Description & Scope:</span>
                    <p className="font-medium text-slate-200 mt-0.5">
                      {receipt.activity.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parties & Blockchain Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parties Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <WalletIcon className="size-4" /> Party Wallets & Roles
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400">Initiator / Created By:</span>
                      <p className="font-medium text-white">
                        {receipt.parties.createdBy} ({receipt.parties.partyRole})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Sender Wallet Address:</span>
                      <p className="font-mono text-[11px] text-slate-200 break-all bg-black/40 p-2 rounded-lg mt-0.5">
                        {receipt.parties.senderWallet}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Receiver / Nominee Wallet:</span>
                      <p className="font-mono text-[11px] text-slate-200 break-all bg-black/40 p-2 rounded-lg mt-0.5">
                        {receipt.parties.receiverWallet}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> Blockchain Verification
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount & Currency:</span>
                      <span className="font-bold text-emerald-400">
                        {receipt.blockchain.amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network:</span>
                      <span className="font-medium text-white">{receipt.blockchain.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Block Number:</span>
                      <span className="font-mono text-slate-200">
                        {receipt.blockchain.blockNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Transaction Hash:</span>
                      <p className="font-mono text-[11px] text-primary break-all bg-black/40 p-2 rounded-lg mt-0.5">
                        {receipt.blockchain.txHash}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Calendar className="size-4" /> Execution Status Timeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {receipt.statusHistory.map((step, idx) => (
                    <div
                      key={step.step}
                      className="rounded-xl border border-white/10 bg-black/30 p-3 text-center"
                    >
                      <div className="mx-auto size-5 rounded-full bg-primary/20 text-primary text-xs grid place-items-center font-bold">
                        {idx + 1}
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-white">{step.step}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{step.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review & Reputation Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Star className="size-4 text-amber-400 fill-amber-400" /> Review & Reputation
                  Record
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Reviewer:</span>
                    <p className="font-semibold text-white mt-0.5">{receipt.review.reviewerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Rating & Rating Score:</span>
                    <p className="font-semibold text-amber-400 mt-0.5">
                      {receipt.review.rating} ({receipt.review.reputationScore})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Review Status:</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">
                      {receipt.review.reviewStatus}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-400">Review Comment:</span>
                    <p className="font-medium text-slate-200 mt-0.5 italic">
                      "{receipt.review.reviewComment}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileCheck className="size-4" /> Supporting Evidence
                </h3>
                {receipt.evidence.attached ? (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{receipt.evidence.fileName}</p>
                      <p className="text-[11px] text-slate-400">
                        Evidence Type: {receipt.evidence.type}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-primary flex items-center gap-1">
                      <ExternalLink className="size-3.5" /> Verified Attachment
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Supporting evidence: None attached.
                  </p>
                )}
              </div>

              {/* Footer Notice */}
              <div className="border-t border-white/10 pt-4 text-center text-[10px] text-slate-500">
                This receipt is a read-only cryptographic proof of existing estate records in
                LegacyVault AI. No smart contract logic or private keys were mutated.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
