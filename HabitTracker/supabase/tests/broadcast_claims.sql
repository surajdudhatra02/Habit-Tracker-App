select public.test_assert(
  (select relrowsecurity from pg_class where oid = 'public.notification_broadcast_claims'::regclass),
  'broadcast claims enforce RLS'
);

set role anon;
select public.test_expect_error(
  $$select * from public.notification_broadcast_claims$$, '42501',
  'anonymous clients cannot read broadcast claims'
);
select public.test_expect_error(
  $$insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-04', '09:00')$$,
  '42501', 'anonymous clients cannot claim a broadcast slot'
);
reset role;

set role authenticated;
select public.test_expect_error(
  $$insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-04', '09:00')$$,
  '42501', 'signed-in clients cannot claim a broadcast slot'
);
select public.test_expect_error(
  $$delete from public.notification_broadcast_claims$$, '42501',
  'signed-in clients cannot remove broadcast claims'
);
reset role;

set role service_role;
insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-04', '09:00');
update public.notification_broadcast_claims set success_count = 2, fail_count = 0, completed_at = now()
  where date_ist = '2026-11-04' and time_ist = '09:00';
select public.test_assert(
  (select success_count = 2 and completed_at is not null from public.notification_broadcast_claims
    where date_ist = '2026-11-04' and time_ist = '09:00'),
  'server can acquire a claim and record its outcome'
);
select public.test_expect_error(
  $$insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-04', '09:00')$$,
  '23505', 'a completed slot cannot be claimed again'
);
select public.test_expect_error(
  $$delete from public.notification_broadcast_claims$$, '42501',
  'server cannot delete claims to enable an accidental retry'
);
select public.test_expect_error(
  $$update public.notification_broadcast_claims set time_ist = '10:00'$$, '42501',
  'server cannot move claims to reopen a slot'
);
select public.test_expect_error(
  $$insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-04', '9:00')$$,
  '23514', 'claim keys require canonical time formatting'
);
insert into public.notification_broadcast_claims(date_ist, time_ist) values ('2026-11-05', '09:00');
select public.test_assert(
  (select count(*) = 2 from public.notification_broadcast_claims),
  'the same time on a new day has an independent claim'
);
reset role;
