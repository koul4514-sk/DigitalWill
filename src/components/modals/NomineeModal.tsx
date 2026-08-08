import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, RefreshCw, Users } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  addNomineeRecord,
  updateNomineePermissions,
  type NomineeRecord,
  type PermissionKey,
} from "@/lib/estate-data";

interface NomineeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nomineeToEdit?: NomineeRecord | null;
  onSuccess?: () => void;
}

const ALL_PERMISSIONS: { key: PermissionKey; label: string; desc: string }[] = [
  {
    key: "vault",
    label: "Digital Vault Access",
    desc: "View and download encrypted estate documents",
  },
  {
    key: "instructions",
    label: "Digital Instructions",
    desc: "Read owner instructions and executor guide",
  },
  {
    key: "financial",
    label: "Financial Overview",
    desc: "Access bank, investment, and asset registers",
  },
  {
    key: "checklist",
    label: "Executor Checklist",
    desc: "Track and mark execution checklist items",
  },
  {
    key: "timeline",
    label: "Estate Audit Timeline",
    desc: "View security audit events and access activity",
  },
];

export function NomineeModal({ open, onOpenChange, nomineeToEdit, onSuccess }: NomineeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    vault: true,
    instructions: true,
    financial: false,
    checklist: true,
    timeline: true,
  });

  function generateRandomToken() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let token = "NV-";
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += "-";
    for (let i = 0; i < 3; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(token);
    setShowPassword(true);
    toast.info(`Generated token: ${token}`);
  }

  useEffect(() => {
    if (nomineeToEdit) {
      setName(nomineeToEdit.name);
      setEmail(nomineeToEdit.email);
      setRelationship(nomineeToEdit.relationship);
      setPassword("");
      setShowPassword(false);
      setPermissions(nomineeToEdit.permissions);
    } else {
      setName("");
      setEmail("");
      setRelationship("Family");
      generateRandomToken();
      setPermissions({
        vault: true,
        instructions: true,
        financial: false,
        checklist: true,
        timeline: true,
      });
    }
  }, [nomineeToEdit, open]);

  function handlePermissionToggle(key: PermissionKey, checked: boolean) {
    setPermissions((prev) => ({ ...prev, [key]: checked }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide nominee name and email");
      return;
    }

    if (!nomineeToEdit && !password.trim()) {
      toast.error("Please specify an access password/token for the nominee");
      return;
    }

    if (nomineeToEdit) {
      updateNomineePermissions(nomineeToEdit.id, permissions, password.trim() || undefined);
      toast.success(`Updated details and permissions for ${name}`);
    } else {
      addNomineeRecord({
        name: name.trim(),
        email: email.trim(),
        relationship: relationship.trim() || "Nominee",
        password: password.trim(),
        permissions,
      });
      toast.success(`Nominee ${name} created with access password/token!`);
    }

    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Users className="size-5" />
              <DialogTitle>
                {nomineeToEdit ? "Manage Nominee Details & Permissions" : "Add Trusted Nominee"}
              </DialogTitle>
            </div>
            <DialogDescription>
              Set up the nominee profile, assign an access password/token, and set resource
              permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {!nomineeToEdit ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom-name">Nominee Full Name</Label>
                  <Input
                    id="nom-name"
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom-email">Email Address</Label>
                  <Input
                    id="nom-email"
                    type="email"
                    placeholder="elena@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nom-rel">Relationship</Label>
                  <Input
                    id="nom-rel"
                    placeholder="e.g. Spouse / Sibling / Legal Executor"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 p-3 text-sm">
                <p className="font-semibold text-foreground">{nomineeToEdit.name}</p>
                <p className="text-xs text-muted-foreground">
                  {nomineeToEdit.email} • {nomineeToEdit.relationship}
                </p>
              </div>
            )}

            {/* Nominee Access Password / Token Field */}
            <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="nom-password"
                  className="flex items-center gap-1.5 font-semibold text-foreground"
                >
                  <KeyRound className="size-4 text-primary" />
                  {nomineeToEdit
                    ? "Reset Access Password / Token (Optional)"
                    : "Nominee Access Password / Token"}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:bg-primary/10"
                  onClick={generateRandomToken}
                >
                  <RefreshCw className="mr-1 size-3" /> Auto-Token
                </Button>
              </div>

              <div className="relative">
                <Input
                  id="nom-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    nomineeToEdit
                      ? "Leave blank to keep existing password"
                      : "Set password or access token"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 border-primary/30 font-mono"
                  required={!nomineeToEdit}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The nominee will use their email and this password/token to log in via the Nominee
                Portal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Granted Resource Permissions
              </Label>

              <div className="space-y-2.5">
                {ALL_PERMISSIONS.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <Switch
                      checked={Boolean(permissions[p.key])}
                      onCheckedChange={(checked) => handlePermissionToggle(p.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              {nomineeToEdit ? "Save Changes" : "Create Nominee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
