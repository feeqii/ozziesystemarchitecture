import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { upsertMastery } from "@/lib/progress";
// Phase 2: Import XP and achievements
import { awardXp, checkAndAwardAchievements, XP_REWARDS } from "@/lib/achievements";

export async function POST(req: Request) {
  try {
    const { parent } = await requireParent();
    const body = await req.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid sync payload", 400);
    }

    const { childId, attempts } = parsed.data;
    const child = await getChildForParent(parent.id, childId);
    if (!child) {
      return jsonError("Child not found", 404);
    }

    // Kareem: Batch check for duplicates instead of N+1 queries
    const deviceIds = attempts.map((a) => a.deviceAttemptId);
    const existingAttempts = await prisma.attempt.findMany({
      where: { deviceAttemptId: { in: deviceIds } },
      select: { deviceAttemptId: true },
    });
    const existingIds = new Set(existingAttempts.map((a) => a.deviceAttemptId));

    // Filter to only new attempts
    const newAttempts = attempts.filter(
      (a) => a.childId === childId && !existingIds.has(a.deviceAttemptId)
    );

    // Validate all childIds match
    const mismatch = attempts.find((a) => a.childId !== childId);
    if (mismatch) {
      return jsonError("Attempt childId mismatch", 400);
    }

    // Kareem: Use transaction for atomicity
    // Phase 2: Extended transaction for XP and achievements
    const result = await prisma.$transaction(async (tx) => {
      // Batch create all attempts
      const createdAttempts = await tx.attempt.createManyAndReturn({
        data: newAttempts.map((a) => ({
          childId: a.childId,
          wordId: a.wordId,
          accuracy: a.accuracy,
          deviceAttemptId: a.deviceAttemptId,
          sessionId: a.sessionId ?? null,
        })),
        skipDuplicates: true,
      });

      // Update mastery for each new attempt
      let xpEarned = 0;
      let hasPerfectAccuracy = false;

      for (const attempt of createdAttempts) {
        await upsertMastery(attempt.childId, attempt.wordId, attempt.accuracy, tx);

        // Phase 2: Award base XP for each attempt (completing a word)
        // More XP for higher accuracy
        if (attempt.accuracy >= 0.9) {
          xpEarned += XP_REWARDS.WORD_MASTERED;
        }

        // Track if any attempt was perfect
        if (attempt.accuracy === 1.0) {
          hasPerfectAccuracy = true;
        }
      }

      // Phase 2: Award bonus for perfect accuracy
      if (hasPerfectAccuracy) {
        xpEarned += XP_REWARDS.PERFECT_ACCURACY;
      }

      // Phase 2: Award XP if any earned
      if (xpEarned > 0) {
        await awardXp(childId, xpEarned, tx);
      }

      // Phase 2: Check for achievements
      // Get updated child data for streak
      const updatedChild = await tx.childProfile.findUnique({
        where: { id: childId },
        select: { currentStreak: true },
      });

      // Count mastered words for this child
      const masteredWordCount = await tx.mastery.count({
        where: { childId, status: "mastered" },
      });

      const earnedAchievements = await checkAndAwardAchievements(
        childId,
        {
          verseCompleted: createdAttempts.length > 0, // Award first verse on first attempt
          perfectAccuracy: hasPerfectAccuracy,
          currentStreak: updatedChild?.currentStreak ?? 0,
          wordsMastered: masteredWordCount,
        },
        tx
      );

      return { createdAttempts, xpEarned, earnedAchievements };
    });

    return NextResponse.json({
      createdCount: result.createdAttempts.length,
      duplicateCount: attempts.length - result.createdAttempts.length,
      // Phase 2: Include gamification data
      xpEarned: result.xpEarned,
      achievementsEarned: result.earnedAchievements,
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to sync attempts", 500);
  }
}
