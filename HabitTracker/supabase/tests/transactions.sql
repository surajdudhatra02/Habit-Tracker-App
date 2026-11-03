set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

select public.create_habit_with_reminders('10000000-0000-4000-8000-000000000001', 'Read', 'Details', 'Goal', array['09:00', '09:00:00']);
select public.test_assert((select count(*) = 1 from public.habit_reminders), 'duplicate reminder times normalized');
select public.test_assert((select count(*) = 1 from public.habits), 'habit and reminder saved');
select public.create_habit_with_reminders('10000000-0000-4000-8000-000000000001', 'Read', 'Details', 'Goal', array['09:00']);
select public.test_assert((select count(*) = 1 from public.habits), 'retry with stable UUID does not duplicate habit');
select public.test_assert((select count(*) = 1 from public.habit_reminders), 'retry does not replace reminders');

select public.test_expect_error($q$select public.create_habit_with_reminders('10000000-0000-4000-8000-000000000002', 'Failed', null, null, array['10:00'])$q$, 'P0001', 'injected create failure surfaced');
select public.test_assert(not exists(select 1 from public.habits where name = 'Failed'), 'failed reminder INSERT rolls back new habit');
select public.test_expect_error($q$select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{"name":"Changed"}', array['10:00'])$q$, 'P0001', 'injected edit failure surfaced');
select public.test_assert((select name = 'Read' from public.habits limit 1), 'failed edit restores original habit name');
select public.test_assert((select reminder_time = time '09:00' from public.habit_reminders limit 1), 'failed edit restores original reminder');
select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{"description":null,"goal":null}', null);
select public.test_assert((select description is null and goal is null from public.habits limit 1), 'optional fields explicitly cleared');
select public.test_assert((select count(*) = 1 from public.habit_reminders), 'null reminder argument preserves existing reminders');
select public.test_expect_error($q$select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{"user_id":"00000000-0000-4000-8000-000000000002"}', null)$q$, '22023', 'ownership field cannot be edited through RPC');
select public.test_expect_error($q$select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{"name":null}', null)$q$, '22023', 'null name rejected');
select public.test_expect_error($q$select public.create_habit_with_reminders('10000000-0000-4000-8000-000000000003', 'Bad time', null, null, array['25:00'])$q$, '22023', 'invalid reminder time rejected');

set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
select public.test_assert((select count(*) = 0 from public.habits), 'Bob cannot select Alice habits');
select public.test_expect_error($q$insert into public.habits (user_id, name) values ('00000000-0000-4000-8000-000000000001', 'Spoofed')$q$, '42501', 'broad habit INSERT policy no longer bypasses ownership');
select public.test_expect_error($q$insert into public.habit_completions (habit_id, user_id) values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002')$q$, '42501', 'Bob cannot complete Alice habit under his own user ID');
select public.test_expect_error($q$select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{"name":"Hijacked"}', null)$q$, 'P0002', 'Bob cannot edit Alice habit');
select public.test_expect_error($q$select * from public.get_habit_completion_by_range('00000000-0000-4000-8000-000000000001', '2026-11-01', '2026-11-03')$q$, '42501', 'legacy progress RPC rejects another user');
select public.test_expect_error($q$select * from public.get_habit_completion_by_range('00000000-0000-4000-8000-000000000001', '2026-11-01', '2026-11-03', 'Asia/Kolkata')$q$, '42501', 'timezone progress RPC rejects another user');

reset role;
update public.habits set created_at = '2026-11-02 20:00:00+00';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
insert into public.habit_completions (habit_id, user_id, completed_at)
  values ('10000000-0000-4000-8000-000000000001', auth.uid(), '2026-11-03');
select public.test_assert((select total_habits = 0 from public.get_habit_completion_by_range(auth.uid(), '2026-11-02', '2026-11-02', 'Asia/Kolkata')), 'habit not counted before local creation day');
select public.test_assert((select total_habits = 1 and completed_habits = 1 and completion_rate = 100 from public.get_habit_completion_by_range(auth.uid(), '2026-11-03', '2026-11-03', 'Asia/Kolkata')), 'local creation day and completion produce 100 percent');
select public.test_assert((select count(*) = 3 from public.get_habit_completion_by_range(auth.uid(), '2026-11-01', '2026-11-03')), 'three-argument RPC remains callable by published apps');
select public.test_expect_error($q$select * from public.get_habit_completion_by_range(auth.uid(), '2026-11-03', '2026-11-01', 'UTC')$q$, '22023', 'reversed date range rejected');
select public.test_expect_error($q$select * from public.get_habit_completion_by_range(auth.uid(), '2026-11-01', '2026-11-03', 'invalid-zone')$q$, '22023', 'invalid timezone rejected');
select public.update_habit_with_reminders('10000000-0000-4000-8000-000000000001', '{}', array[]::text[]);
select public.test_assert((select count(*) = 0 from public.habit_reminders), 'explicit empty reminder list removes reminders');
select public.test_assert((select bool_and(not prosecdef) from pg_proc where proname in ('create_habit_with_reminders', 'update_habit_with_reminders', 'get_habit_completion_by_range')), 'all application RPCs run without privilege escalation');

set role anon;
set request.jwt.claim.sub = '';
select public.test_expect_error($q$select * from public.get_habit_completion_by_range('00000000-0000-4000-8000-000000000001', '2026-11-01', '2026-11-03')$q$, '42501', 'anonymous callers cannot execute progress RPC');
select public.test_expect_error($q$select public.create_habit_with_reminders('10000000-0000-4000-8000-000000000004', 'Anonymous', null, null, array[]::text[])$q$, '42501', 'anonymous callers cannot execute write RPC');
reset role;
