import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import BodyMap from '../components/BodyMap';
import { FREQUENCY_DAY_LABELS, FREQUENCY_DESCRIPTIONS } from '../lib/generateProgram';

const GOALS = [
  { id: 'muscle',      label: 'Kütlə artırmaq', emoji: '💪' },
  { id: 'lose_weight', label: 'Arıqlamaq',       emoji: '🔥' },
  { id: 'strength',    label: 'Güc artırmaq',    emoji: '⚡' },
  { id: 'general',     label: 'Ümumi fitness',   emoji: '🏃' },
];

const FREQUENCY_OPTIONS = [2, 3, 4, 5];

const ALL_MUSCLES = [
  'chest', 'back', 'shoulders', 'arms', 'abs', 'legs', 'glutes',
];

const MUSCLE_LABELS = {
  chest:     'Sinə',
  back:      'Kürək',
  shoulders: 'Çiyinlər',
  arms:      'Qollar',
  abs:       'Qarın',
  legs:      'Ayaqlar',
  glutes:    'Glutes',
};

const PLAN_TYPE_LABELS = {
  home: 'Evdə Məşq',
  gym:  'Zalda Məşq',
};

const TOTAL_STEPS = 4;

const CreateCustomPlanPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const planType  = location.state?.planType || 'gym';
  const pageTitle = PLAN_TYPE_LABELS[planType] || 'Plan Yarat';

  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState(null);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return goal !== null;
      case 2: return selectedMuscles.length > 0;
      case 3: return daysPerWeek !== null;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSelectAllMuscles = () => {
    if (selectedMuscles.length === ALL_MUSCLES.length) {
      setSelectedMuscles([]);
    } else {
      setSelectedMuscles([...ALL_MUSCLES]);
    }
  };

  const handleCreate = () => {
    const goalObj = GOALS.find((g) => g.id === goal);
    const planConfig = { goal, muscles: selectedMuscles, daysPerWeek, planType };
    localStorage.setItem('pendingPlanConfig', JSON.stringify(planConfig));
    navigate('/generating', {
      state: { programName: `${pageTitle} — ${goalObj?.label || ''}`, planConfig },
    });
  };

  const goalObj = GOALS.find((g) => g.id === goal);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col" data-testid="create-custom-plan-page">
      {/* Navbar */}
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-white">{pageTitle}</h1>
          <button
            onClick={() => navigate('/browse')}
            className="text-zinc-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-32 px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Goal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-green-500 text-sm font-semibold mb-1">1 / {TOTAL_STEPS - 1}</p>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Məqsədin nədir?</h2>
                <p className="text-zinc-400">Məqsədini seç</p>
              </div>
              <div className="space-y-3">
                {GOALS.map((g) => {
                  const isSelected = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-zinc-900 border-green-500'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-lg font-semibold ${isSelected ? 'text-green-400' : 'text-white'}`}>{g.label}</span>
                      {isSelected && <Check className="w-5 h-5 text-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Muscle Groups */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-green-500 text-sm font-semibold mb-1">2 / {TOTAL_STEPS - 1}</p>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Hansı əzələlərə fokuslanmaq istəyirsən?
                </h2>
                <p className="text-zinc-400">Ən azı 1 əzələ qrupu seç</p>
              </div>
              <button
                onClick={handleSelectAllMuscles}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                  selectedMuscles.length === ALL_MUSCLES.length
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {selectedMuscles.length === ALL_MUSCLES.length ? 'Hamısı seçilib ✓' : 'Hamısını seç'}
              </button>
              <BodyMap selected={selectedMuscles} onChange={setSelectedMuscles} />
            </div>
          )}

          {/* Step 3: Frequency */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-green-500 text-sm font-semibold mb-1">3 / {TOTAL_STEPS - 1}</p>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Həftədə neçə dəfə məşq?
                </h2>
                <p className="text-zinc-400">Cədvəlinə uyğun bir tezlik seç</p>
              </div>
              <div className="space-y-3">
                {FREQUENCY_OPTIONS.map(n => {
                  const isActive = daysPerWeek === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setDaysPerWeek(n)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-left">
                        <p className={`font-heading text-xl font-bold uppercase ${isActive ? 'text-green-400' : 'text-white'}`}>
                          {n}x / həftə
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{FREQUENCY_DESCRIPTIONS[n]}</p>
                        <p className="text-xs text-zinc-600 mt-1">{FREQUENCY_DAY_LABELS[n]}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? 'bg-green-500' : 'border-2 border-zinc-700'
                      }`}>
                        {isActive && <Check className="w-4 h-4 text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Proqramın hazırdır!</h2>
                <p className="text-zinc-400">Seçimlərini yoxla və proqramı yarat</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Məqsəd</p>
                  <p className="text-white font-bold text-lg">{goalObj?.label}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm mb-2">Əzələ qrupları</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMuscles.map((m) => (
                      <span key={m} className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm">
                        {MUSCLE_LABELS[m] || m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm mb-1">Tezlik</p>
                  <p className="text-white font-semibold">Həftədə {daysPerWeek} gün</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{FREQUENCY_DAY_LABELS[daysPerWeek]}</p>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-bold rounded-2xl"
              >
                Proqramı yarat 🚀
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      {currentStep < TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 glass px-6 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <div className="max-w-3xl mx-auto flex gap-3">
            {currentStep > 1 ? (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Geri
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-40 h-12"
            >
              Növbəti <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCustomPlanPage;
