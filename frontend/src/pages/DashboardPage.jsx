import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dumbbell, LogOut, User, Flame, CheckCircle2, Calendar, Trophy,
  ArrowRight, Clock, Zap, ChevronRight, Utensils, BarChart3,
  FileText, Circle, Minus, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { supabase } from '../lib/supabase';
import { PROGRAMS, getProgramContent } from '../data/programs';

const DashboardPage = () => {
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

  const activePurchase = purchases
    .sort((a, b) => {
      const tiers = { 'elite-beginner': 3, 'transformer': 2, 'starter': 1, 'free-starter': 0 };
      return (tiers[b.program_id] || 0) - (tiers[a.program_id] || 0);
    })[0];

  const workoutData = useMemo(
    () => activePurchase ? getProgramContent(activePurchase.program_id) : null,
    [activePurchase]
  );

  const programProgress = useMemo(
    () => activePurchase ? (progress[activePurchase.program_id] || []) : [],
    [activePurchase, progress]
  );

  const stats = useMemo(() => {
    const completedWorkouts = programProgress.filter(p => p.completed).length;
    const allDays = workoutData?.weeks.flatMap(w => w.days) || [];
    const totalWorkouts = allDays.length || 3;
    const progressPercent = Math.round((completedWorkouts / (totalWorkouts || 1)) * 100);

    let streak = 0;
    const sortedProgress = [...programProgress]
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

    if (sortedProgress.length > 0) {
      streak = sortedProgress.length;
    }

    let currentWeek = 1;
    if (workoutData) {
      for (const w of workoutData.weeks) {
        const weekCompleted = w.days.every(d => programProgress.some(p => p.day_id === d.id && p.completed));
        if (!weekCompleted) {
          currentWeek = w.week;
          break;
        }
        currentWeek = w.week;
      }
    }

    return {
      streak,
      completedWorkouts,
      totalWorkouts,
      progressPercent,
      currentWeek,
      totalWeeks: workoutData?.weeks.length || 1
    };
  }, [programProgress, workoutData]);

  const currentWeekData = workoutData?.weeks.find(w => w.week === stats.currentWeek) || workoutData?.weeks[0];

  const today = new Date();
  const dayNameMapping = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
  const todayName = dayNameMapping[today.getDay()];

  const todayWorkout = currentWeekData?.days.find(d => d.dayName === todayName);
  const isTodayCompleted = todayWorkout && programProgress.some(p => p.day_id === todayWorkout.id && p.completed);
  const isWorkoutDay = !!todayWorkout;

  const names_arr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const name = names_arr[i];
      const workout = currentWeekData?.days.find(d => d.dayName === name);
      const isCompleted = workout && programProgress.some(p => p.day_id === workout.id && p.completed);
      const isToday = date.toDateString() === today.toDateString();

      days.push({
        date,
        dayLetter: name[0],
        dayNumber: date.getDate(),
        isWorkoutDay: !!workout,
        isCompleted,
        isToday,
        workout
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getUpcomingWorkouts = () => {
    const upcoming = [];
    const daysToCheck = 7;
    for (let i = 0; i < daysToCheck && upcoming.length < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const name = names_arr[date.getDay()];
      const workout = currentWeekData?.days.find(d => d.dayName === name);
      if (workout || i === 0) {
        const isCompleted = workout && programProgress.some(p => p.day_id === workout.id && p.completed);
        upcoming.push({
          date,
          dayName: name,
          isToday: i === 0,
          workout,
          isCompleted,
          isRestDay: !workout
        });
      }
    }
    return upcoming;
  };

  const upcomingWorkouts = getUpcomingWorkouts();

  const getGreeting = () => {
    if (stats.streak === 0) return "Ready to start your journey? Let's go! 💪";
    if (stats.streak <= 2) return "Great start! Keep the momentum going! 🔥";
    return `You're on a ${stats.streak}-day streak! Unstoppable! 🏆`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!activePurchase) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]" data-testid="dashboard-page">
        <DashboardNav user={user} onLogout={handleLogout} activePage="dashboard" />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl font-bold text-white mb-4">Welcome, {user.name?.split(' ')[0]}! 👋</h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
              {user.exerciseLocation === 'home'
                ? "Ready to transform your body from the comfort of home?"
                : "Ready to hit the gym and crush some weights?"}
            </p>
            <Button
              onClick={() => navigate('/browse')}
              className="bg-green-600 hover:bg-green-700 h-14 px-8 rounded-full font-bold text-lg"
            >
              Find Your {user.exerciseLocation === 'home' ? 'Home' : 'Gym'} Program
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="dashboard-page">
      <DashboardNav user={user} onLogout={handleLogout} activePage="dashboard" />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2" data-testid="welcome-message">
              Welcome back, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-zinc-400" data-testid="motivation-message">{getGreeting()}</p>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-row">
            <StatCard icon={<Flame className="w-6 h-6 text-orange-500" />} value={stats.streak} label="Day Streak" testId="stat-streak" />
            <StatCard icon={<CheckCircle2 className="w-6 h-6 text-green-500" />} value={stats.completedWorkouts} label="Workouts Done" testId="stat-workouts" />
            <StatCard icon={<Calendar className="w-6 h-6 text-blue-500" />} value={`Week ${stats.currentWeek}`} sublabel={`of ${stats.totalWeeks}`} label="Current Week" testId="stat-week" />
            <StatCard icon={<Trophy className="w-6 h-6 text-yellow-500" />} value={`${stats.progressPercent}%`} label="Program Complete" showRing ringPercent={stats.progressPercent} testId="stat-progress" />
          </section>

          <section className="bg-zinc-900/80 border-l-4 border-green-500 rounded-2xl p-6 md:p-8" data-testid="todays-workout-card">
            {isWorkoutDay && todayWorkout ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold text-white uppercase">Today's Workout</h2>
                  {isTodayCompleted && <span className="flex items-center gap-2 text-green-400 font-medium"><CheckCircle2 className="w-5 h-5" />Completed Today!</span>}
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">Day {todayWorkout.dayNumber} — {todayWorkout.title}</h3>
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <span className="flex items-center gap-2 text-zinc-400"><Dumbbell className="w-4 h-4 text-green-500" />{todayWorkout.mainWorkout.length} exercises</span>
                  <span className="flex items-center gap-2 text-zinc-400"><Clock className="w-4 h-4 text-green-500" />~35 min</span>
                  <span className="flex items-center gap-2 text-zinc-400"><Zap className="w-4 h-4 text-green-500" />Beginner</span>
                </div>
                {!isTodayCompleted && (
                  <Button onClick={() => navigate(`/program/${activePurchase.program_id}/day/${todayWorkout.id}`)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-full text-lg group">
                    Start Workout <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold text-white uppercase mb-2">Rest Day 😴</h2>
                <p className="text-zinc-400">Recovery is important! Take it easy today and come back stronger.</p>
              </>
            )}
          </section>

          <section data-testid="weekly-calendar">
            <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">This Week</h2>
            <div className="flex justify-between gap-2">
              {weekDays.map((day, i) => (
                <div key={i} onClick={() => day.isCompleted && day.workout && navigate(`/program/${activePurchase.program_id}/day/${day.workout.id}`)}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-all ${day.isToday ? 'bg-green-500/20 border-2 border-green-500' : 'bg-zinc-900/50 border border-zinc-800'} ${day.isCompleted ? 'cursor-pointer hover:border-green-500/50' : ''}`}
                  data-testid={`calendar-day-${i}`}
                >
                  <span className="text-xs text-zinc-500 mb-1">{day.dayLetter}</span>
                  <span className={`text-sm font-medium mb-2 ${day.isToday ? 'text-white' : 'text-zinc-400'}`}>{day.dayNumber}</span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {day.isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : day.isMissed ? <X className="w-5 h-5 text-red-500" /> : day.isWorkoutDay ? (day.isToday ? <Flame className="w-5 h-5 text-orange-500" /> : <Circle className="w-5 h-5 text-zinc-600" />) : <Minus className="w-4 h-4 text-zinc-700" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6" data-testid="program-progress">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-white">{activePurchase.program_name || PROGRAMS.find(p => p.id === activePurchase.program_id)?.name || 'Active Program'}</h2>
              <Link to={`/program/${activePurchase.program_id}`} className="text-green-500 hover:text-green-400 text-sm flex items-center gap-1">View Full Program <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <Progress value={stats.progressPercent} className="h-3 bg-zinc-800 mb-3" />
            <p className="text-zinc-400 text-sm">{stats.completedWorkouts} of {stats.totalWorkouts} workouts completed</p>
          </section>

          <section data-testid="upcoming-schedule">
            <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">Upcoming Schedule</h2>
            <div className="space-y-3">
              {upcomingWorkouts.map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between" data-testid={`upcoming-${i}`}>
                  <div>
                    <span className={`text-sm font-medium ${item.isToday ? 'text-green-400' : 'text-zinc-500'}`}>{item.isToday ? 'Today' : item.dayName}</span>
                    {item.isRestDay ? <p className="text-zinc-400">Rest Day 😴 Recovery is important!</p> : <p className="text-white font-medium">Day {item.workout?.dayNumber} — {item.workout?.title}</p>}
                  </div>
                  {!item.isRestDay && (
                    <Button onClick={() => navigate(`/program/${activePurchase.program_id}/day/${item.workout?.id}`)} variant={item.isToday && !item.isCompleted ? 'default' : 'outline'} size="sm" className={item.isToday && !item.isCompleted ? 'bg-green-600 hover:bg-green-700' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}>
                      {item.isCompleted ? 'Review' : item.isToday ? 'Start' : 'Preview'} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// Component helper for stats
const StatCard = ({ icon, value, label, sublabel, showRing, ringPercent, testId }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center text-center hover:border-zinc-700 transition-colors" data-testid={testId}>
    <div className="relative w-12 h-12 flex items-center justify-center mb-2">
      {showRing && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${ringPercent} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
        </svg>
      )}
      <div className="relative z-10">{icon}</div>
    </div>
    <div className="flex flex-col">
      <div className="flex items-baseline justify-center">
        <span className={`font-heading font-bold text-white relative z-10 ${showRing ? 'text-lg' : 'text-2xl'}`}>{value}</span>
        {sublabel && <span className="text-zinc-500 text-xs ml-1 relative z-10">{sublabel}</span>}
      </div>
      <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">{label}</span>
    </div>
  </div>
);

// Navbar component for re-use
const DashboardNav = ({ user, onLogout, activePage }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
        <Dumbbell className="w-8 h-8 text-green-500" />
        <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">{user?.name}</span>
        </div>
        <Button onClick={onLogout} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
          <LogOut className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  </nav>
);

export default DashboardPage;
