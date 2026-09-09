import { NavLink, Link } from 'react-router-dom';

export function Header() {
  return <header className="site-header">
    <Link to="/" className="wordmark" aria-label="One From The Met — today">ONE FROM <span>THE MET</span></Link>
    <nav aria-label="Main navigation"><NavLink to="/archive">Archive <span aria-hidden="true">↗</span></NavLink></nav>
  </header>;
}
