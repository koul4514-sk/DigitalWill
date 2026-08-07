import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSessionState } from "@/lib/estate-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("alex@legacyvault.ai");
  const [password, setPassword] = useState("demo-password");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    toast.info("Authenticating owner session...");

    setTimeout(() => {
      saveSessionState({ role: "owner", email: email.trim() });
      toast.success("Signed in successfully!");
      window.location.assign("/dashboard");
    }, 500);
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
          <CardTitle className="text-xl">Owner Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access your encrypted estate command center and manage nominee permissions.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span
                  className="text-xs text-muted-foreground cursor-pointer hover:underline"
                  onClick={() => toast.info("Password reset instructions sent to your email.")}
                >
                  Forgot password?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button variant="hero" type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Sign in"} <ArrowRight className="size-4" />
            </Button>

            <div className="mt-4 text-center text-xs text-muted-foreground space-y-2">
              <p>
                Don't have an estate yet?{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Create estate
                </Link>
              </p>
              <p>
                Are you a nominee?{" "}
                <Link to="/nominee/login" className="text-primary font-medium hover:underline">
                  Sign in via Nominee Portal
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
