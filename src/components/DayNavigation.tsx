import { Link } from 'react-router-dom';
import type { AdjacentObject } from '../lib/types';

export function DayNavigation({ previous, next, metUrl }: { previous: AdjacentObject | null; next: AdjacentObject | null; metUrl: string }) {
  return <div className="entry-bottom">
    <nav className="day-navigation" aria-label="Daily entries">
      <span>{previous && <Link to={`/day/${previous.display_date}`}>← Previous</Link>}</span>
      <Link to="/archive">Archive</Link>
      <span>{next && <Link to={`/day/${next.display_date}`}>Next →</Link>}</span>
    </nav>
    <a className="met-link" href={metUrl} target="_blank" rel="noopener noreferrer">View at The Met <span aria-hidden="true">↗</span></a>
  </div>;
}
