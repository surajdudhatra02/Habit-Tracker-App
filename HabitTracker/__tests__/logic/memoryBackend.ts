// Minimal PostgREST boundary: writes persist independently, undefined fields
// are omitted by JSON serialization, and failed statements do not mutate rows.
// No production services are contacted.
export const memoryBackend = (initial: Record<string, any[]> = {}) => {
  const tables: Record<string, any[]> = JSON.parse(JSON.stringify(initial));
  const failures: Record<string, string[]> = {};
  const calls: any[] = [];
  let nextId = 0;

  const from = (table: string) => {
    let operation = 'select';
    let payload: any;
    let single = false;
    let conflictKeys: string[] = [];
    let ignoreDuplicates = false;
    const filters: [string, any][] = [];
    const query: any = {
      select: () => query,
      order: () => query,
      eq: (key: string, value: any) => {
        filters.push([key, value]);
        return query;
      },
      insert: (value: any) => {
        operation = 'insert';
        payload = value;
        return query;
      },
      update: (value: any) => {
        operation = 'update';
        payload = value;
        return query;
      },
      upsert: (value: any, options: any = {}) => {
        operation = 'upsert';
        payload = value;
        conflictKeys = (options.onConflict ?? 'id')
          .split(',')
          .map((key: string) => key.trim());
        ignoreDuplicates = !!options.ignoreDuplicates;
        return query;
      },
      delete: () => {
        operation = 'delete';
        return query;
      },
      single: () => {
        single = true;
        return query;
      },
      then: (resolve: any, reject: any) => {
        calls.push({ table, operation, payload, filters });
        const failure = failures[`${table}:${operation}`]?.shift();
        if (failure) {
          return Promise.resolve({
            data: null,
            error: { message: failure },
          }).then(resolve, reject);
        }
        const rows = (tables[table] ||= []);
        const matches = (row: any) =>
          filters.every(([key, value]) => row[key] === value);
        let data: any[] = rows.filter(matches);
        if (operation === 'insert' || operation === 'upsert') {
          data = (Array.isArray(payload) ? payload : [payload]).map(row => ({
            id: `generated-${++nextId}`,
            ...JSON.parse(JSON.stringify(row)),
          }));
          for (const row of data) {
            const existing =
              operation === 'upsert' &&
              rows.find(current =>
                conflictKeys.every(key => current[key] === row[key]),
              );
            if (existing) {
              if (!ignoreDuplicates)
                Object.assign(existing, { ...row, id: existing.id });
            } else rows.push(row);
          }
        } else if (operation === 'delete') {
          tables[table] = rows.filter(row => !matches(row));
        } else if (operation === 'update') {
          data.forEach(row =>
            Object.assign(row, JSON.parse(JSON.stringify(payload))),
          );
        }
        return Promise.resolve({
          data: single ? data[0] : data,
          error: null,
        }).then(resolve, reject);
      },
    };
    return query;
  };

  // RPC response model for UI/store tests. Actual transaction rollback,
  // validation and authorization are tested independently in PostgreSQL.
  const rpc = (name: string, params: any) => ({
    single: async () => {
      const snapshot = JSON.parse(JSON.stringify(tables));
      const execute = async (query: any) => {
        const result = await query;
        if (result.error) throw result.error;
        return result.data;
      };
      try {
        let saved;
        if (name === 'create_habit_with_reminders') {
          saved = tables.habits?.find(row => row.id === params.p_habit_id);
          if (saved) return { data: saved, error: null };
          saved = await execute(
            from('habits')
              .insert({
                id: params.p_habit_id,
                user_id: 'alice',
                name: params.p_name,
                description: params.p_description,
                goal: params.p_goal,
              })
              .single(),
          );
        } else if (name === 'update_habit_with_reminders') {
          saved = await execute(
            from('habits')
              .update(params.p_updates)
              .eq('id', params.p_habit_id)
              .single(),
          );
        } else throw new Error(`Unexpected RPC ${name}`);
        if (params.p_reminders !== null) {
          await execute(
            from('habit_reminders').delete().eq('habit_id', saved.id),
          );
          await execute(
            from('habit_reminders').insert(
              params.p_reminders.map((time: string) => ({
                habit_id: saved.id,
                reminder_time: `${time.slice(0, 5)}:00`,
                is_enabled: true,
              })),
            ),
          );
        }
        return { data: saved, error: null };
      } catch (error) {
        Object.keys(tables).forEach(key => {
          delete tables[key];
        });
        Object.assign(tables, snapshot);
        return { data: null, error };
      }
    },
  });

  return {
    tables,
    calls,
    from,
    rpc,
    failNext: (
      table: string,
      operation: string,
      message = 'Simulated backend failure',
    ) => {
      (failures[`${table}:${operation}`] ||= []).push(message);
    },
  };
};
