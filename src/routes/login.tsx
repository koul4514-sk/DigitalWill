import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("alex@legacyvault.ai");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="glass w-full max-w-md border-none">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <CardTitle>LegacyVault AI</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your secure digital estate and manage nominee permissions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input type="password" placeholder="Password" defaultValue="demo-password" />
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              saveSessionState({ role: "owner", email });
              window.location.assign("/dashboard");
            }}
          >
            Sign in <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
