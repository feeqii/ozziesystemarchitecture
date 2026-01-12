# Milestone 3 Review (Backend + Content Structure)

## Data model & schema
- Prisma schema for ParentUser, ChildProfile, Surah, Verse, Word, Attempt, Mastery: `prisma/schema.prisma`
- Migration + SQLite dev database: `prisma/migrations`, `dev.db`

## Content architecture
- Surah/Verse/Word tables with word-level IDs and audio URLs: `prisma/schema.prisma`
- Seed script pulls Surah 1 + 112 from Quran Foundation API: `scripts/seed-quran.ts`

## REST API
- Health check: `app/api/health/route.ts`
- Content listing + detail: `app/api/content/surahs/route.ts`, `app/api/content/surahs/[id]/route.ts`
- Progress attempt + sync + summary: `app/api/progress/attempt/route.ts`, `app/api/progress/sync/route.ts`, `app/api/progress/summary/route.ts`

## Adaptive learning data model
- Attempts and mastery tracking in schema: `prisma/schema.prisma`
- Mastery status + streak updates: `lib/progress.ts`

## Offline queue + sync
- Offline queue and sync UX: `app/(demo)/demo/page.tsx`
- Idempotency via deviceAttemptId: `app/api/progress/attempt/route.ts`, `app/api/progress/sync/route.ts`

## API documentation & tooling
- OpenAPI spec: `openapi/openapi.yaml`
- Swagger UI: `app/api-docs/page.tsx`, `app/api-docs/openapi/route.ts`
- Postman collection: `postman/ozzie-m3-m4.postman_collection.json`
