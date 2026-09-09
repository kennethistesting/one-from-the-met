import { Link } from 'react-router-dom';

export function LoadingState() {
  return <div className="loading-state" role="status"><span className="sr-only">Loading the collection…</span><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>;
}

export function PageState({ title, children, retry }: { title: string; children: React.ReactNode; retry?: () => void }) {
  return <section className="page-state" aria-live="polite"><p className="eyebrow">One from the Met</p><h1>{title}</h1><p>{children}</p><div className="state-actions">{retry && <button onClick={retry}>Try again</button>}<Link to="/archive">Explore the archive →</Link></div></section>;
}
