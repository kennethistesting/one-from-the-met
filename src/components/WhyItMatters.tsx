export function WhyItMatters({ summary, text }: { summary: string | null; text: string | null }) {
  if (!summary && !text) return null;
  return <section className="essay" aria-labelledby="why-heading">
    <h2 className="eyebrow" id="why-heading">Why it matters</h2>
    <div>{summary && <p className="summary">{summary}</p>}{text && <p>{text}</p>}</div>
  </section>;
}
