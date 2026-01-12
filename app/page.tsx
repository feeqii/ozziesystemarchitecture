import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeroOrbit } from "@/components/react-bits/hero-orbit";
import { GlowCard } from "@/components/react-bits/glow-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,100,0.12),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(242,194,96,0.18),_transparent_45%)]">
      <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:px-12">
        <HeroOrbit />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex flex-wrap items-center gap-4">
            <Badge className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
              Milestone 3+4 Demo
            </Badge>
            <p className="text-sm text-muted-foreground">
              Backend structure + auth & profiles in one flow.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Ozzie Learning Portal — content, mastery, and parental control
                in a single demo.
              </h1>
              <p className="text-lg text-muted-foreground">
                Walk through the end-to-end experience: authenticate, onboard
                with COPPA consent, create child profiles, explore Surahs,
                submit attempts, and sync progress even when offline.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/demo">Launch Demo</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/api-docs">API Docs</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </div>
            <Card className="relative overflow-hidden border-0 bg-background/80 p-6 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(24,144,121,0.08),_transparent_45%,_rgba(242,194,96,0.12))]" />
              <div className="relative space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Live Demo Flow
                  </p>
                  <h2 className="font-display text-2xl">From sign-in to mastery</h2>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>1. Clerk auth + onboarding (DOB & consent)</p>
                  <p>2. Create/select child profiles</p>
                  <p>3. Fetch Surahs with word-level IDs</p>
                  <p>4. Submit attempts + sync offline queue</p>
                  <p>5. Review progress dashboard</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-12">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3">
            <h2 className="font-display text-3xl">Why this demo proves the milestone</h2>
            <p className="text-muted-foreground">
              Every requirement is mapped to a working UI + API touchpoint.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <GlowCard
              title="Content architecture"
              subtitle="Milestone 3"
              accent="bg-primary/30"
            >
              <p className="text-sm text-muted-foreground">
                Surahs, verses, and word-level IDs with audio references seeded
                from Quran Foundation.
              </p>
            </GlowCard>
            <GlowCard
              title="Adaptive mastery"
              subtitle="Milestone 3"
              accent="bg-accent/40"
            >
              <p className="text-sm text-muted-foreground">
                Attempts, mastery states, streak tracking, and offline sync with
                idempotent device IDs.
              </p>
            </GlowCard>
            <GlowCard
              title="Parent + child profiles"
              subtitle="Milestone 4"
              accent="bg-emerald-200/50"
            >
              <p className="text-sm text-muted-foreground">
                Clerk auth, COPPA consent capture, and strict data isolation for
                up to three children.
              </p>
            </GlowCard>
          </div>
          <Separator />
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <Card className="p-6">
              <h3 className="font-display text-2xl">Stack snapshot</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Next.js App Router + Tailwind + shadcn/ui. Clerk auth. Prisma +
                SQLite. REST endpoints with OpenAPI + Postman collection.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-2xl">Ready to demo</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Jump into the demo route to create a child profile, explore
                Surahs, and simulate offline attempts before syncing.
              </p>
              <Button asChild className="mt-4">
                <Link href="/demo">Start the walkthrough</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
