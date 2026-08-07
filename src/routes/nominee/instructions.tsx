import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { nomineeNav } from "@/components/layout/nav-config";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstateState, getSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/instructions")({
  component: NomineeInstructionsPage,
});

function NomineeInstructionsPage() {
  const state = getEstateState();
  const session = getSessionState();
  const nominee = state.nominees.find((item) => item.id === session?.nomineeId) ?? state.nominees[0];

  return (
    <AppShell groups={nomineeNav} roleLabel="Nominee" userName={nominee.name}>
      <PageHeader title="Instructions" description="The owner has shared these directions for your review." />

      <div className="space-y-4">
        {state.instructions.map((instruction) => (
          <Card key={instruction.id} className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="size-4 text-primary" /> {instruction.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{instruction.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
