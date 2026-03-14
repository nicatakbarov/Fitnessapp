import { Dumbbell, Home, ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

const icons = [Dumbbell, Home, ClipboardList];
const colors = [
  { gradient: 'from-green-500/20 to-transparent', border: 'border-green-500/30 hover:border-green-500/60', iconBg: 'bg-green-500/10', iconColor: 'text-green-400' },
  { gradient: 'from-blue-500/20 to-transparent',  border: 'border-blue-500/30 hover:border-blue-500/60',  iconBg: 'bg-blue-500/10',  iconColor: 'text-blue-400'  },
  { gradient: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30 hover:border-purple-500/60', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
];

export const Programs = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const tr = t[lang].programs;

  return (
    <section
      id="programs"
      data-testid="programs-section"
      className="py-24 md:py-32 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            {tr.tag}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-5">
            {tr.title1}{' '}
            <span className="text-green-500">{tr.title2}</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base leading-relaxed">
            {tr.sub}
          </p>
        </div>

        {/* Free pill */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {tr.pill}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tr.features.map((feature, i) => {
            const Icon = icons[i];
            const c = colors[i];
            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-3xl p-8 bg-zinc-900 border transition-all duration-300 hover:-translate-y-2 ${c.border}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${c.gradient} pointer-events-none`} />

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${c.iconBg}`}>
                  <Icon className={`w-7 h-7 ${c.iconColor}`} />
                </div>

                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${c.iconColor}`}>
                  {feature.subtitle}
                </p>
                <h3 className="font-heading text-2xl font-bold text-white uppercase mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${c.iconColor}`} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/register')}
            data-testid="programs-cta"
            className="px-10 py-6 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-base shadow-lg shadow-green-900/30 transition-all hover:scale-105 active:scale-95"
          >
            {tr.ctaBtn}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-zinc-600 text-sm mt-4">{tr.ctaNote}</p>
        </div>

      </div>
    </section>
  );
};
