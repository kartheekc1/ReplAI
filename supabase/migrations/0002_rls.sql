-- ReplyVerse — Row Level Security policies
-- Every public table is scoped to the requesting user via auth.uid().

alter table public.users               enable row level security;
alter table public.instagram_accounts  enable row level security;
alter table public.automations         enable row level security;
alter table public.comments            enable row level security;
alter table public.messages            enable row level security;
alter table public.leads               enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.payments            enable row level security;

-- ─── users ───
drop policy if exists "users read self" on public.users;
create policy "users read self" on public.users for select
  using (auth.uid() = id);

drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update
  using (auth.uid() = id);

-- The signup trigger handles inserts using SECURITY DEFINER; no insert policy needed.

-- ─── instagram_accounts ───
drop policy if exists "ig owner all" on public.instagram_accounts;
create policy "ig owner all" on public.instagram_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── automations ───
drop policy if exists "auto owner all" on public.automations;
create policy "auto owner all" on public.automations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── comments ───
drop policy if exists "comments owner read" on public.comments;
create policy "comments owner read" on public.comments for select
  using (auth.uid() = user_id);

-- writes happen via the service-role key in the FastAPI webhook handler; no insert/update policy.

-- ─── messages ───
drop policy if exists "messages owner read" on public.messages;
create policy "messages owner read" on public.messages for select
  using (auth.uid() = user_id);

-- ─── leads ───
drop policy if exists "leads owner all" on public.leads;
create policy "leads owner all" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── subscriptions ───
drop policy if exists "subs owner read" on public.subscriptions;
create policy "subs owner read" on public.subscriptions for select
  using (auth.uid() = user_id);

-- ─── payments ───
drop policy if exists "payments owner read" on public.payments;
create policy "payments owner read" on public.payments for select
  using (auth.uid() = user_id);
