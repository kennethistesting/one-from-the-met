export function isPublicKey(value: string): boolean {
  if (value.startsWith('sb_publishable_')) return true;
  try {
    const payload: unknown = JSON.parse(atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload === 'object' && payload !== null && 'role' in payload && payload.role === 'anon';
  } catch { return false; }
}
