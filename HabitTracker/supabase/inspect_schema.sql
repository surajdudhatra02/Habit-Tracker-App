-- Read-only. Run in the Supabase SQL Editor and share the resulting JSON.
-- Does not read user rows, tokens, keys, or credentials.
with target_tables as (
  select c.oid, n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('habits', 'habit_reminders', 'habit_completions', 'device_tokens')
    and c.relkind in ('r', 'p')
)
select jsonb_pretty(jsonb_build_object(
  'tables', (select jsonb_agg(jsonb_build_object(
    'table', t.relname,
    'rls_enabled', t.relrowsecurity,
    'rls_forced', t.relforcerowsecurity,
    'columns', (select jsonb_agg(jsonb_build_object(
      'name', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
      'nullable', not a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid)
    ) order by a.attnum)
      from pg_attribute a left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
      where a.attrelid = t.oid and a.attnum > 0 and not a.attisdropped),
    'constraints', (select jsonb_agg(pg_get_constraintdef(c.oid)) from pg_constraint c where c.conrelid = t.oid),
    'indexes', (select jsonb_agg(indexdef) from pg_indexes i where i.schemaname = t.nspname and i.tablename = t.relname),
    'policies', (select jsonb_agg(to_jsonb(p)) from pg_policies p where p.schemaname = t.nspname and p.tablename = t.relname),
    'triggers', (select jsonb_agg(pg_get_triggerdef(tr.oid)) from pg_trigger tr where tr.tgrelid = t.oid and not tr.tgisinternal)
  ) order by t.relname) from target_tables t),
  'completion_function', (select jsonb_agg(pg_get_functiondef(p.oid))
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'get_habit_completion_by_range')
)) as schema_details;
