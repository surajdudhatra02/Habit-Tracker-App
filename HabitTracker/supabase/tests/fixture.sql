-- Disposable local database only. Mirrors the schema supplied on 2026-11-03.
create role authenticated nologin;
create role anon nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema public, auth to authenticated, anon;

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null, description text, goal text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.habit_reminders (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  reminder_time time not null, is_enabled boolean default true, created_at timestamptz default now()
);
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  completed_at date not null default current_date, created_at timestamptz default now(),
  unique (habit_id, completed_at)
);
create table public.device_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  token text not null, platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, token)
);
create function public.update_updated_at_column() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger update_habits_updated_at before update on public.habits
  for each row execute function public.update_updated_at_column();
grant select, insert, update, delete on all tables in schema public to authenticated, anon;
alter table public.habits enable row level security;
alter table public.habit_reminders enable row level security;
alter table public.habit_completions enable row level security;
alter table public.device_tokens enable row level security;
create policy "Enable insert for authenticated users only" on public.habits for insert to authenticated with check (true);
create policy "Users can create own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on public.habits for delete using (auth.uid() = user_id);
create policy "Users can view own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can create own reminders" on public.habit_reminders for insert with check (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "Users can update own reminders" on public.habit_reminders for update using (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "Users can delete own reminders" on public.habit_reminders for delete using (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "Users can view own reminders" on public.habit_reminders for select using (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "Users can create own completions" on public.habit_completions for insert with check(auth.uid() = user_id);
create policy "Users can delete own completions" on public.habit_completions for delete using(auth.uid() = user_id);
create policy "Users can view own completions" on public.habit_completions for select using(auth.uid() = user_id);
create policy "Users can insert own tokens" on public.device_tokens for insert with check(auth.uid() = user_id);
create policy "Users can update own tokens" on public.device_tokens for update using(auth.uid() = user_id);
create policy "Users can delete own tokens" on public.device_tokens for delete using(auth.uid() = user_id);
create policy "Users can view own tokens" on public.device_tokens for select using(auth.uid() = user_id);

-- Represents the existing definer signature, so migration replacement is tested.
create function public.get_habit_completion_by_range(p_user_id uuid, p_start_date date, p_end_date date)
returns table(day_date date, day_label text, total_habits integer, completed_habits integer, completion_rate numeric)
language sql security definer as $$ select p_start_date, 'Tue'::text, 0, 0, 0::numeric; $$;

insert into auth.users values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');

-- Inject a failure at the reminder INSERT, after other statements have run.
create function public.test_fail_reminder() returns trigger language plpgsql as $$
begin
  if new.reminder_time = time '10:00' then raise exception 'Injected reminder failure'; end if;
  return new;
end; $$;
create trigger test_fail_reminder before insert on public.habit_reminders
  for each row execute function public.test_fail_reminder();

create function public.test_assert(condition boolean, message text) returns void language plpgsql as $$
begin
  if condition is distinct from true then raise exception 'FAIL: %', message; end if;
  raise notice 'PASS: %', message;
end; $$;
create function public.test_expect_error(statement text, expected_code text, message text) returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate <> expected_code then raise exception 'FAIL: %, expected %, got %: %', message, expected_code, sqlstate, sqlerrm; end if;
    raise notice 'PASS: %', message;
    return;
  end;
  raise exception 'FAIL: %, expected failure but operation succeeded', message;
end; $$;
