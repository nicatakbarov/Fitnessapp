import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, Flame, Trophy, CheckCircle2, Calendar, TrendingUp, BarChart2, Watch, Scale, Footprints, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { FREE_STARTER_WORKOUTS, TWO_DAY_WORKOUTS, STARTER_WORKOUTS, TRANSFORMER_WORKOUTS, ELITE_WORKOUTS, HOME_BEGINNER_WORKOUTS } from '../data/programs';
import { getStepsLast7Days, getWeightHistory, getAppleWatchWorkouts, requestHealthPermissions, getTodaySteps, getTodayCalories, getLatestHeartRate } from '../lib/healthkit';
import { Capacitor } from '@capacitor/core';

// Light haptic tap — only fires on native iOS, silently skipped on web
const hapticTick = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) {}
};

const ProgressPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [watchWorkouts, setWatchWorkouts] = useState([]);
  const [healthData, setHealthData] = useState({ steps: null, calories: null, heartRate: null });
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [rulerWeight, setRulerWeight] = useState(70);
  const rulerDragRef = useRef({ active: false, startX: 0, startWeight: 70, lastX: 0, velocity: 0, lastTime: 0 });
  const momentumRef = useRef(null);
  const isFetching = useRef(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProgress(parsedUser.id);
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
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      await requestHealthPermissions();
      const [stepsWeekly, weight, workouts, steps, calories, heartRate] = await Promise.all([
        getStepsLast7Days(),
        getWeightHistory(),
        getAppleWatchWorkouts(),
        getTodaySteps(),
        getTodayCalories(),
        getLatestHeartRate(),
      ]);
      setWeeklySteps(stepsWeekly);
      setWeightData(weight);
      setWatchWorkouts(workouts);
      setHealthData({ steps, calories, heartRate });
      const noData = (steps === 0 || steps === null) && (calories === 0 || calories === null) && heartRate === null;
      if (noData) {
        setTimeout(() => { isFetching.current = false; fetchHealthData(); }, 1500);
        return;
      }
    } finally {
      isFetching.current = false;
    }
  };

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

  // Body weight history — merged from HealthKit + localStorage
  const bodyWeightHistory = useMemo(() => {
    const lsKey = user ? `body_weights_${user.id}` : null;
    const lsEntries = lsKey
      ? JSON.parse(localStorage.getItem(lsKey) || '[]')
      : [];
    // HealthKit entries
    const hkEntries = (weightData || []).map(w => ({ date: w.date, weight: w.weight, source: 'hk' }));
    // Merge — prefer most recent per day
    const map = {};
    [...hkEntries, ...lsEntries].forEach(e => {
      const day = e.date?.slice(0, 10);
      if (day) map[day] = e;
    });
    return Object.values(map).sort((a, b) => a.date > b.date ? 1 : -1);
  }, [weightData, user]);

  const latestBodyWeight = bodyWeightHistory.length
    ? bodyWeightHistory[bodyWeightHistory.length - 1].weight
    : null;

  const onRulerStart = useCallback((clientX) => {
    if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
    const now = performance.now();
    rulerDragRef.current = { active: true, startX: clientX, startWeight: rulerWeight, lastX: clientX, velocity: 0, lastTime: now };
  }, [rulerWeight]);

  const onRulerMove = useCallback((clientX) => {
    const d = rulerDragRef.current;
    if (!d.active) return;
    const now = performance.now();
    const dt = now - d.lastTime;
    if (dt > 0) d.velocity = (clientX - d.lastX) / dt; // px/ms
    d.lastX = clientX;
    d.lastTime = now;
    const dx = clientX - d.startX;
    const PX_PER_KG = 30;
    const raw = d.startWeight - dx / PX_PER_KG;
    const newW = Math.max(30, Math.min(200, Math.round(raw * 2) / 2));
    setRulerWeight(prev => {
      if (prev !== newW) hapticTick();
      return newW;
    });
  }, []);

  const onRulerEnd = useCallback(() => {
    const d = rulerDragRef.current;
    d.active = false;
    // Momentum scroll
    let vel = d.velocity; // px/ms, negative = moving left = weight up
    const PX_PER_KG = 30;
    const decay = 0.80;
    const step = () => {
      vel *= decay;
      if (Math.abs(vel) < 0.02) return;
      rulerDragRef.current.startWeight -= vel * 16 / PX_PER_KG;
      rulerDragRef.current.startX = rulerDragRef.current.lastX;
      const newW = Math.max(30, Math.min(200, Math.round(rulerDragRef.current.startWeight * 2) / 2));
      setRulerWeight(prev => {
        if (prev !== newW) hapticTick();
        return newW;
      });
      momentumRef.current = requestAnimationFrame(step);
    };
    momentumRef.current = requestAnimationFrame(step);
  }, []);

  const addBodyWeight = () => {
    const val = rulerWeight;
    if (!val || val < 20 || val > 300 || !user) return;
    const lsKey = `body_weights_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(lsKey) || '[]');
    const today = new Date().toISOString().slice(0, 10);
    const filtered = existing.filter(e => e.date?.slice(0, 10) !== today);
    const updated = [...filtered, { date: new Date().toISOString(), weight: val }];
    localStorage.setItem(lsKey, JSON.stringify(updated));
    setShowWeightInput(false);
    setWeightData(prev => [...prev]);
  };

  // Weight history from localStorage
  const weightHistory = useMemo(() => {
    if (!user) return [];
    const WORKOUT_MAP = {
      'free-starter': FREE_STARTER_WORKOUTS,
      'starter-2day': TWO_DAY_WORKOUTS,
      'starter': STARTER_WORKOUTS,
      'transformer': TRANSFORMER_WORKOUTS,
      'elite-beginner': ELITE_WORKOUTS,
      'home-beginner': HOME_BEGINNER_WORKOUTS,
    };
    const resolveExerciseName = (programId, dayId, exerciseKey) => {
      const workoutData = WORKOUT_MAP[programId];
      if (!workoutData) return null;
      const allDays = workoutData?.weeks?.flatMap(w => w.days) || [];
      const day = allDays.find(d => d.id === dayId);
      if (!day) return null;
      const [section, idxStr] = exerciseKey.split('-');
      const idx = parseInt(idxStr, 10);
      if (section === 'main') return day.mainWorkout?.[idx]?.name || null;
      if (section === 'warmup') return day.warmup?.exercises?.[idx]?.name || null;
      if (section === 'cooldown') return day.cooldown?.exercises?.[idx]?.name || null;
      return null;
    };
    try {
      const all = JSON.parse(localStorage.getItem('workout_weights') || '{}');
      const entries = [];
      for (const [key, val] of Object.entries(all)) {
        if (!key.includes(`_${user.id}_`)) continue;
        // key format: weights_{userId}_{programId}_{dayId}
        const parts = key.split('_');
        const userIdIndex = parts.indexOf(user.id.toString()) !== -1
          ? parts.indexOf(user.id.toString())
          : parts.findIndex((_, i) => parts.slice(1, i + 1).join('_') === user.id);
        // Extract programId and dayId after "weights_{userId}_"
        const prefix = `weights_${user.id}_`;
        const rest = key.slice(prefix.length); // "{programId}_{dayId}"
        // dayId is the last segment (e.g. "week1-day2"), programId is what's before it
        const lastDash = rest.lastIndexOf('_');
        const programId = rest.slice(0, lastDash);
        const dayId = rest.slice(lastDash + 1);
        const { weights, completedAt } = val;
        for (const [exerciseKey, weight] of Object.entries(weights)) {
          if (weight) {
            const resolvedName = resolveExerciseName(programId, dayId, exerciseKey);
            entries.push({
              exerciseKey,
              exerciseName: resolvedName || exerciseKey,
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
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
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

      <main className="pt-24 pb-24 px-4 md:px-6">
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

          {/* Today's Health Widgets — always shown, loads independently */}
          {(() => {
                const mockDayBars = [6,10,4,12,6,10,17,6,4,10,8,14,12,62,108,145,128,95,46,29,17,10,6,21,10,14,8,10,4,8];
                const dayBars = mockDayBars;
                const W = {borderRadius:'20px',padding:'14px',display:'flex',flexDirection:'column',aspectRatio:'1',overflow:'hidden'};
                const iconBox = (bg) => ({background:bg,borderRadius:'50%',width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center'});
                const timeRow = {display:'flex',justifyContent:'space-between',fontSize:'10px',color:'rgba(255,255,255,0.25)'};
                return (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-heading text-sm font-bold text-zinc-400 uppercase tracking-widest">Today's Health</h2>
                      <span className="text-xs text-zinc-600">from Apple Health</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Widget 1: Steps */}
                      <div style={{...W, background:'#162b1a'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                          <div style={iconBox('#1f3d25')}><Footprints size={12} color="#4ade80" /></div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'32px',fontWeight:'800',color:'white',lineHeight:1,letterSpacing:'-0.5px'}}>
                              {(healthData.steps ?? 0).toLocaleString()}
                            </div>
                            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>of 10 000 steps</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 183 150" style={{width:'100%',flex:1,minHeight:0,marginBottom:'2px'}} aria-hidden="true">
                          {dayBars.map((h,i) => <rect key={i} x={i*6+1} y={150-h} width="4" height={Math.max(h,2)} rx="2" fill="#4ade80" opacity={h>20?1:0.3} />)}
                        </svg>
                        <div style={timeRow}><span>0:00</span><span>12:00</span><span>24:00</span></div>
                      </div>
                      {/* Widget 2: Heart Rate */}
                      <div style={{...W, background:'#1a0e3a'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                          <div style={iconBox('#2d1a5e')}><Heart size={12} color="#f472b6" /></div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'32px',fontWeight:'800',color:'#f472b6',lineHeight:1}}>
                              {healthData.heartRate ?? '—'}
                            </div>
                            <div style={{fontSize:'13px',color:'#f472b6',opacity:0.6,marginTop:'2px'}}>BPM avg</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 183 150" style={{width:'100%',flex:1,minHeight:0,marginBottom:'2px'}} aria-hidden="true">
                          {[0,0,0,0,29,91,132,87,115,103,132,115,103,140,115,103,132,87,70,41,21,0,0,0,0,0,0,0,0,0].map((h,i) => <rect key={i} x={i*6+1} y={150-h} width="4" height={Math.max(h,2)} rx="2" fill="#38bdf8" opacity={h>20?0.85:0.2} />)}
                        </svg>
                        <div style={timeRow}><span>0:00</span><span>12:00</span><span>24:00</span></div>
                      </div>
                      {/* Widget 3: Calories */}
                      <div style={{...W, background:'#2d1010'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                          <div style={iconBox('#4a1515')}><Flame size={12} color="#f97316" /></div>
                          <div style={{textAlign:'right'}}>
                            <div style={{display:'flex',alignItems:'baseline',gap:'3px',justifyContent:'flex-end'}}>
                              <span style={{fontSize:'32px',fontWeight:'800',color:'#ff6b35',lineHeight:1,letterSpacing:'-0.5px'}}>
                                {healthData.calories ?? 0}
                              </span>
                              <span style={{fontSize:'14px',color:'rgba(249,115,22,0.6)',fontWeight:'600'}}>kcal</span>
                            </div>
                            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>of 600 kcal burn</div>
                          </div>
                        </div>
                        <svg viewBox="0 0 183 150" style={{width:'100%',flex:1,minHeight:0,marginBottom:'2px'}} aria-hidden="true">
                          {dayBars.map((h,i) => <rect key={i} x={i*6+1} y={150-h} width="4" height={Math.max(h,2)} rx="2" fill="#f97316" opacity={h>20?1:0.3} />)}
                        </svg>
                        <div style={timeRow}><span>0:00</span><span>12:00</span><span>24:00</span></div>
                      </div>
                      {/* Widget 4: Body Weight */}
                      {(() => {
                        return (
                          <div
                            onClick={() => {
                              if (!showWeightInput) setRulerWeight(latestBodyWeight || 70);
                              setShowWeightInput(v => !v);
                            }}
                            style={{...W, background:'#0e2420', cursor:'pointer', justifyContent:'center', alignItems:'center'}}
                          >
                            {showWeightInput ? (
                              /* ── Ruler picker mode ── */
                              <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                                width:'100%',height:'100%',justifyContent:'space-between',gap:'4px'}}
                                onClick={e => e.stopPropagation()}>

                                {/* Weight value display */}
                                <div style={{display:'flex',alignItems:'baseline',gap:'3px',marginTop:'4px'}}>
                                  <span
                                    style={{
                                      fontSize:'38px',fontWeight:'800',color:'white',
                                      letterSpacing:'-1px',display:'inline-block',
                                      transition:'opacity 0.06s ease-out',
                                      opacity: 1,
                                    }}
                                  >
                                    {rulerWeight}
                                  </span>
                                  <span style={{fontSize:'15px',color:'#34d399',fontWeight:'600'}}>kg</span>
                                </div>

                                {/* Ruler */}
                                {(() => {
                                  const PX_PER_KG = 10;
                                  const ticks = [];
                                  for (let w = 30; w <= 200; w += 0.5) {
                                    const isMajor = Number.isInteger(w) && w % 5 === 0;
                                    const isMinor = Number.isInteger(w) && w % 5 !== 0;
                                    ticks.push({ w, isMajor, isMinor });
                                  }
                                  const rulerW = (200 - 30) * PX_PER_KG * 2; // total ruler width
                                  const centerOffset = (rulerWeight - 30) * PX_PER_KG * 2;
                                  return (
                                    <div style={{position:'relative',width:'100%',height:'52px',
                                      overflow:'hidden',cursor:'ew-resize',userSelect:'none'}}
                                      onMouseDown={e => onRulerStart(e.clientX)}
                                      onMouseMove={e => onRulerMove(e.clientX)}
                                      onMouseUp={onRulerEnd}
                                      onMouseLeave={onRulerEnd}
                                      onTouchStart={e => { e.stopPropagation(); onRulerStart(e.touches[0].clientX); }}
                                      onTouchMove={e => { e.stopPropagation(); onRulerMove(e.touches[0].clientX); }}
                                      onTouchEnd={onRulerEnd}
                                    >
                                      {/* Sliding ruler strip */}
                                      <div style={{
                                        position:'absolute',
                                        top:0,
                                        left:`calc(50% - ${centerOffset}px)`,
                                        width:`${rulerW}px`,
                                        height:'44px',
                                        display:'flex',
                                        alignItems:'flex-end',
                                        pointerEvents:'none',
                                      }}>
                                        {ticks.map((t, i) => (
                                          <div key={i} style={{
                                            position:'absolute',
                                            left:`${(t.w - 30) * PX_PER_KG * 2}px`,
                                            bottom:'8px',
                                            width: t.isMajor ? '2px' : '1px',
                                            height: t.isMajor ? '22px' : t.isMinor ? '14px' : '9px',
                                            background: t.isMajor ? 'rgba(52,211,153,0.9)' : 'rgba(255,255,255,0.2)',
                                            transform:'translateX(-50%)',
                                          }} />
                                        ))}
                                        {/* Major tick labels */}
                                        {ticks.filter(t => t.isMajor).map((t, i) => (
                                          <div key={i} style={{
                                            position:'absolute',
                                            left:`${(t.w - 30) * PX_PER_KG * 2}px`,
                                            bottom:'0px',
                                            transform:'translateX(-50%)',
                                            fontSize:'8px',
                                            color:'rgba(52,211,153,0.5)',
                                            fontWeight:'600',
                                            whiteSpace:'nowrap',
                                          }}>
                                            {t.w}
                                          </div>
                                        ))}
                                      </div>
                                      {/* Center indicator ▼ */}
                                      <div style={{
                                        position:'absolute',top:'0',left:'50%',
                                        transform:'translateX(-50%)',
                                        width:0,height:0,
                                        borderLeft:'5px solid transparent',
                                        borderRight:'5px solid transparent',
                                        borderTop:'8px solid #34d399',
                                      }} />
                                    </div>
                                  );
                                })()}

                                {/* Save button */}
                                <button
                                  onClick={addBodyWeight}
                                  style={{background:'#34d399',border:'none',borderRadius:'10px',
                                    padding:'6px 0',width:'100%',color:'#0a2e20',fontWeight:'700',
                                    fontSize:'12px',cursor:'pointer',flexShrink:0}}
                                >
                                  Saxla
                                </button>
                              </div>
                            ) : latestBodyWeight === null ? (
                              /* ── Empty state: big "+" ── */
                              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                                <div style={{
                                  width:'52px',height:'52px',borderRadius:'50%',
                                  border:'2px solid rgba(52,211,153,0.35)',
                                  display:'flex',alignItems:'center',justifyContent:'center',
                                }}>
                                  <span style={{fontSize:'28px',color:'rgba(52,211,153,0.6)',lineHeight:1,marginTop:'-2px'}}>+</span>
                                </div>
                                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',letterSpacing:'0.05em'}}>çəki əlavə et</span>
                              </div>
                            ) : (
                              /* ── Has data: minimal weight display ── */
                              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                                <div style={{display:'flex',alignItems:'baseline',gap:'4px'}}>
                                  <span style={{fontSize:'48px',fontWeight:'800',color:'white',lineHeight:1,letterSpacing:'-1px'}}>
                                    {latestBodyWeight}
                                  </span>
                                  <span style={{fontSize:'18px',color:'rgba(52,211,153,0.7)',fontWeight:'600'}}>kg</span>
                                </div>
                                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',letterSpacing:'0.05em'}}>bədən çəkisi</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </section>
                );
              })()}

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
                    <div className="grid grid-cols-[2fr_1fr_1fr] px-4 py-2 border-b border-zinc-800 text-zinc-500 text-xs font-medium uppercase">
                      <span>Exercise</span>
                      <span className="text-center">Best Weight</span>
                      <span className="text-right">Date</span>
                    </div>
                    {personalRecords.map((item, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-[2fr_1fr_1fr] px-4 py-3 items-center ${index !== personalRecords.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                          {index === 1 && <Trophy className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
                          {index === 2 && <Trophy className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
                          {index > 2 && <div className="w-3.5" />}
                          <span className="text-white text-sm capitalize truncate">
                            {item.exerciseName}
                          </span>
                        </div>
                        <span className="text-green-400 font-bold text-sm text-center">{item.weight}</span>
                        <span className="text-zinc-500 text-xs text-right">{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Weekly Steps */}
              <section>
                <h2 className="font-heading text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-green-400" /> Həftəlik Addımlar
                </h2>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                  {weeklySteps.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">Addım məlumatı yoxdur. Apple Health icazəsi lazımdır.</p>
                  ) : (() => {
                    const maxSteps = Math.max(...weeklySteps.map(d => d.steps), 1);
                    const totalSteps = weeklySteps.reduce((s, d) => s + d.steps, 0);
                    const avgSteps = Math.round(totalSteps / weeklySteps.length);
                    const todayStr = new Date().toISOString().split('T')[0];
                    const DAY_GOAL = 10000;
                    return (
                      <>
                        <div className="flex items-end justify-between gap-2 mb-3">
                          {weeklySteps.map((d, i) => {
                            const isToday = d.date === todayStr;
                            const barH = Math.max(4, (d.steps / maxSteps) * 80);
                            const goalPct = Math.min(100, (d.steps / DAY_GOAL) * 100);
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                {d.steps > 0 && (
                                  <span className="text-[10px] text-zinc-500">
                                    {d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps}
                                  </span>
                                )}
                                <div className="w-full flex items-end" style={{ height: '80px' }}>
                                  <div
                                    className={`w-full rounded-t-md transition-all ${
                                      isToday ? 'bg-green-400' : goalPct >= 100 ? 'bg-green-600' : 'bg-green-800/60'
                                    }`}
                                    style={{ height: `${barH}px` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mb-4">
                          {weeklySteps.map((d, i) => {
                            const isToday = d.date === todayStr;
                            const dayName = new Date(d.date).toLocaleDateString('az', { weekday: 'short' });
                            return (
                              <div key={i} className="flex-1 text-center">
                                <span className={`text-xs font-medium ${isToday ? 'text-green-400' : 'text-zinc-600'}`}>
                                  {dayName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500 mb-0.5">Həftəlik cəm</p>
                            <p className="text-lg font-bold text-white">{totalSteps.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-0.5">Günlük ortalama</p>
                            <p className="text-lg font-bold text-white">{avgSteps.toLocaleString()}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </section>

              {/* Weight Trend */}
              <section>
                  <h2 className="font-heading text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-cyan-400" /> Çəki Trendi
                  </h2>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                  {bodyWeightHistory.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">Hələ çəki məlumatı yoxdur. Yuxarıdakı widget ilə əlavə et.</p>
                  ) : (
                    <>{(() => {
                      const last12 = bodyWeightHistory.slice(-12);
                      const minW = Math.min(...last12.map(d => d.weight));
                      const maxW = Math.max(...last12.map(d => d.weight));
                      const range = maxW - minW || 0.1;
                      const latest = last12[last12.length - 1];
                      const first = last12[0];
                      const diff = (latest.weight - first.weight).toFixed(1);
                      const BAR_MAX_H = 60;
                      return (
                        <>
                          <div className="flex items-end gap-1 mb-3">
                            {last12.map((d, i) => {
                              const barH = Math.max(6, ((d.weight - minW) / range) * (BAR_MAX_H - 6) + 6);
                              const isLatest = i === last12.length - 1;
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  {isLatest && (
                                    <span className="text-[9px] text-cyan-400 font-bold">{d.weight}</span>
                                  )}
                                  <div className="w-full flex items-end" style={{ height: `${BAR_MAX_H}px` }}>
                                    <div
                                      className={`w-full rounded-t-sm ${isLatest ? 'bg-cyan-400' : 'bg-cyan-800/60'}`}
                                      style={{ height: `${barH}px` }}
                                    />
                                  </div>
                                  {isLatest && (
                                    <span className="text-[9px] text-zinc-600">
                                      {new Date(d.date).toLocaleDateString('az', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                            <span className="text-2xl font-bold text-white">{latest.weight} kg</span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                              +diff < 0 ? 'bg-green-500/15 text-green-400'
                              : +diff > 0 ? 'bg-red-500/15 text-red-400'
                              : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {+diff > 0 ? '+' : ''}{diff} kg
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-1">
                            {last12.length} ölçüm · son {last12.length > 1
                              ? Math.round((new Date(latest.date) - new Date(first.date)) / 86400000) + ' gün'
                              : 'ölçüm'}
                          </p>
                        </>
                      );
                    })()}</>
                  )}
                  </div>
                </section>

              {/* Apple Watch Workouts */}
              <section>
                  <h2 className="font-heading text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                    <Watch className="w-5 h-5 text-zinc-300" /> Apple Watch Workoutları
                  </h2>
                  {watchWorkouts.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
                      <Watch className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-400 text-sm">Apple Watch workout məlumatı yoxdur.</p>
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {watchWorkouts.slice(0, 5).map((w, i) => (
                      <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">⌚</div>
                          <div>
                            <p className="text-white font-medium">{w.type}</p>
                            <p className="text-zinc-500 text-sm">
                              {new Date(w.startDate).toLocaleDateString('az', { month: 'short', day: 'numeric' })} · {w.duration} dəq
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {w.calories && <p className="text-orange-400 text-sm font-medium">{w.calories} kal</p>}
                          {w.distance && <p className="text-zinc-500 text-xs">{w.distance} km</p>}
                        </div>
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
      <BottomNav />
    </div>
  );
};

export default ProgressPage;
