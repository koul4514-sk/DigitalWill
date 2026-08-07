import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Shield } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/nominee/login")({
  component: NomineeLoginPage,
});

function NomineeLoginPage() {
  const [email, setEmail] = useState("priya@example.com");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="glass w-full max-w-md border-none">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Shield className="size-5" />
            <CardTitle>Nominee access</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in as a nominee to see only the resources your owner has granted.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Nominee email" />
          <Input type="password" placeholder="Access code" defaultValue="demo-access" />
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              saveSessionState({ role: "nominee", email, nomineeId: "nom-1" });
              window.location.assign("/nominee/dashboard");
            }}
          >
            Enter portal <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
