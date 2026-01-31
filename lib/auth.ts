import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

/**
 * Phase 3B: Supabase Auth Migration
 * Replaced Clerk with Supabase Auth
 */

export const MAX_CHILDREN = 3;

export async function requireUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }
  return user.id;
}

export async function requireParent() {
  const userId = await requireUserId();
  const parent = await prisma.parentUser.findUnique({
    where: { supabaseUserId: userId },
  });
  if (!parent) {
    throw new Error("ONBOARDING_REQUIRED");
  }
  return { userId, parent };
}
