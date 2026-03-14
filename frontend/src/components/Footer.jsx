import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

export const Footer = () => {
  const { lang } = useLang();
  const tr = t[lang].footer;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer data-testid="footer" className="bg-[#0f0f0f] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-8 h-8 text-green-500" />
              <span className="font-heading text-2xl font-bold text-white">FitStart</span>
            </Link>
            <p className="text-zinc-400 max-w-sm mb-6">
              {tr.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                data-testid="social-instagram"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-green-500 hover:text-black transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                data-testid="social-twitter"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-green-500 hover:text-black transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                data-testid="social-youtube"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-green-500 hover:text-black transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white uppercase mb-4">
              {tr.quickLinks}
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  data-testid="footer-programs-link"
                  className="text-zinc-400 hover:text-green-400 transition-colors"
                >
                  {tr.programs}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  data-testid="footer-faq-link"
                  className="text-zinc-400 hover:text-green-400 transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  data-testid="footer-testimonials-link"
                  className="text-zinc-400 hover:text-green-400 transition-colors"
                >
                  {tr.testimonials}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white uppercase mb-4">
              {tr.contact}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@fitstart.com"
                  data-testid="footer-email-link"
                  className="text-zinc-400 hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  support@fitstart.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm" data-testid="footer-copyright">
            {tr.copyright}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {tr.privacy}
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {tr.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
