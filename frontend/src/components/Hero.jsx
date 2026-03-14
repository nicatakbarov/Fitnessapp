import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronRight, Play } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

export const Hero = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const tr = t[lang].hero;

  const scrollToPrograms = () => {
    document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
          alt="Fitness background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-[#0f0f0f]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">{tr.badge}</span>
        </div>

        {/* Headline */}
        <h1
          data-testid="hero-headline"
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tight mb-6 text-balance"
        >
          {tr.headline1}{' '}
          <span className="text-green-500">{tr.headline2}</span>
        </h1>

        {/* Subheadline */}
        <p
          data-testid="hero-subheadline"
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {tr.sub}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={scrollToPrograms}
            data-testid="hero-view-programs-btn"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-10 text-lg rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/30 group"
          >
            {tr.cta1}
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={scrollToHowItWorks}
            variant="outline"
            data-testid="hero-learn-more-btn"
            className="bg-transparent border-2 border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 py-6 px-10 text-lg rounded-full transition-all group"
          >
            <Play className="w-5 h-5 mr-2 text-green-500" />
            {tr.cta2}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-zinc-800/50">
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-white">10K+</p>
            <p className="text-zinc-500 text-sm mt-1">{tr.stat1Label}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-white">95%</p>
            <p className="text-zinc-500 text-sm mt-1">{tr.stat2Label}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-white">50+</p>
            <p className="text-zinc-500 text-sm mt-1">{tr.stat3Label}</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-green-500" />
        </div>
      </div>
    </section>
  );
};
