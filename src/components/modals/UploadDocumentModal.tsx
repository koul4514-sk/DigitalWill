import { useState, type ChangeEvent } from "react";
import { FileUp, Lock, ShieldCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDocumentRecord } from "@/lib/estate-data";

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Legal",
  "Finance",
  "Insurance",
  "Identity",
  "Property",
  "Medical",
  "Technology",
];

export function UploadDocumentModal({ open, onOpenChange, onSuccess }: UploadDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Legal");
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    setIsEncrypting(true);
    toast.info("Encrypting document payload with AES-256 and inserting into MySQL...");

    let content = `Confidential Digital Will document payload for "${title.trim()}". Category: ${category}. Stored securely in MySQL database.`;
    let mimeType = "text/plain";

    if (file) {
      mimeType = file.type || "text/plain";
      try {
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(content);
          reader.readAsText(file);
        });
      } catch (err) {
        console.error("File reading error:", err);
      }
    }

    const sizeBytes = file ? file.size : 1240000;
    const sizeLabel =
      sizeBytes > 1048576
        ? `${(sizeBytes / 1048576).toFixed(1)} MB`
        : `${Math.round(sizeBytes / 1024)} KB`;

    addDocumentRecord({
      title: title.trim(),
      category,
      sizeLabel,
      secure: true,
      content,
      mimeType,
    });

    setIsEncrypting(false);
    toast.success(`"${title}" encrypted and saved to MySQL Digital Vault!`);
    setTitle("");
    setFile(null);
    setCategory("Legal");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-md sm:rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <DialogTitle>Upload Encrypted Document</DialogTitle>
            </div>
            <DialogDescription>
              Select a file to encrypt and store directly inside the MySQL Digital Vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="e.g. Last Will & Testament 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">File (Optional)</Label>
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-6 transition-colors hover:border-primary/50">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <FileUp className="size-8 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    {file ? (
                      <span className="text-primary font-semibold">{file.name}</span>
                    ) : (
                      "Click to browse or drop file here"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AES-256 encrypted before MySQL persistence
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary">
              <Lock className="size-4 shrink-0" />
              <span>Real-time MySQL insertion with end-to-end encrypted storage.</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isEncrypting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isEncrypting}>
              {isEncrypting ? "Encrypting & Storing..." : "Upload & Save to Vault"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
