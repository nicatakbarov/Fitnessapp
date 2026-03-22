import { Target, Video, TrendingUp } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

const icons = [Target, Video, TrendingUp];

export const HowItWorks = () => {
  const { lang } = useLang();
  const tr = t[lang].howItWorks;

  return (
    <section
      id="how-it-works"
      data-testid="how-it-works-section"
      className="py-24 md:py-32 bg-[#0f0f0f]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            {tr.tag}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            {tr.title}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            {tr.sub}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tr.steps.map((item, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                data-testid={`step-${index + 1}`}
                className="relative group"
              >
                {index < tr.steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-800 to-transparent" />
                )}

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Icon className="w-7 h-7 text-green-500" />
                    </div>
                    <span className="font-heading text-5xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-white mb-3 uppercase">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
