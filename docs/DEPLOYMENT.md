# Deployment

## 1. Supabase (database, auth, storage)

1. Create a new project at https://supabase.com.
2. SQL editor → run `supabase/migrations/0001_init.sql` then `0002_rls.sql`.
3. **Authentication → Providers**:
   - Enable **Email**. Disable confirm-email only if you trust your domain MX.
   - Enable **Google**. Create an OAuth client in Google Cloud (callback `https://<project>.supabase.co/auth/v1/callback`) and paste client id/secret.
4. **Project Settings → API**:
   - Copy `URL`, `anon key`, `service_role key`, **JWT secret**.

## 2. Backend on Railway

1. New project → "Deploy from GitHub repo".
2. Point at `backend/`.
3. Add these environment variables (from `.env.example`):

   ```
   SUPABASE_URL=…
   SUPABASE_ANON_KEY=…
   SUPABASE_SERVICE_ROLE_KEY=…
   SUPABASE_JWT_SECRET=…
   META_APP_ID=…
   META_APP_SECRET=…
   META_VERIFY_TOKEN=replyverse-webhook-verify
   META_REDIRECT_URI=https://app.replyverse.app/dashboard/accounts/callback
   RAZORPAY_KEY_ID=…
   RAZORPAY_KEY_SECRET=…
   FRONTEND_URL=https://app.replyverse.app
   ALLOWED_ORIGINS=https://app.replyverse.app
   ENVIRONMENT=production
   ```

4. Railway auto-detects `requirements.txt` and uses the `Procfile` / `railway.json` start command. Health check is `/health`.
5. Note the public URL — e.g. `https://replyverse.up.railway.app`.

## 3. Frontend on Vercel

1. Import the repo and select the `frontend/` directory.
2. Framework: **Next.js**. Build command: `npm run build`. Output: `.next`.
3. Environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   NEXT_PUBLIC_API_URL=https://replyverse.up.railway.app
   NEXT_PUBLIC_APP_URL=https://app.replyverse.app
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_…
   NEXT_PUBLIC_META_APP_ID=…
   NEXT_PUBLIC_META_REDIRECT_URI=https://app.replyverse.app/dashboard/accounts/callback
   ```

4. Configure a custom domain (`app.replyverse.app`) and verify HTTPS.
5. In Supabase **Auth → URL Configuration**:
   - Site URL: `https://app.replyverse.app`
   - Additional redirects: `https://app.replyverse.app/auth/callback`

## 4. Meta app configuration

1. Create a Meta app (Business type) at https://developers.facebook.com/apps.
2. Add the **Instagram Graph API** product.
3. Configure OAuth redirect URIs (must match `META_REDIRECT_URI`).
4. **Webhooks → Instagram** → subscribe to `comments`, `messages`.
   Callback URL: `https://replyverse.up.railway.app/webhook`
   Verify token: same as `META_VERIFY_TOKEN`.
5. Submit for App Review with the following permissions:
   - `instagram_basic`
   - `instagram_manage_comments`
   - `instagram_manage_messages`
   - `pages_show_list`

## 5. Razorpay

1. Generate API keys (test then live).
2. In the dashboard → **Webhooks**, set the URL to `https://replyverse.up.railway.app/billing/webhook` (extend `app/routes/billing.py` if you add async webhook flows).

## 6. DNS

- `replyverse.app` → marketing (could also point to Vercel)
- `app.replyverse.app` → Vercel
- `api.replyverse.app` → Railway

## 7. Smoke test

```bash
curl https://replyverse.up.railway.app/health
# → {"status":"ok"}

curl -X POST https://replyverse.up.railway.app/automations \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"account_id":"…","name":"Test","keywords":["link"],"message":"Hi!"}'
```

## 8. Observability

- Railway: logs + metrics built-in.
- Vercel: Speed Insights + Edge logs.
- Supabase: log explorer + advisors.
- Add Sentry by setting `SENTRY_DSN` in both services (optional).
