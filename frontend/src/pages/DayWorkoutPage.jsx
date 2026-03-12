import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Dumbbell, LogOut, User, ArrowLeft, CheckCircle2, Clock,
  Flame, Info, PartyPopper, ChevronDown, ImageOff, Target, ListChecks
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { getProgramContent } from '../data/programs';

// ─── Exercise Media Fetcher ────────────────────────────────────────────────
let yuhonasCache = null;

const loadYuhonasDb = async () => {
  if (yuhonasCache) return yuhonasCache;
  const res = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
  );
  yuhonasCache = await res.json();
  return yuhonasCache;
};

const fetchExerciseMedia = async (name) => {
  const clean = name.replace(/\s*\(.*?\)\s*/g, '').trim();

  try {
    const db = await loadYuhonasDb();
    const nameLower = clean.toLowerCase();
    const words = nameLower.split(' ').filter(w => w.length > 3);

    // Exact name match first
    let found = db.find(ex => ex.name.toLowerCase() === nameLower && ex.images?.length);
    // Then keyword match
    if (!found) {
      found = db.find(ex => {
        const exLower = ex.name.toLowerCase();
        return words.some(w => exLower.includes(w)) && ex.images?.length;
      });
    }

    if (found) {
      return {
        imageUrl: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${found.images[0]}`,
        name: found.name,
        muscles: found.primaryMuscles || [],
        instructions: found.instructions || [],
        source: 'yuhonas',
      };
    }
  } catch {}

  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────
const DayWorkoutPage = () => {
  const navigate = useNavigate();
  const { id, dayId } = useParams();
  const [user, setUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [checked, setChecked] = useState({});
  const [showDemo, setShowDemo] = useState({});
  const [mediaCache, setMediaCache] = useState({});
  const [mediaLoading, setMediaLoading] = useState({});

  const toggleExercise = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDemo = async (key, exerciseName) => {
    const isOpen = !!showDemo[key];
    setShowDemo(prev => ({ ...prev, [key]: !isOpen }));
    if (!isOpen && !(key in mediaCache)) {
      setMediaLoading(prev => ({ ...prev, [key]: true }));
      try {
        const media = await fetchExerciseMedia(exerciseName);
        setMediaCache(prev => ({ ...prev, [key]: media || 'notfound' }));
      } catch {
        setMediaCache(prev => ({ ...prev, [key]: 'notfound' }));
      } finally {
        setMediaLoading(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  const fetchProgress = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('program_id', id);
      setProgress(data || []);
      const completed = (data || []).some(p => p.day_id === dayId && p.completed);
      setIsCompleted(completed);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [id, dayId]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProgress(parsedUser.id);
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
      await supabase.from('progress').upsert({
        user_id: userData.id,
        program_id: id,
        day_id: dayId,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,program_id,day_id' });
      setIsCompleted(true);
      setShowCongrats(true);
      await fetchProgress(userData.id);
    } catch {
      alert('Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  const workoutData = getProgramContent(id);
  let dayData = null;
  workoutData?.weeks.forEach(week => {
    const found = week.days.find(d => d.id === dayId);
    if (found) dayData = found;
  });

  const totalExercises = dayData
    ? (dayData.warmup.exercises.length + dayData.mainWorkout.length + dayData.cooldown.exercises.length)
    : 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allExercisesDone = checkedCount >= totalExercises;

  const allDays = workoutData?.weeks.flatMap(w => w.days) || [];
  const totalDays = allDays.length;
  const completedDaysCount = progress.filter(p => p.completed).length +
    (isCompleted && !progress.some(p => p.day_id === dayId) ? 1 : 0);
  const remainingDays = totalDays - completedDaysCount;

  if (!user) return null;
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

      {/* Congrats Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-green-500 rounded-3xl p-8 max-w-md mx-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-2">Great Job!</h2>
            <p className="text-zinc-400 mb-2">Day {dayData.dayNumber} complete!</p>
            <p className="text-green-400 font-medium mb-6">
              {remainingDays > 0
                ? `${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining.`
                : 'You completed all workouts! 🎉'
              }
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowCongrats(false)} variant="outline" className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
                Stay Here
              </Button>
              <Button onClick={() => navigate(`/program/${id}`)} className="flex-1 bg-green-600 hover:bg-green-700">
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
            <Button onClick={handleLogout} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => navigate(`/program/${id}`)} variant="ghost" className="text-zinc-400 hover:text-white mb-6 -ml-2">
            <ArrowLeft className="w-5 h-5 mr-2" />Back to Program
          </Button>

          {/* Day Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-2">
              <span>{dayData.dayName}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase">
              Day {dayData.dayNumber} - {dayData.title}
            </h1>
          </div>

          {/* Warm-up */}
          <Section icon={<Flame className="w-5 h-5 text-orange-500" />} iconBg="bg-orange-500/20" title="Warm-up" subtitle={dayData.warmup.duration}>
            {dayData.warmup.exercises.map((exercise, index) => (
              <SimpleExerciseCard
                key={index}
                exercise={exercise}
                done={!!checked[`warmup-${index}`]}
                onToggle={() => toggleExercise(`warmup-${index}`)}
              />
            ))}
          </Section>

          {/* Main Workout */}
          <Section icon={<Dumbbell className="w-5 h-5 text-green-500" />} iconBg="bg-green-500/20" title="Main Workout">
            {dayData.mainWorkout.map((exercise, index) => {
              const key = `main-${index}`;
              return (
                <MainExerciseCard
                  key={index}
                  exercise={exercise}
                  done={!!checked[key]}
                  demoOpen={!!showDemo[key]}
                  media={mediaCache[key]}
                  mediaLoading={!!mediaLoading[key]}
                  onToggle={() => toggleExercise(key)}
                  onToggleDemo={() => toggleDemo(key, exercise.name)}
                />
              );
            })}
          </Section>

          {/* Cool-down */}
          <Section icon={<Clock className="w-5 h-5 text-blue-500" />} iconBg="bg-blue-500/20" title="Cool-down" subtitle={dayData.cooldown.duration}>
            {dayData.cooldown.exercises.map((exercise, index) => (
              <SimpleExerciseCard
                key={index}
                exercise={exercise}
                done={!!checked[`cooldown-${index}`]}
                onToggle={() => toggleExercise(`cooldown-${index}`)}
              />
            ))}
          </Section>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
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
                  : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" />Day Completed</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" />Mark Day Complete</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Section Wrapper ───────────────────────────────────────────────────────
const Section = ({ icon, iconBg, title, subtitle, children }) => (
  <section className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>{icon}</div>
      <div>
        <h2 className="font-heading text-lg font-bold text-white uppercase">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

// ─── Simple Exercise Card (warmup / cooldown) ──────────────────────────────
const SimpleExerciseCard = ({ exercise, done, onToggle }) => (
  <div
    onClick={onToggle}
    className={`flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all select-none ${
      done ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600'
    }`}
  >
    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}>
      {done && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
    <div className="flex-1">
      <p className={`font-medium ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>{exercise.name}</p>
      <p className="text-sm text-zinc-400">
        {exercise.sets && exercise.reps
          ? `${exercise.sets} sets × ${exercise.reps} reps`
          : exercise.duration || exercise.reps}
      </p>
    </div>
  </div>
);

// ─── Main Exercise Card (with demo) ────────────────────────────────────────
const MainExerciseCard = ({ exercise, done, demoOpen, media, mediaLoading, onToggle, onToggleDemo }) => (
  <div
    data-testid="exercise-card"
    className={`rounded-2xl overflow-hidden transition-all ${
      done ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
    }`}
  >
    {/* Exercise header — click to check */}
    <div className="p-5 cursor-pointer select-none" onClick={onToggle}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}>
            {done && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <h3 className={`font-semibold text-lg ${done ? 'text-zinc-500 line-through' : 'text-white'}`}>
            {exercise.name}
          </h3>
        </div>
        {exercise.rest && (
          <div className="flex items-center gap-1 text-zinc-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{exercise.rest}</span>
          </div>
        )}
      </div>
      <p className={`font-medium mb-2 ml-9 ${done ? 'text-zinc-600' : 'text-green-400'}`}>
        {exercise.sets} sets × {exercise.reps} {typeof exercise.reps === 'number' ? 'reps' : ''}
      </p>
      {exercise.tip && (
        <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            <span className="font-medium">Beginner tip:</span> {exercise.tip}
          </p>
        </div>
      )}
    </div>

    {/* "How to do it" toggle */}
    <div className="border-t border-zinc-800">
      <button
        onClick={(e) => { e.stopPropagation(); onToggleDemo(); }}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors group"
      >
        <span className="flex items-center gap-2 font-medium">
          <span className="text-base">🎯</span>
          How to do it
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`} />
      </button>

      {demoOpen && (
        <div className="px-4 pb-4">
          {mediaLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Loading demo…</p>
            </div>
          ) : media && media !== 'notfound' ? (
            <ExerciseMediaCard media={media} exerciseName={exercise.name} />
          ) : (
            <NoMediaCard exerciseName={exercise.name} />
          )}
        </div>
      )}
    </div>
  </div>
);

// ─── Exercise Media Card ───────────────────────────────────────────────────
const ExerciseMediaCard = ({ media, exerciseName }) => (
  <div className="rounded-2xl overflow-hidden bg-zinc-800/60 border border-zinc-700">
    {/* Photo */}
    <div className="relative bg-zinc-800 h-56 flex items-center justify-center overflow-hidden">
      <img
        src={media.imageUrl}
        alt={media.name || exerciseName}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentNode.querySelector('.fallback')?.classList.remove('hidden');
        }}
      />
      <div className="fallback hidden absolute inset-0 flex flex-col items-center justify-center gap-2">
        <ImageOff className="w-10 h-10 text-zinc-600" />
        <p className="text-zinc-500 text-sm">Image unavailable</p>
      </div>
      {/* Source badge */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-zinc-400 text-[10px] px-2 py-1 rounded-full">
        Free Exercise DB
      </div>
    </div>

    {/* Exercise name */}
    <div className="px-4 pt-3 pb-1">
      <p className="text-white font-semibold text-sm">{media.name || exerciseName}</p>
    </div>

    {/* Muscles */}
    {media.muscles?.length > 0 && (
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
        <Target className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        {media.muscles.map((m, i) => (
          <span key={i} className="bg-green-500/15 text-green-400 text-xs px-2 py-0.5 rounded-full capitalize">
            {m}
          </span>
        ))}
      </div>
    )}

    {/* Instructions */}
    {media.instructions?.length > 0 && (
      <div className="px-4 pt-1 pb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ListChecks className="w-3.5 h-3.5 text-zinc-400" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Steps</p>
        </div>
        <ol className="space-y-2">
          {media.instructions.slice(0, 4).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              <p className="text-zinc-400 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    )}
  </div>
);

// ─── No Media Fallback ─────────────────────────────────────────────────────
const NoMediaCard = ({ exerciseName }) => (
  <div className="rounded-2xl bg-zinc-800/40 border border-zinc-700/50 p-5 text-center">
    <ImageOff className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
    <p className="text-zinc-500 text-sm">No demo found for <span className="text-zinc-400 font-medium">"{exerciseName}"</span></p>
    <p className="text-zinc-600 text-xs mt-1">Try searching on YouTube for the correct form.</p>
  </div>
);

export default DayWorkoutPage;
