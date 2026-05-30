# ReplyVerse · Backend

FastAPI service that powers authentication helpers, automations CRUD, Instagram OAuth + Send API, lead capture, analytics aggregation, Razorpay checkout, and the **Meta webhook pipeline**.

## Local dev

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit:

- http://localhost:8000/docs — Swagger UI
- http://localhost:8000/redoc — Redoc

## Layout

```
app/
  main.py           — FastAPI app factory + middleware
  config.py         — pydantic-settings
  routes/           — REST endpoints (auth, instagram, automations, …)
  services/         — supabase, instagram, razorpay clients
  models/schemas.py — Pydantic v2 schemas
  webhooks/meta.py  — Meta webhook verification + dispatcher
  utils/security.py — JWT decode + auth dependency
```

## Authentication

The frontend authenticates users via Supabase. Every authenticated request to this
backend must include:

```
Authorization: Bearer <supabase access token>
```

`app/utils/security.py::get_current_user_id` validates the JWT (HS256, audience
`authenticated`) using `SUPABASE_JWT_SECRET` and returns the `sub` (= `auth.users.id`).

## Webhook flow

1. Meta verifies our endpoint via `GET /webhook?hub.mode=subscribe&hub.verify_token=…&hub.challenge=…`
2. Comment / DM events arrive at `POST /webhook` with `X-Hub-Signature-256`.
3. We verify the signature using `META_APP_SECRET`, ACK in <5s, and process in a background task.
4. The handler resolves the IG account → automation → sends the DM → writes `comments`, `messages`, optional `leads`.

To re-process events, simply re-post them to `/webhook` with a valid signature.

## Razorpay

- `POST /billing/create-order` creates an order and records it in `payments`.
- `POST /billing/verify-payment` validates the signature, marks the payment captured, upserts the subscription, and bumps `users.plan`.

## Deployment

See `../docs/DEPLOYMENT.md`. Both Procfile and Dockerfile are included; Railway will use the Procfile.
