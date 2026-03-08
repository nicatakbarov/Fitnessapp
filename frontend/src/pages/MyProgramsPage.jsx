import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, Play, ShoppingBag, ArrowRight, CheckCircle2, Circle, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { supabase } from '../lib/supabase';
import { FREE_STARTER_WORKOUTS } from '../data/programs';

const MyProgramsPage = () => {
  const navigate = useNavigate();
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
    try {
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId);
      setPurchases(purchasesData || []);

      const progressData = {};
      for (const purchase of (purchasesData || [])) {
        const { data: prog } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', userId)
          .eq('program_id', purchase.program_id);
        progressData[purchase.program_id] = prog || [];
      }
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getProgramTotalDays = (programId) => {
    if (programId === 'free-starter') {
      return FREE_STARTER_WORKOUTS.weeks[0].days.length;
    }
    return 0;
  };

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

  const getProgramDays = (programId) => {
    if (programId === 'free-starter') {
      return FREE_STARTER_WORKOUTS.weeks[0].days;
    }
    return [];
  };

  const isDayCompleted = (programId, dayId) => {
    const prog = progress[programId] || [];
    return prog.some(p => p.day_id === dayId && p.completed);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="my-programs-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
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
      <main className="pt-24 pb-16 px-6">
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-xl font-bold text-white uppercase">
                            {purchase.program_name}
                          </h3>
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
    </div>
  );
};

export default MyProgramsPage;
