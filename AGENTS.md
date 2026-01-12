# Ozzie Milestone 3+4 Demo Portal (Spec)

Goal: Ship a deployable web demo that proves Milestone 3 (backend + content structure) and Milestone 4 (auth + profiles) end-to-end. review @milestonedeets for all the relevant information about the project 

Stack:
- Next.js App Router (TypeScript)
- shadcn/ui + tailwind
- React Bits components (minimal, only key moments)
- Clerk auth (email + Google; Apple if enabled)
- Prisma + Postgres (SQLite acceptable for local dev)
- REST endpoints via Next route handlers
- OpenAPI + Postman collection included

Core entities:
ParentUser (clerkUserId, dob, consentAt)
ChildProfile (parentId, name, age, avatar)
Surah, Verse, Word (word-level IDs)
Attempt (childId, wordId, accuracy, createdAt, deviceAttemptId)
Mastery (childId, wordId, status, streak, lastAttemptAt)

Must-have flows:
1) Auth -> onboarding (DOB + COPPA consent) -> child create/select -> content fetch -> submit attempt -> progress dashboard
2) Offline queue: if offline, store attempts locally; when online, sync with idempotency via deviceAttemptId.

Endpoints:
GET /api/health
GET/POST /api/me
GET/POST /api/children
GET /api/content/surahs
GET /api/content/surahs/:id
POST /api/progress/attempt
POST /api/progress/sync
GET /api/progress/summary?childId=...
POST /api/account/delete

Seed:
scripts/seed-quran.ts fetches Surah 1 and 112 from QuranFoundation APIs and inserts verses/words into DB.

Deliverables:
- /api-docs Swagger UI
- postman collection
- docs/MILESTONE3_REVIEW.md and docs/MILESTONE4_REVIEW.md
