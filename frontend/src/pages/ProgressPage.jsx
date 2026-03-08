import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, Flame, Trophy, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { FREE_STARTER_WORKOUTS } from '../data/programs';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
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
      fetchProgress(parsedUser.id);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchProgress = async (userId) => {
    try {
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('program_id', 'free-starter');
      setProgress(data || []);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Calculate stats
  const stats = useMemo(() => {
    const completedWorkouts = progress.filter(p => p.completed).length;
    const totalWorkouts = FREE_STARTER_WORKOUTS?.weeks[0]?.days.length || 3;
    
    // Current streak (simplified)
    const currentStreak = completedWorkouts;
    const bestStreak = completedWorkouts; // Same for now
    const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

    return {
      totalCompleted: completedWorkouts,
      currentStreak,
      bestStreak,
      completionRate
    };
  }, [progress]);

  // Generate month calendar
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0=Sun
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push({ empty: true });
    }
    
    // Workout days are Mon (1), Wed (3), Fri (5)
    const workoutDays = [1, 3, 5];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWorkoutDay = workoutDays.includes(dayOfWeek);
      const isPast = date < today && date.toDateString() !== today.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      
      // Check if completed (simplified - check if any progress exists)
      const dayMapping = { 1: 'day-1', 3: 'day-2', 5: 'day-3' };
      const dayId = dayMapping[dayOfWeek];
      const isCompleted = dayId && progress.some(p => p.day_id === dayId && p.completed);
      const isMissed = isWorkoutDay && isPast && !isCompleted;
      
      days.push({
        day,
        date,
        isWorkoutDay,
        isCompleted,
        isMissed,
        isToday,
        isPast,
        isFuture: !isPast && !isToday
      });
    }
    
    return {
      monthName: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days
    };
  }, [progress]);

  // Get workout history
  const workoutHistory = useMemo(() => {
    return progress
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 10)
      .map(p => {
        const workout = FREE_STARTER_WORKOUTS.weeks[0].days.find(d => d.id === p.day_id);
        return {
          ...p,
          workoutName: workout ? `Day ${workout.dayNumber} — ${workout.title}` : p.day_id,
          date: new Date(p.completed_at).toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric' 
          })
        };
      });
  }, [progress]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="progress-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white">Dashboard</Link>
            <Link to="/my-programs" className="text-sm font-medium text-zinc-400 hover:text-white">My Programs</Link>
            <Link to="/progress" className="text-sm font-medium text-green-400">Progress</Link>
            <Link to="/nutrition" className="text-sm font-medium text-zinc-400 hover:text-white">Nutrition</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-6 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              My Progress 📊
            </h1>
            <p className="text-zinc-400">
              Track your fitness journey and celebrate your wins!
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400">Loading progress...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Summary */}
              <section data-testid="stats-summary">
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
                  Stats Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.totalCompleted}</span>
                    <p className="text-zinc-500 text-xs mt-1">Total Workouts</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.currentStreak}</span>
                    <p className="text-zinc-500 text-xs mt-1">Current Streak</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.bestStreak}</span>
                    <p className="text-zinc-500 text-xs mt-1">Best Streak</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.completionRate}%</span>
                    <p className="text-zinc-500 text-xs mt-1">Completion Rate</p>
                  </div>
                </div>
              </section>

              {/* Monthly Calendar */}
              <section data-testid="monthly-calendar">
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
                  {calendarData.monthName}
                </h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-zinc-500 text-xs font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.days.map((day, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          day.empty
                            ? ''
                            : day.isToday
                            ? 'ring-2 ring-blue-500 bg-blue-500/10 text-white'
                            : day.isCompleted
                            ? 'bg-green-500/20 text-green-400'
                            : day.isMissed
                            ? 'bg-red-500/20 text-red-400'
                            : day.isFuture
                            ? 'bg-zinc-800/30 text-zinc-600'
                            : 'bg-zinc-800/50 text-zinc-400'
                        }`}
                      >
                        {!day.empty && day.day}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded bg-green-500/20" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded bg-red-500/20" />
                      <span>Missed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded ring-2 ring-blue-500" />
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded bg-zinc-800/50" />
                      <span>Rest Day</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Workout History */}
              <section data-testid="workout-history">
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
                  Workout History
                </h2>
                {workoutHistory.length === 0 ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400">No workouts completed yet. Start your first workout!</p>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workoutHistory.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                        data-testid={`history-item-${index}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.workoutName}</p>
                            <p className="text-zinc-500 text-sm">{item.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 rounded-full px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
