import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { childSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { MAX_CHILDREN, requireParent } from "@/lib/auth";

export async function GET() {
  try {
    const { parent } = await requireParent();
    const children = await prisma.childProfile.findMany({
      where: { parentId: parent.id },
      orderBy: { createdAt: "asc" },
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
