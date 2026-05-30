# Environment variables — cheat sheet

## Frontend (`frontend/.env.local`)

| Name | Required | Notes |
|------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Anon key — exposed to the browser, safe (RLS protects data) |
| `NEXT_PUBLIC_API_URL` | ✓ | FastAPI base URL |
| `NEXT_PUBLIC_APP_URL` | ✓ | This app's public URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✓ | Razorpay key id (public) |
| `NEXT_PUBLIC_META_APP_ID` | ✓ | Meta app id for OAuth |
| `NEXT_PUBLIC_META_REDIRECT_URI` | ✓ | OAuth callback in our app |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Only if you add server-only Route Handlers that need to bypass RLS |

## Backend (`backend/.env`)

| Name | Required | Notes |
|------|----------|-------|
| `SUPABASE_URL` | ✓ | Same as frontend |
| `SUPABASE_ANON_KEY` | ✓ | Used for end-user JWT verification fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Server-only write access (bypasses RLS) — **never commit** |
| `SUPABASE_JWT_SECRET` | ✓ | Used to verify access tokens |
| `META_APP_ID` | ✓ | |
| `META_APP_SECRET` | ✓ | Used to verify webhook signatures + token exchange |
| `META_VERIFY_TOKEN` | ✓ | Echoed back during webhook handshake |
| `META_REDIRECT_URI` | ✓ | Must match the frontend's value |
| `RAZORPAY_KEY_ID` | ✓ | |
| `RAZORPAY_KEY_SECRET` | ✓ | Used to verify payment signatures |
| `FRONTEND_URL` | ✓ | Used for CORS allowlist |
| `ALLOWED_ORIGINS` | ✓ | Comma-separated CORS origins |
| `RATE_LIMIT_DEFAULT` | — | Default `120/minute` |
