import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardCheck,
  FileLock2,
  Fingerprint,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { AppLink } from "@/components/layout/AppLink";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DigitalWill — Secure Digital Estate Management" },
      {
        name: "description",
        content:
          "Organize, encrypt and hand over your digital legacy. Store documents, track digital assets and grant nominees exactly the access you choose.",
      },
      { property: "og:title", content: "DigitalWill — Secure Digital Estate Management" },
      {
        property: "og:description",
        content:
          "A privacy-first vault for your documents, accounts and instructions, with permission-controlled access for the people you trust.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FileLock2,
    title: "Encrypted Vault",
    body: "Insurance, identity, property, medical, legal and financial documents in one private store with signed, expiring access links.",
  },
  {
    icon: Wallet,
    title: "Digital Assets",
    body: "Track subscriptions, social and developer accounts, cloud storage, policies and property in a single structured register.",
  },
  {
    icon: Users,
    title: "Nominee Permissions",
    body: "Add nominees and grant access resource by resource. Revoke anything, at any time, and the portal reshapes instantly.",
  },
  {
    icon: ScrollText,
    title: "Digital Instructions",
    body: "Write prioritized, plain-language directions so the people you trust know exactly what to do — and in what order.",
  },
  {
    icon: ClipboardCheck,
    title: "Executor Checklist",
    body: "A guided, trackable sequence that turns an overwhelming task into a clear list with visible progress.",
  },
  {
    icon: Fingerprint,
    title: "Audit Trail",
    body: "Every view, download and permission change is written to an append-only log. Nothing happens quietly.",
  },
];

const pillars = [
  {
    icon: Lock,
    title: "Encrypted before storage",
    body: "Documents live in a private bucket, never a public URL. The architecture is built for client-side AES envelope encryption.",
  },
  {
    icon: ShieldCheck,
    title: "Enforced in the database",
    body: "Permissions are row-level policies, not hidden menu items. A revoked nominee gets zero rows, not a hidden button.",
  },
  {
    icon: KeyRound,
    title: "Read-only by construction",
    body: "Nominees have no write path to owner data anywhere in the schema. It is a structural guarantee, not a convention.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your estate",
    body: "Sign up and set up your private vault in minutes.",
  },
  {
    n: "02",
    title: "Add what matters",
    body: "Upload documents, register assets, write instructions.",
  },
  {
    n: "03",
    title: "Invite nominees",
    body: "Send an email invite and choose exactly what each person sees.",
  },
  {
    n: "04",
    title: "Stay in control",
    body: "Adjust permissions and watch every access in the audit log.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* ---------------------------------------------------------- Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppLink to="/" aria-label="DigitalWill home">
            <Logo />
          </AppLink>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#security" className="transition-colors hover:text-foreground">
              Security
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <AppLink to="/login">Sign in</AppLink>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <AppLink to="/signup">Get started</AppLink>
            </Button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-rise-in">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Privacy-first digital estate management
              </span>

              <h1 className="mt-6 font-display text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Your digital life,
                <br />
                <span className="text-gradient">safely inherited.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Documents, accounts, policies and passwords are scattered across dozens of
                platforms. DigitalWill brings them into one encrypted vault — and hands the right
                pieces to the right people, exactly when it matters.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button variant="hero" size="xl" asChild>
                  <AppLink to="/signup">
                    Create your estate
                    <ArrowRight className="size-4" />
                  </AppLink>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <AppLink to="/nominee/login">I'm a nominee</AppLink>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
                {[
                  ["6", "Document categories"],
                  ["7", "Asset categories"],
                  ["100%", "Audited access"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-semibold">{value}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Product preview */}
            <div className="relative animate-float-slow">
              <div className="glass-strong rounded-3xl p-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Digital Health Score</p>
                    <p className="font-display text-3xl font-semibold">82%</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                    Well protected
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { icon: FileLock2, label: "Documents secured", value: "24" },
                    { icon: Wallet, label: "Digital assets tracked", value: "17" },
                    { icon: Users, label: "Nominees active", value: "3" },
                    { icon: ScrollText, label: "Instructions written", value: "9" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 rounded-xl bg-surface-2/50 px-4 py-3"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                        <row.icon className="size-4" />
                      </span>
                      <span className="flex-1 text-sm text-muted-foreground">{row.label}</span>
                      <span className="font-display text-sm font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Nominee access:</span> Priya S.
                    can view Vault + Instructions. Financial access is off.
                  </p>
                </div>
              </div>
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-45 blur-3xl"
                style={{ background: "var(--gradient-primary)" }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Features */}
      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Everything in one place
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for the moment your family needs it most
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- Security */}
      <section id="security" className="relative border-y border-border bg-surface-1/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Security architecture
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Hiding a menu is not security
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Access rules are enforced where the data lives, so an unauthorized request returns
                nothing — no matter how it is made.
              </p>
            </div>

            <div className="space-y-4">
              {pillars.map((p) => (
                <div key={p.title} className="glass flex gap-4 rounded-2xl p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- How it works */}
      <section id="how" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Four steps to a protected legacy
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border p-6">
              <span className="font-display text-4xl font-semibold text-primary/25">{s.n}</span>
              <h3 className="mt-3 font-display font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-64 opacity-30 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
            aria-hidden
          />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Start protecting your digital legacy today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            It takes ten minutes to set up, and it saves your family weeks of uncertainty.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="xl" asChild>
              <AppLink to="/signup">
                Create free account
                <ArrowRight className="size-4" />
              </AppLink>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <AppLink to="/login">Sign in</AppLink>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DigitalWill · Privacy-first digital estate management
          </p>
        </div>
      </footer>
    </div>
  );
}
