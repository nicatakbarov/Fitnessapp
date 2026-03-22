import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, Flame, Trophy, CheckCircle2, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [navigate]);

  const fetchProgress = async (userId) => {
    try {
      const { data } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);
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

  // Weight history from localStorage
  const weightHistory = useMemo(() => {
    if (!user) return [];
    try {
      const all = JSON.parse(localStorage.getItem('workout_weights') || '{}');
      const entries = [];
      for (const [key, val] of Object.entries(all)) {
        if (!key.includes(`_${user.id}_`)) continue;
        const { weights, completedAt } = val;
        for (const [exerciseKey, weight] of Object.entries(weights)) {
          if (weight) {
            entries.push({
              exerciseKey,
              weight,
              date: new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              ts: new Date(completedAt).getTime(),
              weightNum: parseFloat(weight) || 0,
            });
          }
        }
      }
      return entries.sort((a, b) => b.ts - a.ts).slice(0, 50);
    } catch {
      return [];
    }
  }, [user]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = progress.filter(p => p.completed);
    const totalCompleted = completed.length;

    // Current streak — consecutive days ending today or yesterday
    const uniqueDates = [...new Set(
      completed
        .filter(p => p.completed_at)
        .map(p => new Date(p.completed_at).toDateString())
    )];
    let streak = 0;
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : new Date(Date.now() - 86400000);
      while (uniqueDates.includes(checkDate.toDateString())) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    }

    // This week (Mon–Sun)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);
    const thisWeek = completed.filter(p => {
      const d = new Date(p.completed_at);
      return d >= monday && d < sunday;
    }).length;

    // Personal best — max weight from weight history
    const maxWeight = weightHistory.reduce((max, e) => Math.max(max, e.weightNum), 0);
    const personalBest = maxWeight > 0 ? maxWeight : null;

    return { totalCompleted, streak, thisWeek, personalBest };
  }, [progress, weightHistory]);

  // Weekly bar chart — last 8 weeks
  const weeklyChart = useMemo(() => {
    const completed = progress.filter(p => p.completed && p.completed_at);
    const weeks = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Start of current week (Monday)
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    thisMonday.setHours(0, 0, 0, 0);

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(thisMonday);
      weekStart.setDate(thisMonday.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = completed.filter(p => {
        const d = new Date(p.completed_at);
        return d >= weekStart && d < weekEnd;
      }).length;

      const label = i === 0 ? 'This' : `W-${i}`;
      weeks.push({ label, count, weekStart });
    }
    return weeks;
  }, [progress]);

  const maxWeekCount = Math.max(...weeklyChart.map(w => w.count), 1);

  // Personal Records — max weight per exercise
  const personalRecords = useMemo(() => {
    const prMap = {};
    for (const entry of weightHistory) {
      const key = entry.exerciseKey;
      if (!prMap[key] || entry.weightNum > prMap[key].weightNum) {
        prMap[key] = entry;
      }
    }
    return Object.values(prMap).sort((a, b) => b.weightNum - a.weightNum);
  }, [weightHistory]);

  // Generate month calendar
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const completedDates = new Set(
      progress
        .filter(p => p.completed && p.completed_at)
        .map(p => new Date(p.completed_at).toDateString())
    );

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push({ empty: true });

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isCompleted = completedDates.has(date.toDateString());
      days.push({ day, date, isCompleted, isToday, isPast, isFuture: !isPast && !isToday });
    }

    return {
      monthName: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days,
    };
  }, [progress]);

  // Workout history
  const workoutHistory = useMemo(() => {
    return progress
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 10)
      .map(p => ({
        ...p,
        workoutName: `${p.program_id.replace(/-/g, ' ')} — ${p.day_id}`,
        date: new Date(p.completed_at).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
        }),
      }));
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
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => navigate('/dashboard')} variant="ghost" className="text-zinc-400 hover:text-white mb-6 -ml-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              My Progress
            </h1>
            <p className="text-zinc-400">Track your fitness journey across all programs.</p>
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
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">Stats Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.totalCompleted}</span>
                    <p className="text-zinc-500 text-xs mt-1">Total Workouts</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.streak}</span>
                    <p className="text-zinc-500 text-xs mt-1">Day Streak</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">{stats.thisWeek}</span>
                    <p className="text-zinc-500 text-xs mt-1">This Week</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <span className="font-heading text-2xl font-bold text-white">
                      {stats.personalBest ? `${stats.personalBest}` : '—'}
                    </span>
                    <p className="text-zinc-500 text-xs mt-1">Personal Best (kg)</p>
                  </div>
                </div>
              </section>

              {/* Weekly Activity Chart */}
              <section>
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
                  <span className="flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-500" /> Weekly Activity</span>
                </h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-end justify-between gap-2 h-32">
                    {weeklyChart.map((week, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-zinc-500 text-xs">{week.count > 0 ? week.count : ''}</span>
                        <div className="w-full flex items-end" style={{ height: '80px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all ${week.count > 0 ? 'bg-green-500' : 'bg-zinc-800'}`}
                            style={{ height: `${Math.max((week.count / maxWeekCount) * 80, week.count > 0 ? 8 : 4)}px` }}
                          />
                        </div>
                        <span className="text-zinc-500 text-xs">{week.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-zinc-600 text-xs mt-3">Last 8 weeks — workouts completed per week</p>
                </div>
              </section>

              {/* Monthly Calendar */}
              <section data-testid="monthly-calendar">
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">{calendarData.monthName}</h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-zinc-500 text-xs font-medium">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.days.map((day, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          day.empty ? ''
                          : day.isToday ? 'ring-2 ring-blue-500 bg-blue-500/10 text-white'
                          : day.isCompleted ? 'bg-green-500/20 text-green-400'
                          : day.isFuture ? 'bg-zinc-800/30 text-zinc-600'
                          : 'bg-zinc-800/50 text-zinc-400'
                        }`}
                      >
                        {!day.empty && day.day}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded bg-green-500/20" /><span>Workout completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded ring-2 ring-blue-500" /><span>Today</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Personal Records */}
              <section>
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
                  <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Personal Records</span>
                </h2>
                {personalRecords.length === 0 ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
                    <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">No records yet. Enter weights during your workouts to track your PRs.</p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2 border-b border-zinc-800 text-zinc-500 text-xs font-medium uppercase">
                      <span>Exercise</span>
                      <span className="text-center">Best Weight</span>
                      <span className="text-right">Date</span>
                    </div>
                    {personalRecords.map((item, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-3 px-4 py-3 items-center ${index !== personalRecords.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                          {index === 1 && <Trophy className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
                          {index === 2 && <Trophy className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
                          {index > 2 && <div className="w-3.5" />}
                          <span className="text-white text-sm capitalize truncate">
                            {item.exerciseKey.replace('main-', 'Exercise ')}
                          </span>
                        </div>
                        <span className="text-green-400 font-bold text-sm text-center">{item.weight}</span>
                        <span className="text-zinc-500 text-xs text-right">{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Workout History */}
              <section data-testid="workout-history">
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">Workout History</h2>
                {workoutHistory.length === 0 ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400">No workouts completed yet. Start your first workout!</p>
                    <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-green-600 hover:bg-green-700">
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
                            <p className="text-white font-medium capitalize">{item.workoutName}</p>
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

          <div className="mt-10 text-center">
            <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700 rounded-full px-8">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
