import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(params);
  const surahId = Number(id);
  if (Number.isNaN(surahId)) {
    return jsonError("Invalid surah id", 400);
  }

  const surah = await prisma.surah.findUnique({
    where: { id: surahId },
    include: {
      verses: {
        orderBy: { verseNumber: "asc" },
        include: { words: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!surah) {
    return jsonError("Surah not found", 404);
  }

  return NextResponse.json({ surah });
}
