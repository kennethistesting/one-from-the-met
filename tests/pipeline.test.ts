import test from 'node:test';
import assert from 'node:assert/strict';
import { getNewYorkDate, isValidDate } from '../src/lib/date';
import { generateFallbackContent } from '../src/lib/contentGenerator';
import { isPublicKey } from '../src/lib/publicKey';
import { parseEligibleObject, parseCandidateIDs, shuffle } from '../scripts/met';
import { selectDailyObject } from '../scripts/select-daily-object';
import type { DailyStore } from '../scripts/supabase-admin';
import type { DailyObjectInsert } from '../src/lib/types';

const candidate = {
  objectID: 1, title: 'Study', isPublicDomain: true,
  primaryImage: 'https://images.metmuseum.org/CRDImages/ep/original/example.jpg',
  objectURL: 'https://www.metmuseum.org/art/collection/search/1',
  culture: 'French', medium: 'Oil on canvas', objectDate: '1889', department: 'European Paintings',
};
const now = new Date('2026-09-08T14:00:00Z');

function memoryStore(initial: DailyObjectInsert[] = []): DailyStore & { rows: DailyObjectInsert[] } {
  const rows = [...initial];
  return { rows,
    async hasDate(date) { return rows.some(row => row.display_date === date); },
    async hasObject(id) { return rows.some(row => row.met_object_id === id); },
    async insert(row) {
      if (rows.some(item => item.display_date === row.display_date)) return 'date-exists';
      if (rows.some(item => item.met_object_id === row.met_object_id)) return 'object-exists';
      rows.push(row); return 'inserted';
    },
  };
}
const quiet = () => {};

test('New York dates handle UTC midnight, leap days and both DST transitions', () => {
  assert.equal(getNewYorkDate(new Date('2026-09-09T02:00:00Z')), '2026-09-08');
  assert.equal(getNewYorkDate(new Date('2026-01-01T04:59:59Z')), '2025-12-31');
  assert.equal(getNewYorkDate(new Date('2026-03-08T07:00:00Z')), '2026-03-08');
  assert.equal(getNewYorkDate(new Date('2026-11-01T06:00:00Z')), '2026-11-01');
  assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('bad-date'), false);
});

test('eligibility rejects absent, placeholder, unsafe and non-public-domain metadata', () => {
  assert.ok(parseEligibleObject(candidate));
  for (const patch of [{ title: 'N/A' }, { title: ' ' }, { primaryImage: '' }, { objectID: 0 },
    { isPublicDomain: false }, { isPublicDomain: 'true' }, { objectURL: 'javascript:alert(1)' },
    { primaryImage: 'https://metmuseum.org.evil.example/a.jpg' }, { culture: null }]) {
    assert.equal(parseEligibleObject({ ...candidate, ...patch }), null);
  }
  assert.equal(parseEligibleObject(null), null);
});

test('candidate response validation and Fisher-Yates keep unique valid IDs', () => {
  assert.deepEqual(parseCandidateIDs({ objectIDs: [1, 2, 2] }), [1, 2]);
  assert.throws(() => parseCandidateIDs({ objectIDs: ['1'] }));
  const source = [1, 2, 3];
  assert.deepEqual(shuffle(source, () => 0), [2, 3, 1]);
  assert.deepEqual(source, [1, 2, 3]);
});

test('fallback produces exactly three factual prompts even with sparse metadata', () => {
  const parsed = parseEligibleObject({ ...candidate, medium: null, objectDate: 'Unknown', department: null })!;
  const content = generateFallbackContent(parsed);
  assert.equal(content.lookCloser.length, 3);
  assert.doesNotMatch(JSON.stringify(content), /undefined|\bnull\b|Unknown|N\/A/);
  assert.equal(generateFallbackContent(parseEligibleObject(candidate)!).lookCloser[0].label, 'Material');
});

test('second execution exits before contacting Met and preserves the original entry', async () => {
  const store = memoryStore();
  assert.equal(await selectDailyObject({ store, now, candidates: async () => [1], object: async () => candidate, log: quiet }), 'inserted');
  const original = structuredClone(store.rows[0]);
  assert.equal(await selectDailyObject({ store, now, candidates: async () => { throw new Error('Must not request candidates'); }, log: quiet }), 'already-exists');
  assert.equal(store.rows.length, 1);
  assert.deepEqual(store.rows[0], original);
});

test('skips invalid, failed and already-used objects before saving a valid candidate', async () => {
  const store = memoryStore();
  await selectDailyObject({ store, now: new Date('2026-09-07T14:00:00Z'), candidates: async () => [1], object: async () => candidate, log: quiet });
  await selectDailyObject({ store, now, random: () => .999, candidates: async () => [1, 2, 3, 4], object: async id => {
    if (id === 2) return { ...candidate, objectID: 2, primaryImage: '' };
    if (id === 3) throw new Error('Met unavailable');
    return { ...candidate, objectID: id };
  }, log: quiet });
  assert.deepEqual(store.rows.map(row => row.met_object_id), [1, 4]);
});

test('fails after 20 candidates without writing incomplete content', async () => {
  const store = memoryStore();
  let attempts = 0;
  await assert.rejects(selectDailyObject({ store, now, candidates: async () => Array.from({ length: 50 }, (_, i) => i + 1), object: async () => { attempts++; return null; }, log: quiet }), /20 candidates/);
  assert.equal(attempts, 20); assert.equal(store.rows.length, 0);
});

test('simultaneous selectors resolve a date collision successfully', async () => {
  const store = memoryStore();
  const options = { store, now, candidates: async () => [1], object: async () => candidate, log: quiet };
  const results = await Promise.all([selectDailyObject(options), selectDailyObject(options)]);
  assert.equal(store.rows.length, 1);
  assert.ok(results.includes('already-exists'));
});

test('an object collision during insertion tries the next candidate', async () => {
  const store = memoryStore();
  const save = store.insert;
  store.insert = async row => row.met_object_id === 1 ? 'object-exists' : save(row);
  await selectDailyObject({ store, now, random: () => .999, candidates: async () => [1, 2], object: async id => ({ ...candidate, objectID: id }), log: quiet });
  assert.equal(store.rows[0].met_object_id, 2);
});

test('database errors fail the run rather than selecting around them', async () => {
  const store = memoryStore();
  store.insert = async () => { throw new Error('Database unavailable'); };
  await assert.rejects(selectDailyObject({ store, now, candidates: async () => [1], object: async () => candidate, log: quiet }), /Database unavailable/);
});

test('public client keys reject service-role and secret keys', () => {
  const token = (role: string) => `header.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
  assert.equal(isPublicKey(token('anon')), true);
  assert.equal(isPublicKey(token('service_role')), false);
  assert.equal(isPublicKey('sb_secret_example'), false);
  assert.equal(isPublicKey('sb_publishable_example'), true);
});
