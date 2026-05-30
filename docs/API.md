# API reference

Base URL: `http://localhost:8000` (dev) · `https://api.replyverse.app` (prod)

All authenticated endpoints expect:

```
Authorization: Bearer <supabase-access-token>
```

The access token comes from the frontend's Supabase session. The FastAPI layer
verifies it with `SUPABASE_JWT_SECRET`.

Errors follow `{ "detail": "<message>" }`.

---

## Health

| Method | Path     | Description              |
|--------|----------|--------------------------|
| GET    | `/`      | Service identity         |
| GET    | `/health`| Liveness probe (Railway) |

## Auth

| Method | Path             | Auth | Body                                          |
|--------|------------------|------|-----------------------------------------------|
| POST   | `/auth/register` | —    | `{ email, password, name? }`                  |
| POST   | `/auth/login`    | —    | `{ email, password }`                         |
| POST   | `/auth/google`   | —    | `{ id_token }` *(stub — use client SDK)*      |

> Most auth flows are run client-side via `supabase-js`; these endpoints are stubs for server-to-server extensions.

## Instagram

| Method | Path                              | Auth | Notes                                            |
|--------|-----------------------------------|------|--------------------------------------------------|
| GET    | `/instagram/connect`              | —    | Redirects to Instagram OAuth screen              |
| POST   | `/instagram/callback`             | ✓    | `{ code }` — exchanges + stores account          |
| GET    | `/instagram`                      | ✓    | List my connected accounts                       |
| GET    | `/instagram/{id}/media`           | ✓    | Posts & reels for that account                   |
| POST   | `/instagram/disconnect/{id}`      | ✓    | Mark account `revoked`                           |

## Automations

| Method | Path                                | Auth | Notes                          |
|--------|-------------------------------------|------|--------------------------------|
| GET    | `/automations`                      | ✓    | List my automations            |
| POST   | `/automations`                      | ✓    | Body: `AutomationIn`           |
| PUT    | `/automations/{id}`                 | ✓    | Body: `AutomationIn`           |
| DELETE | `/automations/{id}`                 | ✓    | 204                            |
| POST   | `/automations/{id}/pause`           | ✓    | Set status=paused              |
| POST   | `/automations/{id}/resume`          | ✓    | Set status=active              |

`AutomationIn`:

```jsonc
{
  "account_id": "uuid",
  "name": "Link in comments",
  "trigger_type": "comment",            // comment | story_reply | dm
  "post_id": "ig-media-id-or-null",     // null = any post
  "keywords": ["link", "drop"],
  "message": "Hey 👋 here's the link …",
  "cta_label": "Open",
  "cta_url": "https://example.com",
  "require_follow": false,
  "reply_publicly": true,
  "status": "active"                    // active | paused | draft
}
```

## Leads

| Method | Path             | Auth | Query                                                |
|--------|------------------|------|------------------------------------------------------|
| GET    | `/leads`         | ✓    | `?q=&keyword=&limit=&offset=` returns `{ data, total }` |
| POST   | `/leads/export`  | ✓    | Streams a CSV download                               |

## Analytics

| Method | Path           | Auth | Returns                                                       |
|--------|----------------|------|---------------------------------------------------------------|
| GET    | `/analytics`   | ✓    | Aggregate counts + top keywords/posts                         |

## Billing (Razorpay)

| Method | Path                       | Auth | Body                                                                      |
|--------|----------------------------|------|---------------------------------------------------------------------------|
| POST   | `/billing/create-order`    | ✓    | `{ plan: "starter"\|"pro"\|"agency", currency?: "USD" }` → returns order  |
| POST   | `/billing/verify-payment`  | ✓    | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`          |

## Webhook (Meta)

| Method | Path        | Description                                                        |
|--------|-------------|--------------------------------------------------------------------|
| GET    | `/webhook`  | Verification handshake. Echo `hub.challenge` if `verify_token` ok. |
| POST   | `/webhook`  | Event ingestion. Validated via `X-Hub-Signature-256`.              |

Subscribe in Meta App Dashboard to: **comments**, **messages**, **message_reactions**.
