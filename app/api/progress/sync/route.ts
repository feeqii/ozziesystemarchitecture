import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { upsertMastery } from "@/lib/progress";

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
      for (const attempt of createdAttempts) {
        await upsertMastery(attempt.childId, attempt.wordId, attempt.accuracy, tx);
      }

      return createdAttempts;
    });

    return NextResponse.json({
      createdCount: result.length,
      duplicateCount: attempts.length - result.length,
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to sync attempts", 500);
  }
}
