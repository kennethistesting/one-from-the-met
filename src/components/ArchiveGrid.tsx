import type { ArchiveObject } from '../lib/types';
import { formatDate } from '../lib/date';
import { ArchiveItem } from './ArchiveItem';

export function ArchiveGrid({ objects }: { objects: ArchiveObject[] }) {
  const months = new Map<string, ArchiveObject[]>();
  for (const object of objects) {
    const month = object.display_date.slice(0, 7);
    months.set(month, [...(months.get(month) || []), object]);
  }
  return <>{[...months].map(([month, entries]) => <section className="archive-month" key={month}>
    <h2 className="eyebrow">{formatDate(`${month}-01`, { month: 'long', year: 'numeric' })}</h2>
    <div className="archive-grid">{entries.map(object => <ArchiveItem key={object.display_date} object={object} />)}</div>
  </section>)}</>;
}
