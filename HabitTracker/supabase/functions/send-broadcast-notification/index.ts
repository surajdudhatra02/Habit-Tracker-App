import { createClient } from '@supabase/supabase-js';
import { createBroadcastHandler } from './handler.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
interface FirebaseServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}
let firebaseAccount: FirebaseServiceAccount | undefined;
function getFirebaseAccount(): FirebaseServiceAccount {
  return (firebaseAccount ??= JSON.parse(
    Deno.env.get('FIREBASE_SERVICE_ACCOUNT')!,
  ));
}

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
  const FIREBASE_SA = getFirebaseAccount();
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
  const FIREBASE_SA = getFirebaseAccount();
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

// Cron must POST with the service-role bearer credential (stored in Vault).
// Ordinary user JWTs and the public anon key cannot invoke a broadcast.
Deno.serve(
  createBroadcastHandler({
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
    getSupabase: () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY),
    getAccessToken: getGoogleAccessToken,
    send: sendToToken,
  }),
);
