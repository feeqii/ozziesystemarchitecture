# Vercel + Supabase Postgres Deployment

This guide switches the demo from SQLite to Supabase Postgres and deploys to Vercel (Hobby). Clerk auth stays in place.

## 1) Create a Supabase project and get DATABASE_URL

1. Create a new project in Supabase and wait for provisioning to finish.
2. In Supabase, open **Project Settings -> Database -> Connection string**.
3. Copy the **Direct** (non-pooled) Postgres URI. It looks like:
   `postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require`
4. Keep the pooled connection string handy for Vercel runtime usage (if offered).

## 2) Set local environment variables

1. Set your local `.env` `DATABASE_URL` to the **Direct** Supabase URI.
2. Ensure Clerk env vars are set locally if you plan to test:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

## 3) Generate Prisma client

From the repo root:

```bash
npx prisma generate
```

## 4) Push schema to Supabase (demo workflow)

From the repo root:

```bash
npx prisma db push
```

We use `db push` for the demo because the Supabase database already has tables
and `migrate deploy` will fail with P3005 on a non-empty schema. For a production
workflow, we will reset or baseline the database and switch back to migrations.

## 5) Run the seed script against Supabase

```bash
npm run seed
```

The seed script is idempotent, so re-running it does not duplicate Surahs, verses, or words.

## 6) Verify tables in Supabase

Open **Table Editor** in Supabase and confirm these tables exist:
`ParentUser`, `ChildProfile`, `Surah`, `Verse`, `Word`, `Attempt`, `Mastery`.

## 7) Deploy to Vercel and set environment variables

1. Import the repo into Vercel and choose the default Next.js settings.
2. In Vercel project settings, add the environment variables below:

- `DATABASE_URL` = Supabase **pooled** Postgres URI (preferred for serverless runtime)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL` = `https://<your-vercel-domain>`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/demo`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/onboarding`

3. Deploy the project.

## 8) Update Clerk allowed origins and redirect URLs

In the Clerk dashboard:

1. Add your Vercel domain to **Allowed origins**:
   - `https://<your-vercel-domain>`
2. Add redirect URLs:
   - `https://<your-vercel-domain>/sign-in`
   - `https://<your-vercel-domain>/sign-up`
   - `https://<your-vercel-domain>/demo`
   - `https://<your-vercel-domain>/onboarding`

## Seed instructions (CLI only)

Do not add a public seed endpoint. To seed Supabase safely:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require" npm run seed
```

You can run this multiple times without duplicating rows.

## Troubleshooting

- **P3005 on migrate deploy**: The database is not empty. Use `npx prisma db push`
  for the demo. For production, reset or baseline and switch back to migrations.
- **IPv6 direct connection errors**: If the direct connection fails due to IPv6,
  use the pooled connection string for runtime and connect from a network that
  supports IPv4 for local `db push`/seed steps.
- **Seed fails after schema changes**: If you see type or missing field errors,
  run `npx prisma generate` to refresh the Prisma client before re-running the seed.
