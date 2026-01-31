import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";

/**
 * GET /api/progress/summary?childId=...
 * Phase 3: Now uses PostgreSQL function for aggregation (performance optimization)
 */
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

    // Phase 3: Use PostgreSQL function for aggregation instead of JS
    const result = await prisma.$queryRaw<
      Array<{
        total_attempts: bigint;
        avg_accuracy: number;
        mastered_count: bigint;
        learning_count: bigint;
        struggling_count: bigint;
        current_xp: number;
        current_level: number;
        achievement_count: bigint;
      }>
    >`SELECT * FROM get_child_progress_summary(${childId})`;

    if (!result || result.length === 0) {
      return jsonError("Unable to load summary", 500);
    }

    const summary = result[0];

    return NextResponse.json({
      childId,
      attemptCount: Number(summary.total_attempts),
      avgAccuracy: Number(summary.avg_accuracy),
      mastery: {
        mastered: Number(summary.mastered_count),
        learning: Number(summary.learning_count),
        struggling: Number(summary.struggling_count),
      },
      xp: {
        total: summary.current_xp,
        level: summary.current_level,
      },
      achievementCount: Number(summary.achievement_count),
    });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to load summary", 500);
  }
}
