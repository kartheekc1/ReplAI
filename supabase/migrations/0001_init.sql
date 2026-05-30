-- ReplyVerse — initial schema
-- Apply via:  supabase db push   (or paste into the SQL editor)

create extension if not exists "pgcrypto";

-- ───────────────────────── Enums ─────────────────────────
do $$ begin
  create type plan_tier as enum ('free', 'starter', 'pro', 'agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type automation_status as enum ('active', 'paused', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type automation_trigger_type as enum ('comment', 'story_reply', 'dm');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_status as enum ('queued', 'sent', 'delivered', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ig_account_status as enum ('connected', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'cancelled', 'past_due', 'trialing');
exception when duplicate_object then null; end $$;

-- ───────────────────────── Users ─────────────────────────
-- Mirrors `auth.users`. Filled by the trigger below on signup.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text,
  avatar_url  text,
  plan        plan_tier not null default 'free',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Instagram accounts ─────────────────────────
create table if not exists public.instagram_accounts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  ig_user_id          text unique not null,
  username            text not null,
  followers           int  not null default 0,
  profile_picture_url text,
  access_token        text not null,                 -- encrypt at rest via Supabase Vault in prod
  token_expires_at    timestamptz,
  status              ig_account_status not null default 'connected',
  connected_at        timestamptz not null default now()
);

create index if not exists idx_ig_accounts_user on public.instagram_accounts(user_id);
create index if not exists idx_ig_accounts_ig_id on public.instagram_accounts(ig_user_id);

-- ───────────────────────── Automations ─────────────────────────
create table if not exists public.automations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  account_id      uuid not null references public.instagram_accounts(id) on delete cascade,
  name            text not null,
  trigger_type    automation_trigger_type not null default 'comment',
  post_id         text,                              -- null = applies to all posts
  keywords        text[] not null default '{}',
  message         text not null,
  cta_label       text,
  cta_url         text,
  require_follow  boolean not null default false,
  reply_publicly  boolean not null default true,
  status          automation_status not null default 'active',
  dms_sent        int  not null default 0,
  leads_captured  int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_automations_user on public.automations(user_id);
create index if not exists idx_automations_post on public.automations(post_id);

-- ───────────────────────── Comments (webhook ingest log) ─────────────────────────
create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  automation_id   uuid references public.automations(id) on delete set null,
  ig_comment_id   text unique,
  media_id        text,
  username        text not null,
  comment         text,
  matched_keyword text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_comments_user on public.comments(user_id);

-- ───────────────────────── Messages (outgoing DMs) ─────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  automation_id   uuid references public.automations(id) on delete set null,
  recipient       text not null,           -- username
  recipient_id    text,                    -- IGSID
  ig_message_id   text,
  message         text not null,
  status          message_status not null default 'queued',
  sent_at         timestamptz not null default now()
);
create index if not exists idx_messages_user on public.messages(user_id);

-- ───────────────────────── Leads ─────────────────────────
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  automation_id   uuid references public.automations(id) on delete set null,
  username        text not null,
  name            text,
  email           text,
  phone           text,
  source_post_id  text,
  keyword         text,
  notes           text,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index if not exists idx_leads_user on public.leads(user_id);
create index if not exists idx_leads_keyword on public.leads(keyword);

-- ───────────────────────── Subscriptions ─────────────────────────
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid unique not null references public.users(id) on delete cascade,
  plan                     plan_tier not null,
  status                   subscription_status not null default 'active',
  razorpay_subscription_id text,
  start_date               timestamptz not null default now(),
  expiry_date              timestamptz,
  created_at               timestamptz not null default now()
);

-- ───────────────────────── Payments ─────────────────────────
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  razorpay_order_id   text not null,
  razorpay_payment_id text,
  plan                plan_tier not null,
  amount              int  not null,                  -- in smallest currency unit
  currency            text not null default 'USD',
  status              text not null default 'created',
  created_at          timestamptz not null default now(),
  captured_at         timestamptz
);
create index if not exists idx_payments_user on public.payments(user_id);
create unique index if not exists uniq_payments_order on public.payments(razorpay_order_id);

-- ───────────────────────── Helper RPCs ─────────────────────────
create or replace function public.increment_automation_dms(automation_id_in uuid)
returns void as $$
begin
  update public.automations
  set dms_sent = dms_sent + 1, updated_at = now()
  where id = automation_id_in;
end;
$$ language plpgsql security definer;

create or replace function public.increment_automation_leads(automation_id_in uuid)
returns void as $$
begin
  update public.automations
  set leads_captured = leads_captured + 1, updated_at = now()
  where id = automation_id_in;
end;
$$ language plpgsql security definer;

-- ───────────────────────── updated_at helper ─────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists touch_users on public.users;
create trigger touch_users before update on public.users
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_automations on public.automations;
create trigger touch_automations before update on public.automations
  for each row execute function public.touch_updated_at();
