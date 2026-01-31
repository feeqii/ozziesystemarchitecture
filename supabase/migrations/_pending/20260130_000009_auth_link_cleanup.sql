-- Make supabaseUserId required and enforce FK to auth.users
ALTER TABLE "ParentUser"
  ALTER COLUMN "supabaseUserId" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "ParentUser"
    ADD CONSTRAINT "ParentUser_supabaseUserId_fkey"
    FOREIGN KEY ("supabaseUserId") REFERENCES auth.users("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Drop clerkUserId after cutover
ALTER TABLE "ParentUser" DROP COLUMN IF EXISTS "clerkUserId";
