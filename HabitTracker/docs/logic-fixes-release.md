# Logic fixes and release order

Prepared 2026-11-03. These changes are local source and a tested SQL migration;
they have not been applied to the live Supabase project or published app.

## Fixes

1. Account isolation: clear habits synchronously at session boundaries; reject
   stale requests even for a logout/login back into the same account; newer
   refreshes win. A late auth startup result cannot undo a later auth event.
2. Logout reminders: enumerate all habit alarms in the OS rather than relying on
   the loaded habit list. Serialize native alarm mutations so logout waits for
   in-flight scheduling, and gate obsolete scheduling by account generation.
3. Calendar dates: use local year/month/day for date-only values. Open screens
   advance at midnight and after foregrounding. Progress RPCs also receive the
   device's timezone so habit creation timestamps use the same calendar day.
4. Consistent saves: new database RPCs save habit fields and reminder rows in one
   transaction. A stable cryptographic UUID per create form makes retries safe.
   Native reminder scheduling is a separate outcome: the UI accurately reports
   a saved habit with a reminder problem instead of inviting duplicate saves.
   Deletes cancel reminders only after the database delete succeeds.
5. FCM lifecycle: recreate registration/listeners for each login; ignore token
   requests completing after effect cleanup; catch refresh errors.
6. Multiple devices: upsert only the `(user_id, token)` pair, matching the actual
   unique constraint. Do not delete other installations' registrations by OS.
7. Optional fields: clearing a description or goal sends explicit null values;
   callbacks use the saved database row rather than inventing local timestamps.
8. Progress refresh: refetch on tab focus, reject obsolete responses, and derive
   metrics from the current result so empty data resets the average and trend.
9. Exact alarms: inspect Notifee's real `android.alarm` settings API and prompt
   when alarms are disabled on supported Android versions.
10. Load errors: propagate completion/reminder read errors; preserve known state.
    The editor blocks saves while reminders load and exposes retry after failure.

The supplied schema exposed additional ownership issues. The migration removes
the habit INSERT policy that allowed any authenticated user ID, adds restrictive
ownership guards, verifies completion ownership against the parent habit, and
changes the progress function from SECURITY DEFINER to SECURITY INVOKER with an
explicit caller check. Published clients retain their three-argument signature.

## Validation

- `npm test -- --runInBand --watchman=false`: 49 assertions pass. Includes real
  application store/hook/screen logic and app composition; native/backend
  boundaries are mocked. Tested in Asia/Kolkata, UTC, and America/Los_Angeles.
- `python3 -B supabase/tests/run.py`: 30 assertions in a disposable local
  PostgreSQL database. Includes injected reminder-write failures, actual rollback,
  RLS denial, idempotent create, legacy RPC compatibility, timezone calculations,
  and reapplying the migration without changing saved habit data.
- `node_modules/.bin/tsc --noEmit`: passes. Existing UI/navigation types were
  corrected. Supabase Edge Functions are excluded from the mobile TypeScript
  project because they execute in Deno and require their own runtime check;
  they were not modified or validated in this task.
- ESLint has no errors in changed source/tests. Some existing inline-style
  warnings remain in UI files.

The old test suite's native-polyfill load failure is resolved with explicit
boundary mocks and the shared test transform. App composition tests exercise
normal, optional-update, required-update, and maintenance states.

## Apply before running or shipping the new mobile code

1. Run `supabase/migrations/202611030001_atomic_habits_and_ownership.sql` in the
   Supabase SQL Editor for a staging project with the supplied schema.
2. Run `supabase/verify_migration.sql`; the existence, caller-RLS, role-permission,
   and ownership-guard checks should all report true.
3. Verify on devices: midnight check-ins; edit/clear/reload; create/save retry
   after a network failure; Android 12 disabled exact alarms; notifications with
   the app closed; logout while alarms are scheduling; account switching; two
   phones on the same account; and the previous published app's progress screen.
4. Apply and verify the same migration in production before releasing the new
   mobile build. The new save RPCs and timezone overload must exist first.
   Do not fall back to the old multi-request writes if the RPC is missing.
5. Build and distribute the mobile update through the existing release process.
   No app version, signing configuration, or remote minimum-version setting was
   changed by this task.

The migration adds/replaces functions and policies, without shifting or deleting
existing user rows. Historic UTC-dated check-ins cannot be reliably reassigned
without knowing the timezone used when they were created; no bulk date rewrite
is included. If rolling back the mobile release, retain the ownership fixes and
the compatible legacy progress signature.

Native notification delivery and the live project's schema/application were not
exercised directly. The PostgreSQL fixture mirrors the schema supplied in chat;
the database test runner never connects to production and disables TCP.

## Reference decisions

Database functions follow Supabase's guidance to prefer caller privileges/RLS:
https://supabase.com/docs/guides/database/functions

Focus refresh follows React Navigation's lifecycle:
https://reactnavigation.org/docs/use-focus-effect/

Alarm settings follow the installed Notifee API and trigger documentation:
https://notifee.app/react-native/docs/triggers/
