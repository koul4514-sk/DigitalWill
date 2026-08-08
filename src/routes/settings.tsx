import { createFileRoute } from "@tanstack/react-router";
import { Download, Lock, Save, Settings, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportEstateBackup,
  getEstateState,
  subscribeToStateChanges,
  updateOwnerProfile,
  updateSettings,
  type EstateState,
} from "@/lib/estate-data";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [estateState, setEstateState] = useState<EstateState>(() => getEstateState());

  const [ownerName, setOwnerName] = useState(estateState.ownerName);
  const [estateName, setEstateName] = useState(estateState.estateName);
  const [email, setEmail] = useState(estateState.email);

  const [autoLock, setAutoLock] = useState(estateState.settings.autoLock);
  const [requireReview, setRequireReview] = useState(estateState.settings.requireReview);
  const [encryptionMode, setEncryptionMode] = useState<"AES-256" | "Zero-knowledge">(
    estateState.settings.encryptionMode,
  );

  useEffect(() => {
    return subscribeToStateChanges((newState) => {
      setEstateState(newState);
      setOwnerName(newState.ownerName);
      setEstateName(newState.estateName);
      setEmail(newState.email);
      setAutoLock(newState.settings.autoLock);
      setRequireReview(newState.settings.requireReview);
      setEncryptionMode(newState.settings.encryptionMode);
    });
  }, []);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerName.trim() || !email.trim()) {
      toast.error("Please complete all profile fields");
      return;
    }
    const updated = updateOwnerProfile({
      ownerName: ownerName.trim(),
      estateName: estateName.trim() || `${ownerName}'s Estate`,
      email: email.trim(),
    });
    setEstateState(updated);
    toast.success("Profile details updated.");
  }

  function handleSaveSecurity(e: React.FormEvent) {
    e.preventDefault();
    const updated = updateSettings({
      autoLock,
      requireReview,
      encryptionMode,
    });
    setEstateState(updated);
    toast.success("Estate security settings updated.");
  }

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={estateState.ownerName}>
      <PageHeader
        title="Estate settings"
        description="Configure your digital estate identity, auto-lock rules, and client-side encryption policy."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-primary" /> Estate Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">Owner Full Name</Label>
                <Input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estate-name">Digital Estate Title</Label>
                <Input
                  id="estate-name"
                  value={estateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner-email">Primary Email Address</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <Save className="size-4" /> Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Security & Encryption Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-lock Inactivity Timer</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically lock vault after 15 minutes of idle time
                  </p>
                </div>
                <Switch checked={autoLock} onCheckedChange={setAutoLock} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Require Pre-Release Review</p>
                  <p className="text-xs text-muted-foreground">
                    Nominees cannot view documents without verified trigger
                  </p>
                </div>
                <Switch checked={requireReview} onCheckedChange={setRequireReview} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enc-mode">Vault Encryption Mode</Label>
                <Select
                  value={encryptionMode}
                  onValueChange={(val) => setEncryptionMode(val as "AES-256" | "Zero-knowledge")}
                >
                  <SelectTrigger id="enc-mode" className="w-full">
                    <SelectValue placeholder="Select Encryption Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256-GCM Envelope Encryption</SelectItem>
                    <SelectItem value="Zero-knowledge">
                      Zero-Knowledge Hardware-Bound Key
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <Lock className="size-4" /> Save Security Rules
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-none mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-4 text-primary" /> MySQL Database & Digital Backup Export
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Export Full Digital Will Backup</p>
            <p className="text-xs text-muted-foreground">
              Download a complete JSON snapshot of all real-time documents, assets, instructions,
              checklist items, nominees, and audit logs stored in your MySQL database.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => {
              toast.info("Preparing complete MySQL database export...");
              exportEstateBackup();
              toast.success("Database backup download started.");
            }}
          >
            <Download className="size-4 mr-2" /> Download MySQL Backup
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
