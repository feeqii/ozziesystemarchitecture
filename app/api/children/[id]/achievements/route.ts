import { NextRequest, NextResponse } from "next/server";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getChildForParent } from "@/lib/children";
import { getChildAchievements } from "@/lib/achievements";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/children/:id/achievements
 * Returns a child's earned achievements
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { parent } = await requireParent();
        const { id: childId } = await params;

        if (!childId) {
            return jsonError("Child ID required", 400);
        }

        // Verify child belongs to parent
        const child = await getChildForParent(parent.id, childId);
        if (!child) {
            return jsonError("Child not found", 404);
        }

        // Get earned achievements
        const achievements = await getChildAchievements(childId);

        return NextResponse.json({
            childId,
            achievements,
            count: achievements.length,
        });
    } catch (error) {
        return mapAuthError(error) ?? jsonError("Unable to load achievements", 500);
    }
}
