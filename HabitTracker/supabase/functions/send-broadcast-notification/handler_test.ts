import { strict as assert } from 'node:assert';
import { createClient } from '@supabase/supabase-js';
import { createBroadcastHandler } from './handler.ts';

const serverKey = 'test-server-credential';
const now = Date.parse('2026-11-04T03:30:00Z'); // 09:00 IST
const request = (key = serverKey, method = 'POST') =>
  new Request('https://local.test', {
    method,
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });

// Real supabase-js query construction, with a local PostgREST transport double.
// No test can reach Supabase, Google OAuth or FCM.
function fixture() {
  const state = {
    config: {
      is_enabled: true,
      times_ist: ['09:00'],
      title: 'Habit',
      body: 'Keep going',
    },
    tokens: ['device-a', 'device-a', 'device-b'],
    history: false,
    claims: new Set<string>(),
    dbCalls: 0,
    oauthCalls: 0,
    sent: [] as string[],
    deleted: false,
    fail: '',
    rejectSend: false,
    stale: false,
  };
  const fetchMock: typeof fetch = async (input, init) => {
    state.dbCalls++;
    const url = new URL(String(input));
    const table = url.pathname.split('/').at(-1);
    const method = init?.method ?? 'GET';
    const action = `${table}:${method}`;
    if (state.fail === action) {
      return Response.json(
        { code: 'XX000', message: 'Simulated DB outage' },
        {
          status: 500,
        },
      );
    }
    if (table === 'notification_config') return Response.json(state.config);
    if (table === 'device_tokens') {
      if (method === 'DELETE') {
        state.deleted = true;
        return new Response(null, { status: 204 });
      }
      return Response.json(state.tokens.map(token => ({ token })));
    }
    if (table === 'notification_send_log') {
      if (method === 'GET') {
        return Response.json(state.history ? [{ id: 1 }] : []);
      }
      state.history = true;
      return new Response(null, { status: 201 });
    }
    if (table === 'notification_broadcast_claims') {
      if (method === 'POST') {
        const row = JSON.parse(String(init?.body));
        const slot = `${row.date_ist}/${row.time_ist}`;
        if (state.claims.has(slot)) {
          return Response.json({ code: '23505' }, { status: 409 });
        }
        state.claims.add(slot);
        return new Response(null, { status: 201 });
      }
      return Response.json({ date_ist: '2026-11-04' });
    }
    throw new Error(`Unexpected database operation: ${action}`);
  };
  const client = createClient('https://db.local.test', serverKey, {
    global: { fetch: fetchMock },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const handle = createBroadcastHandler({
    serviceRoleKey: serverKey,
    getSupabase: () => client,
    getAccessToken: () => {
      state.oauthCalls++;
      if (state.fail === 'oauth') {
        return Promise.reject(new Error('OAuth unavailable'));
      }
      return Promise.resolve('test-google-token');
    },
    send: async (_access, token) => {
      state.sent.push(token);
      // Keep the winner in flight while competing requests acquire their claims.
      await new Promise(resolve => setTimeout(resolve, 15));
      if (state.rejectSend) {
        throw new Error('Response lost after FCM accepted request');
      }
      return state.stale
        ? { ok: false, errorCode: 'UNREGISTERED' }
        : { ok: true };
    },
    now: () => now,
  });
  return { state, handle };
}

Deno.test(
  'rejects public keys, user JWTs, forged admin JWTs and missing credentials before side effects',
  async () => {
    const { state, handle } = fixture();
    for (const key of [
      '',
      'anon-key',
      'user-jwt',
      'eyJhbGciOiJub25lIn0.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.',
    ]) {
      assert.equal((await handle(request(key))).status, 401);
    }
    assert.equal(state.dbCalls, 0);
    assert.equal(state.oauthCalls, 0);
    assert.deepEqual(state.sent, []);
  },
);

Deno.test(
  'only POST is supported; missing server credentials fail closed',
  async () => {
    const { state, handle } = fixture();
    const response = await handle(request(serverKey, 'GET'));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'POST');
    const unconfigured = createBroadcastHandler({
      serviceRoleKey: undefined,
      getSupabase: () => {
        throw new Error('Must not create client');
      },
      getAccessToken: () => Promise.reject(new Error('Must not fetch token')),
      send: () => Promise.reject(new Error('Must not send')),
    });
    assert.equal((await unconfigured(request())).status, 503);
    assert.equal(state.dbCalls, 0);
  },
);

Deno.test(
  'eight overlapping executions dispatch each physical token only once',
  async () => {
    const { state, handle } = fixture();
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => handle(request())),
    );
    const bodies = await Promise.all(
      responses.map(response => response.json()),
    );
    assert.equal(bodies.filter(body => body.status === 'sent').length, 1);
    assert.equal(
      bodies.filter(body => body.status === 'already_claimed').length,
      7,
    );
    assert.deepEqual(state.sent.sort(), ['device-a', 'device-b']);
    assert.equal(state.claims.size, 1);
    assert.deepEqual(
      bodies.find(body => body.status === 'sent'),
      {
        status: 'sent',
        matchedTime: '09:00',
        sent: 2,
        failed: 0,
      },
    );
  },
);

Deno.test(
  'legacy send history prevents sending without consuming a new claim',
  async () => {
    const { state, handle } = fixture();
    state.history = true;
    assert.equal(
      (await (await handle(request())).json()).status,
      'already_sent',
    );
    assert.equal(state.claims.size, 0);
    assert.equal(state.oauthCalls, 0);
    assert.deepEqual(state.sent, []);
  },
);

for (const failure of [
  'notification_config:GET',
  'notification_send_log:GET',
  'device_tokens:GET',
  'notification_broadcast_claims:POST',
]) {
  Deno.test(`database error at ${failure} prevents dispatch`, async () => {
    const { state, handle } = fixture();
    state.fail = failure;
    assert.equal((await handle(request())).status, 500);
    assert.deepEqual(state.sent, []);
    assert.equal(state.claims.size, 0);
  });
}

Deno.test(
  'OAuth failure leaves the slot available for a later successful attempt',
  async () => {
    const { state, handle } = fixture();
    state.fail = 'oauth';
    assert.equal((await handle(request())).status, 500);
    assert.equal(state.claims.size, 0);
    assert.deepEqual(state.sent, []);
    state.fail = '';
    assert.equal((await (await handle(request())).json()).status, 'sent');
  },
);

for (const failure of [
  'notification_send_log:POST',
  'notification_broadcast_claims:PATCH',
]) {
  Deno.test(
    `recording failure at ${failure} cannot cause a retry to resend`,
    async () => {
      const { state, handle } = fixture();
      state.fail = failure;
      assert.equal((await handle(request())).status, 500);
      assert.equal(state.claims.size, 1);
      // Even if the audit log is absent, the independent claim still blocks retry.
      state.history = false;
      state.fail = '';
      assert.equal(
        (await (await handle(request())).json()).status,
        'already_claimed',
      );
      assert.equal(state.sent.length, 2);
    },
  );
}

Deno.test(
  'uncertain FCM responses retain the claim even when logging also fails',
  async () => {
    const { state, handle } = fixture();
    state.rejectSend = true;
    state.fail = 'notification_send_log:POST';
    assert.equal((await handle(request())).status, 500);
    state.rejectSend = false;
    state.fail = '';
    // Also change formatting of the configured time; it is still the same slot.
    for (const time of ['9:00', '09:00:00', '09:00:30']) {
      state.config.times_ist = [time];
      assert.equal(
        (await (await handle(request())).json()).status,
        'already_claimed',
      );
    }
    assert.equal(state.sent.length, 2);
  },
);

Deno.test(
  'stale tokens are cleaned and failed sends counted without retrying',
  async () => {
    const { state, handle } = fixture();
    state.stale = true;
    const body = await (await handle(request())).json();
    assert.equal(body.sent, 0);
    assert.equal(body.failed, 2);
    assert.equal(state.deleted, true);
    assert.equal(
      (await (await handle(request())).json()).status,
      'already_sent',
    );
    assert.equal(state.sent.length, 2);
  },
);

Deno.test(
  'disabled, unscheduled and empty-recipient runs do not claim or send',
  async () => {
    for (const status of ['disabled', 'no_match', 'no_tokens']) {
      const { state, handle } = fixture();
      if (status === 'disabled') state.config.is_enabled = false;
      if (status === 'no_match') state.config.times_ist = ['20:00'];
      if (status === 'no_tokens') state.tokens = [];
      assert.equal((await (await handle(request())).json()).status, status);
      assert.equal(state.claims.size, 0);
      assert.deepEqual(state.sent, []);
    }
  },
);
