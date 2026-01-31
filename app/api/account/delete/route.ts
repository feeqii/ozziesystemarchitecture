import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";
import { z } from "zod";

// Kareem: Add confirmation to prevent accidental deletes
const deleteSchema = z.object({
  confirm: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const { parent } = await requireParent();

    // Kareem: Require explicit confirmation
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON payload", 400);
    }

    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Must confirm deletion with { confirm: true }", 400);
    }

    // Kareem: Soft delete instead of hard delete
    const now = new Date();

    // Count children before transaction
    const childCount = await prisma.childProfile.count({
      where: { parentId: parent.id },
    });

    // Use transaction to ensure consistency (Kareem feedback)
    await prisma.$transaction([
      // Soft delete the parent
      prisma.parentUser.update({
        where: { id: parent.id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      }),
      // Soft delete all children
      prisma.childProfile.updateMany({
        where: { parentId: parent.id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      }),
      // Kareem: Create audit log entry
      prisma.auditLog.create({
        data: {
          parentId: parent.id,
          action: "ACCOUNT_DELETED",
          details: { childCount },
        },
      }),
    ]);

    return NextResponse.json({ deleted: true, softDelete: true });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to delete account", 500);
  }
}
