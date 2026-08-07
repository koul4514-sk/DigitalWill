import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEstateState, saveSessionState } from "@/lib/estate-data";

interface NomineeLoginResponse {
  token?: string;
  nominee?: {
    id: string;
    name: string;
    email: string;
    permissions: Record<string, boolean>;
  };
  error?: string;
}

export const Route = createFileRoute("/nominee/login")({
  component: NomineeLoginPage,
});

function NomineeLoginPage() {
  const [email, setEmail] = useState("priya@example.com");
  const [password, setPassword] = useState("LegacyVault@2026");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latestCode, setLatestCode] = useState<string | null>(null);

  async function handleSendOtp() {
    if (!email.trim()) {
      toast.error("Please enter your registered nominee email address.");
      return;
    }

    setSendingOtp(true);
    setPreviewUrl(null);
    setLatestCode(null);

    try {
      const res = await fetch("/api/nominee/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send verification code.");
        return;
      }

      if (data.code) setLatestCode(data.code);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);

      if (data.deliveredToGmail) {
        toast.success(`Verification code delivered directly to your Gmail inbox (${email.trim()})!`, { duration: 10000 });
      } else {
        toast.success(`Verification code: ${data.code} (Sent to ${email.trim()})`, {
          action: data.previewUrl
            ? {
                label: "Open Email Preview",
                onClick: () => window.open(data.previewUrl, "_blank"),
              }
            : undefined,
          duration: 12000,
        });
      }

      // Auto-fill OTP field for convenient one-click testing
      if (data.code) {
        setOtp(data.code);
      }

      // Start 60s cooldown timer
      setOtpCooldown(60);
      const timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("Could not send verification code. Please check server connection.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (otpMode && !otp.trim()) {
      toast.error("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (!otpMode && !password.trim()) {
      toast.error("Please provide your nominee access key or password.");
      return;
    }

    setLoading(true);
    toast.info("Verifying nominee authorization...");

    try {
      const body = otpMode
        ? { email: email.trim(), otp: otp.trim() }
        : { email: email.trim(), password: password.trim() };

      const response = await fetch("/api/nominee/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as NomineeLoginResponse;

      if (!response.ok || !payload.token || !payload.nominee) {
        toast.error(payload.error ?? "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      saveSessionState({
        role: "nominee",
        email: payload.nominee.email,
        nomineeId: payload.nominee.id,
      });
      localStorage.setItem("legacyvault-jwt", payload.token);

      toast.success(`Authenticated successfully as ${payload.nominee.name}!`);
      window.location.assign("/nominee/dashboard");
    } catch {
      // Fallback local auth for offline/demo mode
      const estateState = getEstateState();
      const localNominee =
        estateState.nominees.find((n) => n.email.toLowerCase() === email.trim().toLowerCase()) ??
        estateState.nominees[0];
      saveSessionState({ role: "nominee", email: localNominee.email, nomineeId: localNominee.id });
      toast.success(`Authenticated successfully as ${localNominee.name}!`);
      window.location.assign("/nominee/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="glass w-full max-w-md border-none">
        <CardHeader className="space-y-2">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Shield className="size-6" />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              DigitalWill
            </span>
          </Link>
          <CardTitle className="text-xl">Nominee Portal Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in as a trusted nominee using your assigned Access Token or Email Verification Code.
          </p>
        </CardHeader>
        <CardContent>
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              className={`rounded-lg py-2 transition-all ${
                !otpMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setOtpMode(false);
              }}
            >
              Access Token / Key
            </button>
            <button
              type="button"
              className={`rounded-lg py-2 transition-all ${
                otpMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setOtpMode(true);
              }}
            >
              Email Verification Code
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nominee-email">Nominee Email Address</Label>
              <Input
                id="nominee-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                required
              />
            </div>

            {!otpMode ? (
              <div className="space-y-2">
                <Label htmlFor="nominee-password">Access Token / Password</Label>
                <Input
                  id="nominee-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access token or password"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">6-Digit Verification Code (OTP)</Label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCooldown > 0}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {sendingOtp
                      ? "Sending..."
                      : otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : "Send Code to Email"}
                  </button>
                </div>

                {previewUrl && (
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-primary font-medium">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3.5" /> Email Inbox Dispatch
                      </span>
                      {latestCode && (
                        <span className="font-mono font-bold bg-primary/20 px-2 py-0.5 rounded text-primary">
                          Code: {latestCode}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="hero"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open(previewUrl, "_blank")}
                    >
                      <ExternalLink className="mr-1.5 size-3.5" /> 1-Click Open Web Email Inbox
                    </Button>
                  </div>
                )}

                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="font-mono text-center tracking-widest text-lg font-bold"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Click "Send Code to Email" to receive your verification code.
                </p>
              </div>
            )}

            <Button variant="hero" type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Authenticating..." : "Enter Nominee Portal"}{" "}
              <ArrowRight className="size-4" />
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-4">
              <span
                className="cursor-pointer hover:text-primary hover:underline font-medium text-foreground"
                onClick={() => setOtpMode(!otpMode)}
              >
                {otpMode ? "Use Access Key / Token" : "Login via Email OTP"}
              </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Owner Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
