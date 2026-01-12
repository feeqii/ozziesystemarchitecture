import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";

export async function GET(req: Request) {
  try {
    const { parent } = await requireParent();
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    if (!childId) {
      return jsonError("childId is required", 400);
    }

    const child = await getChildForParent(parent.id, childId);
    if (!child) {
      return jsonError("Child not found", 404);
    }

    const attemptCount = await prisma.attempt.count({
      where: { childId },
    });

    const mastery = await prisma.mastery.findMany({
      where: { childId },
      select: { status: true },
    });

    const summary = mastery.reduce(
      (acc, item) => {
        if (item.status === "mastered") acc.mastered += 1;
        if (item.status === "learning") acc.learning += 1;
        if (item.status === "struggling") acc.struggling += 1;
        return acc;
      },
      { mastered: 0, learning: 0, struggling: 0 }
    );

    return NextResponse.json({
      childId,
      attemptCount,
      mastery: summary,
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to load summary", 500);
  }
}
