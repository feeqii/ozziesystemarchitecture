# Phase 3 Part B Implementation Plan - Supabase Auth Migration

## Overview
Migrating from Clerk to Supabase Auth - a major authentication system change.

## Current State
- ✅ Supabase credentials already in `.env.local`
- ✅ Database is Supabase PostgreSQL
- ✅ Clerk currently handling auth
- ✅ `supabaseUserId` column already exists in ParentUser schema

## Implementation Sequence

### Step 1: Install Supabase Packages ✅
```bash
npm install @supabase/ssr @supabase/supabase-js
npm uninstall @clerk/nextjs
```

### Step 2: Update Prisma Schema
- Make `clerkUserId` optional (for migration)
- Ensure `supabaseUserId` is properly indexed
- Run `npx prisma db push`

### Step 3: Create Supabase Client Helpers
- Create `lib/supabase/server.ts` - Server-side client
- Create `lib/supabase/browser.ts` - Client-side client

### Step 4: Update Auth Helpers
- Replace `lib/auth.ts` - Use Supabase instead of Clerk
- Update `requireUserId()` and `requireParent()`

### Step 5: Update Middleware
- Replace `middleware.ts` - Use Supabase auth check
- Keep same public routes

### Step 6: Create Auth Callback Route
- Create `app/auth/callback/route.ts` - Handle OAuth callbacks

### Step 7: Create Sign-In/Sign-Up Pages
- Replace `app/sign-in/[[...sign-in]]/page.tsx`
- Create `app/sign-up/page.tsx` (if doesn't exist)
- Build custom forms with Supabase auth

### Step 8: Update API Routes
- Update `app/api/me/route.ts` - Use `supabaseUserId`
- Verify all other routes use `requireParent()` (they should)

### Step 9: Remove Clerk Dependencies
- Remove Clerk imports
- Clean up any Clerk-specific code

### Step 10: Test Everything
- Build test
- Auth flow test
- API endpoints test

## Critical Notes
- ❌ Do NOT delete `clerkUserId` column (keep for potential rollback)
- ✅ Test thoroughly before deploying
- ✅ All API routes already use `requireParent()` so they'll work automatically
- ✅ Supabase credentials already configured

## Files to Create
1. `lib/supabase/server.ts`
2. `lib/supabase/browser.ts`
3. `app/auth/callback/route.ts`
4. `app/sign-up/page.tsx` (new)

## Files to Modify
1. `prisma/schema.prisma`
2. `lib/auth.ts`
3. `middleware.ts`
4. `app/sign-in/[[...sign-in]]/page.tsx`
5. `app/api/me/route.ts`
6. `package.json` (via npm uninstall)

## Testing Checklist
- [ ] Build passes
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect to sign-in
- [ ] Public routes accessible
- [ ] API routes work with new auth
- [ ] Onboarding flow works
- [ ] Child profiles work

## Rollback Plan
If something goes wrong:
1. Revert git commits
2. Reinstall Clerk: `npm install @clerk/nextjs`
3. Restore old files from git

Ready to implement!
