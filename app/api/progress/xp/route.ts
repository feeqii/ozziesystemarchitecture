import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { getChildXpStatus } from "@/lib/achievements";

// Phase 2: XP query validation
const xpQuerySchema = z.object({
    childId: z.string().min(1),
});

/**
 * GET /api/progress/xp?childId=...
 * Returns child's XP status, level, and progress to next level
 */
export async function GET(req: NextRequest) {
    try {
        const { parent } = await requireParent();

        // Parse query params
        const searchParams = req.nextUrl.searchParams;
        const parsed = xpQuerySchema.safeParse({
            childId: searchParams.get("childId"),
        });

        if (!parsed.success) {
            return jsonError("Invalid childId parameter", 400);
        }

        const { childId } = parsed.data;

        // Verify child belongs to parent
        const child = await getChildForParent(parent.id, childId);
        if (!child) {
            return jsonError("Child not found", 404);
        }

        // Get XP status
        const xpStatus = await getChildXpStatus(childId);
        if (!xpStatus) {
            return jsonError("Unable to load XP data", 500);
        }

        return NextResponse.json({
            childId,
            totalXp: xpStatus.totalXp,
            level: xpStatus.level,
            xpNeeded: xpStatus.xpNeeded,
            progress: xpStatus.progress,
            nextLevel: xpStatus.nextLevel,
        });
    } catch (error) {
        return mapAuthError(error) ?? jsonError("Unable to load XP data", 500);
    }
}
