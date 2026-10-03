-- World Fate 클라우드 저장용 테이블. Supabase 대시보드 > SQL Editor 에서 한 번만 실행하세요.
create table if not exists public.saves (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  slot text not null,
  name text,
  meta jsonb,
  data text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

alter table public.saves enable row level security;

-- 로그인한 본인의 저장만 읽고 쓸 수 있다
drop policy if exists "own saves" on public.saves;
create policy "own saves" on public.saves
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
