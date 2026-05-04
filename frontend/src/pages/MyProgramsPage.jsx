import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, Play, ShoppingBag, ArrowRight, CheckCircle2, Circle, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import OfflineBanner from '../components/OfflineBanner';
import useOffline from '../hooks/useOffline';
import { supabase } from '../lib/supabase';
import {
  cachePurchases, getCachedPurchases,
  cacheProgress, getCachedProgress,
  cacheCustomPlan, getCachedCustomPlan,
} from '../lib/offlineCache';
import { FREE_STARTER_WORKOUTS, STARTER_WORKOUTS, TRANSFORMER_WORKOUTS, ELITE_WORKOUTS, HOME_BEGINNER_WORKOUTS } from '../data/programs';

const MyProgramsPage = () => {
  const navigate = useNavigate();
  const isOffline = useOffline();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchData(parsedUser.id);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async (userId) => {
    // --- Try network ---
    if (navigator.onLine) {
      try {
        const { data: purchasesData, error: pErr } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', userId);

        if (pErr) throw pErr;

        const purchases = purchasesData || [];
        setPurchases(purchases);
        cachePurchases(userId, purchases);

        const progressData = {};
        const customPlansData = {};

        for (const purchase of purchases) {
          const { data: prog } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('program_id', purchase.program_id);
          const rows = prog || [];
          progressData[purchase.program_id] = rows;
          cacheProgress(userId, purchase.program_id, rows);

          if (purchase.program_id.startsWith('custom-')) {
            const customPlanId = purchase.program_id.replace('custom-', '');
            const { data: customPlan } = await supabase
              .from('custom_plans')
              .select('*')
              .eq('id', customPlanId)
              .single();

            if (customPlan?.plan_data) {
              try {
                const planData = typeof customPlan.plan_data === 'string'
                  ? JSON.parse(customPlan.plan_data)
                  : customPlan.plan_data;
                const full = { ...planData, created_at: customPlan.created_at };
                customPlansData[purchase.program_id] = full;
                cacheCustomPlan(purchase.program_id, full);
              } catch (e) {
                console.error('Failed to parse custom plan data:', e);
              }
            }
          }
        }

        setProgress(progressData);
        if (Object.keys(customPlansData).length > 0) {
          sessionStorage.setItem('customPlans', JSON.stringify(customPlansData));
        }
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Network fetch failed, falling back to cache:', err);
      }
    }

    // --- Offline / network error: load from cache ---
    const cachedPurchases = getCachedPurchases(userId) || [];
    setPurchases(cachedPurchases);

    const progressData = {};
    const customPlansData = {};

    for (const purchase of cachedPurchases) {
      progressData[purchase.program_id] = getCachedProgress(userId, purchase.program_id) || [];

      if (purchase.program_id.startsWith('custom-')) {
        const plan = getCachedCustomPlan(purchase.program_id);
        if (plan) customPlansData[purchase.program_id] = plan;
      }
    }

    setProgress(progressData);
    if (Object.keys(customPlansData).length > 0) {
      sessionStorage.setItem('customPlans', JSON.stringify(customPlansData));
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Build WORKOUT_MAP with pre-made and custom plans
  const buildWorkoutMap = () => {
    const baseMap = {
      'free-starter': FREE_STARTER_WORKOUTS,
      'starter': STARTER_WORKOUTS,
      'transformer': TRANSFORMER_WORKOUTS,
      'elite-beginner': ELITE_WORKOUTS,
      'home-beginner': HOME_BEGINNER_WORKOUTS,
    };

    // Add custom plans from sessionStorage
    const customPlans = sessionStorage.getItem('customPlans');
    if (customPlans) {
      try {
        const customPlansData = JSON.parse(customPlans);
        return { ...baseMap, ...customPlansData };
      } catch (e) {
        console.error('Failed to parse custom plans:', e);
      }
    }

    return baseMap;
  };

  const WORKOUT_MAP = buildWorkoutMap();

  const getAllDays = (programId) => {
    const data = WORKOUT_MAP[programId];
    if (!data) return [];
    return data.weeks.flatMap(w => w.days);
  };

  const getProgramTotalDays = (programId) => getAllDays(programId).length;

  const getCompletedDays = (programId) => {
    const prog = progress[programId] || [];
    return prog.filter(p => p.completed).length;
  };

  const getProgressPercentage = (programId) => {
    const total = getProgramTotalDays(programId);
    const completed = getCompletedDays(programId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgramDays = (programId) => getAllDays(programId);

  const isDayCompleted = (programId, dayId) => {
    const prog = progress[programId] || [];
    return prog.some(p => p.day_id === dayId && p.completed);
  };

  const isCustomProgram = (programId) => programId.startsWith('custom-');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="my-programs-page">
      {isOffline && <OfflineBanner />}
      {/* Navbar */}
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white">Dashboard</Link>
            <Link to="/my-programs" className="text-sm font-medium text-green-400">My Programs</Link>
            <Link to="/progress" className="text-sm font-medium text-zinc-400 hover:text-white">Progress</Link>
            <Link to="/nutrition" className="text-sm font-medium text-zinc-400 hover:text-white">Nutrition</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              data-testid="logout-btn"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              My Programs
            </h1>
            <p className="text-zinc-400">
              Track your progress and continue your workouts.
            </p>
          </div>

          {/* Programs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400">Loading your programs...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Programs Yet</h3>
              <p className="text-zinc-400 mb-6">Start your fitness journey by getting a program.</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
              >
                Browse Programs
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => {
                const totalDays = getProgramTotalDays(purchase.program_id);
                const completedDays = getCompletedDays(purchase.program_id);
                const progressPercent = getProgressPercentage(purchase.program_id);
                const isComplete = totalDays > 0 && completedDays >= totalDays;

                const days = getProgramDays(purchase.program_id);

                return (
                  <div
                    key={purchase.id}
                    data-testid={`my-program-card-${purchase.program_id}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
                  >
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-heading text-xl font-bold text-white uppercase">
                            {purchase.program_name}
                          </h3>
                          {isCustomProgram(purchase.program_id) && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            >
                              Custom
                            </span>
                          )}
                          <span
                            data-testid={`status-badge-${purchase.program_id}`}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              isComplete
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}
                          >
                            {isComplete ? 'Completed' : 'Active'}
                          </span>
                        </div>

                        {isCustomProgram(purchase.program_id) && WORKOUT_MAP[purchase.program_id]?.created_at && (
                          <p className="text-xs text-zinc-500 mb-3">
                            Created {formatDate(WORKOUT_MAP[purchase.program_id].created_at)}
                          </p>
                        )}

                        {totalDays > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-zinc-400">
                                {completedDays}/{totalDays} days completed
                              </span>
                              <span className="text-sm font-medium text-green-400">
                                {progressPercent}%
                              </span>
                            </div>
                            <Progress
                              value={progressPercent}
                              className="h-2 bg-zinc-800"
                              data-testid={`progress-bar-${purchase.program_id}`}
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => navigate(`/program/${purchase.program_id}`)}
                        data-testid={`start-workout-${purchase.program_id}`}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-5 font-bold group"
                      >
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Review Program
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Start Workout
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Day subtasks */}
                    {days.length > 0 && (
                      <div className="border-t border-zinc-800 pt-4 space-y-2">
                        {days.map((day, i) => {
                          const completed = isDayCompleted(purchase.program_id, day.id);
                          const isLocked = !completed && i > 0 && !isDayCompleted(purchase.program_id, days[i - 1].id);
                          return (
                            <div
                              key={day.id}
                              onClick={() => !isLocked && navigate(`/program/${purchase.program_id}/day/${day.id}`)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                completed
                                  ? 'bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/15'
                                  : isLocked
                                  ? 'bg-zinc-800/40 border border-zinc-800 cursor-not-allowed opacity-50'
                                  : 'bg-zinc-800/60 border border-zinc-700 cursor-pointer hover:border-green-500/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                                )}
                                <div>
                                  <p className={`text-sm font-medium ${completed ? 'text-green-400' : isLocked ? 'text-zinc-600' : 'text-white'}`}>
                                    Day {day.dayNumber} — {day.title}
                                  </p>
                                  <p className="text-xs text-zinc-600">{day.dayName}</p>
                                </div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                completed
                                  ? 'bg-green-500/20 text-green-400'
                                  : isLocked
                                  ? 'text-zinc-700'
                                  : 'text-zinc-400'
                              }`}>
                                {completed ? 'Done' : isLocked ? 'Locked' : 'Start'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default MyProgramsPage;
