"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlowCard } from "@/components/react-bits/glow-card";
import { SuccessBurst } from "@/components/react-bits/success-burst";
import { DemoChecklistPanel } from "@/components/react-bits/demo-checklist";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatar?: string | null;
};

type Surah = {
  id: number;
  name: string;
  nameEn: string;
};

type Word = {
  id: number;
  position: number;
  textArabic: string;
  translation: string;
  transliteration: string;
  audioUrl?: string | null;
};

type Verse = {
  id: number;
  verseNumber: number;
  textArabic: string;
  translation: string;
  transliteration: string;
  words: Word[];
};

type SurahDetail = Surah & { verses: Verse[] };

type AttemptPayload = {
  childId: string;
  wordId: number;
  accuracy: number;
  deviceAttemptId: string;
};

type Summary = {
  attemptCount: number;
  mastery: {
    mastered: number;
    learning: number;
    struggling: number;
  };
};

const QUEUE_KEY = "ozzie-offline-queue";

const checklistItems = [
  {
    title: "Task 1: App shell + routes",
    steps: [
      "Visit / to confirm landing page and hero styling.",
      "Navigate to /demo and verify the demo workspace loads.",
      "Check tabs switch between Profiles, Learn, Progress.",
    ],
  },
  {
    title: "Task 2: Clerk auth + onboarding",
    steps: [
      "Sign out and try /demo to confirm redirect to /sign-in.",
      "Sign in with Google, land on /onboarding.",
      "Submit DOB + consent and confirm redirect to /demo.",
    ],
  },
  {
    title: "Task 3: Prisma + seed",
    steps: [
      "Run npm run prisma:migrate and npm run seed from repo root.",
      "Open /api/content/surahs/1 to verify seeded data.",
      "Check /api/content/surahs for the list (1 and 112).",
    ],
  },
  {
    title: "Task 4: REST endpoints",
    steps: [
      "Use /api/children to create/list (max 3).",
      "POST /api/progress/attempt from Learn word chips.",
      "GET /api/progress/summary updates in Progress tab.",
    ],
  },
  {
    title: "Task 5: Demo flow",
    steps: [
      "Create/select a child profile.",
      "Pick a Surah and click word chips to submit attempts.",
      "Open Progress tab to see counts update.",
    ],
  },
  {
    title: "Task 6: React Bits accents",
    steps: [
      "Hero orbit on landing page.",
      "Glow cards for child profiles and checklist.",
      "Success burst animation on sync.",
    ],
  },
  {
    title: "Task 7: OpenAPI + Postman",
    steps: [
      "Open /api-docs to see Swagger UI.",
      "Load /api-docs/openapi to view YAML.",
      "Import postman/ozzie-m3-m4.postman_collection.json.",
    ],
  },
  {
    title: "Task 8: Milestone docs",
    steps: [
      "Review docs/MILESTONE3_REVIEW.md.",
      "Review docs/MILESTONE4_REVIEW.md.",
      "Confirm each requirement maps to UI/API.",
    ],
  },
];

function makeDeviceAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function DemoPage() {
  const router = useRouter();
  const [checkingParent, setCheckingParent] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedSurahId, setSelectedSurahId] = useState<string>("");
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [accuracy, setAccuracy] = useState("0.9");
  const [queue, setQueue] = useState<AttemptPayload[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childAvatar, setChildAvatar] = useState("");

  useEffect(() => {
    const storedQueue = localStorage.getItem(QUEUE_KEY);
    if (!storedQueue) return;
    try {
      setQueue(JSON.parse(storedQueue));
    } catch {
      setQueue([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    const checkParent = async () => {
      const res = await fetch("/api/me");
      if (!res.ok) {
        router.push("/sign-in");
        return;
      }
      const data = await res.json();
      if (!data.parent) {
        router.push("/onboarding");
        return;
      }
      setCheckingParent(false);
    };
    checkParent();
  }, [router]);

  useEffect(() => {
    if (checkingParent) return;
    const load = async () => {
      const [childrenRes, surahsRes] = await Promise.all([
        fetch("/api/children"),
        fetch("/api/content/surahs"),
      ]);
      if (childrenRes.ok) {
        const data = await childrenRes.json();
        setChildren(data.children ?? []);
        setSelectedChildId((current) =>
          current || (data.children?.length ? data.children[0].id : "")
        );
      }
      if (surahsRes.ok) {
        const data = await surahsRes.json();
        setSurahs(data.surahs ?? []);
        setSelectedSurahId((current) =>
          current || (data.surahs?.length ? String(data.surahs[0].id) : "")
        );
      }
    };
    load();
  }, [checkingParent]);

  useEffect(() => {
    if (!selectedSurahId) {
      setSurahDetail(null);
      return;
    }
    const loadSurah = async () => {
      const res = await fetch(`/api/content/surahs/${selectedSurahId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSurahDetail(data.surah);
    };
    loadSurah();
  }, [selectedSurahId]);

  useEffect(() => {
    if (!selectedChildId) {
      setSummary(null);
      return;
    }
    const loadSummary = async () => {
      const res = await fetch(`/api/progress/summary?childId=${selectedChildId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSummary(data);
    };
    loadSummary();
  }, [selectedChildId, queue.length]);

  const refreshSummary = async (childId: string) => {
    const res = await fetch(`/api/progress/summary?childId=${childId}`);
    if (!res.ok) return;
    const data = await res.json();
    setSummary(data);
  };

  const queuedForChild = useMemo(
    () => queue.filter((item) => item.childId === selectedChildId),
    [queue, selectedChildId]
  );

  const submitAttempt = async (wordId: number) => {
    if (!selectedChildId) return;
    const payload: AttemptPayload = {
      childId: selectedChildId,
      wordId,
      accuracy: Number(accuracy),
      deviceAttemptId: makeDeviceAttemptId(),
    };

    if (offlineMode) {
      setQueue((prev) => [...prev, payload]);
      return;
    }

    await fetch("/api/progress/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await refreshSummary(selectedChildId);
  };

  const syncQueue = async () => {
    if (!selectedChildId || queuedForChild.length === 0) return;
    setSyncing(true);
    const res = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: selectedChildId, attempts: queuedForChild }),
    });
    if (res.ok) {
      setQueue((prev) => prev.filter((item) => item.childId !== selectedChildId));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
      await refreshSummary(selectedChildId);
    }
    setSyncing(false);
  };

  const createChild = async () => {
    if (!childName || !childAge) return;
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: childName,
        age: Number(childAge),
        avatar: childAvatar || undefined,
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setChildren((prev) => [...prev, data.child]);
    setSelectedChildId(data.child.id);
    setChildName("");
    setChildAge("");
    setChildAvatar("");
  };

  if (checkingParent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking onboarding...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Demo workspace
            </p>
            <h1 className="font-display text-3xl">Milestone 3 + 4 walkthrough</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Offline queue: {queue.length}</Badge>
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1">
              <Checkbox
                id="offlineMode"
                checked={offlineMode}
                onCheckedChange={(value) => setOfflineMode(Boolean(value))}
              />
              <Label htmlFor="offlineMode" className="text-xs">
                Offline mode
              </Label>
            </div>
          </div>
        </header>

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="bg-background">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-2xl">Choose a child</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Each child has isolated progress and mastery tracking.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setSelectedChildId(child.id)}
                  >
                    <GlowCard
                      title={child.name}
                      subtitle={`Age ${child.age}`}
                      className={
                        selectedChildId === child.id
                          ? "ring-2 ring-primary"
                          : ""
                      }
                    >
                      <p className="text-xs text-muted-foreground">
                        {child.avatar ? `Avatar: ${child.avatar}` : "No avatar set"}
                      </p>
                    </GlowCard>
                  </button>
                ))}
                {children.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No child profiles yet. Create one below.
                  </p>
                ) : null}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-2xl">Create a child profile</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="childName">Name</Label>
                  <Input
                    id="childName"
                    value={childName}
                    onChange={(event) => setChildName(event.target.value)}
                    placeholder="Amina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Age</Label>
                  <Input
                    id="childAge"
                    type="number"
                    min={3}
                    max={12}
                    value={childAge}
                    onChange={(event) => setChildAge(event.target.value)}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAvatar">Avatar (optional)</Label>
                  <Input
                    id="childAvatar"
                    value={childAvatar}
                    onChange={(event) => setChildAvatar(event.target.value)}
                    placeholder="Lion, Crescent, Rocket"
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={createChild}>
                Add child
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="learn" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl">Surah selection</h2>
                  <p className="text-sm text-muted-foreground">
                    Load content with word-level IDs and audio references.
                  </p>
                </div>
                <Select
                  value={selectedSurahId}
                  onValueChange={(value) => setSelectedSurahId(value)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select Surah" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahs.map((surah) => (
                      <SelectItem key={surah.id} value={String(surah.id)}>
                        {surah.id}. {surah.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl">Learning screen</h2>
                  <p className="text-sm text-muted-foreground">
                    Tap a word to submit an attempt.
                  </p>
                </div>
                <Select value={accuracy} onValueChange={setAccuracy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Accuracy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.6">0.60 - Needs work</SelectItem>
                    <SelectItem value="0.8">0.80 - Getting there</SelectItem>
                    <SelectItem value="0.9">0.90 - Confident</SelectItem>
                    <SelectItem value="1">1.0 - Perfect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!selectedChildId ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Select a child profile before starting.
                </p>
              ) : null}

              {!surahDetail ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Choose a Surah to load words.
                </p>
              ) : null}

              {surahDetail ? (
                <div className="mt-6 space-y-6">
                  {surahDetail.verses.map((verse) => (
                    <div key={verse.id} className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Verse {verse.verseNumber}
                          </p>
                          <p className="text-xl">{verse.textArabic}</p>
                        </div>
                        <Badge variant="secondary">{verse.translation}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {verse.words.map((word) => (
                          <Button
                            key={word.id}
                            variant="outline"
                            size="sm"
                            onClick={() => submitAttempt(word.id)}
                          >
                            {word.textArabic}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {verse.transliteration}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl">Offline sync</h2>
                  <p className="text-sm text-muted-foreground">
                    Queue attempts offline and sync them when online.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SuccessBurst active={syncSuccess} />
                  <Button
                    onClick={syncQueue}
                    disabled={syncing || queuedForChild.length === 0 || !selectedChildId}
                  >
                    {syncing ? "Syncing..." : `Sync ${queuedForChild.length} attempts`}
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Device attempt IDs prevent duplicates across retries.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-2xl">Progress dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Track mastery and attempts per child.
              </p>
              {summary ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Attempts
                    </p>
                    <p className="font-display text-3xl">{summary.attemptCount}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Mastered
                    </p>
                    <p className="font-display text-3xl">
                      {summary.mastery.mastered}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Learning
                    </p>
                    <p className="font-display text-3xl">
                      {summary.mastery.learning}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Struggling
                    </p>
                    <p className="font-display text-3xl">
                      {summary.mastery.struggling}
                    </p>
                  </Card>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Select a child to load summary data.
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <DemoChecklistPanel items={checklistItems} />
    </div>
  );
}
