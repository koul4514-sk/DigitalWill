import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultState, saveEstateState, saveSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState(defaultState.ownerName);
  const [email, setEmail] = useState(defaultState.email);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="glass w-full max-w-md border-none">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <CardTitle>Create your estate</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your private digital legacy vault in minutes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input type="password" placeholder="Create password" defaultValue="demo-password" />
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              const nextState = { ...defaultState, ownerName: name, email };
              saveEstateState(nextState);
              saveSessionState({ role: "owner", email });
              window.location.assign("/dashboard");
            }}
          >
            Get started <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
