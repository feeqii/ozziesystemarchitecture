"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { MermaidDiagram } from "@/components/mermaid/MermaidDiagram";
import { HeroOrbit } from "@/components/react-bits/hero-orbit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  focusAreas,
  sequenceDiagram,
  systemOverview,
  erDiagram,
  type FocusArea,
} from "@/lib/architecture/diagrams";

type ViewMode = "simple" | "detailed";

export default function ArchitecturePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [focus, setFocus] = useState<FocusArea>("Auth");
  const isDetailed = viewMode === "detailed";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,144,121,0.12),_transparent_52%),radial-gradient(circle_at_bottom,_rgba(242,194,96,0.16),_transparent_50%)] px-6 pb-20 pt-16">
      <section className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <div className="relative overflow-hidden rounded-3xl border bg-background/80 p-10 shadow-sm">
          <HeroOrbit />
          <div className="relative space-y-4">
            <Badge className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
              Architecture Tour
            </Badge>
            <h1 className="font-display text-4xl">
              A visual tour of how Ozzie works
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              This page explains the demo in plain English first, with deeper
              technical detail available on demand. Use the focus pills to zoom
              into Auth, Content, Progress, or Offline Sync.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1">
                <Button
                  size="sm"
                  variant={viewMode === "simple" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("simple")}
                >
                  Simple
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "detailed" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("detailed")}
                >
                  Detailed
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {focusAreas.map((area) => (
                  <Button
                    key={area}
                    size="sm"
                    variant={focus === area ? "default" : "outline"}
                    onClick={() => setFocus(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl">
        <Tabs defaultValue="big-picture" className="space-y-6">
          <TabsList className="bg-background">
            <TabsTrigger value="big-picture">Big Picture</TabsTrigger>
            <TabsTrigger value="milestones">Milestone 3 + 4</TabsTrigger>
            <TabsTrigger value="delivered">What We Delivered</TabsTrigger>
            <TabsTrigger value="next">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="big-picture" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl">System overview</h2>
                  <p className="text-sm text-muted-foreground">
                    A bird&apos;s-eye view of the demo from parent login to
                    progress tracking.
                  </p>
                </div>
                <MermaidDiagram diagram={systemOverview[focus]} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">What this means</p>
                    <p className="text-sm text-muted-foreground">
                      Parents authenticate, the app talks to secure APIs, content
                      comes from the seeded Quran data, and progress is stored in
                      a structured database.
                    </p>
                  </div>
                  {isDetailed ? (
                    <div>
                      <p className="text-sm font-semibold">Where it lives in code</p>
                      <p className="text-sm text-muted-foreground">
                        Auth: `middleware.ts`, `app/api/me/route.ts` · Content:
                        `app/api/content/surahs` · Progress:
                        `app/api/progress/*` · DB: `prisma/schema.prisma`
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl">Why this matters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The demo proves we can move from parent sign-in to real-time
                learning progress without any missing pieces. Each box above
                already has a working API and UI touchpoint.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl">
                    Demo flow sequence
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This is the exact order a parent experiences in the demo.
                  </p>
                </div>
                <MermaidDiagram diagram={sequenceDiagram} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">What this means</p>
                    <p className="text-sm text-muted-foreground">
                      The onboarding flow (Milestone 4) and the learning flow
                      (Milestone 3) are connected end-to-end with offline sync in
                      the middle.
                    </p>
                  </div>
                  {isDetailed ? (
                    <div>
                      <p className="text-sm font-semibold">Where it lives in code</p>
                      <p className="text-sm text-muted-foreground">
                        `/sign-in`, `/onboarding`, `/demo` UI · APIs:
                        `/api/me`, `/api/children`, `/api/content/surahs/:id`,
                        `/api/progress/attempt`, `/api/progress/sync`
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl">Milestone connections</h3>
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="m3">
                  <AccordionTrigger>Milestone 3: Backend + content</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Content is pre-seeded (Surah 1 + 112), APIs serve word-level
                      data, and attempts update mastery.
                    </p>
                    {isDetailed ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Seed script: `scripts/seed-quran.ts` · Schema:
                        `prisma/schema.prisma`
                      </p>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="m4">
                  <AccordionTrigger>Milestone 4: Auth + profiles</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Clerk handles login. Parents give consent, then create up to
                      three child profiles.
                    </p>
                    {isDetailed ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Auth middleware: `middleware.ts` · Parent endpoint:
                        `app/api/me/route.ts`
                      </p>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </TabsContent>

          <TabsContent value="delivered" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl">Data model snapshot</h2>
                  <p className="text-sm text-muted-foreground">
                    The core entities that power content, progress, and profiles.
                  </p>
                </div>
                <MermaidDiagram diagram={erDiagram} />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">What this means</p>
                    <p className="text-sm text-muted-foreground">
                      Every child has progress tied to specific words inside
                      verses, so mastery can be measured precisely.
                    </p>
                  </div>
                  {isDetailed ? (
                    <div>
                      <p className="text-sm font-semibold">Where it lives in code</p>
                      <p className="text-sm text-muted-foreground">
                        `prisma/schema.prisma` defines all relationships and
                        enforces isolation with foreign keys.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl">Milestone scoreboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Quick proof links for the demo deliverables.
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  {
                    label: "Live demo flow",
                    type: "link",
                    action: "/demo",
                  },
                  {
                    label: "API documentation",
                    type: "link",
                    action: "/api-docs",
                  },
                  {
                    label: "Milestone 3 review",
                    type: "copy",
                    action: "docs/MILESTONE3_REVIEW.md",
                  },
                  {
                    label: "Milestone 4 review",
                    type: "copy",
                    action: "docs/MILESTONE4_REVIEW.md",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/60 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium">{item.label}</p>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                    {item.type === "link" ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={item.action}>
                          View
                          <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(item.action)}
                      >
                        Copy path
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {isDetailed ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Reviews live in `docs/` and map requirements to code and UI.
                </p>
              ) : null}
            </Card>
          </TabsContent>

          <TabsContent value="next" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-2xl">
                Next steps once designs arrive
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This is how the mobile UI will plug into what we already built.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Use the same REST endpoints from the mobile app UI.</li>
                <li>Swap SQLite for hosted Postgres (or Supabase) via Prisma.</li>
                <li>Replace localStorage queue with AsyncStorage for offline sync.</li>
                <li>Add CI/CD pipeline for staging + production deployments.</li>
                <li>Provision environment variables for Clerk + database + APIs.</li>
                <li>Expand content seeding to cover the full Quran.</li>
                <li>Add analytics + error monitoring for release readiness.</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl">Need a quick tour?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this page with cofounders for a guided walkthrough, or jump
                directly into the demo.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/demo">Open Demo</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/api-docs">API Docs</Link>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
