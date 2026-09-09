import { createClient } from '@supabase/supabase-js';
import type { DailyObjectInsert } from '../src/lib/types';

export interface DailyStore {
  hasDate(date: string): Promise<boolean>;
  hasObject(id: number): Promise<boolean>;
  insert(record: DailyObjectInsert): Promise<'inserted' | 'date-exists' | 'object-exists'>;
}

export function createAdminStore(): DailyStore {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the job environment.');
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }) },
  });
  const exists = async (column: string, value: string | number): Promise<boolean> => {
    const { data, error } = await client.from('daily_objects').select('id').eq(column, value).maybeSingle();
    if (error) throw new Error(`Database lookup failed (${error.code || 'unavailable'})`);
    return data !== null;
  };
  return {
    hasDate: date => exists('display_date', date),
    hasObject: id => exists('met_object_id', id),
    async insert(record) {
      const { error } = await client.from('daily_objects').insert(record);
      if (!error) return 'inserted';
      if (error.code === '23505') {
        if (await exists('display_date', record.display_date)) return 'date-exists';
        if (await exists('met_object_id', record.met_object_id)) return 'object-exists';
      }
      throw new Error(`Database insert failed (${error.code || 'unavailable'})`);
    },
  };
}
