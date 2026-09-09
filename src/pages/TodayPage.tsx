import { useEffect, useState } from 'react';
import { getNewYorkDate } from '../lib/date';
import { EntryPage } from './DayPage';

export function TodayPage() {
  const [date, setDate] = useState(getNewYorkDate);
  useEffect(() => {
    const update = () => setDate(getNewYorkDate());
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <EntryPage key={date} date={date} today />;
}
