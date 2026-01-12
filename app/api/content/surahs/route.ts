import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const surahs = await prisma.surah.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ surahs });
}
