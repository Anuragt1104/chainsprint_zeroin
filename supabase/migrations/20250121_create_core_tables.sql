create extension if not exists "pgcrypto";

create table if not exists public.crews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sprint_goal text,
  owner_wallet text,
  current_streak_days integer not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.crew_members (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  wallet_address text not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  constraint crew_members_wallet_unique unique (crew_id, wallet_address)
);

create table if not exists public.wallet_sessions (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  wallet_address text not null,
  chain_id text,
  last_connected_at timestamptz not null default now(),
  constraint wallet_sessions_unique unique (crew_id, wallet_address)
);

create table if not exists public.sprint_snapshots (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  wallet_address text,
  portfolio jsonb not null,
  pnl jsonb not null,
  positions jsonb not null,
  transactions jsonb not null,
  summary jsonb not null,
  captured_at timestamptz not null default now()
);

create table if not exists public.zerion_events (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  wallet_address text,
  event_type text not null,
  payload jsonb not null,
  signature_valid boolean not null default false,
  received_at timestamptz not null default now()
);

create index if not exists idx_crew_members_crew_id on public.crew_members (crew_id);
create index if not exists idx_wallet_sessions_crew_id on public.wallet_sessions (crew_id);
create index if not exists idx_sprint_snapshots_crew_id_captured_at on public.sprint_snapshots (crew_id, captured_at desc);
create index if not exists idx_zerion_events_crew_id_received_at on public.zerion_events (crew_id, received_at desc);