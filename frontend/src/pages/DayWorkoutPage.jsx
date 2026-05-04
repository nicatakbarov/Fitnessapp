import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, CheckCircle2, Clock, Flame, Info, PartyPopper, PlayCircle, ChevronUp, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import OfflineBanner from '../components/OfflineBanner';
import useOffline from '../hooks/useOffline';
import { supabase, getStoredUser } from '../lib/supabase';
import { getWorkoutCaloriesAndHR } from '../lib/healthkit';
import {
  cacheProgress, getCachedProgress, getCachedCustomPlan,
  enqueueOfflineAction,
} from '../lib/offlineCache';
import { FREE_STARTER_WORKOUTS, STARTER_WORKOUTS, TRANSFORMER_WORKOUTS, ELITE_WORKOUTS, HOME_BEGINNER_WORKOUTS, TWO_DAY_WORKOUTS } from '../data/programs';
import { getExerciseGif } from '../lib/getExerciseGif';

const DayWorkoutPage = () => {
  const navigate = useNavigate();
  const isOffline = useOffline();
  const { id, dayId } = useParams();
  const [user, setUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [checked, setChecked] = useState({});
  const [customPlan, setCustomPlan] = useState(null);
  const [expandedGif, setExpandedGif] = useState(null);
  const [weights, setWeights] = useState({});
  const [workoutHealth, setWorkoutHealth] = useState({ calories: null, avgHeartRate: null });
  const workoutStartRef = useRef(new Date());

  const toggleExercise = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchProgress = useCallback(async (userId) => {
    let rows = null;

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', userId)
          .eq('program_id', id);
        if (!error) {
          rows = data || [];
          cacheProgress(userId, id, rows);
        }
      } catch (err) {
        console.warn('fetchProgress network error, using cache:', err);
      }
    }

    // Fallback to cache
    if (rows === null) {
      rows = getCachedProgress(userId, id) || [];
    }

    setProgress(rows);
    const completed = rows.some(p => p.day_id === dayId && p.completed);
    setIsCompleted(completed);
    if (completed) {
      const lsKey = `weights_${userId}_${id}_${dayId}`;
      const all = JSON.parse(localStorage.getItem('workout_weights') || '{}');
      const saved = all[lsKey];
      if (saved?.weights) {
        setWeights(saved.weights);
        const allChecked = {};
        Object.keys(saved.weights).forEach(k => { allChecked[k] = true; });
        setChecked(allChecked);
      }
    }
  }, [id, dayId]);

  useEffect(() => {
    const parsedUser = getStoredUser();
    if (!parsedUser) { navigate('/login'); return; }
    try {
      setUser(parsedUser);
      fetchProgress(parsedUser.id);

      if (id.startsWith('custom-')) {
        // 1. sessionStorage (fast, in-session cache)
        const cachedSession = sessionStorage.getItem('customPlans');
        if (cachedSession) {
          const plans = JSON.parse(cachedSession);
          if (plans[id]) { setCustomPlan(plans[id]); return; }
        }
        // 2. localStorage offline cache
        const lsCached = getCachedCustomPlan(id);
        if (lsCached) { setCustomPlan(lsCached); return; }
        // 3. Network fetch
        if (navigator.onLine) {
          const planId = id.replace('custom-', '');
          supabase.from('custom_plans').select('*').eq('id', planId).single().then(({ data }) => {
            if (data?.plan_data) {
              const plan = typeof data.plan_data === 'string' ? JSON.parse(data.plan_data) : data.plan_data;
              const full = { ...plan, id };
              setCustomPlan(full);
              const existing = cachedSession ? JSON.parse(cachedSession) : {};
              sessionStorage.setItem('customPlans', JSON.stringify({ ...existing, [id]: full }));
            }
          });
        }
      }
    } catch {
      navigate('/login');
    }
  }, [navigate, id, fetchProgress]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const completedAt = new Date().toISOString();

      // Always save weights to localStorage immediately
      if (Object.keys(weights).length > 0) {
        const lsKey = `weights_${userData.id}_${id}_${dayId}`;
        const existing = JSON.parse(localStorage.getItem('workout_weights') || '{}');
        existing[lsKey] = { weights, completedAt };
        localStorage.setItem('workout_weights', JSON.stringify(existing));
      }

      const payload = {
        user_id: userData.id,
        program_id: id,
        day_id: dayId,
        completed: true,
        completed_at: completedAt,
      };

      if (!navigator.onLine) {
        // Queue for later sync
        enqueueOfflineAction({ type: 'mark_complete', payload });
        // Update local cache so UI reflects completion immediately
        const cached = getCachedProgress(userData.id, id) || [];
        const updated = [
          ...cached.filter(p => !(p.program_id === id && p.day_id === dayId)),
          payload,
        ];
        cacheProgress(userData.id, id, updated);
        setProgress(updated);
        setIsCompleted(true);
        setWorkoutHealth({ calories: null, avgHeartRate: null });
        setShowCongrats(true);
        return;
      }

      await supabase.from('progress').upsert(payload, {
        onConflict: 'user_id,program_id,day_id',
      });
      setIsCompleted(true);
      const healthStats = await getWorkoutCaloriesAndHR(workoutStartRef.current);
      setWorkoutHealth(healthStats);
      setShowCongrats(true);
      await fetchProgress(userData.id);
    } catch (err) {
      alert('Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  // Get workout data
  const WORKOUT_MAP = {
    'free-starter': FREE_STARTER_WORKOUTS,
    'starter-2day': TWO_DAY_WORKOUTS,
    'starter': STARTER_WORKOUTS,
    'transformer': TRANSFORMER_WORKOUTS,
    'elite-beginner': ELITE_WORKOUTS,
    'home-beginner': HOME_BEGINNER_WORKOUTS,
  };
  const workoutData = id.startsWith('custom-') ? customPlan : (WORKOUT_MAP[id] || null);
  const allDays = workoutData?.weeks?.flatMap(w => w.days) || [];
  const dayData = allDays.find(d => d.id === dayId);

  // Equipment-adaptive exercise resolver (for home programs)
  const userEquipment = (() => {
    try {
      return JSON.parse(localStorage.getItem('fitstart_equipment') || '["bodyweight"]');
    } catch {
      return ['bodyweight'];
    }
  })();
  const resolveExercise = (ex) => {
    if (!ex.equipment) return ex;
    const equips = Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment];
    if (equips.some(e => userEquipment.includes(e))) return ex;
    if (ex.alternatives && ex.alternatives.length > 0) {
      for (const alt of ex.alternatives) {
        const altEquips = Array.isArray(alt.equipment) ? alt.equipment : [alt.equipment];
        if (altEquips.some(e => userEquipment.includes(e))) return alt;
      }
      return ex.alternatives[ex.alternatives.length - 1];
    }
    return ex;
  };

  // When viewing a completed workout, mark all exercises as checked
  useEffect(() => {
    if (!isCompleted || !dayData) return;
    const allChecked = {};
    dayData.warmup.exercises.forEach((_, i) => { allChecked[`warmup-${i}`] = true; });
    dayData.mainWorkout.forEach((_, i) => { allChecked[`main-${i}`] = true; });
    dayData.cooldown.exercises.forEach((_, i) => { allChecked[`cooldown-${i}`] = true; });
    setChecked(allChecked);
  }, [isCompleted, dayData]);

  // Calculate if all exercises are checked
  const totalExercises = dayData
    ? (dayData.warmup.exercises.length + dayData.mainWorkout.length + dayData.cooldown.exercises.length)
    : 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allExercisesDone = checkedCount >= totalExercises;

  // Calculate remaining days
  const totalDays = allDays.length;
  const completedDays = progress.filter(p => p.completed).length + (isCompleted && !progress.some(p => p.day_id === dayId) ? 1 : 0);
  const remainingDays = totalDays - completedDays;

  if (!user) {
    return null;
  }

  if (!dayData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Workout Not Found</h1>
          <Button onClick={() => navigate(`/program/${id}`)} className="bg-green-600 hover:bg-green-700">
            Back to Program
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="day-workout-page">
      {isOffline && <OfflineBanner />}
      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="congrats-modal">
          <div className="bg-zinc-900 border border-green-500 rounded-3xl p-8 max-w-md mx-4 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-2">
              Great Job!
            </h2>
            <p className="text-zinc-400 mb-2">
              Day {dayData.dayNumber} complete!
            </p>
            <p className="text-green-400 font-medium mb-4" data-testid="remaining-days-message">
              {remainingDays > 0
                ? `${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining this week.`
                : 'You completed all workouts this week! 🎉'
              }
            </p>

            {(workoutHealth.calories !== null || workoutHealth.avgHeartRate !== null) && (
              <div className="flex gap-3 mb-6">
                {workoutHealth.calories !== null && (
                  <div className="flex-1 bg-zinc-800 rounded-2xl p-3 text-center">
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{workoutHealth.calories}</p>
                    <p className="text-xs text-zinc-500">kalori</p>
                  </div>
                )}
                {workoutHealth.avgHeartRate !== null && (
                  <div className="flex-1 bg-zinc-800 rounded-2xl p-3 text-center">
                    <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{workoutHealth.avgHeartRate}</p>
                    <p className="text-xs text-zinc-500">bpm ortalama</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCongrats(false)}
                variant="outline"
                className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Stay Here
              </Button>
              <Button
                onClick={() => navigate(`/program/${id}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Back to Program
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(`/program/${id}`)}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-6 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Program
          </Button>

          {/* Day Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-2">
              <span>{dayData.dayName}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
            <h1 
              className="font-heading text-3xl md:text-4xl font-bold text-white uppercase"
              data-testid="day-title"
            >
              Day {dayData.dayNumber} - {dayData.title}
            </h1>
          </div>

          {/* Warm-up Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white uppercase">Warm-up</h2>
                <p className="text-sm text-zinc-500">{dayData.warmup.duration}</p>
              </div>
            </div>
            <div className="space-y-3">
              {dayData.warmup.exercises.map((exercise, index) => {
                const key = `warmup-${index}`;
                const done = !!checked[key];
                return (
                  <div
                    key={index}
                    onClick={() => toggleExercise(key)}
                    className={`flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all select-none ${
                      done
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                    }`}>
                      {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-all ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {exercise.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {exercise.sets && exercise.reps
                          ? `${exercise.sets} sets × ${exercise.reps} reps`
                          : exercise.duration || exercise.reps
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main Workout Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="font-heading text-lg font-bold text-white uppercase">Main Workout</h2>
            </div>
            <div className="space-y-4">
              {dayData.mainWorkout.map((rawExercise, index) => {
                const exercise = resolveExercise(rawExercise);
                const key = `main-${index}`;
                const done = !!checked[key];
                return (
                  <div
                    key={index}
                    data-testid={`exercise-card-${index}`}
                    className={`rounded-xl p-5 select-none transition-all ${
                      done
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleExercise(key)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                            done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                          }`}>
                            {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <h3 className={`font-semibold text-lg transition-all ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {exercise.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Rest {exercise.rest}</span>
                        </div>
                      </div>
                      <p className={`font-medium mb-2 ml-9 ${done ? 'text-zinc-600' : 'text-green-400'}`}>
                        {exercise.sets} sets × {exercise.reps} {typeof exercise.reps === 'number' ? 'reps' : ''}
                      </p>
                    </div>
                    {/* GIF toggle */}
                    {(() => {
                      const gifUrl = getExerciseGif(exercise.name);
                      if (!gifUrl) return null;
                      const isOpen = expandedGif === `${index}-${exercise.name}`;
                      return (
                        <div className="mt-2 ml-9">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedGif(isOpen ? null : `${index}-${exercise.name}`);
                            }}
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 transition-colors"
                          >
                            {isOpen
                              ? <><ChevronUp className="w-3.5 h-3.5" /> Hide GIF</>
                              : <><PlayCircle className="w-3.5 h-3.5" /> Show GIF</>
                            }
                          </button>
                          {isOpen && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-zinc-700">
                              <img
                                src={gifUrl}
                                alt={exercise.name}
                                className="w-full max-h-64 object-contain bg-zinc-950"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {/* Weight input */}
                    <div className="mt-3 ml-9" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={weights[key] || ''}
                        onChange={e => setWeights(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={exercise.weight ? `Suggested: ${exercise.weight}` : 'Log weight (e.g. 20 kg)'}
                        className="w-full max-w-xs bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>
                    {exercise.tip && (
                      <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-300">
                          <span className="font-medium">Beginner tip:</span> {exercise.tip}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Cool-down Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white uppercase">Cool-down</h2>
                <p className="text-sm text-zinc-500">{dayData.cooldown.duration}</p>
              </div>
            </div>
            <div className="space-y-3">
              {dayData.cooldown.exercises.map((exercise, index) => {
                const key = `cooldown-${index}`;
                const done = !!checked[key];
                return (
                  <div
                    key={index}
                    onClick={() => toggleExercise(key)}
                    className={`flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all select-none ${
                      done
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                    }`}>
                      {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-all ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {exercise.name}
                      </p>
                      <p className="text-sm text-zinc-400">{exercise.duration}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent">
        <div className="max-w-3xl mx-auto">
          {!isCompleted && !allExercisesDone && (
            <p className="text-center text-zinc-500 text-sm mb-3">
              {totalExercises - checkedCount} exercise{totalExercises - checkedCount !== 1 ? 's' : ''} remaining
            </p>
          )}
          <Button
            onClick={handleMarkComplete}
            disabled={loading || isCompleted || !allExercisesDone}
            data-testid="mark-complete-btn"
            className={`w-full py-6 rounded-full font-bold text-lg transition-all ${
              isCompleted
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : !allExercisesDone
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Day Completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Mark Day Complete
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayWorkoutPage;
