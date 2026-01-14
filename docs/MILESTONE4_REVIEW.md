# Milestone 4 Review (Auth + Profiles)

## Authentication
- Clerk provider setup: `app/layout.tsx`
- Clerk sign-in + sign-up routes: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- Route protection for demo + onboarding: `middleware.ts`
- Email verification, password reset, and account recovery are provided by Clerk when enabled in the Clerk dashboard; not configured or documented in this repo.
- Social login (Google/Apple) can be enabled in Clerk dashboard; not verified in this repo.

## Parent onboarding (DOB + COPPA consent)
- Onboarding UI + consent capture: `app/onboarding/page.tsx`
- Parent profile persistence: `app/api/me/route.ts`

## Child profiles
- Create/list children (max 3): `app/api/children/route.ts`, `lib/auth.ts`
- Child profile UI (create/select only, no editing yet): `app/(demo)/demo/page.tsx`

## Profile isolation & security
- Parent + child ownership checks: `lib/auth.ts`, `lib/children.ts`
- Progress endpoints enforce parent/child isolation: `app/api/progress/attempt/route.ts`, `app/api/progress/sync/route.ts`, `app/api/progress/summary/route.ts`

## Account deletion
- Delete parent + cascade child data via API (no UI flow yet): `app/api/account/delete/route.ts`
