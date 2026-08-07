import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultState, saveEstateState, saveSessionState } from "@/lib/estate-data";

async function syncProfile(ownerName: string, estateName: string, email: string) {
  try {
    await fetch("/api/estate/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ownerName, estateName, email }),
    });
  } catch (err) {
    console.error("Profile sync failed:", err);
  }
}

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState(defaultState.ownerName);
  const [email, setEmail] = useState(defaultState.email);
  const [password, setPassword] = useState("demo-password");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    toast.info("Initializing encrypted estate vault...");

    const nextState = {
      ...defaultState,
      ownerName: name.trim(),
      estateName: `${name.trim()}'s Digital Legacy`,
      email: email.trim(),
    };

    saveEstateState(nextState);
    await syncProfile(name.trim(), nextState.estateName, email.trim());
    saveSessionState({ role: "owner", email: email.trim() });

    toast.success("Estate vault created successfully!");
    window.location.assign("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="glass w-full max-w-md border-none">
        <CardHeader className="space-y-2">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-6" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              DigitalWill
            </span>
          </Link>
          <CardTitle className="text-xl">Create Your Estate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Organize, encrypt and hand over your digital legacy to people you trust.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@legacyvault.ai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button variant="hero" type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Vault..." : "Get started"} <ArrowRight className="size-4" />
            </Button>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
