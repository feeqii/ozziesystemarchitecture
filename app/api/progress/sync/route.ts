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

    const created = [];
    const duplicates = [];

    for (const attemptPayload of attempts) {
      if (attemptPayload.childId !== childId) {
        return jsonError("Attempt childId mismatch", 400);
      }
      const existing = await prisma.attempt.findUnique({
        where: { deviceAttemptId: attemptPayload.deviceAttemptId },
      });
      if (existing) {
        duplicates.push(existing);
        continue;
      }

      const attempt = await prisma.attempt.create({
        data: {
          childId: attemptPayload.childId,
          wordId: attemptPayload.wordId,
          accuracy: attemptPayload.accuracy,
          deviceAttemptId: attemptPayload.deviceAttemptId,
        },
      });
      await upsertMastery(childId, attemptPayload.wordId, attemptPayload.accuracy);
      created.push(attempt);
    }

    return NextResponse.json({
      createdCount: created.length,
      duplicateCount: duplicates.length,
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to sync attempts", 500);
  }
}
