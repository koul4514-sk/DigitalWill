import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAssetRecord, updateAssetRecord, type AssetRecord } from "@/lib/estate-data";

interface AssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetToEdit?: AssetRecord | null;
  onSuccess?: () => void;
}

const ASSET_TYPES = [
  "Financial",
  "Subscriptions",
  "Social Accounts",
  "Developer Accounts",
  "Cloud Storage",
  "Insurance",
  "Property",
  "Creative",
];

export function AssetModal({ open, onOpenChange, assetToEdit, onSuccess }: AssetModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Financial");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setType(assetToEdit.type);
      setValue(assetToEdit.value);
      setNotes(assetToEdit.notes);
    } else {
      setName("");
      setType("Financial");
      setValue("");
      setNotes("");
    }
  }, [assetToEdit, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter asset name");
      return;
    }

    if (assetToEdit) {
      updateAssetRecord(assetToEdit.id, {
        name: name.trim(),
        type,
        value: value.trim() || "N/A",
        notes: notes.trim() || "No specific instructions specified.",
      });
      toast.success(`Asset "${name}" updated.`);
    } else {
      addAssetRecord({
        name: name.trim(),
        type,
        value: value.trim() || "N/A",
        notes: notes.trim() || "No specific instructions specified.",
      });
      toast.success(`Digital Asset "${name}" registered.`);
    }

    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-md sm:rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="size-5" />
              <DialogTitle>
                {assetToEdit ? "Edit Asset Record" : "Register Digital Asset"}
              </DialogTitle>
            </div>
            <DialogDescription>
              Record accounts, subscriptions, properties or financial holdings for nominee handover.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset / Account Name</Label>
              <Input
                id="asset-name"
                placeholder="e.g. AWS Cloud Account / Coinbase Wallet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="asset-type" className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-value">Estimated Value / Identifier</Label>
              <Input
                id="asset-value"
                placeholder="e.g. $50,000 / Account #9482"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-notes">Handover Instructions / Access Details</Label>
              <Textarea
                id="asset-notes"
                placeholder="e.g. Transfer access to primary executor; credentials stored in password manager."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              {assetToEdit ? "Save Changes" : "Register Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
