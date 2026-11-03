# Mobile app logic audit

Date: 2026-11-03. Scope: `HabitTracker`; `website` excluded.

Follow-up: the findings below describe the original audit. Fixes and deployment
requirements are documented in [logic-fixes-release.md](logic-fixes-release.md).

## Evidence and limits

21 isolated tests executed against the existing store, hooks, and screens:
17 failed expectations and 4 passing controls. The failing tests assert the
desired behavior and are intentionally red until the bugs are fixed. Several
tests cover different consequences of the same bug, so test failures are not a
count of independent bugs. Findings below are grouped into 10 areas.

Tests use real application logic and React hook/screen rendering, with mocked
Firebase/Notifee boundaries and a small in-memory PostgREST model. The model
implements separate statement commits, JSON serialization, filters, and injected
statement errors. No live accounts or production data were read or changed.
Production database constraints, RLS, RPC definitions, and OS notification
delivery were not tested. In particular, duplicate-create behavior depends on
whether the database permits duplicate habit names; partial client writes do
not depend on that assumption.

Run from `HabitTracker`:

```sh
TZ=Asia/Kolkata node_modules/.bin/jest --config jest.logic.config.js --runInBand --watchman=false
```

## 1. High: dates use UTC instead of the user's calendar day

Sources: [store](../src/store/useHabitStore.ts#L196),
[range hook](../src/hooks/useHabitCompletionRange.ts#L19).

- At 00:30 IST on November 3, a check-in is written as November 2.
- A completion stored for November 3 is missing from the same day's lookup.
- Local November 1–30 month boundaries become October 31–November 29 in the RPC
  request. This happens because local midnight is converted to UTC.

Observed: three failed tests, with actual values `2026-11-02`, an empty lookup,
and RPC dates `2026-10-31` / `2026-11-29` respectively.

Fix direction: use a shared local calendar-date formatter for date-only values;
keep ISO timestamps for actual instants. Reuse it in the calendar and progress
marking logic, which currently repeat the UTC conversion.

## 2. High: late requests restore signed-out account data

Source: [fetchHabits](../src/store/useHabitStore.ts#L53).

Reproduction: start Alice's habit fetch, log out, then resolve the request.
Logout clears the list, but the pending request writes Alice's habits back into
the shared store. There is no account or request-generation check before `set`.
This is a stale client-state isolation problem; it does not establish an RLS
bypass or unauthorized server access.

Observed: the expected empty list instead contains Alice's habit.

Fix direction: invalidate pending loads on account changes and apply responses
only when they still belong to the active account. Clear state on account
switch as well as logout.

## 3. High: reminders survive logout

Source: [setUserId](../src/store/useHabitStore.ts#L39).

Reproduction: schedule an account's reminders, then call `setUserId(null)`.
Habit state is cleared, but no notification cancellation occurs. Scheduled habit
names can still appear after logout. Successful account deletion also signs out
without an explicit alarm cleanup path.

Observed: the simulated OS still has the signed-out habit's alarm.

Fix direction: cancel account-owned reminders on logout/deletion and guard
against an in-flight rescheduling operation recreating them afterward.

## 4. High: failed operations leave saved data and reminders inconsistent

Sources: [create](../src/store/useHabitStore.ts#L72),
[update](../src/store/useHabitStore.ts#L114),
[delete](../src/store/useHabitStore.ts#L160).

Three independently reproduced failure cases:

- Create: habit insertion succeeds, reminder insertion fails, and the screen
  reports failure although the habit remains saved. Retrying produced two habits
  in the test backend, which permits duplicate names.
- Edit: old reminder rows are deleted before replacement insertion. If that
  insertion fails, the old reminder records are permanently missing. OS alarms
  have not yet been rebuilt, leaving database and device out of sync.
- Delete: OS reminders are cancelled before the database deletion. If deletion
  fails, the surviving habit has lost its alarms on that device until another
  successful scheduling pass.

Fix direction: transact related database changes server-side, make retries safe,
and handle OS scheduling as a separately recoverable operation. Do not report a
fully failed save after data has already committed without reconciling state.

## 5. High: signing in again skips FCM registration

Source: [useFCMToken](../src/hooks/useFCMToken.ts#L13).

`registeredRef` is never reset. AuthProvider stays mounted when its session
changes. After first registration, logout removes the refresh listener, then the
next login returns early because the ref is still true.

Observed: logging in as Bob after Alice creates no Bob token row; logging back
into Alice leaves the refresh subscription count at one rather than two.

Fix direction: scope registration to the current account/device, reset it on
session changes, and restore listeners for every authenticated session.

## 6. High: one device removes other devices' push registrations

Source: [token cleanup](../src/hooks/useFCMToken.ts#L39).

Registration deletes every token matching `user_id` and `platform`, rather than
just this installation's obsolete token. Logging in on a second Android phone
therefore removes the first Android phone's registration from the backend.

Observed: a pre-existing Android token is gone after the second registration.

Fix direction: identify individual installations and upsert this installation's
token without deleting other devices. Remove invalid tokens based on delivery
results or an explicit device lifecycle.

## 7. Medium: descriptions and goals cannot be cleared

Source: [NewHabitScreen](../src/screens/NewHabitScreen.tsx#L111).

Blank edited values are converted to `undefined`. JSON serialization omits those
fields, so the backend retains the previous values even though the editor's
local update callback can make them look cleared temporarily.

Observed: both screen tests clear the input and save successfully, but persisted
values remain `Old description` and `Old goal`.

Fix direction: send explicit `null` or an empty string and align the database
types, input types, and local display state.

## 8. Medium: progress displays stale results

Sources: [ProgressScreen](../src/screens/ProgressScreen.tsx#L9),
[completion hook](../src/hooks/useHabitCompletionRange.ts#L51).

- The mounted Progress tab does not refetch on navigation focus or on check-in
  changes. Returning after a check-in keeps the old chart/calendar data.
- When a successful refetch returns an empty list, the hook clears `data` but
  does not reset `averageRate` or `trend`.

Observed: a chart stays at 0% after the modeled backend changes to 100% and focus
returns; an empty result retains the previous 50% average and +100 trend.

Fix direction: refresh on screen focus or completion invalidation; explicitly
reset every derived metric for an empty successful response.

## 9. High on Android 12: exact-alarm permission check never runs

Source: [useNotificationPermission](../src/hooks/useNotificationPermission.ts#L24).

The code optionally invokes `notifee.isAlarmPermissionGranted`, which does not
exist in the installed Notifee API. Optional chaining produces `undefined`, so
the `=== false` branch never prompts the user. The real API exposes alarm status
through notification settings (`android.alarm`).

Observed: with API 31, notifications authorized, and alarms disabled, the prompt
is never shown. The mock includes the real settings APIs and deliberately does
not invent the nonexistent method. Native permission behavior still needs a
device check after the fix.

Fix direction: inspect `getNotificationSettings().android.alarm` using the
installed API's enum and guide the user to alarm settings when disabled.

## 10. Medium: failed loads look like no completions

Source: [getTodayCompletions](../src/store/useHabitStore.ts#L192).

A database error is logged and returned as `[]`. Home/Today consequently treat a
failed request as a successful empty day, so checked habits appear unchecked and
the calling screen's error handler does not run. Reminder reads use the same
error-as-empty pattern.

Observed: an injected completion query failure resolves to `[]`, exactly like
the passing control for a genuinely empty day.

Fix direction: propagate a typed failure or return a distinct error result;
preserve known good data and offer retry instead of replacing it with emptiness.

## Test infrastructure findings

- Original `npm test -- --runInBand --watchman=false`: the existing app smoke
  test fails during module loading with `Identifier 'module' has already been
  declared` in `react-native-get-random-values`; zero assertions run.
- The isolated logic config bypasses native startup and that unrelated import.
- ESLint passes for all added audit test/config files.
- Full TypeScript check still reports 28 existing errors, none in the added
  audit tests. These were not counted as logic bugs in this report.

Recommended order: account isolation and alarm cleanup; calendar dates;
consistent writes; notification registration and permissions; editing/progress
and error presentation. Production source was not modified during this audit.
