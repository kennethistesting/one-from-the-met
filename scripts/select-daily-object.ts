import { pathToFileURL } from 'node:url';
import { getNewYorkDate } from './date';
import { generateFallbackContent } from './content';
import { fetchCandidateIDs, fetchObject, isRecord, parseEligibleObject, shuffle } from './met';
import { createAdminStore, type DailyStore } from './supabase-admin';
import type { DailyObjectInsert } from '../src/lib/types';

interface SelectionDependencies {
  store: DailyStore;
  candidates?: () => Promise<number[]>;
  object?: (id: number) => Promise<unknown>;
  now?: Date;
  random?: () => number;
  log?: (message: string) => void;
}

export async function selectDailyObject({ store, candidates = fetchCandidateIDs, object = fetchObject,
  now = new Date(), random = Math.random, log = console.log }: SelectionDependencies): Promise<'inserted' | 'already-exists'> {
  const date = getNewYorkDate(now);
  if (await store.hasDate(date)) {
    log(`An entry already exists for ${date}; leaving it unchanged.`);
    return 'already-exists';
  }
  const ids = shuffle([...new Set(await candidates())], random).slice(0, 20);
  for (const id of ids) {
    let raw: unknown;
    try { raw = await object(id); }
    catch { log(`Object ${id}: metadata request failed; trying another candidate.`); continue; }
    const item = parseEligibleObject(raw);
    if (!item || item.objectID !== id || !isRecord(raw)) { log(`Object ${id}: ineligible metadata.`); continue; }
    if (await store.hasObject(id)) { log(`Object ${id}: already featured.`); continue; }
    const content = generateFallbackContent(item);
    const record: DailyObjectInsert = {
      display_date: date, met_object_id: id, title: item.title,
      artist_display_name: item.artistDisplayName, culture: item.culture, period: item.period, dynasty: item.dynasty,
      object_date: item.objectDate, medium: item.medium, department: item.department,
      primary_image: item.primaryImage, primary_image_small: item.primaryImageSmall,
      met_object_url: item.objectURL, summary: content.summary, why_it_matters: content.whyItMatters,
      look_closer: content.lookCloser, raw_metadata: raw,
    };
    const result = await store.insert(record);
    if (result === 'object-exists') continue;
    log(result === 'inserted' ? `Selected Met object ${id} for ${date}.` : `Another run already selected an object for ${date}.`);
    return result === 'inserted' ? 'inserted' : 'already-exists';
  }
  throw new Error(`No eligible, unused Met object found after ${ids.length} candidates (maximum 20); no entry inserted.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await selectDailyObject({ store: createAdminStore() }); }
  catch (error) {
    console.error(error instanceof Error ? error.message : 'Daily object selection failed.');
    process.exitCode = 1;
  }
}
