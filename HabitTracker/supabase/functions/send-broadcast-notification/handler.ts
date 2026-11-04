import type { SupabaseClient } from '@supabase/supabase-js';

export interface BroadcastDependencies {
  serviceRoleKey: string | undefined;
  getSupabase: () => SupabaseClient;
  getAccessToken: () => Promise<string>;
  send: (
    accessToken: string,
    token: string,
    title: string,
    body: string,
  ) => Promise<{ ok: boolean; errorCode?: string }>;
  now?: () => number;
}

function reply(status: string, code = 200, details = {}): Response {
  return Response.json({ status, ...details }, { status: code });
}

export function createBroadcastHandler(deps: BroadcastDependencies) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }
    if (!deps.serviceRoleKey) return reply('server_not_configured', 503);

    // Gateway JWT validation alone also admits normal app users. Only the
    // server's exact service-role credential may trigger a broadcast.
    if (req.headers.get('Authorization') !== `Bearer ${deps.serviceRoleKey}`) {
      return reply('unauthorized', 401);
    }

    try {
      const supabase = deps.getSupabase();
      const { data: config, error: configError } = await supabase
        .from('notification_config')
        .select('*')
        .single();
      if (configError || !config) return reply('config_unavailable', 500);
      if (!config.is_enabled) return reply('disabled');

      const nowIST = new Date((deps.now ?? Date.now)() + 330 * 60 * 1000);
      const dateIST = nowIST.toISOString().split('T')[0];
      if (!Array.isArray(config.times_ist)) return reply('invalid_config', 500);
      const matchedTime = config.times_ist.find((time: unknown) => {
        if (
          typeof time !== 'string' ||
          !/^\d{1,2}:\d{2}(?::[0-5]\d(?:\.\d+)?)?$/.test(time)
        ) {
          return false;
        }
        const [hour, minute] = time.split(':').map(Number);
        return (
          hour < 24 &&
          minute < 60 &&
          hour === nowIST.getUTCHours() &&
          Math.abs(minute - nowIST.getUTCMinutes()) <= 5
        );
      }) as string | undefined;
      if (!matchedTime) return reply('no_match');

      // Normalize the claim key so 9:00, 09:00 and 09:00:00 share one slot.
      const [hour, minute] = matchedTime.split(':').map(Number);
      const slot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
      )}`;

      // Honor sends made before claims were introduced. A failed lookup must
      // never be interpreted as permission to send. Limit handles old duplicates.
      const { data: logs, error: logError } = await supabase
        .from('notification_send_log')
        .select('id')
        .eq('date_ist', dateIST)
        .in('time_ist', [matchedTime, slot, `${slot}:00`])
        .limit(1);
      if (logError) return reply('send_history_unavailable', 500);
      if (logs?.length) return reply('already_sent');

      const { data: rows, error: tokenError } = await supabase
        .from('device_tokens')
        .select('token');
      if (tokenError) return reply('tokens_unavailable', 500);
      // A physical token can belong to more than one account row.
      const tokens = [
        ...new Set<string>(
          (rows ?? [])
            .map((row: { token: string }) => row.token)
            .filter(Boolean),
        ),
      ];
      if (!tokens.length) return reply('no_tokens');
      const accessToken = await deps.getAccessToken();

      // The primary key arbitrates concurrent workers atomically. Do not use
      // upsert, delete a claim on failure, or add an expiry: FCM may have accepted
      // a request even when its response was lost.
      const { error: claimError } = await supabase
        .from('notification_broadcast_claims')
        .insert({ date_ist: dateIST, time_ist: slot });
      if (claimError?.code === '23505') return reply('already_claimed');
      if (claimError) return reply('claim_unavailable', 500);

      const staleTokens: string[] = [];
      const results = await Promise.allSettled(
        tokens.map(async token => {
          const result = await deps.send(
            accessToken,
            token,
            config.title,
            config.body,
          );
          if (result.errorCode === 'UNREGISTERED') staleTokens.push(token);
          return result.ok;
        }),
      );
      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value,
      ).length;
      const failCount = results.length - successCount;
      const counts = { success_count: successCount, fail_count: failCount };

      const { error: outcomeError } = await supabase
        .from('notification_broadcast_claims')
        .update({
          ...counts,
          completed_at: new Date((deps.now ?? Date.now)()).toISOString(),
        })
        .eq('date_ist', dateIST)
        .eq('time_ist', slot)
        .select('date_ist')
        .single();
      const { error: insertLogError } = await supabase
        .from('notification_send_log')
        .insert({ date_ist: dateIST, time_ist: matchedTime, ...counts });

      if (staleTokens.length) {
        const { error } = await supabase
          .from('device_tokens')
          .delete()
          .in('token', staleTokens);
        if (error) console.error('[Broadcast] Stale-token cleanup failed.');
      }
      if (outcomeError || insertLogError) return reply('recording_failed', 500);
      return reply('sent', 200, {
        matchedTime,
        sent: successCount,
        failed: failCount,
      });
    } catch {
      // Any claim already acquired remains durable, including on timeouts.
      console.error('[Broadcast] Execution failed.');
      return reply('execution_failed', 500);
    }
  };
}
