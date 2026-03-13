import { Check, Gift, Zap, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const programs = [
  {
    id: 'free-starter',
    name: 'Free Starter',
    duration: '3 weeks',
    frequency: '3x per week',
    level: 'Absolute Beginner',
    features: [
      'Full gym workout plan',
      'Warm-up & cool-down routines',
      'Day-by-day progress tracking',
      'Exercise checklist per session',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    duration: '4 weeks',
    frequency: '3x per week',
    level: 'Beginner',
    features: [
      'Push / Pull / Legs split',
      'Progressive overload built-in',
      'Beginner nutrition guide',
      'Full progress tracking',
    ],
  },
  {
    id: 'transformer',
    name: 'Transformer',
    duration: '8 weeks',
    frequency: '4x per week',
    level: 'Beginner–Intermediate',
    features: [
      'Upper / Lower periodized split',
      '4 progressive phases',
      'Complete meal plan',
      'Weekly check-in structure',
    ],
    highlight: true,
  },
  {
    id: 'elite-beginner',
    name: 'Elite Beginner',
    duration: '12 weeks',
    frequency: '5x per week',
    level: 'Full transformation',
    features: [
      'PPL + Full Body system',
      '4 advanced phases',
      'Advanced nutrition protocols',
      'Bonus: Mobility program',
    ],
  },
];

export const Programs = () => {
  const navigate = useNavigate();

  return (
    <section
      id="programs"
      data-testid="programs-section"
      className="py-24 md:py-32 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            All Programs
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            Training Programs
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Every program is completely free. No credit card. No subscriptions. Just sign up and start training.
          </p>
        </div>

        {/* Free Banner */}
        <div className="flex items-center justify-center mb-14">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 font-semibold text-sm">
            <Gift className="w-5 h-5 text-green-400" />
            100% Free — No Credit Card Required
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              data-testid={`program-card-${program.id}`}
              className={`relative flex flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 ${
                program.highlight
                  ? 'bg-gradient-to-b from-green-500/10 to-zinc-900 border-2 border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                  : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Popular Badge */}
              {program.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-green-500 text-black text-xs font-bold uppercase whitespace-nowrap">
                    <Zap className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Free Badge */}
              <div className="flex items-center gap-1.5 mb-4">
                <span className="px-3 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide">
                  Free
                </span>
              </div>

              {/* Program Name */}
              <h3 className="font-heading text-xl font-bold text-white uppercase mb-1">
                {program.name}
              </h3>

              {/* Details */}
              <div className="space-y-1.5 mb-5 pb-5 border-b border-zinc-800 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Duration</span>
                  <span className="text-white font-medium">{program.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Frequency</span>
                  <span className="text-white font-medium">{program.frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Level</span>
                  <span className="text-white font-medium">{program.level}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-grow">
                {program.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => navigate('/register')}
                data-testid={`program-cta-${program.id}`}
                className={`w-full py-5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                  program.highlight
                    ? 'bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-900/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                Start Free
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="flex items-center justify-center gap-2 mt-10 text-zinc-500 text-sm">
          <Lock className="w-4 h-4" />
          <span>No hidden fees. All programs unlock immediately after sign-up.</span>
        </div>
      </div>
    </section>
  );
};
