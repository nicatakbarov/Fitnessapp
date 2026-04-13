import { useEffect, useState, useMemo, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dumbbell, LogOut, User, Flame, CheckCircle2, Calendar, Trophy,
  ArrowRight, Clock, Zap, ChevronRight, Utensils, BarChart3,
  FileText, Circle, Minus, X, Heart, Footprints, Activity, Moon
} from 'lucide-react';
import {
  requestHealthPermissions, getTodaySteps, getTodayCalories, getLatestHeartRate, getSleepLast7Days
} from '../lib/healthkit';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import ProgramSelectorModal from '../components/ProgramSelectorModal';
import DashboardNav from '../components/DashboardNav';
import { supabase } from '../lib/supabase';
import { FREE_STARTER_WORKOUTS, HOME_BEGINNER_WORKOUTS } from '../data/programs';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [customPlanData, setCustomPlanData] = useState(null);
  const [showProgramSelector, setShowProgramSelector] = useState(false);
  const [healthData, setHealthData] = useState({ steps: null, calories: null, heartRate: null, sleepHours: null });

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
      fetchHealthData();
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHealthData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHealthData = async () => {
    console.log('[Dashboard] fetchHealthData started');
    const permResult = await requestHealthPermissions();
    console.log('[Dashboard] permResult:', permResult);
    const [steps, calories, heartRate, sleepData] = await Promise.all([
      getTodaySteps(),
      getTodayCalories(),
      getLatestHeartRate(),
      getSleepLast7Days(),
    ]);
    const lastNight = sleepData?.length ? sleepData[sleepData.length - 1].hours : null;
    console.log('[Dashboard] health results:', { steps, calories, heartRate, sleepHours: lastNight });
    setHealthData({ steps, calories, heartRate, sleepHours: lastNight });
  };

  const fetchData = async (userId) => {
    try {
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });
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

      // Load custom plan data for the first (active) program
      const activePurchase = (purchasesData || [])[0];
      if (activePurchase?.program_id?.startsWith('custom-')) {
        const cached = sessionStorage.getItem('customPlans');
        if (cached) {
          const plans = JSON.parse(cached);
          if (plans[activePurchase.program_id]) {
            setCustomPlanData(plans[activePurchase.program_id]);
          } else {
            await loadCustomPlan(activePurchase.program_id, plans);
          }
        } else {
          await loadCustomPlan(activePurchase.program_id, {});
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomPlan = async (programId, existingPlans) => {
    const planId = programId.replace('custom-', '');
    const { data } = await supabase
      .from('custom_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (data?.plan_data) {
      const plan = typeof data.plan_data === 'string'
        ? JSON.parse(data.plan_data)
        : data.plan_data;
      const fullPlan = { ...plan, id: programId };
      setCustomPlanData(fullPlan);
      sessionStorage.setItem('customPlans', JSON.stringify({
        ...existingPlans,
        [programId]: fullPlan,
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleProgramSelect = (programType) => {
    if (programType === 'home') {
      navigate('/home-setup');
    } else if (programType === 'gym') {
      navigate('/browse?program=free-starter');
    } else if (programType === 'custom') {
      navigate('/create-plan');
    }
    setShowProgramSelector(false);
  };

  // Active program = most recently purchased
  const activeProgram = purchases[0] || null;

  // Resolve workout data dynamically
  const workoutData = useMemo(() => {
    if (!activeProgram) return null;
    const pid = activeProgram.program_id;
    if (pid === 'free-starter') return FREE_STARTER_WORKOUTS;
    if (pid === 'home-beginner') return HOME_BEGINNER_WORKOUTS;
    if (pid.startsWith('custom-')) return customPlanData;
    return null;
  }, [activeProgram, customPlanData]);

  const programProgress = useMemo(
    () => (activeProgram ? progress[activeProgram.program_id] || [] : []),
    [activeProgram, progress]
  );

  // Workout day indices (days of week 0=Sun…6=Sat)
  const workoutDayIndices = useMemo(
    () => workoutData?.workoutDayIndices || [1, 3, 5],
    [workoutData]
  );

  // Stats
  const stats = useMemo(() => {
    const completedWorkouts = programProgress.filter(p => p.completed).length;
    const allDays = workoutData?.weeks?.flatMap(w => w.days) || [];
    const totalWorkouts = allDays.length || workoutDayIndices.length;
    const progressPercent = totalWorkouts > 0
      ? Math.round((completedWorkouts / totalWorkouts) * 100)
      : 0;

    const daysPerWeek = workoutDayIndices.length;
    const totalWeeks = workoutData?.weeks?.length || 1;
    const currentWeek = Math.min(
      Math.floor(completedWorkouts / daysPerWeek) + 1,
      totalWeeks
    );

    const streak = programProgress.filter(p => p.completed).length;

    return {
      streak,
      completedWorkouts,
      totalWorkouts,
      progressPercent,
      currentWeek,
      totalWeeks,
      daysPerWeek,
    };
  }, [programProgress, workoutData, workoutDayIndices]);

  // Last 7 days activity (for Card 1 mini chart)
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const done = programProgress.some(
        p => p.completed && p.completed_at?.startsWith(dateStr)
      );
      return { done };
    });
  }, [programProgress]);

  // Per-program-week bar data (for Card 4 mini chart)
  const weeklyBarData = useMemo(() => {
    const completed = programProgress
      .filter(p => p.completed && p.completed_at)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
    const daysPerWeek = workoutDayIndices.length || 3;
    const totalWeeks = workoutData?.weeks?.length || 1;
    return Array.from({ length: totalWeeks }, (_, weekIdx) => {
      const count = completed.slice(weekIdx * daysPerWeek, (weekIdx + 1) * daysPerWeek).length;
      return { count };
    });
  }, [programProgress, workoutDayIndices, workoutData]);

  // SVG area path for Card 2
  const svgAreaPath = useMemo(() => {
    if (weeklyBarData.length < 2) return { line: 'M0,25 L100,25', fill: 'M0,25 L100,25 L100,30 L0,30 Z' };
    const maxCount = Math.max(...weeklyBarData.map(w => w.count), 1);
    const pts = weeklyBarData.map((w, i) => {
      const x = (i / (weeklyBarData.length - 1)) * 100;
      const y = 30 - (w.count / maxCount) * 25;
      return [x, y];
    });
    const line = `M${pts.map(([x, y]) => `${x},${y}`).join(' L')}`;
    const fill = `M${pts[0][0]},${pts[0][1]} L${pts.map(([x, y]) => `${x},${y}`).join(' L')} L100,30 L0,30 Z`;
    return { line, fill, pts };
  }, [weeklyBarData]);

  // Map day-of-week to the correct workout
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWorkoutDay = workoutDayIndices.includes(dayOfWeek);

  const getDayWorkout = (dow) => {
    const idx = workoutDayIndices.indexOf(dow);
    if (idx === -1 || !workoutData?.weeks) return null;
    const completedCount = programProgress.filter(p => p.completed).length;
    const daysPerWeek = workoutDayIndices.length;
    const weekIndex = Math.min(
      Math.floor(completedCount / daysPerWeek),
      workoutData.weeks.length - 1
    );
    return workoutData.weeks[weekIndex]?.days[idx] || null;
  };

  const todayWorkout = getDayWorkout(dayOfWeek);
  const isTodayCompleted = todayWorkout && programProgress.some(
    p => p.day_id === todayWorkout.id && p.completed
  );

  // Weekly calendar
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

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
        isWorkoutDay: workoutDayIndices.includes(dow),
        isCompleted,
        isToday,
        isPast,
        isMissed,
        workout,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Upcoming workouts
  const getUpcomingWorkouts = () => {
    const upcoming = [];
    for (let i = 0; i < 7 && upcoming.length < 3; i++) {
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
          isRestDay: !workout,
        });
      }
    }
    return upcoming;
  };

  const upcomingWorkouts = getUpcomingWorkouts();

  const getGreeting = () => {
    if (stats.streak === 0) return "Ready to start your journey? Let's go!";
    if (stats.streak <= 2) return "Great start! Keep the momentum going!";
    return `You're on a ${stats.streak}-workout streak! Unstoppable!`;
  };

  const programLink = activeProgram ? `/program/${activeProgram.program_id}` : '/my-programs';
  const programName = activeProgram?.program_name || 'My Program';

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!activeProgram) {
    navigate('/browse');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="dashboard-page">
      <DashboardNav user={user} onLogout={handleLogout} activePage="dashboard" />

      <main className="pt-24 pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <section className="mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2" data-testid="welcome-message">
              Welcome back, {user.name?.split(' ')[0]}!
            </h1>
            <p className="text-zinc-400" data-testid="motivation-message">
              {getGreeting()}
            </p>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-2 gap-3" data-testid="stats-row">
            {/* Card 1 — Workouts Done */}
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              gradient="from-orange-500/10 to-transparent"
              value={stats.streak}
              label="Workouts Done"
              testId="stat-streak"
              chart={
                <div className="flex items-end gap-0.5 h-10">
                  {last7Days.map((day, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${day.done ? 'bg-orange-500' : 'bg-zinc-700'}`}
                      style={{ height: day.done ? '100%' : '35%' }}
                    />
                  ))}
                </div>
              }
            />

            {/* Card 2 — Completed */}
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              gradient="from-green-500/10 to-transparent"
              value={stats.completedWorkouts}
              sublabel={`/ ${stats.totalWorkouts}`}
              label="Completed"
              testId="stat-workouts"
              chart={
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-10">
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={svgAreaPath.fill} fill="url(#greenGrad)" />
                  <path d={svgAreaPath.line} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {svgAreaPath.pts?.map(([x, y], i) => {
                    if (i === stats.currentWeek - 1) {
                      return <circle key={i} cx={x} cy={y} r="2.5" fill="#22c55e" />;
                    }
                    return null;
                  })}
                </svg>
              }
            />

            {/* Card 3 — Current Week */}
            <StatCard
              icon={<Calendar className="w-4 h-4 text-blue-500" />}
              gradient="from-blue-500/10 to-transparent"
              value={`Week ${stats.currentWeek}`}
              sublabel={`of ${stats.totalWeeks}`}
              label="Current Week"
              testId="stat-week"
              chart={
                <div className="flex gap-1">
                  {weekDays.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                      <div className={`w-full aspect-square rounded-full flex items-center justify-center text-[9px] font-bold
                        ${day.isCompleted
                          ? 'bg-blue-500 text-white'
                          : day.isToday && day.isWorkoutDay
                            ? 'bg-blue-500/30 text-blue-300 ring-1 ring-blue-500'
                            : day.isWorkoutDay
                              ? 'bg-zinc-700 text-zinc-400'
                              : 'bg-zinc-800 text-zinc-600'}`}>
                        {day.dayLetter}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />

            {/* Card 4 — Program Progress */}
            <StatCard
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              gradient="from-yellow-500/10 to-transparent"
              value={`${stats.progressPercent}%`}
              label="Program Complete"
              testId="stat-progress"
              chart={
                <div className="relative h-4 bg-zinc-800 rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500"
                    style={{
                      width: `${stats.progressPercent || 0}%`,
                      background: 'repeating-linear-gradient(135deg, #f97316 0px, #f97316 8px, #ea6b0e 8px, #ea6b0e 16px)',
                    }}
                  >
                    <div className="absolute inset-y-0 right-0 w-1.5 bg-orange-500" />
                  </div>
                </div>
              }
            />
          </section>

          {/* Today's Workout */}
          <section
            className={`bg-zinc-900/80 rounded-2xl p-6 md:p-8 ${isWorkoutDay && todayWorkout ? 'border-l-4 border-green-500' : ''}`}
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
                    {todayWorkout.mainWorkout?.length} exercises
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
                    {todayWorkout.mainWorkout?.slice(0, 3).map((ex, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300">
                        {ex.name}
                      </span>
                    ))}
                    {(todayWorkout.mainWorkout?.length || 0) > 3 && (
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-500">
                        +{todayWorkout.mainWorkout.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                {!isTodayCompleted && (
                  <Button
                    onClick={() => navigate(`/program/${activeProgram.program_id}/day/${todayWorkout.id}`)}
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
                  Rest Day
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
                  onClick={() => day.isCompleted && day.workout && navigate(`/program/${activeProgram.program_id}/day/${day.workout.id}`)}
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

          {/* Program Progress */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6" data-testid="program-progress">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-white">
                {programName}
              </h2>
              <Link
                to={programLink}
                className="text-zinc-400 hover:text-zinc-300 text-sm flex items-center gap-1"
              >
                View Program <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative h-5 bg-zinc-800 rounded overflow-hidden mb-3">
              <div
                className="absolute inset-y-0 left-0 rounded-r transition-all duration-500"
                style={{
                  width: `${stats.progressPercent || 0}%`,
                  background: 'repeating-linear-gradient(135deg, #22c55e 0px, #22c55e 8px, #16a34a 8px, #16a34a 16px)',
                }}
              />
            </div>
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
                    <span className={`text-sm font-medium ${item.isToday ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {item.isToday ? 'Today' : item.dayName}
                    </span>
                    {item.isRestDay ? (
                      <p className="text-zinc-400">Rest Day — Recovery is important!</p>
                    ) : (
                      <p className="text-white font-medium">
                        Day {item.workout?.dayNumber} — {item.workout?.title}
                      </p>
                    )}
                  </div>
                  {!item.isRestDay && (
                    <Button
                      onClick={() => navigate(`/program/${activeProgram.program_id}/day/${item.workout?.id}`)}
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

        </div>
      </main>
      <BottomNav />
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────

const StatCard = ({ icon, gradient, value, sublabel, label, chart, testId }) => (
  <div className="bg-zinc-900 rounded-2xl p-4 relative overflow-hidden" data-testid={testId}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />
    <div className="flex items-center gap-1.5 mb-2 relative z-10">
      {icon}
      <span className="text-zinc-400 text-xs font-medium">{label}</span>
    </div>
    <div className="relative z-10 mb-3">
      <span className="font-heading text-3xl font-bold text-white">{value}</span>
      {sublabel && <span className="text-zinc-400 text-sm ml-1">{sublabel}</span>}
    </div>
    <div className="relative z-10">{chart}</div>
  </div>
);

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
