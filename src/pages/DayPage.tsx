import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatDate, isValidDate } from '../lib/date';
import { getObjectByDate, getPreviousObject, getNextObject } from '../lib/queries';
import type { AdjacentObject, DailyObject } from '../lib/types';
import { ArtworkHero } from '../components/ArtworkHero';
import { ArtworkMetadata } from '../components/ArtworkMetadata';
import { WhyItMatters } from '../components/WhyItMatters';
import { LookCloser } from '../components/LookCloser';
import { DayNavigation } from '../components/DayNavigation';
import { LoadingState, PageState } from '../components/PageState';

type State = { status: 'loading' } | { status: 'empty' } | { status: 'error' } | { status: 'ready'; object: DailyObject; previous: AdjacentObject | null; next: AdjacentObject | null };

export function EntryPage({ date, today = false }: { date: string; today?: boolean }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    if (!isValidDate(date)) { setState({ status: 'empty' }); return; }
    const load = async () => {
      try {
        const object = await getObjectByDate(date);
        if (!active) return;
        if (!object) { setState({ status: 'empty' }); return; }
        const [previous, next] = await Promise.all([getPreviousObject(date), getNextObject(date)]);
        if (active) { setState({ status: 'ready', object, previous, next }); document.title = `${object.title} · One From The Met`; }
      } catch (error) {
        if (import.meta.env.DEV) console.error(error);
        if (active) setState({ status: 'error' });
      }
    };
    void load();
    return () => { active = false; };
  }, [date, attempt]);

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <PageState title={today ? 'We couldn’t load today’s object.' : 'We couldn’t load this object.'} retry={() => setAttempt(n => n + 1)}>Try again, or explore the archive.</PageState>;
  if (state.status === 'empty') return <PageState title={today ? 'Today’s object is being prepared.' : 'There’s no entry for this date.'}>{today ? 'Explore the archive while you wait.' : 'Discover another day in the collection.'}</PageState>;
  const { object, previous, next } = state;
  return <article className="daily-entry">
    <div className="edition-heading"><span className="eyebrow">{today ? 'Today’s object' : 'From the archive'}</span><time dateTime={date}>{formatDate(date)}</time><span className="edition-mark" aria-hidden="true">One / day</span></div>
    <ArtworkHero key={object.met_object_id} src={object.primary_image} title={object.title} />
    <ArtworkMetadata object={object} />
    <div className="reading-room"><WhyItMatters summary={object.summary} text={object.why_it_matters} /><LookCloser items={object.look_closer} /><DayNavigation previous={previous} next={next} metUrl={object.met_object_url} /></div>
  </article>;
}

export function DayPage() {
  const { date = '' } = useParams();
  return <EntryPage key={date} date={date} />;
}
