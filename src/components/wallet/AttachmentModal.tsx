import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { attachActivityEvidence } from "@/lib/estate-data";

interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  activityTitle: string;
  onSuccess: () => void;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AttachmentModal({
  open,
  onOpenChange,
  activityId,
  activityTitle,
  onSuccess,
}: AttachmentModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  function resetState() {
    setSelectedFile(null);
    setImagePreview(null);
    setUrlInput("");
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    // Check executable / unsafe filename extensions
    const dangerousExts = [
      ".exe",
      ".bat",
      ".cmd",
      ".sh",
      ".js",
      ".mjs",
      ".php",
      ".py",
      ".vbs",
      ".jar",
      ".msi",
    ];
    if (dangerousExts.some((ext) => lowerName.endsWith(ext))) {
      toast.error("Executable or dangerous file types are strictly prohibited.");
      e.target.value = "";
      return;
    }

    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      toast.error("Unsupported file format. Allowed formats: PDF, JPG, JPEG, PNG, WebP.");
      e.target.value = "";
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      toast.error(
        `Unsupported MIME type (${file.type}). Allowed formats: PDF, JPG, JPEG, PNG, WebP.`,
      );
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds maximum allowed limit of 10MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setImagePreview(null);
  }

  async function handleSubmit() {
    if (activeTab === "file") {
      if (!selectedFile) {
        toast.error("Please select a file or image to attach.");
        return;
      }

      setLoading(true);

      // Read file content / data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const res = await attachActivityEvidence(activityId, {
          type: "file",
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          fileSize: selectedFile.size,
          fileData,
        });

        setLoading(false);

        if (!res.ok) {
          toast.error(res.error || "Failed to attach evidence.");
          return;
        }

        toast.success("Supporting evidence attached successfully.");
        onSuccess();
        onOpenChange(false);
        resetState();
      };
      reader.readAsDataURL(selectedFile);
    } else {
      if (!urlInput.trim()) {
        toast.error("Please enter an external evidence URL.");
        return;
      }

      const trimmed = urlInput.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        toast.error("External URL must use http:// or https:// protocol.");
        return;
      }

      try {
        new URL(trimmed);
      } catch {
        toast.error("Invalid URL format. Please provide a valid URL.");
        return;
      }

      setLoading(true);
      const res = await attachActivityEvidence(activityId, {
        type: "link",
        fileUrl: trimmed,
      });
      setLoading(false);

      if (!res.ok) {
        toast.error(res.error || "Failed to attach external link evidence.");
        return;
      }

      toast.success("Evidence URL attached successfully.");
      onSuccess();
      onOpenChange(false);
      resetState();
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetState();
      }}
    >
      <DialogContent className="glass-modal max-w-lg border-border sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Upload className="size-5 text-primary" /> Attach Supporting Evidence
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Attach exactly <strong>ONE</strong> supporting document, image, or link to record:{" "}
            <span className="font-semibold text-foreground">{activityTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "file" | "link")}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-surface-2/60 p-1">
            <TabsTrigger value="file" className="rounded-lg text-xs font-medium">
              File or Image
            </TabsTrigger>
            <TabsTrigger value="link" className="rounded-lg text-xs font-medium">
              External Link
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FILE / IMAGE UPLOAD */}
          <TabsContent value="file" className="space-y-4 pt-3">
            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/30 p-6 text-center transition-colors hover:border-primary/50">
                <Upload className="size-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Drop your file here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports PDF, PNG, JPG, JPEG, WebP (Max 10MB)
                </p>
                <Label htmlFor="evidence-file-input" className="mt-4 cursor-pointer">
                  <span className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                    Select File
                  </span>
                  <Input
                    id="evidence-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Label>
              </div>
            ) : (
              /* LIVE PREVIEW BEFORE SAVING */
              <div className="rounded-2xl border border-primary/30 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Pre-Save Evidence Preview
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-1 size-3.5" /> Remove / Change
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Thumbnail preview"
                      className="size-16 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-8" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground text-sm">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Size: {formatBytes(selectedFile.size)} • Type:{" "}
                      {selectedFile.type || "Document"}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-success">
                      <CheckCircle className="size-3" /> Validated & ready to attach
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: EXTERNAL LINK */}
          <TabsContent value="link" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label htmlFor="external-url-input" className="text-xs font-medium">
                External Evidence URL
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="external-url-input"
                  placeholder="https://example.com/evidence-document"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Provide a valid HTTP or HTTPS link to public or secure evidence.
              </p>
            </div>

            {/* PRE-SAVE LINK PREVIEW */}
            {urlInput.trim() && (
              <div className="rounded-2xl border border-primary/30 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Pre-Save Link Preview
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUrlInput("")}
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-1 size-3.5" /> Clear Link
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ExternalLink className="size-4 text-primary shrink-0" />
                  <a
                    href={urlInput}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-medium text-primary hover:underline"
                  >
                    {urlInput}
                  </a>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={handleSubmit}
            disabled={
              loading ||
              (activeTab === "file" && !selectedFile) ||
              (activeTab === "link" && !urlInput.trim())
            }
          >
            {loading ? "Saving..." : "Attach Evidence"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
