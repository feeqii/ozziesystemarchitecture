import { prisma } from "@/lib/db";

export function getStatusForAccuracy(accuracy: number) {
  if (accuracy >= 0.9) {
    return "mastered";
  }
  if (accuracy >= 0.7) {
    return "learning";
  }
  return "struggling";
}

export async function upsertMastery(childId: string, wordId: number, accuracy: number) {
  const status = getStatusForAccuracy(accuracy);
  const existing = await prisma.mastery.findUnique({
    where: { childId_wordId: { childId, wordId } },
  });

  const nextStreak =
    status === "mastered" ? (existing?.streak ?? 0) + 1 : 0;

  return prisma.mastery.upsert({
    where: { childId_wordId: { childId, wordId } },
    update: {
      status,
      streak: nextStreak,
      lastAttemptAt: new Date(),
    },
    create: {
      childId,
      wordId,
      status,
      streak: nextStreak,
      lastAttemptAt: new Date(),
    },
  });
}
