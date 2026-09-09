import { supabase } from './supabase';
import { getNewYorkDate, isValidDate } from './date';
import { cleanText, isMetUrl } from './metadata';
import type { AdjacentObject, ArchiveObject, DailyObject, LookCloserItem } from './types';

const fields = 'id,display_date,met_object_id,title,artist_display_name,culture,period,dynasty,object_date,medium,department,primary_image,primary_image_small,met_object_url,summary,why_it_matters,look_closer,created_at';

function client() {
  if (!supabase) throw new Error('Public data connection is not configured.');
  return supabase;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid object data.');
  return value as Record<string, unknown>;
}

function dateValue(value: unknown): string {
  if (typeof value !== 'string' || !isValidDate(value)) throw new Error('Invalid entry date.');
  return value;
}

function parseArchive(value: unknown): ArchiveObject {
  const row = record(value);
  const title = cleanText(row.title);
  if (!title) throw new Error('Invalid entry title.');
  return { display_date: dateValue(row.display_date), title,
    primary_image: isMetUrl(row.primary_image) ? row.primary_image : '',
    primary_image_small: isMetUrl(row.primary_image_small) ? row.primary_image_small : null };
}

function parseDaily(value: unknown): DailyObject {
  const row = record(value);
  if (!Number.isSafeInteger(row.id) || !Number.isSafeInteger(row.met_object_id) || !isMetUrl(row.met_object_url)) throw new Error('Invalid entry metadata.');
  const lookCloser: LookCloserItem[] = Array.isArray(row.look_closer) ? row.look_closer.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const label = cleanText(item.label), text = cleanText(item.text);
    return label && text ? [{ label, text }] : [];
  }).slice(0, 3) : [];
  return { ...parseArchive(row), id: Number(row.id), met_object_id: Number(row.met_object_id),
    artist_display_name: cleanText(row.artist_display_name), culture: cleanText(row.culture),
    period: cleanText(row.period), dynasty: cleanText(row.dynasty), object_date: cleanText(row.object_date),
    medium: cleanText(row.medium), department: cleanText(row.department), met_object_url: row.met_object_url,
    summary: cleanText(row.summary), why_it_matters: cleanText(row.why_it_matters),
    look_closer: lookCloser, created_at: cleanText(row.created_at) || '',
  };
}

export async function getObjectByDate(date: string): Promise<DailyObject | null> {
  if (!isValidDate(date) || date > getNewYorkDate()) return null;
  const { data, error } = await client().from('daily_objects').select(fields).eq('display_date', date).maybeSingle();
  if (error) throw new Error(`Entry query failed (${error.code || 'unavailable'})`);
  return data ? parseDaily(data) : null;
}

export function getTodayObject() { return getObjectByDate(getNewYorkDate()); }

async function adjacent(date: string, direction: 'previous' | 'next'): Promise<AdjacentObject | null> {
  if (!isValidDate(date)) return null;
  let query = client().from('daily_objects').select('display_date').lte('display_date', getNewYorkDate());
  query = direction === 'previous' ? query.lt('display_date', date) : query.gt('display_date', date);
  const { data, error } = await query.order('display_date', { ascending: direction === 'next' }).limit(1).maybeSingle();
  if (error) throw new Error(`Navigation query failed (${error.code || 'unavailable'})`);
  return data ? { display_date: dateValue(data.display_date) } : null;
}

export function getPreviousObject(date: string) { return adjacent(date, 'previous'); }
export function getNextObject(date: string) { return adjacent(date, 'next'); }

// Keyset pagination avoids Supabase's default row limit and offset drift.
export async function getArchiveObjects(): Promise<ArchiveObject[]> {
  const entries: ArchiveObject[] = [];
  let before: string | null = null;
  for (;;) {
    let query = client().from('daily_objects').select('display_date,title,primary_image,primary_image_small')
      .lte('display_date', getNewYorkDate()).order('display_date', { ascending: false }).limit(500);
    if (before) query = query.lt('display_date', before);
    const { data, error } = await query;
    if (error) throw new Error(`Archive query failed (${error.code || 'unavailable'})`);
    if (!data?.length) return entries;
    const page = data.map(parseArchive);
    entries.push(...page);
    before = page[page.length - 1].display_date;
  }
}

export async function getRecentObjects(limit = 4): Promise<ArchiveObject[]> {
  const { data, error } = await client().from('daily_objects').select('display_date,title,primary_image,primary_image_small')
    .lte('display_date', getNewYorkDate()).order('display_date', { ascending: false }).limit(Math.max(1, Math.min(500, Math.floor(limit))));
  if (error) throw new Error(`Recent entries query failed (${error.code || 'unavailable'})`);
  return (data || []).map(parseArchive);
}
