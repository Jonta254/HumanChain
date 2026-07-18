-- HumanChain Supabase Schema
-- Run this in your Supabase dashboard SQL editor at:
-- https://supabase.com/dashboard/project/<your-project>/editor

-- Users
create table if not exists hc_users (
  wallet        text primary key,
  username      text not null default 'Human',
  points        integer not null default 0,
  streak        integer not null default 0,
  tier          text not null default 'Bronze',
  joined_at     timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- Ask threads
create table if not exists hc_ask_threads (
  id              uuid primary key default gen_random_uuid(),
  question        text not null,
  author_wallet   text not null references hc_users(wallet) on delete cascade,
  author_username text not null,
  answer_count    integer not null default 0,
  created_at      timestamptz not null default now()
);

-- Ask answers
create table if not exists hc_ask_answers (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references hc_ask_threads(id) on delete cascade,
  body            text not null,
  author_wallet   text not null references hc_users(wallet) on delete cascade,
  author_username text not null,
  created_at      timestamptz not null default now()
);

-- Chain moments (feed)
create table if not exists hc_moments (
  id              uuid primary key default gen_random_uuid(),
  text            text not null,
  image_url       text,
  author_wallet   text not null references hc_users(wallet) on delete cascade,
  author_username text not null,
  emoji           text,
  created_at      timestamptz not null default now()
);

-- Marketplace listings
create table if not exists hc_marketplace (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  price           numeric(10,2) not null,
  condition       text not null,
  category        text not null,
  description     text,
  seller_wallet   text not null references hc_users(wallet) on delete cascade,
  seller_username text not null,
  location        text,
  status          text not null default 'active' check (status in ('active','sold')),
  created_at      timestamptz not null default now()
);

-- HP ledger
create table if not exists hc_hp_ledger (
  id          uuid primary key default gen_random_uuid(),
  wallet      text not null references hc_users(wallet) on delete cascade,
  amount      integer not null,
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- Content reports
create table if not exists hc_reports (
  id               uuid primary key default gen_random_uuid(),
  target_type      text not null,
  target_id        text not null,
  reason           text not null,
  reporter_wallet  text,
  created_at       timestamptz not null default now()
);

-- Job / service applications
create table if not exists hc_applications (
  id               uuid primary key default gen_random_uuid(),
  listing_id       text not null,
  listing_title    text,
  applicant_wallet text not null,
  message          text,
  status           text not null default 'pending' check (status in ('pending','viewed','accepted','rejected')),
  created_at       timestamptz not null default now()
);

-- Blocked users. One-directional: blocker_wallet no longer sees content
-- from blocked_wallet. Private table — no public read policy, same as
-- hc_reports; only accessed server-side via the service role, scoped to
-- the caller's own session wallet.
create table if not exists hc_blocks (
  id              uuid primary key default gen_random_uuid(),
  blocker_wallet  text not null references hc_users(wallet) on delete cascade,
  blocked_wallet  text not null,
  created_at      timestamptz not null default now(),
  unique (blocker_wallet, blocked_wallet)
);

-- Indexes
create index if not exists hc_ask_threads_created  on hc_ask_threads(created_at desc);
create index if not exists hc_ask_answers_thread   on hc_ask_answers(thread_id, created_at asc);
create index if not exists hc_moments_created      on hc_moments(created_at desc);
create index if not exists hc_marketplace_status   on hc_marketplace(status, created_at desc);
create index if not exists hc_hp_ledger_wallet     on hc_hp_ledger(wallet, created_at desc);
create index if not exists hc_reports_target       on hc_reports(target_type, target_id, created_at desc);
create index if not exists hc_applications_listing on hc_applications(listing_id, created_at desc);
create index if not exists hc_blocks_blocker        on hc_blocks(blocker_wallet, created_at desc);

-- RLS
alter table hc_users        enable row level security;
alter table hc_ask_threads  enable row level security;
alter table hc_ask_answers  enable row level security;
alter table hc_moments      enable row level security;
alter table hc_marketplace  enable row level security;
alter table hc_hp_ledger    enable row level security;
alter table hc_reports      enable row level security;
alter table hc_applications enable row level security;
alter table hc_blocks       enable row level security;

-- Public read on all tables (service role writes via API routes)
create policy "public read users"       on hc_users       for select using (true);
create policy "public read threads"     on hc_ask_threads for select using (true);
create policy "public read answers"     on hc_ask_answers for select using (true);
create policy "public read moments"     on hc_moments     for select using (true);
create policy "public read marketplace" on hc_marketplace for select using (true);

-- Increment answer count (called from API route)
create or replace function increment_answer_count(thread_id uuid)
returns void language sql as $$
  update hc_ask_threads set answer_count = answer_count + 1 where id = thread_id;
$$;

-- Leaderboard helper view (SECURITY INVOKER respects RLS of the querying user)
create or replace view hc_leaderboard
  with (security_invoker = true) as
  select wallet, username, points, streak, tier,
         rank() over (order by points desc) as rank
  from hc_users
  order by points desc
  limit 50;
