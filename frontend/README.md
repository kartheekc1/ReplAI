# ReplyVerse · Frontend

Next.js 15 App Router app for the ReplyVerse marketing site + authenticated dashboard.

## Stack

- **Next.js 15** with the App Router
- **TypeScript** strict mode
- **Tailwind CSS** + custom design tokens
- **Shadcn-style** UI primitives in `components/ui/`
- **Framer Motion** for hero animations
- **TanStack Query** for server state
- **Supabase JS** for auth + realtime
- **Razorpay Checkout** for payments

## Layout

```
app/
  (marketing)/    — landing page + footer (route group, no layout chrome)
  (auth)/         — login, register, forgot-password
  auth/callback   — Supabase OAuth code exchange
  dashboard/      — authenticated app shell + screens
  api/            — Edge route handlers (extend as needed)
components/
  landing/        — Hero, Features, Pricing, FAQ, etc.
  dashboard/      — Sidebar, Topbar, screens
  ui/             — Button, Card, Input, Dialog, Tabs … (Shadcn-style)
  shared/         — Logo, charts, providers
lib/
  supabase/       — browser + server clients, generated types
  api.ts          — typed fetch wrapper for the FastAPI backend
  utils.ts        — cn(), formatters
middleware.ts     — refresh session + protect /dashboard
```

## Local dev

```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build && npm start
```

## Notes

- The landing page mirrors the Hi-Fi prototype in `/tmp/replyverse-design` — typography (Poppins), gradient `#5B5FF8 → #7C3AED → #00C2A8`, glassmorphic floating cards over the hero mockup, soft shadows, large spacing.
- The dashboard uses the same tokens for visual continuity.
- All authenticated calls go through `lib/api.ts`, which attaches the Supabase access token automatically.
