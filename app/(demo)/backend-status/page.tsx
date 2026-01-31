import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function BackendStatusPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [
    parentCount,
    childCount,
    surahCount,
    verseCount,
    wordCount,
    attemptCount,
    masteryCount,
    achievementCount,
    childAchievementCount,
    seededSurahs,
    recentAttempts,
  ] = await Promise.all([
    prisma.parentUser.count(),
    prisma.childProfile.count(),
    prisma.surah.count(),
    prisma.verse.count(),
    prisma.word.count(),
    prisma.attempt.count(),
    prisma.mastery.count(),
    prisma.achievement.count(), // Phase 2
    prisma.childAchievement.count(), // Phase 2
    prisma.surah.findMany({
      where: { id: { in: [1, 112] } },
      select: { id: true },
    }),
    prisma.attempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        childId: true,
        wordId: true,
        accuracy: true,
        createdAt: true,
      },
    }),
  ]);

  const seededIds = new Set(seededSurahs.map((surah) => surah.id));
  const hasSurah1 = seededIds.has(1);
  const hasSurah112 = seededIds.has(112);

  const counts = [
    { label: "ParentUser", value: parentCount },
    { label: "ChildProfile", value: childCount },
    { label: "Surah", value: surahCount },
    { label: "Verse", value: verseCount },
    { label: "Word", value: wordCount },
    { label: "Attempt", value: attemptCount },
    { label: "Mastery", value: masteryCount },
    { label: "Achievement", value: achievementCount, badge: "Phase 2" }, // Phase 2
    { label: "ChildAchievement", value: childAchievementCount, badge: "Phase 2" }, // Phase 2
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Backend status</h1>
          <p className="text-sm text-muted-foreground">
            Read-only operational snapshot of the demo database.
          </p>
        </div>
        <Badge variant="secondary">Clerk-protected</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {counts.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {item.label}
                  {'badge' in item && <Badge variant="outline" className="text-xs">{item.badge}</Badge>}
                </p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Seed status</CardTitle>
            <CardDescription>Surah 1 and 112 availability checks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Surah 1</span>
              <Badge variant={hasSurah1 ? "default" : "destructive"}>
                {hasSurah1 ? "Present" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Surah 112</span>
              <Badge variant={hasSurah112 ? "default" : "destructive"}>
                {hasSurah112 ? "Present" : "Missing"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Last 10 attempts recorded.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child ID</TableHead>
                  <TableHead>Word ID</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Created at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No attempts yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAttempts.map((attempt) => (
                    <TableRow key={`${attempt.childId}-${attempt.createdAt.toISOString()}`}>
                      <TableCell className="font-mono text-xs">
                        {attempt.childId}
                      </TableCell>
                      <TableCell>{attempt.wordId}</TableCell>
                      <TableCell>{attempt.accuracy.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {attempt.createdAt.toISOString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What you're seeing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This panel pulls live counts from the Supabase-backed database,
          confirms the Quran seed content is present, and shows the most recent
          word-level attempts so you can verify the end-to-end demo pipeline
          without exposing any write controls.
        </CardContent>
      </Card>
    </main>
  );
}
