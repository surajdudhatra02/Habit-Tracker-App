# Broadcast notification deployment

This endpoint accepts POST only, with `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`.
The key must match the function's server-side environment value exactly. Public anon
keys, signed-in users and unsigned JWTs are rejected before accessing the database or
Firebase. Keep the service-role key out of the mobile app, source code and logs.

## Apply this fix

1. Pause the existing broadcast Cron job and wait for any running invocation to finish.
   This avoids an older deployed worker sending without the new claim protection.
2. Run only `supabase/migrations/202611040001_broadcast_claims.sql` in this project's
   Supabase SQL editor. It adds a separate claim table; it does not alter the existing
   notification configuration, history or device tokens.
3. From `HabitTracker`, deploy with `supabase functions deploy send-broadcast-notification`.
   Keep JWT verification enabled. Existing `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` and `FIREBASE_SERVICE_ACCOUNT` environment values are used.
4. Check the existing Cron job makes a POST request with the service-role bearer
   credential, rather than an anon key or user JWT. Store that credential in Supabase
   Vault and resolve it inside the Cron SQL, for example:

   ```sql
   -- Header expression inside the EXISTING net.http_post call.
   -- Create/update this named secret securely in Vault first; do not commit it.
   headers := jsonb_build_object(
     'Content-Type', 'application/json',
     'Authorization', 'Bearer ' || (
       select decrypted_secret from vault.decrypted_secrets
       where name = 'broadcast_service_role_key'
     )
   )
   ```

   If the job already uses the matching service-role key, its headers need no change.
5. Resume the existing Cron schedule. Do not create a second job or invoke a broadcast
   manually as a deployment test: an authorized invocation at a matching time sends
   to real devices.

Supabase's [scheduling guide](https://supabase.com/docs/guides/functions/schedule-functions)
describes storing Cron credentials in Vault.

## Delivery behavior

Before sending, a worker inserts a permanent claim keyed by IST date and canonical
`HH:MM`. PostgreSQL's primary key allows only one worker to acquire the slot. Workers
also honor older send-history rows and deduplicate device tokens. Database errors
prevent dispatch; missing migration or unavailable send history cannot enable a send.

Each slot gets at most one dispatch attempt. Claims have no automatic expiry or
release, including when FCM responses are lost or logging fails. A crash after claiming
can leave some devices without a notification. This deliberately prevents retrying
uncertain sends; it is not an exactly-once delivery guarantee from FCM. Inspect
`notification_broadcast_claims` for `claimed_at`, `completed_at` and outcome counts.
A null completion can mean a worker stopped after FCM accepted requests. Do not delete
or move such a claim to retry it blindly. Subsequent days and time slots remain eligible.

## Local verification

From `HabitTracker`:

```sh
npm run check:functions
node_modules/.bin/deno task --config supabase/functions/send-broadcast-notification/deno.json test
python3 -B supabase/tests/run.py
```

Handler tests use an in-memory transport and never contact Supabase or FCM. Database
tests use a disposable local PostgreSQL cluster with TCP disabled, checking privileges,
unique claims and eight competing database connections. No live broadcast is required.
