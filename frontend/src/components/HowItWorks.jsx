import { Target, Video, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Target,
    step: '01',
    title: 'Choose Your Program',
    description: 'Pick from our beginner-friendly plans designed for every fitness level.',
  },
  {
    icon: Video,
    step: '02',
    title: 'Follow the Plan',
    description: 'Daily workouts with video guidance to ensure proper form and technique.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Track Your Progress',
    description: 'See real results week by week with our comprehensive tracking system.',
  },
];

export const HowItWorks = () => {
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
            Simple Process
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            How It Works
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Getting started is easy. Follow these three simple steps to begin your transformation.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div
              key={index}
              data-testid={`step-${index + 1}`}
              className="relative group"
            >
              {/* Connector Line (hidden on mobile, shown between cards on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-800 to-transparent" />
              )}

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <item.icon className="w-7 h-7 text-green-500" />
                  </div>
                  <span className="font-heading text-5xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-semibold text-white mb-3 uppercase">
                  {item.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
