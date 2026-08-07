import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ownerNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState } from "@/lib/estate-data";

export const Route = createFileRoute("/instructions")({
  component: InstructionsPage,
});

function InstructionsPage() {
  const state = getEstateState();

  return (
    <AppShell groups={ownerNav} roleLabel="Owner" userName={state.ownerName}>
      <PageHeader
        title="Digital instructions"
        description="Leave clear, structured guidance that your nominee can follow without ambiguity."
      />

      <div className="grid gap-4">
        {state.instructions.map((instruction) => (
          <Card key={instruction.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="size-4 text-primary" /> {instruction.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{instruction.details}</p>
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Priority: {instruction.priority}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
