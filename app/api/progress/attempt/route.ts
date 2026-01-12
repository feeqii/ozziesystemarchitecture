import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { attemptSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { upsertMastery } from "@/lib/progress";

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

    const attempt = await prisma.attempt.create({
      data: {
        childId,
        wordId,
        accuracy,
        deviceAttemptId,
      },
    });

    await upsertMastery(childId, wordId, accuracy);

    return NextResponse.json({ attempt });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to save attempt", 500);
  }
}
