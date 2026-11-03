begin;

-- Permissive policies are ORed. The existing `WITH CHECK (true)` defeats the
-- ownership policy, so remove it and add a restrictive ownership guard.
drop policy if exists "Enable insert for authenticated users only" on public.habits;
drop policy if exists habits_insert_ownership_guard on public.habits;
create policy habits_insert_ownership_guard on public.habits
  as restrictive for insert to authenticated with check (user_id = auth.uid());
drop policy if exists completion_habit_ownership_guard on public.habit_completions;
create policy completion_habit_ownership_guard on public.habit_completions
  as restrictive for insert to authenticated with check (
    user_id = auth.uid() and exists (
      select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()
    )
  );

-- Each RPC call is one transaction. A reminder failure rolls back the habit
-- change too. Caller privileges/RLS still apply; no SECURITY DEFINER bypass.
create or replace function public.create_habit_with_reminders(
  p_habit_id uuid, p_name text, p_description text, p_goal text, p_reminders text[]
) returns public.habits
language plpgsql security invoker set search_path = '' as $$
declare
  saved public.habits;
  reminder text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_habit_id is null or nullif(btrim(p_name), '') is null then
    raise exception 'Habit ID and name are required' using errcode = '22023';
  end if;
  foreach reminder in array coalesce(p_reminders, array[]::text[]) loop
    if reminder is null or reminder !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:00)?$' then
      raise exception 'Invalid reminder time' using errcode = '22023';
    end if;
  end loop;
  insert into public.habits (id, user_id, name, description, goal)
    values (p_habit_id, auth.uid(), btrim(p_name), p_description, p_goal)
    on conflict (id) do nothing returning * into saved;
  if not found then
    select * into saved from public.habits where id = p_habit_id and user_id = auth.uid() for update;
    if not found then raise exception 'Habit not available' using errcode = '42501'; end if;
    -- Stable client UUID makes retrying a lost successful response safe. A retry
    -- never overwrites a habit that was already committed or subsequently edited.
    return saved;
  end if;
  insert into public.habit_reminders (habit_id, reminder_time, is_enabled)
    select saved.id, r::time, true from (
      select distinct unnest(coalesce(p_reminders, array[]::text[]))::time as r
    ) times;
  return saved;
end;
$$;

create or replace function public.update_habit_with_reminders(
  p_habit_id uuid, p_updates jsonb, p_reminders text[] default null
) returns public.habits
language plpgsql security invoker set search_path = '' as $$
declare
  saved public.habits;
  reminder text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_updates is null or jsonb_typeof(p_updates) <> 'object'
    or (p_updates - array['name', 'description', 'goal']) <> '{}'::jsonb then
    raise exception 'Invalid habit fields' using errcode = '22023';
  end if;
  if (p_updates ? 'name') and (jsonb_typeof(p_updates->'name') <> 'string' or nullif(btrim(p_updates->>'name'), '') is null) then
    raise exception 'Habit name is required' using errcode = '22023';
  end if;
  if ((p_updates ? 'description') and jsonb_typeof(p_updates->'description') not in ('string', 'null'))
    or ((p_updates ? 'goal') and jsonb_typeof(p_updates->'goal') not in ('string', 'null')) then
    raise exception 'Invalid optional habit fields' using errcode = '22023';
  end if;
  foreach reminder in array coalesce(p_reminders, array[]::text[]) loop
    if reminder is null or reminder !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:00)?$' then
      raise exception 'Invalid reminder time' using errcode = '22023';
    end if;
  end loop;
  select * into saved from public.habits where id = p_habit_id and user_id = auth.uid() for update;
  if not found then raise exception 'Habit not found' using errcode = 'P0002'; end if;
  update public.habits set
    name = case when p_updates ? 'name' then btrim(p_updates->>'name') else name end,
    description = case when p_updates ? 'description' then p_updates->>'description' else description end,
    goal = case when p_updates ? 'goal' then p_updates->>'goal' else goal end
    where id = p_habit_id and user_id = auth.uid() returning * into saved;
  if p_reminders is not null then
    delete from public.habit_reminders where habit_id = p_habit_id;
    insert into public.habit_reminders (habit_id, reminder_time, is_enabled)
      select p_habit_id, r, true from (select distinct unnest(p_reminders)::time as r) times;
  end if;
  return saved;
end;
$$;

-- The four-argument overload fixes calendar dates for the current device zone.
-- Keep the three-argument signature for already published app versions.
create or replace function public.get_habit_completion_by_range(
  p_user_id uuid, p_start_date date, p_end_date date, p_timezone text
) returns table (day_date date, day_label text, total_habits integer, completed_habits integer, completion_rate numeric)
language plpgsql stable security invoker set search_path = '' as $$
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Cannot read another account progress' using errcode = '42501';
  end if;
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid date range' using errcode = '22023';
  end if;
  if p_timezone is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;
  return query
    with dates as (
      select p_start_date + n as day from pg_catalog.generate_series(0, p_end_date - p_start_date) n
    ), counts as (
      select d.day,
        count(h.id)::integer as total,
        count(c.id)::integer as completed
      from dates d
      left join public.habits h on h.user_id = auth.uid()
        and (h.created_at at time zone p_timezone)::date <= d.day
      left join public.habit_completions c on c.habit_id = h.id
        and c.user_id = auth.uid() and c.completed_at = d.day
      group by d.day
    )
    select day, to_char(day, 'Dy'), total, completed,
      case when total = 0 then 0::numeric else round(completed::numeric / total * 100, 1) end
      from counts order by day;
end;
$$;

create or replace function public.get_habit_completion_by_range(
  p_user_id uuid, p_start_date date, p_end_date date
) returns table (day_date date, day_label text, total_habits integer, completed_habits integer, completion_rate numeric)
language sql stable security invoker set search_path = '' as $$
  select * from public.get_habit_completion_by_range(p_user_id, p_start_date, p_end_date, 'UTC');
$$;

revoke all on function public.create_habit_with_reminders(uuid, text, text, text, text[]) from public, anon;
revoke all on function public.update_habit_with_reminders(uuid, jsonb, text[]) from public, anon;
revoke all on function public.get_habit_completion_by_range(uuid, date, date, text) from public, anon;
revoke all on function public.get_habit_completion_by_range(uuid, date, date) from public, anon;
grant execute on function public.create_habit_with_reminders(uuid, text, text, text, text[]) to authenticated;
grant execute on function public.update_habit_with_reminders(uuid, jsonb, text[]) to authenticated;
grant execute on function public.get_habit_completion_by_range(uuid, date, date, text) to authenticated;
grant execute on function public.get_habit_completion_by_range(uuid, date, date) to authenticated;

notify pgrst, 'reload schema';
commit;
