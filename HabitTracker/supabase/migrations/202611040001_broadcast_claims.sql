-- Each IST day/time slot may be dispatched by only one worker. Claims never
-- expire: retrying an uncertain FCM request could deliver a second notification.
begin;

create table if not exists public.notification_broadcast_claims (
  date_ist date not null,
  time_ist text not null check (time_ist ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  success_count integer check (success_count >= 0),
  fail_count integer check (fail_count >= 0),
  primary key (date_ist, time_ist)
);

alter table public.notification_broadcast_claims enable row level security;
revoke all on public.notification_broadcast_claims from public, anon, authenticated;
revoke all on public.notification_broadcast_claims from service_role;
grant select, insert on public.notification_broadcast_claims to service_role;
grant update (completed_at, success_count, fail_count)
  on public.notification_broadcast_claims to service_role;

comment on table public.notification_broadcast_claims is
  'Permanent broadcast dispatch claims. Never automatically delete or expire; a missing outcome can mean FCM accepted a request before a worker stopped.';

commit;
