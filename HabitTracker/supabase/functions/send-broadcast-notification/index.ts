// supabase/functions/send-broadcast-notification/index.ts
//
// Sends scheduled broadcast notifications to all app users.
// Triggered by Supabase Cron every 30 minutes.
// Reads config (title, body, times in IST) from notification_config table.
// Logs each send to notification_send_log to prevent duplicates.

// Cron every 30 min → function checks IST time  ← We chose this
//   ✅ Change times ONLY in DB table → instant, no code/CLI needed
//   ✅ Fully dynamic, admin panel ready later
//   ⚠️  48 invocations/day = 1,440/month
//       Free limit = 500,000/month → you use 0.3% ✅
// supabase/functions/send-broadcast-notification/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FIREBASE_SA = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT')!);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Base64URL encode (required for JWT) */
const b64url = (input: string): string =>
  btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/** Convert PEM private key string → ArrayBuffer for Web Crypto API */
function pemToBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Gets a short-lived Google OAuth2 access token using the service account.
 * This is what Firebase Admin SDK does internally.
 * Scope: firebase.messaging → allows sending FCM messages.
 */
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const jwtHeader = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const jwtPayload = b64url(
    JSON.stringify({
      iss: FIREBASE_SA.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingInput = `${jwtHeader}.${jwtPayload}`;

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBuffer(FIREBASE_SA.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput),
  );

  const sigB64 = b64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

/**
 * Sends a data-only FCM message to a single device token.
 * Returns { ok: true } on success or { ok: false, errorCode } on failure.
 * errorCode "UNREGISTERED" means the token is stale and should be deleted.
 */
async function sendToToken(
  accessToken: string,
  deviceToken: string,
  title: string,
  body: string,
): Promise<{ ok: boolean; errorCode?: string }> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${FIREBASE_SA.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          data: { title, body, type: 'broadcast' },
          android: { priority: 'HIGH' },
          apns: {
            headers: { 'apns-priority': '10' },
            payload: { aps: { 'content-available': 1 } },
          },
        },
      }),
    },
  );

  if (res.ok) return { ok: true };

  const errBody = await res.json();
  // FCM error code is nested: error.details[0].errorCode or error.status
  const errorCode: string =
    errBody?.error?.details?.[0]?.errorCode ??
    errBody?.error?.status ??
    'UNKNOWN';

  return { ok: false, errorCode };
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async _req => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── Step 1: Load notification config ─────────────────────────────────────
  const { data: config, error: configError } = await supabase
    .from('notification_config')
    .select('*')
    .single();

  if (configError || !config) {
    return new Response('Config not found', { status: 500 });
  }

  // ── Step 2: Check master switch ───────────────────────────────────────────
  if (!config.is_enabled) {
    console.log('[Broadcast] Notifications disabled via is_enabled flag.');
    return new Response(JSON.stringify({ status: 'disabled' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Step 3: Get current IST time ──────────────────────────────────────────
  // IST = UTC + 5 hours 30 minutes (no daylight saving — always fixed)
  const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const currentHour = nowIST.getUTCHours();
  const currentMinute = nowIST.getUTCMinutes();
  // IST date string for the log (e.g. "2026-05-30")
  const dateIST = nowIST.toISOString().split('T')[0];

  console.log(
    `[Broadcast] IST time: ${currentHour}:${String(currentMinute).padStart(2, '0')}`,
  );

  // ── Step 4: Find a matching scheduled time (±5 min window) ───────────────
  // Cron fires every 30 min. We use ±5 min tolerance to match the time slot.
  // The send log prevents duplicate sends even if cron overlaps.
  const matchedTime: string | undefined = config.times_ist.find(
    (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      const sameHour = currentHour === h;
      const withinWindow = Math.abs(currentMinute - m) <= 5;
      return sameHour && withinWindow;
    },
  );

  if (!matchedTime) {
    console.log('[Broadcast] No matching time slot right now — skipping.');
    return new Response(JSON.stringify({ status: 'no_match' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Step 5: Check if already sent for this slot today ────────────────────
  const { data: existingLog } = await supabase
    .from('notification_send_log')
    .select('id')
    .eq('date_ist', dateIST)
    .eq('time_ist', matchedTime)
    .maybeSingle();

  if (existingLog) {
    console.log(
      `[Broadcast] Already sent for ${dateIST} ${matchedTime} — skipping.`,
    );
    return new Response(JSON.stringify({ status: 'already_sent' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Step 6: Fetch all device tokens ──────────────────────────────────────
  const { data: tokenRows, error: tokenError } = await supabase
    .from('device_tokens')
    .select('token');

  if (tokenError || !tokenRows || tokenRows.length === 0) {
    console.log('[Broadcast] No device tokens found.');
    return new Response(JSON.stringify({ status: 'no_tokens' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[Broadcast] Sending to ${tokenRows.length} device(s)...`);

  // ── Step 7: Get FCM access token ──────────────────────────────────────────
  const accessToken = await getGoogleAccessToken();

  // ── Step 8: Send to all tokens + auto-clean stale ones ───────────────────
  const staleTokens: string[] = [];

  const results = await Promise.allSettled(
    tokenRows.map(async (row: { token: string }) => {
      const result = await sendToToken(
        accessToken,
        row.token,
        config.title,
        config.body,
      );
      if (!result.ok && result.errorCode === 'UNREGISTERED') {
        // Token is stale (app uninstalled / re-installed) — queue for deletion
        staleTokens.push(row.token);
      }
      return result.ok;
    }),
  );

  // Delete stale tokens so they don't waste FCM calls next time
  if (staleTokens.length > 0) {
    await supabase.from('device_tokens').delete().in('token', staleTokens);
    console.log(`[Broadcast] Cleaned up ${staleTokens.length} stale token(s).`);
  }

  const successCount = results.filter(
    r => r.status === 'fulfilled' && r.value === true,
  ).length;
  const failCount = results.length - successCount;

  // ── Step 9: Log the send (prevents duplicates) ────────────────────────────
  await supabase.from('notification_send_log').insert({
    date_ist: dateIST,
    time_ist: matchedTime,
    success_count: successCount,
    fail_count: failCount,
  });

  const summary = {
    status: 'sent',
    matchedTime,
    sent: successCount,
    failed: failCount,
  };
  console.log('[Broadcast]', summary);

  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
