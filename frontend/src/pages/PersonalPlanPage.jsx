import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { supabase, getStoredUser } from '../lib/supabase';

const DAY_NAMES = ['Bazar ertəsi','Çərşənbə axşamı','Çərşənbə','Cümə axşamı','Cümə','Şənbə','Bazar'];

const emptyExercise = () => ({ name: '', sets: '3', reps: '10', weight: '' });
const emptyDay = (i) => ({ title: `Məşq ${i + 1}`, exercises: [emptyExercise()] });

/* ── shared styles ── */
const S = {
  page:   { minHeight: '100vh', background: '#0f0f0f', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' },
  nav:    { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  input:  { width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 10, color: 'white', fontSize: 15, padding: '11px 14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  label:  { color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 },
  card:   { background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: '16px' },
  btn:    { border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 50, fontWeight: 700, fontSize: 15, padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconBtn:{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#71717a', display: 'flex', alignItems: 'center' },
};

export default function PersonalPlanPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);  // 1 = info, 2 = exercises
  const [planName, setPlanName] = useState('');
  const [daysCount, setDaysCount] = useState(3);
  const [days, setDays]         = useState(() => Array.from({ length: 3 }, (_, i) => emptyDay(i)));
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  /* ── step 1: update days array when daysCount changes ── */
  const handleDaysCount = (n) => {
    setDaysCount(n);
    setDays(prev => {
      if (n > prev.length) return [...prev, ...Array.from({ length: n - prev.length }, (_, i) => emptyDay(prev.length + i))];
      return prev.slice(0, n);
    });
  };

  /* ── exercise helpers ── */
  const updateExercise = (di, ei, field, value) =>
    setDays(prev => prev.map((d, i) => i !== di ? d : {
      ...d,
      exercises: d.exercises.map((e, j) => j !== ei ? e : { ...e, [field]: value }),
    }));

  const addExercise = (di) =>
    setDays(prev => prev.map((d, i) => i !== di ? d : { ...d, exercises: [...d.exercises, emptyExercise()] }));

  const removeExercise = (di, ei) =>
    setDays(prev => prev.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }));

  const updateDayTitle = (di, value) =>
    setDays(prev => prev.map((d, i) => i !== di ? d : { ...d, title: value }));

  /* ── build plan JSON ── */
  const buildPlan = () => {
    const id = `custom-${Date.now()}`;
    const weekDays = days.map((day, i) => ({
      id: `${id}-d${i + 1}`,
      dayNumber: i + 1,
      dayName: DAY_NAMES[i] || `Gün ${i + 1}`,
      title: day.title || `Məşq ${i + 1}`,
      warmup:      { duration: '5 dəq', exercises: [{ name: 'Dinamik gərginlik' }] },
      mainWorkout: day.exercises.filter(e => e.name.trim()).map(e => ({
        name: e.name.trim(),
        sets: parseInt(e.sets) || 3,
        reps: e.reps || '10',
        weight: e.weight ? `${e.weight} kg` : null,
        rest: '60 san',
        equipment: 'dumbbell',
      })),
      cooldown: { duration: '5 dəq', exercises: [{ name: 'Statik gərginlik' }] },
    }));

    return {
      id,
      name: planName.trim() || 'Şəxsi Planım',
      weeks: [1, 2, 3, 4].map(w => ({
        week: w,
        days: weekDays.map((d, i) => ({ ...d, id: `${id}-w${w}-d${i + 1}` })),
      })),
    };
  };

  /* ── save ── */
  const handleSave = async () => {
    const hasExercises = days.every(d => d.exercises.some(e => e.name.trim()));
    if (!hasExercises) { setError('Hər günə ən azı 1 məşq əlavə et'); return; }

    setSaving(true);
    setError('');
    try {
      const user = getStoredUser();
      if (!user) { navigate('/login'); return; }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        const { error: re } = await supabase.auth.refreshSession();
        if (re) { localStorage.removeItem('user'); navigate('/login'); return; }
      }

      const planJson = buildPlan();
      const name     = planName.trim() || 'Şəxsi Planım';

      const { data: planData, error: planErr } = await supabase
        .from('custom_plans')
        .insert({ user_id: user.id, name, description: `Şəxsi plan — həftədə ${daysCount} gün`, weeks_count: 4, days_per_week: daysCount, plan_data: planJson })
        .select().single();

      if (planErr) throw planErr;

      const programId = `custom-${planData.id}`;

      const { error: purchaseErr } = await supabase
        .from('purchases')
        .insert({ user_id: user.id, program_id: programId, program_name: name, price: 0, status: 'active' });

      if (purchaseErr) throw purchaseErr;

      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Xəta baş verdi. Yenidən cəhd et.');
    } finally {
      setSaving(false);
    }
  };

  /* ──────────────── RENDER ──────────────── */
  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.nav}>
        <button onClick={() => step === 2 ? setStep(1) : navigate('/browse')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ChevronLeft size={20} /> Geri
        </button>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Şəxsi Plan</span>
        <div style={{ width: 60 }} />
      </nav>

      <main style={{ paddingTop: 76, paddingBottom: 40, padding: '76px 20px 40px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? '#22c55e' : '#27272a', transition: 'background 0.2s' }} />
            ))}
          </div>

          {/* ── STEP 1: Plan adı + gün sayı ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Planın məlumatları</h1>
                <p style={{ color: '#71717a', fontSize: 14 }}>Öz planını özün qur</p>
              </div>

              {/* Plan adı */}
              <div>
                <label style={S.label}>Plan adı</label>
                <input
                  style={S.input}
                  placeholder="məs. Mənim Şəxsi Planım"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e  => e.target.style.borderColor = '#27272a'}
                />
              </div>

              {/* Həftədə neçə gün */}
              <div>
                <label style={S.label}>Həftədə neçə gün məşq edirsən?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[2, 3, 4, 5, 6].map(n => (
                    <button key={n} onClick={() => handleDaysCount(n)} style={{
                      flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                      background: daysCount === n ? '#22c55e' : '#18181b',
                      color: daysCount === n ? '#000' : '#a1a1aa',
                      fontWeight: 800, fontSize: 17, cursor: 'pointer',
                      outline: daysCount === n ? 'none' : '1px solid #27272a',
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
                <p style={{ color: '#52525b', fontSize: 12, marginTop: 8 }}>Həftədə {daysCount} gün məşq + {7 - daysCount} gün istirahət</p>
              </div>

              <button onClick={() => setStep(2)} style={{ ...S.btn, background: '#22c55e', color: '#000', marginTop: 8 }}>
                Növbəti →
              </button>
            </div>
          )}

          {/* ── STEP 2: Məşqlər ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Məşqləri daxil et</h1>
                <p style={{ color: '#71717a', fontSize: 14 }}>Hər gün üçün məşqlərini əlavə et</p>
              </div>

              {days.map((day, di) => (
                <div key={di} style={S.card}>
                  {/* Day header */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ ...S.label, marginBottom: 4 }}>Gün {di + 1} — {DAY_NAMES[di] || ''}</label>
                    <input
                      style={{ ...S.input, fontWeight: 600 }}
                      placeholder={`məs. Push Day, Döş günü...`}
                      value={day.title}
                      onChange={e => updateDayTitle(di, e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#22c55e'}
                      onBlur={e  => e.target.style.borderColor = '#27272a'}
                    />
                  </div>

                  {/* Exercise rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Header row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 56px 32px', gap: 5 }}>
                      <span style={{ color: '#52525b', fontSize: 11, paddingLeft: 2 }}>Məşq adı</span>
                      <span style={{ color: '#52525b', fontSize: 11, textAlign: 'center' }}>Dəst</span>
                      <span style={{ color: '#52525b', fontSize: 11, textAlign: 'center' }}>Təkrar</span>
                      <span style={{ color: '#52525b', fontSize: 11, textAlign: 'center' }}>Çəki</span>
                      <span />
                    </div>

                    {day.exercises.map((ex, ei) => (
                      <div key={ei} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 56px 32px', gap: 5, alignItems: 'center' }}>
                        {/* Name */}
                        <input
                          style={{ ...S.input, fontSize: 13, padding: '9px 8px' }}
                          placeholder="Bench Press"
                          value={ex.name}
                          onChange={e => updateExercise(di, ei, 'name', e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#22c55e'}
                          onBlur={e  => e.target.style.borderColor = '#27272a'}
                        />
                        {/* Sets */}
                        <input
                          style={{ ...S.input, fontSize: 14, padding: '9px 4px', textAlign: 'center' }}
                          type="number" min="1" max="20"
                          value={ex.sets}
                          onChange={e => updateExercise(di, ei, 'sets', e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#22c55e'}
                          onBlur={e  => e.target.style.borderColor = '#27272a'}
                        />
                        {/* Reps */}
                        <input
                          style={{ ...S.input, fontSize: 14, padding: '9px 4px', textAlign: 'center' }}
                          placeholder="10"
                          value={ex.reps}
                          onChange={e => updateExercise(di, ei, 'reps', e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#22c55e'}
                          onBlur={e  => e.target.style.borderColor = '#27272a'}
                        />
                        {/* Weight */}
                        <div style={{ position: 'relative' }}>
                          <input
                            style={{ ...S.input, fontSize: 13, padding: '9px 20px 9px 6px', textAlign: 'center' }}
                            type="number" min="0" step="0.5"
                            placeholder="—"
                            value={ex.weight}
                            onChange={e => updateExercise(di, ei, 'weight', e.target.value)}
                            onFocus={e => e.target.style.borderColor = '#22c55e'}
                            onBlur={e  => e.target.style.borderColor = '#27272a'}
                          />
                          <span style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', color: '#52525b', fontSize: 10, pointerEvents: 'none' }}>kg</span>
                        </div>
                        {/* Delete */}
                        <button onClick={() => removeExercise(di, ei)}
                          disabled={day.exercises.length === 1}
                          style={{ ...S.iconBtn, color: day.exercises.length === 1 ? '#3f3f46' : '#71717a' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {/* Add exercise */}
                    <button onClick={() => addExercise(di)} style={{
                      background: 'none', border: '1px dashed #3f3f46', borderRadius: 8,
                      color: '#52525b', padding: '8px', cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontFamily: 'inherit', marginTop: 2,
                    }}>
                      <Plus size={14} /> Məşq əlavə et
                    </button>
                  </div>
                </div>
              ))}

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Save */}
              <button onClick={handleSave} disabled={saving} style={{
                ...S.btn,
                background: saving ? '#27272a' : '#22c55e',
                color: saving ? '#71717a' : '#000',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saxlanılır...</> : '✓  Planı saxla'}
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #52525b; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #18181b inset; -webkit-text-fill-color: white; }
      `}</style>
    </div>
  );
}
