# Phase 3 Implementation Prompt

## Project Overview

You are continuing development on **Ozzie** - an Islamic education app for children to learn Quran recitation. This is a Next.js 16 application with Prisma ORM, PostgreSQL (Supabase), currently using Clerk authentication.

**IMPORTANT CONTEXT FILE:** Read `/Users/feeq/Desktop/ozziemilestone34/Milestonedeets` for the complete project requirements.

## Current State

- **Branch:** `main` 
- **Build Status:** ✅ Passing
- **Auth:** Clerk (working, but migrating to Supabase per Mamoon's feedback)
- **Phase 1:** ✅ Complete (schema changes, soft delete, audit logs, transactions)
- **Phase 2:** ✅ Complete (XP system, achievements)

## What Was Completed Previously

### Phase 1 (Schema & API improvements):
- Parent: name, dobDate, subscription fields, soft delete
- Child: streaks, soft delete
- Session table for attempt grouping
- Audit logging
- Batched queries and transactions
- Verse-level audio URLs

### Phase 2 (Gamification):
- XP system with levels
- Achievement definitions
- ChildAchievement tracking
- API endpoints for XP and achievements
- Automatic achievement awarding

## Your Task: Phase 3 Implementation

You have TWO main objectives:

### Part A: Performance Optimizations (Kareem's Feedback)

#### 1. Database-Side Aggregations
**Problem:** Currently aggregating data in JavaScript (memory intensive)

**Fix:** Create PostgreSQL functions/views for:

```sql
-- Example: Progress summary function
CREATE OR REPLACE FUNCTION get_child_progress_summary(p_child_id TEXT)
RETURNS TABLE (
  total_attempts BIGINT,
  avg_accuracy NUMERIC,
  mastered_count BIGINT,
  learning_count BIGINT,
  struggling_count BIGINT,
  current_xp INT,
  current_level INT,
  achievement_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(a.id)::BIGINT as total_attempts,
    AVG(a.accuracy)::NUMERIC as avg_accuracy,
    COUNT(CASE WHEN m.status = 'mastered' THEN 1 END)::BIGINT as mastered_count,
    COUNT(CASE WHEN m.status = 'learning' THEN 1 END)::BIGINT as learning_count,
    COUNT(CASE WHEN m.status = 'struggling' THEN 1 END)::BIGINT as struggling_count,
    c.xp as current_xp,
    c.level as current_level,
    COUNT(ca.id)::BIGINT as achievement_count
  FROM "ChildProfile" c
  LEFT JOIN "Attempt" a ON a."childId" = c.id
  LEFT JOIN "Mastery" m ON m."childId" = c.id
  LEFT JOIN "ChildAchievement" ca ON ca."childId" = c.id
  WHERE c.id = p_child_id
  GROUP BY c.id, c.xp, c.level;
END;
$$ LANGUAGE plpgsql;
```

**Update these API routes to use DB functions:**
- `/api/progress/summary` - Use DB aggregation instead of JS
- `/api/children/:id/stats` - Create new endpoint with DB-side stats

#### 2. Add Missing Indexes
Review query patterns and add indexes for:
- `Attempt` queries by childId + createdAt (for timeline)
- `Mastery` queries by childId + status (for filtering)
- `ChildAchievement` queries by childId + earnedAt (for recent achievements)

#### 3. Optimize N+1 Patterns
Check these routes for remaining N+1 issues:
- `/api/children` - Should eager load child stats
- `/api/progress/summary` - Should use single query

---

### Part B: Supabase Auth Migration (Mamoon's Feedback)

**CRITICAL:** This is a major change. Follow this EXACT sequence:

#### Step 1: Install Dependencies
```bash
npm install @supabase/ssr @supabase/supabase-js
npm uninstall @clerk/nextjs
```

#### Step 2: Update Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Remove Clerk vars:
```
# Remove these:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

#### Step 3: Database Migration for Auth
```sql
-- Add supabaseUserId, make clerkUserId optional for transition
ALTER TABLE "ParentUser" 
  ALTER COLUMN "clerkUserId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "supabaseUserId" UUID UNIQUE;

-- Create index
CREATE INDEX IF NOT EXISTS "ParentUser_supabaseUserId_idx" 
  ON "ParentUser"("supabaseUserId");
```

Update Prisma schema:
```prisma
model ParentUser {
  clerkUserId    String?  @unique  // Make optional for migration
  supabaseUserId String?  @unique  // Add Supabase ID
  // ... rest of fields
}
```

#### Step 4: Create Supabase Client Helpers

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

Create `lib/supabase/browser.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Step 5: Replace Auth Helpers

Update `lib/auth.ts`:
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const MAX_CHILDREN = 3;

export async function requireUserId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
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
```

#### Step 6: Update Middleware

Replace `middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/health",
  "/api-docs",
  "/architecture",
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isPublic = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

#### Step 7: Create Auth Callback Route

Create `app/auth/callback/route.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/demo";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
```

#### Step 8: Update Sign-In/Sign-Up Pages

Replace Clerk components with Supabase auth forms.

Example `app/sign-in/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/demo");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        
        {error && <p className="text-red-500">{error}</p>}
        
        <button 
          type="submit"
          className="w-full rounded bg-blue-500 px-3 py-2 text-white"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
```

#### Step 9: Update API Routes

Change all routes from:
```typescript
const { parent } = await requireParent();
```

To use the new auth (already done in `lib/auth.ts`).

Update `/api/me/route.ts` to use `supabaseUserId`:
```typescript
const parent = await prisma.parentUser.upsert({
  where: { supabaseUserId: userId },
  update: { /* ... */ },
  create: {
    supabaseUserId: userId,
    // ... other fields
  },
});
```

#### Step 10: Test Migration Path

For existing users with Clerk IDs:
1. They sign in with Supabase
2. Backend checks if `supabaseUserId` exists
3. If not, check `clerkUserId` and migrate:
   ```typescript
   // In requireParent()
   let parent = await prisma.parentUser.findUnique({
     where: { supabaseUserId: userId },
   });
   
   if (!parent) {
     // Try to find by old clerkUserId and migrate
     // This is optional - depends if you have existing users
   }
   ```

---

## Key Files to Modify

### Performance (Part A):
- Create: `prisma/migrations/XXX_add_progress_functions.sql`
- Update: `app/api/progress/summary/route.ts`
- Update: `app/api/children/route.ts`

### Auth Migration (Part B):
- Delete: `lib/auth.ts` (old Clerk version)
- Create: `lib/auth.ts` (new Supabase version)
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/browser.ts`
- Update: `middleware.ts`
- Create: `app/auth/callback/route.ts`
- Update: `app/sign-in/page.tsx`
- Update: `app/sign-up/page.tsx`
- Update: `app/api/me/route.ts`
- Update: `prisma/schema.prisma`

## DO NOT

- ❌ Do NOT delete the `clerkUserId` column (keep for migration)
- ❌ Do NOT skip the auth callback route (required for OAuth)
- ❌ Do NOT forget to update ALL API routes that use auth
- ❌ Do NOT use `getSession()` - always use `getUser()` for server-side
- ❌ Do NOT make all changes at once - do Part A first, test, then Part B

## Development Workflow

### For Part A (Performance):
1. Create SQL migration file
2. Run `npx prisma db push`
3. Update API routes to use new functions
4. Test with `npm run dev`
5. Verify build with `npm run build`

### For Part B (Auth Migration):
1. Install dependencies
2. Create Supabase helpers
3. Update one route at a time
4. Test each route before moving to next
5. Update sign-in/sign-up pages last
6. Full integration test

## Testing Commands

```bash
# After Part A
npm run build
npm run dev
curl http://localhost:3000/api/progress/summary?childId=xxx

# After Part B
npm run build
npm run dev
# Test sign-in flow in browser
# Test protected routes
# Test onboarding flow
```

## Success Criteria

### Part A:
- [ ] Progress summary uses DB function
- [ ] All aggregations happen in PostgreSQL
- [ ] New indexes added for common queries
- [ ] No N+1 query patterns remain
- [ ] Build passes

### Part B:
- [ ] Supabase auth works (sign-in/sign-up)
- [ ] Auth callback route handles OAuth
- [ ] Middleware protects routes correctly
- [ ] All API routes use new auth
- [ ] Parent records use `supabaseUserId`
- [ ] Build passes
- [ ] No Clerk dependencies remain

## Migration Checklist

- [ ] Part A: Create progress summary function
- [ ] Part A: Add missing indexes
- [ ] Part A: Update API routes to use DB aggregations
- [ ] Part A: Test and verify performance
- [ ] Part B: Install Supabase packages
- [ ] Part B: Create Supabase client helpers
- [ ] Part B: Update auth helpers
- [ ] Part B: Update middleware
- [ ] Part B: Create auth callback
- [ ] Part B: Update sign-in/sign-up
- [ ] Part B: Update all API routes
- [ ] Part B: Update schema for supabaseUserId
- [ ] Part B: Test full auth flow
- [ ] Commit changes
- [ ] Deploy and verify

## Important Notes

1. **Do Part A first, commit, test, then do Part B** - don't mix them
2. **Test auth thoroughly** - sign-in, sign-up, protected routes, API calls
3. **Keep clerkUserId column** for potential rollback/migration
4. **Use transactions** for any multi-step operations
5. **Add proper error handling** for auth failures

Good luck! This is a significant migration, so take it step by step.
