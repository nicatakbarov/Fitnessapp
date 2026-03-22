import { Home, Dumbbell, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const ProgramSelectorModal = ({ onSelect }) => {
  const programs = [
    {
      id: 'home',
      subtitle: 'Home Workouts',
      title: 'Home Training',
      description: 'No equipment needed. Work out from your living room, garden, or anywhere you like. Fully effective programs using just your bodyweight.',
      highlights: ['Equipment-free exercises', 'Work out anywhere', 'Full-body programs'],
      icon: Home,
      gradient: 'from-blue-500/20 to-transparent',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'gym',
      subtitle: 'Ready-Made Gym Programs',
      title: 'Gym Training',
      description: 'Structured gym programs like Push/Pull/Legs and Upper/Lower splits. Progress each week with built-in progressive overload.',
      highlights: ['3–5 day programs', 'Progressive overload system', 'Warm-up & cool-down'],
      icon: Dumbbell,
      gradient: 'from-green-500/20 to-transparent',
      border: 'border-green-500/30 hover:border-green-500/60',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'custom',
      subtitle: 'Build Your Own Plan',
      title: 'Custom Plan',
      description: 'Create your own plan, add your own exercises, and track every session. See your progress day by day and stay motivated.',
      highlights: ['Custom plan creation', 'Daily progress tracking', 'Workout history'],
      icon: Sparkles,
      gradient: 'from-purple-500/20 to-transparent',
      border: 'border-purple-500/30 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="min-h-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
            Proqram Seç
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Sənə ən uyğun başlanğıcı seç
          </p>
        </div>

        {/* Program Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {programs.map((program) => {
            const IconComponent = program.icon;
            return (
              <div
                key={program.id}
                className={`relative flex flex-col rounded-2xl md:rounded-3xl p-6 md:p-7 bg-zinc-900 border transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer ${program.border}`}
              >
                {/* Subtle gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-b ${program.gradient} pointer-events-none`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5 ${program.iconBg}`}>
                    <IconComponent className={`w-6 h-6 md:w-7 md:h-7 ${program.iconColor}`} />
                  </div>

                  {/* Subtitle */}
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 leading-tight ${program.iconColor}`}>
                    {program.subtitle}
                  </p>

                  {/* Title */}
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white uppercase mb-2 md:mb-3">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4 md:mb-5 flex-grow">
                    {program.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-5">
                    {program.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${program.iconColor}`} />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button
                    onClick={() => onSelect(program.id)}
                    className={`w-full ${program.buttonColor} text-white font-bold py-3 rounded-full transition-all hover:scale-105 active:scale-95`}
                  >
                    Başla
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-400 text-sm mt-6 mb-2">
          İstənilən vaxt proqramı dəyişə bilərsən
        </p>
      </div>
      </div>
    </div>
  );
};

export default ProgramSelectorModal;
