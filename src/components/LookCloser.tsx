import type { LookCloserItem } from '../lib/types';

export function LookCloser({ items }: { items: LookCloserItem[] }) {
  if (!items.length) return null;
  return <section className="closer" aria-labelledby="closer-heading">
    <h2 className="eyebrow" id="closer-heading">Look closer</h2>
    <ol>{items.map((item, index) => <li key={item.label}>
      <span className="observation-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div><h3 className="eyebrow">{item.label}</h3><p>{item.text}</p></div>
    </li>)}</ol>
  </section>;
}
