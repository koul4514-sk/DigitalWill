import { useState } from "react";
import { ScrollText } from "lucide-react";
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
import { addInstructionRecord } from "@/lib/estate-data";

interface InstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InstructionModal({ open, onOpenChange, onSuccess }: InstructionModalProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      toast.error("Please fill in instruction title and details");
      return;
    }

    addInstructionRecord({
      title: title.trim(),
      details: details.trim(),
      priority,
    });

    toast.success("Digital instruction created.");
    setTitle("");
    setDetails("");
    setPriority("High");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-md sm:rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <ScrollText className="size-5" />
              <DialogTitle>Add Digital Instruction</DialogTitle>
            </div>
            <DialogDescription>
              Write unambiguous directions for your nominee or legal executor.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inst-title">Instruction Title</Label>
              <Input
                id="inst-title"
                placeholder="e.g. Notify bank and lock primary credit card"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inst-priority">Priority Level</Label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as "High" | "Medium" | "Low")}
              >
                <SelectTrigger id="inst-priority" className="w-full">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High (Immediate Action)</SelectItem>
                  <SelectItem value="Medium">Medium (Secondary Step)</SelectItem>
                  <SelectItem value="Low">Low (General Guidance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inst-details">Detailed Directions</Label>
              <Textarea
                id="inst-details"
                placeholder="Provide step-by-step instructions, relevant contact persons, or account reference codes."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Save Instruction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
