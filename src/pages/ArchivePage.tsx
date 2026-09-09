import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArchiveObjects } from '../lib/queries';
import type { ArchiveObject } from '../lib/types';
import { ArchiveGrid } from '../components/ArchiveGrid';
import { LoadingState, PageState } from '../components/PageState';

export function ArchivePage() {
  const [objects, setObjects] = useState<ArchiveObject[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    document.title = 'Archive · One From The Met';
    setError(false); setObjects(null);
    getArchiveObjects().then(data => { if (active) setObjects(data); }).catch(err => {
      if (import.meta.env.DEV) console.error(err);
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [attempt]);
  if (error) return <PageState title="We couldn’t load the archive." retry={() => setAttempt(n => n + 1)}>Please try again in a moment.</PageState>;
  if (!objects) return <LoadingState />;
  return <div className="archive-page"><div className="archive-heading"><div><p className="eyebrow">The collection, day by day</p><h1>Archive</h1></div><Link to="/">Back to today ↗</Link></div>
    {objects.length ? <ArchiveGrid objects={objects} /> : <div className="archive-empty"><h2>A collection begins with one object.</h2><p>Daily entries will gather here as they are published.</p></div>}
  </div>;
}
