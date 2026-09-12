import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PageState } from './components/PageState';
import { DayPage } from './pages/DayPage';
import { ArchivePage } from './pages/ArchivePage';
import { AboutPage } from './pages/AboutPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = 'One From The Met'; }, [pathname]);
  return null;
}

export default function App() {
  return <HashRouter><ScrollToTop /><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a><div className="site-shell"><Header />
    <main id="main-content" tabIndex={-1}><Routes><Route path="/" element={null} /><Route path="/day/:date" element={<DayPage />} /><Route path="/archive" element={<ArchivePage />} /><Route path="/about" element={<AboutPage />} /><Route path="*" element={<PageState title="This page isn’t in the collection.">Find a daily object in the archive.</PageState>} /></Routes></main><Footer /></div></HashRouter>;
}
