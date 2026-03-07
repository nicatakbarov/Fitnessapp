import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import { Button } from './ui/button';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
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
            Home
          </button>
          <button
            onClick={() => scrollToSection('programs')}
            data-testid="nav-programs"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            Programs
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            data-testid="nav-faq"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            FAQ
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            data-testid="nav-login-btn"
            className="text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Login
          </Button>
          <Button
            onClick={() => navigate('/register')}
            data-testid="nav-get-started-btn"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 rounded-full transition-all hover:scale-105"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="mobile-menu-btn"
          className="md:hidden text-white p-2"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-xl p-4" data-testid="mobile-menu">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('programs')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              Programs
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-zinc-300 hover:text-white py-2 text-left"
            >
              FAQ
            </button>
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
              <Button
                variant="ghost"
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                className="w-full justify-center text-zinc-300"
              >
                Login
              </Button>
              <Button
                onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                className="w-full justify-center bg-green-600 hover:bg-green-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
