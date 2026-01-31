import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { onboardingSchema } from "@/lib/validation";
import { jsonError, mapAuthError } from "@/lib/api";
import { requireUserId } from "@/lib/auth";

function getAge(dob: Date) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const parent = await prisma.parentUser.findUnique({
      where: { supabaseUserId: userId },  // Phase 3B: Use supabaseUserId
    });
    return NextResponse.json({ parent });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to load profile", 500);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON payload", 400);
    }
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid onboarding payload", 400);
    }

    const dob = new Date(parsed.data.dob);
    if (Number.isNaN(dob.getTime())) {
      return jsonError("Invalid date of birth", 400);
    }

    const age = getAge(dob);
    if (age < 18) {
      return jsonError("Parent must be at least 18 years old", 400);
    }

    // Mamoon: Store dobDate as proper Date type (in addition to dob DateTime)
    const dobDate = dob;

    // Phase 3B: Use supabaseUserId instead of clerkUserId
    const parent = await prisma.parentUser.upsert({
      where: { supabaseUserId: userId },
      update: {
        name: parsed.data.name ?? undefined, // Only update if provided
        dob,
        dobDate, // Mamoon: Proper Date type
        consentAt: new Date(),
      },
      create: {
        supabaseUserId: userId,
        name: parsed.data.name ?? "",
        dob,
        dobDate,
        consentAt: new Date(),
      },
    });

    return NextResponse.json({ parent });
  } catch (error) {
    return mapAuthError(error) ?? jsonError("Unable to save profile", 500);
  }
}
