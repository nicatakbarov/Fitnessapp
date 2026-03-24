import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, Calendar, Clock, Dumbbell as DumbbellIcon, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { FREE_STARTER_WORKOUTS, STARTER_WORKOUTS, TRANSFORMER_WORKOUTS, ELITE_WORKOUTS, HOME_BEGINNER_WORKOUTS, TWO_DAY_WORKOUTS, PROGRAMS } from '../data/programs';

const ProgramDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customPlan, setCustomPlan] = useState(null);

  const fetchProgress = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('program_id', id);
      setProgress(data || []);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [id]);

  const fetchCustomPlan = useCallback(async () => {
    // Check sessionStorage first
    const cached = sessionStorage.getItem('customPlans');
    if (cached) {
      const plans = JSON.parse(cached);
      if (plans[id]) {
        setCustomPlan(plans[id]);
        return;
      }
    }
    const planId = id.replace('custom-', '');
    const { data } = await supabase.from('custom_plans').select('*').eq('id', planId).single();
    if (data?.plan_data) {
      const plan = typeof data.plan_data === 'string' ? JSON.parse(data.plan_data) : data.plan_data;
      const full = { ...plan, id };
      setCustomPlan(full);
      const existing = cached ? JSON.parse(cached) : {};
      sessionStorage.setItem('customPlans', JSON.stringify({ ...existing, [id]: full }));
    }
  }, [id]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const load = async () => {
        await fetchProgress(parsedUser.id);
        if (id.startsWith('custom-')) await fetchCustomPlan();
        setLoading(false);
      };
      load();
    } catch {
      navigate('/login');
    }
  }, [navigate, id, fetchProgress, fetchCustomPlan]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isDayCompleted = (dayId) => progress.some(p => p.day_id === dayId && p.completed);

  const WORKOUT_MAP = {
    'free-starter': FREE_STARTER_WORKOUTS,
    'starter-2day': TWO_DAY_WORKOUTS,
    'starter': STARTER_WORKOUTS,
    'transformer': TRANSFORMER_WORKOUTS,
    'elite-beginner': ELITE_WORKOUTS,
    'home-beginner': HOME_BEGINNER_WORKOUTS,
  };

  const isCustom = id.startsWith('custom-');
  const staticProgram = PROGRAMS.find(p => p.id === id);
  const workoutData = isCustom ? customPlan : (WORKOUT_MAP[id] || null);

  // Build program meta for display
  const program = isCustom && customPlan
    ? {
        name: customPlan.name || 'My Custom Program',
        duration: `${customPlan.weeks?.length || 4} weeks`,
        frequency: `${customPlan.daysPerWeek || 3}x per week`,
        level: 'Custom',
      }
    : staticProgram;

  if (!user) return null;

  if (loading && !program) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!loading && !program) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Program Not Found</h1>
          <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="program-detail-page">
      {/* Navbar */}
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
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
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/my-programs')}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-6 -ml-2"
            data-testid="back-to-programs"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Programs
          </Button>

          {/* Program Header */}
          <div className="bg-gradient-to-r from-green-500/10 to-zinc-900 border border-green-500/30 rounded-2xl p-8 mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-4">
              {program.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-5 h-5 text-green-500" />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-5 h-5 text-green-500" />
                <span>{program.frequency}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <DumbbellIcon className="w-5 h-5 text-green-500" />
                <span>{program.level}</span>
              </div>
            </div>
          </div>

          {/* Workout Schedule */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400">Loading workouts...</p>
            </div>
          ) : workoutData ? (
            <div className="space-y-8">
              {workoutData.weeks.map((week) => (
                <div key={week.week}>
                  <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                    Week {week.week}
                  </h2>
                  <div className="space-y-4">
                    {week.days.map((day) => {
                      const completed = isDayCompleted(day.id);
                      return (
                        <div
                          key={day.id}
                          data-testid={`workout-day-${day.id}`}
                          className={`bg-zinc-900 border rounded-xl p-6 transition-all hover:border-green-500/50 cursor-pointer ${
                            completed ? 'border-green-500/50' : 'border-zinc-800'
                          }`}
                          onClick={() => navigate(`/program/${id}/day/${day.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                completed ? 'bg-green-500/20' : 'bg-zinc-800'
                              }`}>
                                {completed ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                ) : (
                                  <Circle className="w-6 h-6 text-zinc-600" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">
                                  Day {day.dayNumber} - {day.title}
                                </h3>
                                <p className="text-sm text-zinc-500">{day.dayName}</p>
                              </div>
                            </div>
                            <Button
                              className={`rounded-full ${
                                completed 
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                              data-testid={`start-day-${day.id}`}
                            >
                              {completed ? 'Review' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <DumbbellIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Workout Content Coming Soon</h3>
              <p className="text-zinc-400">
                Full workout details for this program will be available soon.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramDetailPage;
