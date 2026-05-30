# ReplyVerse

> **Turn Instagram comments into customers — automatically.**

ReplyVerse is a production-ready SaaS platform that automates Instagram comment→DM conversations using the Meta Graph API and Instagram Webhooks. When a follower comments a keyword like `link`, `price`, or `details` on a post or reel, ReplyVerse instantly delivers a personalized DM, captures the lead, and tracks the conversion.

Built for creators, coaches, agencies, and businesses who want to scale engagement without scaling headcount.

---

## ✨ Features

- **Comment-to-DM automation** — listens to every comment via Meta Webhooks and auto-replies in under 3 seconds
- **Story reply automation** — turn story replies into qualified leads
- **Keyword triggers** — unlimited exact and fuzzy keyword matches per post
- **AI smart replies** — context-aware DM generation
- **Lead collection** — capture email, phone, and notes inside the DM thread
- **Analytics dashboard** — comments, DMs, leads, conversion, revenue charts
- **Multi-account support** — manage every brand under one workspace
- **Team collaboration** — invite teammates with roles
- **Razorpay billing** — Free, Starter, Pro, Agency plans

## 🧱 Tech stack

| Layer | Stack |
|------|------|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS · Shadcn UI · Framer Motion · TanStack Query |
| Backend | FastAPI · Python 3.11 · Pydantic v2 · httpx |
| Database & Auth | **Supabase** (Postgres + Row Level Security + Auth + Storage) |
| Payments | Razorpay |
| Instagram | Meta Graph API · Instagram Messaging API · Meta Webhooks |
| Deploy | Vercel (frontend) · Railway (backend) · Supabase (cloud) |

> **Note on the original spec:** the brief called for Firebase. Per the user's instruction, **Supabase replaces Firebase** for the database, auth, storage, and realtime — every collection has a corresponding Postgres table with row-level-security policies.

## 🗂 Project structure

```
replyverse/
├── frontend/              # Next.js 15 App Router
│   ├── app/
│   │   ├── (marketing)/   # Landing page (route group)
│   │   ├── (auth)/        # Login, register, forgot password
│   │   ├── dashboard/     # Authenticated app shell + screens
│   │   └── api/           # Edge route handlers (Razorpay verify, webhook proxy)
│   ├── components/
│   │   ├── landing/       # Hero, Features, Pricing, FAQ, etc.
│   │   ├── dashboard/     # Sidebar, Topbar, screens
│   │   ├── ui/            # Shadcn-style primitives
│   │   └── shared/        # Icons, charts, logo
│   ├── lib/               # Supabase client, API client, utils
│   └── hooks/             # React Query hooks
├── backend/               # FastAPI service
│   └── app/
│       ├── main.py
│       ├── routes/        # auth, instagram, automations, leads, analytics, billing, webhook
│       ├── services/      # supabase, instagram, razorpay, ai
│       ├── webhooks/      # Meta webhook handler & dispatcher
│       ├── models/        # Pydantic schemas
│       └── utils/         # security, rate_limit, logger
├── supabase/
│   └── migrations/        # SQL schema + RLS policies
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
└── README.md              # this file
```

## 🚀 Quick start

### 1. Prerequisites

- Node.js 20+
- Python 3.11+
- A free [Supabase](https://supabase.com) project
- A Meta Developer app with Instagram Graph API permissions
- A Razorpay account (test mode is fine)

### 2. Clone & install

```bash
git clone <repo> replyverse
cd replyverse

# Frontend
cd frontend
cp .env.example .env.local
npm install

# Backend
cd ../backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Set up Supabase

```bash
# In the Supabase SQL editor, run:
supabase/migrations/0001_init.sql
supabase/migrations/0002_rls.sql
```

Or via the Supabase CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

### 4. Run locally

```bash
# Terminal 1 — frontend (http://localhost:3000)
cd frontend && npm run dev

# Terminal 2 — backend (http://localhost:8000)
cd backend && uvicorn app.main:app --reload
```

### 5. Configure the Meta webhook

Point Meta's webhook to `https://<your-backend>/webhook` with verify token `META_VERIFY_TOKEN` from `.env`. Subscribe to `comments` and `messages` fields on the Instagram object.

## 📚 More

- **[Architecture](docs/ARCHITECTURE.md)** — request lifecycle, data model, security model
- **[API reference](docs/API.md)** — every FastAPI route
- **[Deployment](docs/DEPLOYMENT.md)** — Vercel, Railway, Supabase, Meta app review

## 🎨 Design

The UI is implemented from a high-fidelity prototype (Poppins, indigo→purple→teal gradient palette `#5B5FF8 / #7C3AED / #00C2A8`, soft shadows, glassmorphic floating cards). The design language matches the look and feel of LinkPlease / Linear / Stripe for a premium creator-tool aesthetic.

## 📄 License

MIT
