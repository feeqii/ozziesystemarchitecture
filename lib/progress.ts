import { prisma } from "@/lib/db";
import { Prisma, PrismaClient } from "@prisma/client";

// Type for transaction client
type PrismaTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export function getStatusForAccuracy(accuracy: number) {
  if (accuracy >= 0.9) {
    return "mastered";
  }
  if (accuracy >= 0.7) {
    return "learning";
  }
  return "struggling";
}

// Kareem: Updated to accept transaction client for atomic operations
export async function upsertMastery(
  childId: string,
  wordId: number,
  accuracy: number,
  tx?: PrismaTransaction
) {
  const db = tx ?? prisma;
  const status = getStatusForAccuracy(accuracy);
  const existing = await db.mastery.findUnique({
    where: { childId_wordId: { childId, wordId } },
  });

  const nextStreak =
    status === "mastered" ? (existing?.streak ?? 0) + 1 : 0;

  return db.mastery.upsert({
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
