export function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return !text || /^(unknown|n\/?a|null|undefined|not available|none|[-?]+)$/i.test(text) ? null : text;
}

export function isMetUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'metmuseum.org' || url.hostname.endsWith('.metmuseum.org'));
  } catch { return false; }
}
