# Architecture

## System diagram

```
┌────────────────────────┐         ┌────────────────────────┐
│  Next.js 15 (Vercel)   │ ─HTTPS─►│   FastAPI (Railway)    │
│  App Router + RSC      │◄───────┤   Python 3.11           │
│  Tailwind, Shadcn UI   │         │                        │
└─────────┬──────────────┘         └──────────┬─────────────┘
          │                                   │
          │ supabase-js  (auth + RLS queries) │ supabase-py (service role)
          ▼                                   ▼
        ┌──────────────────────────────────────────────────┐
        │             Supabase (Postgres + Auth)           │
        │  - public.users / accounts / automations …       │
        │  - Row Level Security on every table             │
        │  - Storage bucket: media-cache                   │
        └──────────────────────────────────────────────────┘
                                ▲
                                │ webhook  (POST /webhook)
                                │
                        ┌───────┴────────┐
                        │   Meta Graph   │
                        │  + Instagram   │
                        │  Messaging API │
                        └────────────────┘
```

## Request lifecycle: comment → DM → lead

1. Follower comments `link` on a reel.
2. Meta sends a webhook to `POST https://api.replyverse.app/webhook` (X-Hub-Signature-256 verified).
3. FastAPI acknowledges within 5s and dispatches the work to a background task.
4. The handler:
   - Looks up the Instagram account by `ig_user_id` → resolves to a ReplyVerse `user_id`.
   - Finds an active automation matching the post and any keyword.
   - Inserts a row into `comments`.
   - Calls Instagram's Send API with the configured DM body (including CTA link).
   - Inserts a row into `messages` and increments `automations.dms_sent`.
   - If the follower later replies with an email/phone, a row is inserted into `leads`.
5. The dashboard reads aggregated counts from these tables via Supabase queries (RLS-scoped) and via `/analytics`.

## Why Supabase instead of Firebase

The user explicitly requested Supabase. The mapping is straightforward:

| Firebase concept   | Supabase equivalent              |
|--------------------|----------------------------------|
| Firestore document | Postgres row                     |
| Collection         | Table                            |
| Security rules     | RLS policy                       |
| Auth               | `auth.users` + JWT (HS256)       |
| Storage            | Storage bucket                   |
| Analytics          | Postgres aggregates + dashboards |

Benefits we leveraged:
- **Native SQL** — joins between accounts/automations/leads instead of denormalized writes
- **Row Level Security** — declarative `auth.uid() = user_id` policies replace imperative rules
- **HS256 JWTs** — FastAPI verifies them with a single shared secret (`SUPABASE_JWT_SECRET`)
- **Single hosted Postgres** — simpler ops than Firestore + indexed reads

## Authentication

- Client uses `supabase-js` (`@supabase/ssr` for the App Router).
- Email/password and Google OAuth are configured in the Supabase Auth settings.
- The session is stored in cookies; `middleware.ts` refreshes it on every request.
- FastAPI verifies the JWT (`HS256`, audience `authenticated`) via `SUPABASE_JWT_SECRET` — see `app/utils/security.py`.

## Data model

See `supabase/migrations/0001_init.sql` and `0002_rls.sql`. All tables include `user_id uuid references public.users(id)` and have an RLS policy `auth.uid() = user_id`. Webhook writes from FastAPI bypass RLS by using the service-role key.

## Security model

- Every public endpoint requires a Supabase JWT (`Bearer <access_token>`).
- Webhooks are validated via `X-Hub-Signature-256` (HMAC-SHA256 of body with `META_APP_SECRET`).
- Razorpay payment confirmations are validated via `verify_payment_signature`.
- Rate limiting: 120 req/min/IP by default (SlowAPI), per-route overrides available.
- CORS allowlist via `ALLOWED_ORIGINS`.
- Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, etc.) are added by middleware in both Next.js and FastAPI.
- Instagram access tokens are stored in `instagram_accounts.access_token` — wrap in **Supabase Vault** (or `pgcrypto`) in production.

## Scalability

- Webhook handler is fully async and returns 200 immediately; heavy work is deferred to background tasks.
- For high volume, swap `BackgroundTasks` for a queue (e.g. Upstash QStash or Redis + RQ) without changing the handler shape.
- Reading is RLS-scoped and indexed by `user_id`; for very large tenants, partition `leads`/`comments` by `user_id`.
- Frontend uses TanStack Query for caching and revalidation; static marketing routes are server-rendered.
