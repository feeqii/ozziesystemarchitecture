import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { attemptSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { upsertMastery } from "@/lib/progress";
import { awardXp, checkAndAwardAchievements, XP_REWARDS } from "@/lib/achievements";

export async function POST(req: Request) {
  try {
    const { parent } = await requireParent();
    const body = await req.json();
    const parsed = attemptSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid attempt payload", 400);
    }

    const { childId, wordId, accuracy, deviceAttemptId } = parsed.data;
    const child = await getChildForParent(parent.id, childId);
    if (!child) {
      return jsonError("Child not found", 404);
    }

    const existing = await prisma.attempt.findUnique({
      where: { deviceAttemptId },
    });
    if (existing) {
      return NextResponse.json({ attempt: existing, duplicate: true });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.create({
        data: {
          childId,
          wordId,
          accuracy,
          deviceAttemptId,
        },
      });

      await upsertMastery(childId, wordId, accuracy, tx);

      // Phase 2: Award XP for the attempt
      let xpEarned = 0;
      const isPerfect = accuracy === 1.0;

      if (accuracy >= 0.9) {
        xpEarned = XP_REWARDS.WORD_MASTERED;
        if (isPerfect) {
          xpEarned += XP_REWARDS.PERFECT_ACCURACY;
        }
      }

      if (xpEarned > 0) {
        await awardXp(childId, xpEarned, tx);
      }

      // Phase 2: Check for achievements
      const updatedChild = await tx.childProfile.findUnique({
        where: { id: childId },
        select: { currentStreak: true },
      });

      const masteredWordCount = await tx.mastery.count({
        where: { childId, status: "mastered" },
      });

      const earnedAchievements = await checkAndAwardAchievements(
        childId,
        {
          verseCompleted: true, // Award first verse on any attempt
          perfectAccuracy: isPerfect,
          currentStreak: updatedChild?.currentStreak ?? 0,
          wordsMastered: masteredWordCount,
        },
        tx
      );

      return { attempt, xpEarned, earnedAchievements };
    });

    return NextResponse.json({
      attempt: result.attempt,
      xpEarned: result.xpEarned,
      achievementsEarned: result.earnedAchievements,
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to save attempt", 500);
  }
}
