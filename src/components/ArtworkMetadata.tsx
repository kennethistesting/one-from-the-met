import type { DailyObject } from '../lib/types';

export function ArtworkMetadata({ object }: { object: DailyObject }) {
  const maker = object.artist_display_name || object.culture || object.period || object.dynasty;
  return <section className="artwork-metadata" aria-labelledby="artwork-title">
    <h1 id="artwork-title">{object.title}</h1>
    {maker && <p className="maker">{maker}</p>}
    {object.object_date && <p className="object-date">{object.object_date}</p>}
    {(object.medium || object.department) && <dl className="catalogue-details">
      {object.medium && <div><dt>Medium</dt><dd>{object.medium}</dd></div>}
      {object.department && <div><dt>Collection</dt><dd>{object.department}</dd></div>}
    </dl>}
  </section>;
}
