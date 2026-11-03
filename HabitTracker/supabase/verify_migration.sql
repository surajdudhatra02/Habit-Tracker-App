-- Read-only checks after applying the migration. All booleans should be true.
select
  to_regprocedure('public.create_habit_with_reminders(uuid,text,text,text,text[])') is not null as atomic_create_exists,
  to_regprocedure('public.update_habit_with_reminders(uuid,jsonb,text[])') is not null as atomic_edit_exists,
  to_regprocedure('public.get_habit_completion_by_range(uuid,date,date)') is not null as published_app_signature_exists,
  to_regprocedure('public.get_habit_completion_by_range(uuid,date,date,text)') is not null as timezone_signature_exists;

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
  not p.prosecdef as uses_caller_rls,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_allowed,
  not has_function_privilege('anon', p.oid, 'EXECUTE') as anonymous_blocked
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in (
  'create_habit_with_reminders', 'update_habit_with_reminders', 'get_habit_completion_by_range'
);

select
  not exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'habits'
    and policyname = 'Enable insert for authenticated users only') as broad_insert_policy_removed,
  exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'habits'
    and policyname = 'habits_insert_ownership_guard' and permissive = 'RESTRICTIVE') as habit_ownership_guard_exists,
  exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'habit_completions'
    and policyname = 'completion_habit_ownership_guard' and permissive = 'RESTRICTIVE') as completion_ownership_guard_exists;
