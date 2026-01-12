import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireParent } from "@/lib/auth";

export async function POST() {
  try {
    const { parent } = await requireParent();
    await prisma.parentUser.delete({
      where: { id: parent.id },
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to delete account", 500);
  }
}
