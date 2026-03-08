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
import { FREE_STARTER_WORKOUTS, PROGRAMS } from '../data/programs';

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

  // Get active program (Free Starter for now)
  const activeProgram = purchases.find(p => p.program_id === 'free-starter');
  const programProgress = useMemo(() => progress['free-starter'] || [], [progress]);
  const workoutData = FREE_STARTER_WORKOUTS;

  // Calculate stats
  const stats = useMemo(() => {
    const completedWorkouts = programProgress.filter(p => p.completed).length;
    const totalWorkouts = workoutData?.weeks[0]?.days.length || 3;
    const progressPercent = Math.round((completedWorkouts / totalWorkouts) * 100);
    
    // Calculate streak (consecutive days)
    let streak = 0;
    const sortedProgress = [...programProgress]
      .filter(p => p.completed)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
    
    if (sortedProgress.length > 0) {
      streak = sortedProgress.length; // Simplified streak
    }

    return {
      streak,
      completedWorkouts,
      totalWorkouts,
      progressPercent,
      currentWeek: 1,
      totalWeeks: 1
    };
  }, [programProgress, workoutData]);

  // Get today's info
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const workoutDays = [1, 3, 5]; // Mon, Wed, Fri
  const isWorkoutDay = workoutDays.includes(dayOfWeek);
  
  // Map day of week to workout
  const getDayWorkout = (dow) => {
    if (dow === 1) return workoutData?.weeks[0]?.days[0]; // Monday - Day 1
    if (dow === 3) return workoutData?.weeks[0]?.days[1]; // Wednesday - Day 2
    if (dow === 5) return workoutData?.weeks[0]?.days[2]; // Friday - Day 3
    return null;
  };

  const todayWorkout = getDayWorkout(dayOfWeek);
  const isTodayCompleted = todayWorkout && programProgress.some(
    p => p.day_id === todayWorkout.id && p.completed
  );

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dow = date.getDay();
      const workout = getDayWorkout(dow);
      const isCompleted = workout && programProgress.some(
        p => p.day_id === workout.id && p.completed
      );
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isMissed = isPast && workout && !isCompleted;
      
      days.push({
        date,
        dayLetter: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dow],
        dayNumber: date.getDate(),
        isWorkoutDay: workoutDays.includes(dow),
        isCompleted,
        isToday,
        isPast,
        isMissed,
        workout
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Get upcoming workouts
  const getUpcomingWorkouts = () => {
    const upcoming = [];
    const daysToCheck = 7;
    
    for (let i = 0; i < daysToCheck && upcoming.length < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dow = date.getDay();
      const workout = getDayWorkout(dow);
      
      if (workout || i === 0) {
        const isCompleted = workout && programProgress.some(
          p => p.day_id === workout.id && p.completed
        );
        upcoming.push({
          date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
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

  // Greeting based on streak
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

  // If no active program, redirect to browse
  if (!activeProgram) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]" data-testid="dashboard-page">
        <DashboardNav user={user} onLogout={handleLogout} activePage="dashboard" />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-3xl font-bold text-white mb-4">
              Welcome, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-zinc-400 mb-8">Get started by choosing a program</p>
            <Button onClick={() => navigate('/browse')} className="bg-green-600 hover:bg-green-700">
              Browse Programs
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
          
          {/* Header Section */}
          <section className="mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2" data-testid="welcome-message">
              Welcome back, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-zinc-400" data-testid="motivation-message">
              {getGreeting()}
            </p>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-row">
            <StatCard 
              icon={<Flame className="w-6 h-6 text-orange-500" />}
              value={stats.streak}
              label="Day Streak"
              testId="stat-streak"
            />
            <StatCard 
              icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
              value={stats.completedWorkouts}
              label="Workouts Done"
              testId="stat-workouts"
            />
            <StatCard 
              icon={<Calendar className="w-6 h-6 text-blue-500" />}
              value={`Week ${stats.currentWeek}`}
              sublabel={`of ${stats.totalWeeks}`}
              label="Current Week"
              testId="stat-week"
            />
            <StatCard 
              icon={<Trophy className="w-6 h-6 text-yellow-500" />}
              value={`${stats.progressPercent}%`}
              label="Program Complete"
              showRing
              ringPercent={stats.progressPercent}
              testId="stat-progress"
            />
          </section>

          {/* Today's Workout Card */}
          <section 
            className="bg-zinc-900/80 border-l-4 border-green-500 rounded-2xl p-6 md:p-8"
            data-testid="todays-workout-card"
          >
            {isWorkoutDay && todayWorkout ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold text-white uppercase">
                    Today's Workout
                  </h2>
                  {isTodayCompleted && (
                    <span className="flex items-center gap-2 text-green-400 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Completed Today!
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                  Day {todayWorkout.dayNumber} — {todayWorkout.title}
                </h3>
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Dumbbell className="w-4 h-4 text-green-500" />
                    {todayWorkout.mainWorkout.length} exercises
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-green-500" />
                    ~35 min
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Zap className="w-4 h-4 text-green-500" />
                    Beginner
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-zinc-500 text-sm mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {todayWorkout.mainWorkout.slice(0, 3).map((ex, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300">
                        {ex.name}
                      </span>
                    ))}
                    {todayWorkout.mainWorkout.length > 3 && (
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-500">
                        +{todayWorkout.mainWorkout.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                {!isTodayCompleted && (
                  <Button
                    onClick={() => navigate(`/program/free-starter/day/${todayWorkout.id}`)}
                    data-testid="start-today-workout"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-full text-lg group"
                  >
                    Start Workout
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold text-white uppercase mb-2">
                  Rest Day 😴
                </h2>
                <p className="text-zinc-400">
                  Recovery is important! Take it easy today and come back stronger.
                </p>
              </>
            )}
          </section>

          {/* Weekly Calendar */}
          <section data-testid="weekly-calendar">
            <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
              This Week
            </h2>
            <div className="flex justify-between gap-2">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  onClick={() => day.isCompleted && day.workout && navigate(`/program/free-starter/day/${day.workout.id}`)}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-all ${
                    day.isToday 
                      ? 'bg-green-500/20 border-2 border-green-500' 
                      : 'bg-zinc-900/50 border border-zinc-800'
                  } ${day.isCompleted ? 'cursor-pointer hover:border-green-500/50' : ''}`}
                  data-testid={`calendar-day-${i}`}
                >
                  <span className="text-xs text-zinc-500 mb-1">{day.dayLetter}</span>
                  <span className={`text-sm font-medium mb-2 ${day.isToday ? 'text-white' : 'text-zinc-400'}`}>
                    {day.dayNumber}
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {day.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : day.isMissed ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : day.isWorkoutDay ? (
                      day.isToday ? (
                        <Flame className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600" />
                      )
                    ) : (
                      <Minus className="w-4 h-4 text-zinc-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Program Progress Bar */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6" data-testid="program-progress">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-white">
                Free Starter Program
              </h2>
              <Link 
                to="/program/free-starter" 
                className="text-green-500 hover:text-green-400 text-sm flex items-center gap-1"
              >
                View Full Program <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Progress value={stats.progressPercent} className="h-3 bg-zinc-800 mb-3" />
            <p className="text-zinc-400 text-sm">
              {stats.completedWorkouts} of {stats.totalWorkouts} workouts completed
            </p>
          </section>

          {/* Upcoming Schedule */}
          <section data-testid="upcoming-schedule">
            <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">
              Upcoming Schedule
            </h2>
            <div className="space-y-3">
              {upcomingWorkouts.map((item, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                  data-testid={`upcoming-${i}`}
                >
                  <div>
                    <span className={`text-sm font-medium ${item.isToday ? 'text-green-400' : 'text-zinc-500'}`}>
                      {item.isToday ? 'Today' : item.dayName}
                    </span>
                    {item.isRestDay ? (
                      <p className="text-zinc-400">Rest Day 😴 Recovery is important!</p>
                    ) : (
                      <p className="text-white font-medium">
                        Day {item.workout?.dayNumber} — {item.workout?.title}
                      </p>
                    )}
                  </div>
                  {!item.isRestDay && (
                    <Button
                      onClick={() => navigate(`/program/free-starter/day/${item.workout?.id}`)}
                      variant={item.isToday && !item.isCompleted ? 'default' : 'outline'}
                      size="sm"
                      className={item.isToday && !item.isCompleted 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      }
                    >
                      {item.isCompleted ? 'Review' : item.isToday ? 'Start' : 'Preview'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="quick-actions">
            <QuickActionCard
              icon={<FileText className="w-6 h-6" />}
              label="View Full Program"
              onClick={() => navigate('/program/free-starter')}
              testId="action-program"
            />
            <QuickActionCard
              icon={<Utensils className="w-6 h-6" />}
              label="Nutrition Tips"
              onClick={() => navigate('/nutrition')}
              testId="action-nutrition"
            />
            <QuickActionCard
              icon={<BarChart3 className="w-6 h-6" />}
              label="My Progress"
              onClick={() => navigate('/progress')}
              testId="action-progress"
            />
          </section>
        </div>
      </main>
    </div>
  );
};

// Dashboard Navigation Component
const DashboardNav = ({ user, onLogout, activePage }) => {
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', key: 'dashboard' },
    { name: 'My Programs', path: '/my-programs', key: 'my-programs' },
    { name: 'Progress', path: '/progress', key: 'progress' },
    { name: 'Nutrition', path: '/nutrition', key: 'nutrition' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
          <Dumbbell className="w-8 h-8 text-green-500" />
          <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.key}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                activePage === link.key 
                  ? 'text-green-400' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <User className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">{user?.name}</span>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, sublabel, label, showRing, ringPercent, testId }) => (
  <div 
    className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center"
    data-testid={testId}
  >
    <div className="mb-2">{icon}</div>
    <div className={`relative flex items-center justify-center ${showRing ? 'w-16 h-16' : ''}`}>
      {showRing && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="3"
            strokeDasharray={`${ringPercent} 100`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
      )}
      <span className={`font-heading font-bold text-white relative z-10 ${showRing ? 'text-base' : 'text-2xl'}`}>{value}</span>
      {sublabel && <span className="text-zinc-500 text-sm ml-1 relative z-10">{sublabel}</span>}
    </div>
    <span className="text-zinc-500 text-xs mt-1">{label}</span>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ icon, label, onClick, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-green-500/50 hover:bg-zinc-900 transition-all group text-left w-full"
  >
    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500/20 transition-colors">
      {icon}
    </div>
    <span className="font-medium text-white">{label}</span>
    <ChevronRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:text-green-500 transition-colors" />
  </button>
);

export default DashboardPage;
