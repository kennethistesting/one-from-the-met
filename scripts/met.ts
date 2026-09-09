import type { MetObject } from '../src/lib/types';
import { cleanText, isMetUrl } from '../src/lib/metadata';

const BASE = 'https://collectionapi.metmuseum.org/public/collection';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function fetchJson(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (response.ok) return await response.json();
      if (response.status !== 429 && response.status < 500) throw new Error(`Met API returned HTTP ${response.status}`);
    } catch (error) {
      if (attempt === 2) throw error;
    }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  throw new Error('Met API remained unavailable after three requests');
}

export function parseCandidateIDs(data: unknown): number[] {
  if (!isRecord(data) || !Array.isArray(data.objectIDs) ||
      !data.objectIDs.every(id => Number.isSafeInteger(id) && id > 0)) {
    throw new Error('Met search returned an invalid candidate response');
  }
  return [...new Set(data.objectIDs as number[])];
}

export async function fetchCandidateIDs(): Promise<number[]> {
  return parseCandidateIDs(await fetchJson(`${BASE}/v1.1/search?hasImages=true&isHighlight=true&offset=0&limit=500`));
}

export async function fetchObject(id: number): Promise<unknown> {
  return fetchJson(`${BASE}/v1/objects/${id}`);
}

export function parseEligibleObject(data: unknown): MetObject | null {
  if (!isRecord(data) || !Number.isSafeInteger(data.objectID) || Number(data.objectID) <= 0 ||
      !cleanText(data.title) || data.isPublicDomain !== true ||
      !isMetUrl(data.primaryImage) || !isMetUrl(data.objectURL)) return null;
  const artistDisplayName = cleanText(data.artistDisplayName);
  const culture = cleanText(data.culture);
  const period = cleanText(data.period);
  const dynasty = cleanText(data.dynasty);
  if (![artistDisplayName, culture, period, dynasty].some(Boolean)) return null;
  return {
    objectID: Number(data.objectID), title: cleanText(data.title)!, isPublicDomain: true,
    primaryImage: data.primaryImage, primaryImageSmall: isMetUrl(data.primaryImageSmall) ? data.primaryImageSmall : null,
    objectURL: data.objectURL, artistDisplayName, culture, period, dynasty,
    objectDate: cleanText(data.objectDate), medium: cleanText(data.medium),
    department: cleanText(data.department), objectName: cleanText(data.objectName),
    classification: cleanText(data.classification), dimensions: cleanText(data.dimensions),
  };
}

export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
