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
  const muscles   = (planConfig.muscles || []).join(', ');
  const isHome    = planConfig.planType === 'home';

  let equipmentNote;
  if (isHome) {
    const savedEquipment = (() => {
      try { return JSON.parse(localStorage.getItem('fitstart_home_equipment') || '[]'); } catch { return []; }
    })();
    const equipList = savedEquipment.length > 0
      ? savedEquipment.join(', ')
      : 'bodyweight';
    equipmentNote = `Avadanlıq: istifadəçinin evdə olan avadanlıqlar: ${equipList}. Yalnız bu avadanlıqlarla edilə bilən məşqlər seç. Gym aparatları istifadə etmə.`;
  } else {
    equipmentNote = 'Avadanlıq: barbell, dumbbell, gym maşınları, kabel maşınları — bütün gym avadanlıqları istifadə edilə bilər.';
  }

  const planLabel = isHome ? 'Evdə Məşq' : 'Zalda Məşq';

  return `Sən FitStart fitness proqram generatorusan. Aşağıdakı parametrlərə əsasən JSON formatında məşq proqramı yarat:

Plan növü: ${planLabel}
Məqsəd: ${goalLabel}
Hədəf əzələlər: ${muscles}
Həftədə: ${planConfig.daysPerWeek} gün
${equipmentNote}

CAVABINI YALNIZ JSON formatında ver, heç bir əlavə mətn olmadan. JSON strukturu:
{
  "name": "Plan adı",
  "week": { "days": [{ "dayNumber": 1, "dayName": "Monday", "title": "Push Day", "warmup": { "duration": "5 min", "exercises": [{"name": "..."}] }, "mainWorkout": [{ "name": "...", "sets": 3, "reps": "12", "rest": "60 sec", "equipment": "barbell" }], "cooldown": { "duration": "5 min", "exercises": [{"name": "..."}] } }] }
}
YALNIZ 1 həftəlik şablon yarat (${planConfig.daysPerWeek} gün). Tətbiq onu 4 həftəyə özü çoxaldacaq. Hər gün üçün fərqli məşqlər seç.`;
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
    // First 6 steps at normal speed, then slow loop on last 2 steps while AI works
    const SLOW_LOOP_FROM = STEPS.length - 3; // step index 5
    let slow = false;
    const tick = () => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 2) {
          // AI still working — loop back to keep animation alive
          slow = true;
          return SLOW_LOOP_FROM;
        }
        return prev + 1;
      });
      // Slow down once looping
      stepInterval.current = setTimeout(tick, slow ? 3200 : 1800);
    };
    stepInterval.current = setTimeout(tick, 1800);
  }, []);

  const savePlanAndNavigate = useCallback(async (planData) => {
    const user = getStoredUser();
    if (!user) { navigate('/login'); return; }

    try {
      // Support both single-week format { week: {...} } and multi-week { weeks: [...] }
      let weeksArray = planData.weeks;
      if (!weeksArray && planData.week) {
        // AI returned 1-week template — expand to 4 weeks
        weeksArray = [1, 2, 3, 4].map(w => ({ week: w, days: planData.week.days }));
      }
      if (!weeksArray || !Array.isArray(weeksArray)) {
        throw new Error('AI cavabında düzgün plan strukturu tapılmadı');
      }

      const planJson = {
        id: `custom-${Date.now()}`,
        name: planData.name || programName,
        weeks: weeksArray.map((week, wi) => ({
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
          weeks_count: planJson.weeks.length,
          days_per_week: planConfig?.daysPerWeek || planJson.weeks[0]?.days?.length || 3,
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
      localStorage.removeItem('fitstart_home_equipment');

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

    // Ensure Supabase session is active
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
    }

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

      if (!planData.weeks && !planData.week) {
        throw new Error('AI cavabında düzgün plan strukturu tapılmadı');
      }

      // Cache in localStorage for visibility change resilience
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planData));
      generatedPlan.current = planData;

      await savePlanAndNavigate(planData);
    } catch (err) {
      if (!aborted.current) {
        if (stepInterval.current) {
          clearTimeout(stepInterval.current);
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
        clearTimeout(stepInterval.current);
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
