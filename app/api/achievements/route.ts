import { NextResponse } from "next/server";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { getAllAchievements } from "@/lib/achievements";

/**
 * GET /api/achievements
 * Returns all available achievements in the system
 */
export async function GET() {
    try {
        // Require authentication
        await requireParent();

        const achievements = await getAllAchievements();

        return NextResponse.json({
            achievements: achievements.map((a) => ({
                id: a.id,
                name: a.name,
                displayName: a.displayName,
                description: a.description,
                iconToken: a.iconToken,
                xpReward: a.xpReward,
            })),
        });
    } catch (error) {
        return mapAuthError(error) ?? jsonError("Unable to load achievements", 500);
    }
}
