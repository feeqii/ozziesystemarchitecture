import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";

/**
 * GET /api/children/:id/stats
 * Phase 3: Returns comprehensive child statistics using DB-side aggregation
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { parent } = await requireParent();
        const { id: childId } = await params;

        // Verify child belongs to parent
        const child = await getChildForParent(parent.id, childId);
        if (!child) {
            return jsonError("Child not found", 404);
        }

        // Phase 3: Use PostgreSQL function for comprehensive stats
        const result = await prisma.$queryRaw<
            Array<{
                total_attempts: bigint;
                recent_attempts_7d: bigint;
                avg_accuracy: number;
                recent_avg_accuracy_7d: number;
                mastered_words: bigint;
                learning_words: bigint;
                struggling_words: bigint;
                total_xp: number;
                level: number;
                achievements_earned: bigint;
                current_streak: number;
                longest_streak: number;
                last_practice_at: Date | null;
            }>
        >`SELECT * FROM get_child_stats(${childId})`;

        if (!result || result.length === 0) {
            return jsonError("Unable to load stats", 500);
        }

        const stats = result[0];

        return NextResponse.json({
            childId,
            attempts: {
                total: Number(stats.total_attempts),
                last7Days: Number(stats.recent_attempts_7d),
            },
            accuracy: {
                overall: Number(stats.avg_accuracy),
                last7Days: Number(stats.recent_avg_accuracy_7d),
            },
            mastery: {
                mastered: Number(stats.mastered_words),
                learning: Number(stats.learning_words),
                struggling: Number(stats.struggling_words),
            },
            gamification: {
                totalXp: stats.total_xp,
                level: stats.level,
                achievementsEarned: Number(stats.achievements_earned),
            },
            streaks: {
                current: stats.current_streak,
                longest: stats.longest_streak,
            },
            lastPracticeAt: stats.last_practice_at,
        });
    } catch (error) {
        return mapAuthError(error) ?? jsonError("Unable to load stats", 500);
    }
}
