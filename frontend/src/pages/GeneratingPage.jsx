import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Analyzing your fitness goals...',
  'Checking available equipment...',
  'Selecting exercises for your level...',
  'Building your weekly schedule...',
  'Generating 4-week progression...',
  'Calculating rest & recovery days...',
  'Adding warm-up & cooldown sets...',
  'Your program is ready!',
];

const GeneratingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const programName = location.state?.programName || 'My Home Program';

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { navigate('/login'); return; }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => navigate('/dashboard'), 900);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <Dumbbell className="w-10 h-10 text-green-500" />
        <span className="font-heading text-3xl font-bold text-white">FitStart</span>
      </div>

      {/* Animated ring */}
      <div className="relative w-24 h-24 mb-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke="#22c55e" strokeWidth="3"
            strokeDasharray={`${done ? 100 : Math.round((currentStep / (STEPS.length - 1)) * 100)} 100`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done
            ? <CheckCircle2 className="w-8 h-8 text-green-500" />
            : <span className="text-white font-bold text-lg">{Math.round((currentStep / (STEPS.length - 1)) * 100)}%</span>
          }
        </div>
      </div>

      <h1 className="font-heading text-2xl font-bold text-white text-center mb-2">
        {done ? 'Program Ready!' : 'Creating Your Program'}
      </h1>
      <p className="text-zinc-400 text-center mb-10 text-sm">{programName}</p>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep || done;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isDone ? 'bg-green-500' : isActive ? 'bg-green-500/30 border border-green-500' : 'bg-zinc-800'
              }`}>
                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                {isActive && !isDone && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              <span className={`text-sm ${isDone || isActive ? 'text-white' : 'text-zinc-600'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeneratingPage;
