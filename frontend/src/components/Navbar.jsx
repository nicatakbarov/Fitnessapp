import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import { Button } from './ui/button';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { lang, toggleLang } = useLang();
  const tr = t[lang].navbar;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className={`safe-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          data-testid="navbar-logo"
          className="flex items-center gap-2 text-white hover:text-green-500 transition-colors"
        >
          <Dumbbell className="w-8 h-8 text-green-500" />
          <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('hero')}
            data-testid="nav-home"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            {tr.home}
          </button>
          <button
            onClick={() => scrollToSection('programs')}
            data-testid="nav-programs"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            {tr.programs}
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            data-testid="nav-faq"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            {tr.faq}
          </button>
        </div>

        {/* Auth Buttons + Lang Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-semibold"
            title="Switch language"
          >
            <span className={lang === 'az' ? 'text-green-400' : 'text-zinc-500'}>AZ</span>
            <span className="text-zinc-700">|</span>
            <span className={lang === 'en' ? 'text-green-400' : 'text-zinc-500'}>EN</span>
          </button>

          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            data-testid="nav-login-btn"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            {tr.login}
          </Button>
          <Button
            onClick={() => navigate('/register')}
            data-testid="nav-get-started-btn"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 rounded-full transition-all hover:scale-105"
          >
            {tr.getStarted}
          </Button>
        </div>

        {/* Mobile: lang toggle + menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold"
          >
            <span className={lang === 'az' ? 'text-green-400' : 'text-zinc-500'}>AZ</span>
            <span className="text-zinc-700">|</span>
            <span className={lang === 'en' ? 'text-green-400' : 'text-zinc-500'}>EN</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-btn"
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-xl p-4" data-testid="mobile-menu">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              {tr.home}
            </button>
            <button
              onClick={() => scrollToSection('programs')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              {tr.programs}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              {tr.faq}
            </button>
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
              <Button
                variant="ghost"
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                className="w-full justify-center text-zinc-300"
              >
                {tr.login}
              </Button>
              <Button
                onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                className="w-full justify-center bg-green-600 hover:bg-green-700"
              >
                {tr.getStarted}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
