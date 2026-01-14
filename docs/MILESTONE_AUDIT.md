# Milestone Audit (Status Matrix)

Status values: DONE / PARTIAL / MISSING. Evidence is limited to what exists in this repo.

## Milestone 3 (Backend + Content Structure)

| Requirement | Status | Evidence | How to verify | Notes |
| --- | --- | --- | --- | --- |
| Schema includes users/children/content/word progress/adaptive model | DONE | `prisma/schema.prisma` (ParentUser, ChildProfile, Surah, Verse, Word, Attempt, Mastery) | Open `prisma/schema.prisma` or run `npm run prisma:studio` | Uses SQLite dev DB by default. |
| Content architecture Surah → Verse → Word with IDs | DONE | `prisma/schema.prisma`, `app/api/content/surahs/[id]/route.ts` | GET `/api/content/surahs/1` after seeding | Word IDs come from Quran API seed. |
| Seeded content: 2 Surahs with Arabic+tashkeel+translation+transliteration+audio refs | DONE | `scripts/seed-quran.ts`, `prisma/schema.prisma` | `npm run seed`, then GET `/api/content/surahs/1` and `/api/content/surahs/112` | Verse transliteration is built from word transliteration; audio refs are per word. |
| APIs functional (create user/me, add child, save progress, retrieve content, audio refs) | DONE | `app/api/me/route.ts`, `app/api/children/route.ts`, `app/api/progress/attempt/route.ts`, `app/api/content/surahs/[id]/route.ts` | Use Postman collection or Swagger UI `/api-docs` | `/api/me` requires Clerk session. |
| Postman collection exists and matches endpoints | DONE | `postman/ozzie-m3-m4.postman_collection.json`, `openapi/openapi.yaml` | Import Postman collection; compare to `/api-docs` | Uses placeholder IDs. |
| Local caching/offline queue + sync conflict strategy | PARTIAL | `app/(demo)/demo/page.tsx`, `app/api/progress/sync/route.ts`, `prisma/schema.prisma` | Toggle Offline mode in `/demo`, queue attempts, sync | Dedupe via `deviceAttemptId` only; no broader conflict strategy documented. |
| Data validation rejects invalid inputs with clear errors | PARTIAL | `lib/validation.ts`, `app/api/children/route.ts`, `app/api/progress/attempt/route.ts`, `app/api/progress/sync/route.ts` | Send invalid payloads to the endpoints above | Validation exists for some endpoints; error messaging is minimal and not documented. |
| Migration strategy documented (versioning + rollback) | MISSING | None | N/A | Only migrations exist; no written strategy. |
| Backup/disaster recovery documented (+ restoration steps) | MISSING | None | N/A | Not documented. |
| Security basics documented (access patterns, secure data) | PARTIAL | `middleware.ts`, `lib/auth.ts`, `lib/children.ts` | Sign out and try `/demo`; attempt cross‑child IDs with two accounts | Enforcement exists but no written security documentation. |
| Error handling/logging documented | PARTIAL | API routes return error JSON (e.g. `app/api/progress/attempt/route.ts`) | Send invalid payloads; observe error responses | No logging strategy or doc. |
| Performance note (<500ms @100 users + 10k concurrency explanation) | MISSING | None | N/A | Not documented. |

## Milestone 4 (Auth + Profiles)

| Requirement | Status | Evidence | How to verify | Notes |
| --- | --- | --- | --- | --- |
| Parent registration/login (email/password) | PARTIAL | `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `app/layout.tsx` | Use `/sign-up` with email/password if enabled in Clerk | Depends on Clerk dashboard settings; not documented in repo. |
| Google Sign‑in implemented | PARTIAL | `app/sign-in/[[...sign-in]]/page.tsx` | Confirm Google button appears on Clerk UI | Requires Clerk dashboard configuration. |
| Apple Sign‑in implemented | MISSING | None | N/A | Not configured or documented. |
| Email verification | PARTIAL | Clerk UI via `/sign-up` | Sign up and verify if enabled in Clerk | No config or testing instructions in repo. |
| Password reset flow | MISSING | None | N/A | Not implemented or documented in the app UI. |
| Account recovery procedure documented | MISSING | None | N/A | Not documented. |
| Parent DOB capture + adult validation | DONE | `app/onboarding/page.tsx`, `app/api/me/route.ts` | Submit DOB under 18 and expect a 400 error | Age check enforced on API. |
| COPPA consent capture (verifiable vs checkbox) | PARTIAL | `app/onboarding/page.tsx`, `app/api/me/route.ts` | Submit onboarding with checkbox | Consent is a checkbox only; not verifiable. |
| Child profile creation (max 3) + profile editing | PARTIAL | `app/api/children/route.ts`, `lib/auth.ts`, `app/(demo)/demo/page.tsx` | Create 4th child to see error; no edit UI | Editing not implemented. |
| Profile data isolation enforced | DONE | `lib/auth.ts`, `lib/children.ts`, `app/api/progress/*` | Try accessing another childId with a different parent account | Requires multi‑account test. |
| Session handling documented (logout + token lifecycle) | PARTIAL | `middleware.ts`, `app/(demo)/layout.tsx` (Clerk `UserButton`) | Sign out; confirm redirect to `/sign-in` | Clerk handles sessions, but no documentation here. |
| Security testing documented (rate limit/brute force/reset) | MISSING | None | N/A | Not documented. |
| Account deletion fully implemented + data purge verified | PARTIAL | `app/api/account/delete/route.ts`, `prisma/schema.prisma` | POST `/api/account/delete`, then check `/api/children` | No UI or documentation of deletion timeline. |
