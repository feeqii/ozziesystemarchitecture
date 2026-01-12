# Milestone 4 Review (Auth + Profiles)

## Authentication
- Clerk provider setup: `app/layout.tsx`
- Clerk sign-in + sign-up routes: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- Route protection for demo + onboarding: `middleware.ts`
- Email verification, password reset, and account recovery handled by Clerk UI: `app/sign-in/[[...sign-in]]/page.tsx`
- Social login (Google/Apple) configured in Clerk dashboard, surfaced in Clerk UI.

## Parent onboarding (DOB + COPPA consent)
- Onboarding UI + consent capture: `app/onboarding/page.tsx`
- Parent profile persistence: `app/api/me/route.ts`

## Child profiles
- Create/list children (max 3): `app/api/children/route.ts`, `lib/auth.ts`
- Child profile UI: `app/(demo)/demo/page.tsx`

## Profile isolation & security
- Parent + child ownership checks: `lib/auth.ts`, `lib/children.ts`
- Progress endpoints enforce parent/child isolation: `app/api/progress/attempt/route.ts`, `app/api/progress/sync/route.ts`, `app/api/progress/summary/route.ts`

## Account deletion
- Delete parent + cascade child data: `app/api/account/delete/route.ts`
