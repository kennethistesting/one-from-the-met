import { Link } from 'react-router-dom';
import type { ArchiveObject } from '../lib/types';
import { formatDate } from '../lib/date';
import { ArtworkHero } from './ArtworkHero';

export function ArchiveItem({ object }: { object: ArchiveObject }) {
  return <Link className="archive-item" to={`/day/${object.display_date}`}>
    <ArtworkHero src={object.primary_image_small || object.primary_image} title={object.title} thumbnail />
    <time dateTime={object.display_date}>{formatDate(object.display_date, { month: 'short', day: 'numeric' })}</time>
    <h3>{object.title}</h3>
  </Link>;
}
