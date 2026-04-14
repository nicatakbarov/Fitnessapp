import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, getStoredUser } from '../lib/supabase';

const STEPS = [
  'Fitness məqsədlərini analiz edirik...',
  'Əzələ qruplarını yoxlayırıq...',
  'Səviyyənə uyğun məşqlər seçirik...',
  'Həftəlik cədvəl qururuq...',
  '4 həftəlik proqressiya yaradırıq...',
  'İstirahət və bərpa günləri hesablayırıq...',
  'İsitmə və soyutma məşqləri əlavə edirik...',
  'Proqramın hazırdır!',
];

const GOAL_LABELS = {
  muscle: 'Əzələ kütləsi artımı',
  lose_weight: 'Arıqlama',
  strength: 'Güc artımı',
  general: 'Ümumi fitness',
};

const STORAGE_KEY = 'pendingGeneratedPlan';

function buildPrompt(planConfig) {
  const goalLabel = GOAL_LABELS[planConfig.goal] || planConfig.goal;
  const muscles = (planConfig.muscles || []).join(', ');

  return `Sən FitStart fitness proqram generatorusan. Aşağıdakı parametrlərə əsasən JSON formatında məşq proqramı yarat:

Məqsəd: ${goalLabel}
Hədəf əzələlər: ${muscles}
Həftədə: ${planConfig.daysPerWeek} gün
Məşq müddəti: ${planConfig.minutesPerWorkout} dəqiqə

CAVABINI YALNIZ JSON formatında ver, heç bir əlavə mətn olmadan. JSON strukturu:
{
  "name": "Plan adı",
  "weeks": [{ "week": 1, "days": [{ "dayNumber": 1, "dayName": "Monday", "title": "Push Day", "warmup": { "duration": "5 min", "exercises": [{"name": "..."}] }, "mainWorkout": [{ "name": "...", "sets": 3, "reps": "12", "rest": "60 sec", "equipment": "barbell" }], "cooldown": { "duration": "5 min", "exercises": [{"name": "..."}] } }] }]
}
4 həftəlik proqram yarat. Hər həftə ${planConfig.daysPerWeek} gün olmalıdır. Hər həftə eyni şablonu istifadə et.`;
}

function extractJSON(text) {
  // Try parsing the whole string first
  try {
    return JSON.parse(text);
  } catch {
    // Try to find JSON object in the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('AI cavabından JSON çıxarıla bilmədi');
  }
}

const GeneratingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const planConfig = location.state?.planConfig;
  const programName = location.state?.programName || 'AI Fitness Proqramı';

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const generationStarted = useRef(false);
  const generatedPlan = useRef(null);
  const aborted = useRef(false);
  const stepInterval = useRef(null);

  const startStepAnimation = useCallback(() => {
    if (stepInterval.current) return;
    stepInterval.current = setInterval(() => {
      setCurrentStep(prev => {
        // Stop at second-to-last step; the final step is set when generation completes
        if (prev >= STEPS.length - 2) {
          clearInterval(stepInterval.current);
          stepInterval.current = null;
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
  }, []);

  const savePlanAndNavigate = useCallback(async (planData) => {
    const user = getStoredUser();
    if (!user) { navigate('/login'); return; }

    try {
      const planJson = {
        id: `custom-${Date.now()}`,
        name: planData.name || programName,
        weeks: planData.weeks.map((week, wi) => ({
          week: week.week || wi + 1,
          days: week.days.map(day => ({
            id: `custom-w${week.week || wi + 1}-d${day.dayNumber}`,
            dayNumber: day.dayNumber,
            dayName: day.dayName,
            title: day.title,
            warmup: day.warmup,
            mainWorkout: day.mainWorkout,
            cooldown: day.cooldown,
          })),
        })),
      };

      const { data: customPlan, error: planError } = await supabase
        .from('custom_plans')
        .insert({
          user_id: user.id,
          name: planData.name || programName,
          description: `AI tərəfindən yaradılmış ${GOAL_LABELS[planConfig?.goal] || ''} proqramı`,
          weeks_count: planData.weeks.length,
          days_per_week: planConfig?.daysPerWeek || planData.weeks[0]?.days?.length || 3,
          plan_data: planJson,
          required_equipment: ['bodyweight'],
        })
        .select()
        .single();

      if (planError) throw planError;

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          program_id: `custom-${customPlan.id}`,
          program_name: planData.name || programName,
          price: 0,
          status: 'active',
        });

      if (purchaseError) throw purchaseError;

      // Clean up localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Show final step
      setCurrentStep(STEPS.length - 1);
      setDone(true);
      setTimeout(() => {
        if (!aborted.current) navigate('/dashboard');
      }, 900);
    } catch (err) {
      setError(err.message || 'Proqram saxlanılarkən xəta baş verdi.');
    }
  }, [navigate, planConfig, programName]);

  const generatePlan = useCallback(async () => {
    if (!planConfig) {
      setError('Plan konfiqurasiyası tapılmadı.');
      return;
    }

    const user = getStoredUser();
    if (!user) { navigate('/login'); return; }

    setError('');
    startStepAnimation();

    try {
      const message = buildPrompt(planConfig);

      const { data, error: fnError } = await supabase.functions.invoke('ai-chat', {
        body: { message, history: [], program: null },
      });

      if (aborted.current) return;

      if (fnError) throw fnError;

      const responseText = typeof data === 'string' ? data : (data?.reply || data?.response || data?.message || JSON.stringify(data));
      const planData = extractJSON(responseText);

      if (!planData.weeks || !Array.isArray(planData.weeks)) {
        throw new Error('AI cavabında düzgün plan strukturu tapılmadı');
      }

      // Cache in localStorage for visibility change resilience
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planData));
      generatedPlan.current = planData;

      await savePlanAndNavigate(planData);
    } catch (err) {
      if (!aborted.current) {
        if (stepInterval.current) {
          clearInterval(stepInterval.current);
          stepInterval.current = null;
        }
        setError(err.message || 'Proqram yaradılarkən xəta baş verdi.');
      }
    }
  }, [planConfig, navigate, startStepAnimation, savePlanAndNavigate]);

  const handleRetry = () => {
    setError('');
    setCurrentStep(0);
    setDone(false);
    generationStarted.current = false;
    localStorage.removeItem(STORAGE_KEY);
    generatedPlan.current = null;
    // Trigger generation on next effect cycle
    setTimeout(() => {
      generationStarted.current = true;
      generatePlan();
    }, 0);
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { navigate('/login'); return; }

    // Check if we have a cached plan from a previous attempt (e.g., app was backgrounded)
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const planData = JSON.parse(cached);
        generatedPlan.current = planData;
        generationStarted.current = true;
        startStepAnimation();
        savePlanAndNavigate(planData);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (!generationStarted.current) {
      generationStarted.current = true;
      generatePlan();
    }

    return () => {
      aborted.current = true;
      if (stepInterval.current) {
        clearInterval(stepInterval.current);
        stepInterval.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle visibility change - when user returns from granting Health permissions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is visible again - if we have a generated plan but haven't saved yet, resume
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached && !done && !error) {
          try {
            const planData = JSON.parse(cached);
            savePlanAndNavigate(planData);
          } catch {
            // ignore parse errors
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [done, error, savePlanAndNavigate]);

  const progress = done ? 100 : Math.round((currentStep / (STEPS.length - 1)) * 100);

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
            stroke={error ? '#ef4444' : '#22c55e'}
            strokeWidth="3"
            strokeDasharray={`${progress} 100`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {error
            ? <AlertCircle className="w-8 h-8 text-red-500" />
            : done
              ? <CheckCircle2 className="w-8 h-8 text-green-500" />
              : <span className="text-white font-bold text-lg">{progress}%</span>
          }
        </div>
      </div>

      <h1 className="font-heading text-2xl font-bold text-white text-center mb-2">
        {error ? 'Xəta baş verdi' : done ? 'Proqram Hazırdır!' : 'Proqramın Yaradılır'}
      </h1>
      <p className="text-zinc-400 text-center mb-10 text-sm">{programName}</p>

      {/* Error state */}
      {error && (
        <div className="w-full max-w-xs mb-8">
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
          >
            Yenidən cəhd et
          </button>
        </div>
      )}

      {/* Steps */}
      {!error && (
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
      )}
    </div>
  );
};

export default GeneratingPage;
