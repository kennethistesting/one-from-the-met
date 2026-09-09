import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  useEffect(() => { document.title = 'About · One From The Met'; }, []);
  return <article className="about-page"><p className="eyebrow">About this project</p><h1>A small daily encounter with art.</h1>
    <p>One From The Met presents one object from The Metropolitan Museum of Art collection each day. Spend a few minutes with its materials, its details, and the questions it invites.</p>
    <p>Each selection stays in the archive. Days follow New York time, and the next object is selected in the early morning.</p>
    <p>Object metadata and public-domain imagery come from <a href="https://metmuseum.github.io/" target="_blank" rel="noopener noreferrer">The Met Collection API</a>. Learning prompts are derived from that metadata; the linked museum record provides the full curatorial information.</p>
    <p>This is an independent project, not affiliated with or endorsed by The Metropolitan Museum of Art.</p><Link className="text-link" to="/">Today’s object →</Link>
  </article>;
}
