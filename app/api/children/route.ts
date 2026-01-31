import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { childSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { MAX_CHILDREN, requireParent } from "@/lib/auth";

/**
 * GET /api/children
 * Phase 3: Now includes basic stats with eager loading to prevent N+1 queries
 */
export async function GET() {
  try {
    const { parent } = await requireParent();

    // Phase 3: Eager load with aggregations to prevent N+1 queries
    const children = await prisma.childProfile.findMany({
      where: { parentId: parent.id, isDeleted: false },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        age: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        currentStreak: true,
        longestStreak: true,
        lastPracticeAt: true,
        totalXp: true,
        level: true,
        // Eager load counts to avoid N+1
        _count: {
          select: {
            attempts: true,
            mastery: true,
            achievements: true,
          },
        },
      },
    });

    return NextResponse.json({ children });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to load children", 500);
  }
}

export async function POST(req: Request) {
  try {
    const { parent } = await requireParent();
    const body = await req.json();
    const parsed = childSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid child payload", 400);
    }

    const existingCount = await prisma.childProfile.count({
      where: { parentId: parent.id },
    });
    if (existingCount >= MAX_CHILDREN) {
      return jsonError("Maximum of 3 child profiles reached", 400);
    }

    const child = await prisma.childProfile.create({
      data: {
        parentId: parent.id,
        name: parsed.data.name,
        age: parsed.data.age,
        avatar: parsed.data.avatar ?? null,
      },
    });

    return NextResponse.json({ child });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to create child", 500);
  }
}
