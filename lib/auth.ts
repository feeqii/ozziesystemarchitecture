import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const MAX_CHILDREN = 3;

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

export async function requireParent() {
  const userId = await requireUserId();
  const parent = await prisma.parentUser.findUnique({
    where: { clerkUserId: userId },
  });
  if (!parent) {
    throw new Error("ONBOARDING_REQUIRED");
  }
  return { userId, parent };
}
