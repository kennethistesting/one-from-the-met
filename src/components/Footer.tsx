import { Link } from 'react-router-dom';

export function Footer() {
  return <footer className="site-footer">
    <p>One object. One day. A few minutes of learning.</p>
    <div><p>Art &amp; imagery from The Metropolitan Museum of Art.</p><Link to="/about">About this project</Link></div>
  </footer>;
}
