# Vercel + Supabase Postgres Deployment

This guide switches the demo from SQLite to Supabase Postgres and deploys to Vercel (Hobby). Clerk auth stays in place.

## 1) Create a Supabase project and get DATABASE_URL

1. Create a new project in Supabase and wait for provisioning to finish.
2. In Supabase, open **Project Settings -> Database -> Connection string**.
3. Copy the **Direct** (non-pooled) Postgres URI. It looks like:
   `postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require`
4. Keep the pooled connection string handy for Vercel runtime usage (if offered).

## 2) Configure Prisma for Postgres

1. Confirm `prisma/schema.prisma` uses `provider = "postgresql"`.
2. Set your local `.env` `DATABASE_URL` to the **Direct** Supabase URI.
   - This is the safest string for migrations and seeding.

## 3) Run Prisma migrations against Supabase

From the repo root:

```bash
npx prisma migrate deploy
```

This applies the existing migrations to Supabase.

## 4) Run the seed script against Supabase

From the repo root (with `DATABASE_URL` still pointing at Supabase):

```bash
npm run seed
```

The seed script is idempotent, so re-running it does not duplicate Surahs, verses, or words.

## 5) Deploy to Vercel and set environment variables

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

## 6) Update Clerk allowed origins and redirect URLs

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

## Common errors

- **Prisma migrate fails with P1001 / timeout**: The database is not reachable. Double-check the Supabase host, password, and that you are using the Direct (non-pooled) connection string for migrations.
- **Prisma migrate fails with connection closed / P1017**: You are likely using a pooled connection string for migrations. Switch `DATABASE_URL` to the Direct connection string and retry.
- **Invalid connection string**: Ensure the URI starts with `postgresql://` and includes `sslmode=require`.
- **Clerk redirect errors ("redirect URL not allowed")**: Add the Vercel domain to Clerk Allowed Origins and include the sign-in/sign-up/demo/onboarding URLs in Redirect URLs.
