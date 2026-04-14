import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Target, Flame, Zap, Activity, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import BodyMap from '../components/BodyMap';

const GOALS = [
  { id: 'muscle',      label: 'Kütlə artırmaq', icon: Target,   emoji: '💪' },
  { id: 'lose_weight', label: 'Arıqlamaq',       icon: Flame,    emoji: '🔥' },
  { id: 'strength',    label: 'Güc artırmaq',    icon: Zap,      emoji: '⚡' },
  { id: 'general',     label: 'Ümumi fitness',   icon: Activity, emoji: '🏃' },
];

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const MINUTES_OPTIONS = [30, 45, 60, 90];

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

const CreateCustomPlanPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [goal, setGoal] = useState(null);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(null);
  const [minutesPerWorkout, setMinutesPerWorkout] = useState(null);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return goal !== null;
      case 2: return selectedMuscles.length > 0;
      case 3: return daysPerWeek !== null && minutesPerWorkout !== null;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleToggleMuscle = (muscle) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
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
    const planConfig = { goal, muscles: selectedMuscles, daysPerWeek, minutesPerWorkout };
    localStorage.setItem('pendingPlanConfig', JSON.stringify(planConfig));
    navigate('/generating', {
      state: { programName: goalObj?.label || 'Fərdi Plan', planConfig },
    });
  };

  const goalObj = GOALS.find((g) => g.id === goal);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col" data-testid="create-custom-plan-page">
      {/* Navbar */}
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-white">Fərdi Plan</h1>
          <button
            onClick={() => navigate('/browse')}
            className="text-zinc-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-green-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Goal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
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
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-zinc-900 border-green-500'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-3xl">{g.emoji}</span>
                      <span className="text-white text-lg font-semibold">{g.label}</span>
                      {isSelected && <Check className="w-5 h-5 text-green-500 ml-auto" />}
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
              <BodyMap selected={selectedMuscles} onToggle={handleToggleMuscle} />
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Məşq cədvəlin</h2>
                <p className="text-zinc-400">Məşq tezliyini və müddətini seç</p>
              </div>

              <div className="space-y-3">
                <p className="text-white font-semibold">Həftədə neçə gün?</p>
                <div className="flex gap-2">
                  {DAYS_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDaysPerWeek(d)}
                      className={`flex-1 py-3 rounded-xl font-bold text-lg transition-colors ${
                        daysPerWeek === d
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-white font-semibold">Hər məşq neçə dəqiqə?</p>
                <div className="flex gap-2">
                  {MINUTES_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutesPerWorkout(m)}
                      className={`flex-1 py-3 rounded-xl font-bold text-lg transition-colors ${
                        minutesPerWorkout === m
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goalObj?.emoji}</span>
                    <span className="text-white font-bold text-lg">{goalObj?.label}</span>
                  </div>
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
                  <p className="text-zinc-500 text-sm mb-1">Cədvəl</p>
                  <p className="text-white font-semibold">
                    Həftədə {daysPerWeek} gün, {minutesPerWorkout} dəqiqə
                  </p>
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
      {currentStep < 4 && (
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
