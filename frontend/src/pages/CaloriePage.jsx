import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Flame, Plus, Trash2, X, ChevronLeft, Bot } from 'lucide-react';
import { supabase, getStoredUser } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import DashboardNav from '../components/DashboardNav';

const CALORIE_GOAL = 2000;

// ── helpers ────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split('T')[0];

const macroBar = (value, max, color) => {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};

// ── component ───────────────────────────────────────────────────────────────
export default function CaloriePage() {
  const navigate = useNavigate();
  // user must be stable — getStoredUser() returns new object each call
  // which would break useCallback deps and cause infinite re-render loop
  const [user] = useState(() => getStoredUser());

  const [logs, setLogs] = useState([]);           // today's food_logs rows
  const [weekData, setWeekData] = useState([]);    // 7-day totals
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // modal state
  const [mode, setMode] = useState(null);          // 'text' | 'photo'
  const [textInput, setTextInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [saving, setSaving] = useState(false);

  // ── load data ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const today = todayISO();
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const [{ data: todayLogs }, { data: weekLogs }] = await Promise.all([
      supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date', today).order('created_at'),
      supabase.from('food_logs').select('date, calories').eq('user_id', user.id).gte('date', weekAgoStr),
    ]);

    setLogs(todayLogs || []);

    // Aggregate week totals
    const days = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      days[d.toISOString().split('T')[0]] = 0;
    }
    for (const r of (weekLogs || [])) {
      if (r.date in days) days[r.date] += r.calories;
    }
    setWeekData(Object.entries(days).map(([date, calories]) => ({ date, calories })));
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  // loadData is stable because it depends on user?.id (primitive)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadData]);

  // ── derived totals ──────────────────────────────────────────────────────
  const totalCal  = logs.reduce((s, r) => s + r.calories, 0);
  const totalProt = logs.reduce((s, r) => s + r.protein, 0);
  const totalCarb = logs.reduce((s, r) => s + r.carbs, 0);
  const totalFat  = logs.reduce((s, r) => s + r.fat, 0);
  const ringPct   = Math.min(1, totalCal / CALORIE_GOAL);
  const circumf   = 2 * Math.PI * 54; // r=54
  const dash      = ringPct * circumf;

  // ── scan via AI ─────────────────────────────────────────────────────────
  const callCalorieScan = async (body) => {
    const { data, error } = await supabase.functions.invoke('calorie-scan', { body });
    if (error) throw new Error(error.message || 'Xəta baş verdi');
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleTextScan = async () => {
    if (!textInput.trim()) return;
    setScanning(true); setScanError(''); setScanResult(null);
    try {
      const result = await callCalorieScan({ text: textInput.trim() });
      setScanResult(result);
    } catch (e) {
      setScanError(e.message);
    } finally {
      setScanning(false);
    }
  };

  const handlePhotoScan = async () => {
    setScanning(true); setScanError(''); setScanResult(null);
    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        allowEditing: false,
      });
      const result = await callCalorieScan({
        image: photo.base64String,
        mimeType: `image/${photo.format || 'jpeg'}`,
      });
      setScanResult(result);
      setMode('photo_result');
    } catch (e) {
      if (!String(e).includes('cancelled') && !String(e).includes('dismissed')) {
        setScanError(e.message || 'Kamera xətası');
      }
    } finally {
      setScanning(false);
    }
  };

  // ── add to log ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!scanResult || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('food_logs').insert({
        user_id: user.id,
        date: todayISO(),
        name: scanResult.name,
        calories: scanResult.calories || 0,
        protein: scanResult.protein || 0,
        carbs: scanResult.carbs || 0,
        fat: scanResult.fat || 0,
      });
      if (error) throw error;
      closeModal();
      loadData();
    } catch (e) {
      setScanError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── delete log entry ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await supabase.from('food_logs').delete().eq('id', id);
    setLogs(prev => prev.filter(r => r.id !== id));
    // Update weekData totals inline
    const deleted = logs.find(r => r.id === id);
    if (deleted) {
      const today = todayISO();
      setWeekData(prev => prev.map(d => d.date === today ? { ...d, calories: d.calories - deleted.calories } : d));
    }
  };

  // ── modal helpers ───────────────────────────────────────────────────────
  const openModal = () => {
    setShowModal(true); setMode(null);
    setTextInput(''); setScanResult(null); setScanError(''); setScanning(false);
  };
  const closeModal = () => {
    setShowModal(false); setMode(null);
    setTextInput(''); setScanResult(null); setScanError('');
  };

  // ── today label ─────────────────────────────────────────────────────────
  const todayLabel = new Date().toLocaleDateString('az', { weekday: 'long', day: 'numeric', month: 'long' });

  // ── weekly chart ────────────────────────────────────────────────────────
  const maxWeekCal = Math.max(...weekData.map(d => d.calories), 1);

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', paddingBottom: '90px' }}>

      <DashboardNav
        user={user}
        onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}
        activePage="nutrition"
      />

      <div style={{ padding: '112px 20px 0' }}>

        {/* Page title + AI button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{todayLabel}</p>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Qida İzləyici</h1>
          </div>
          <button
            onClick={() => navigate('/nutrition')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '8px 14px',
              color: '#4ade80', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <Bot size={14} /> AI Məsləhət
          </button>
        </div>

        {/* ── Calorie Ring ─────────────────────────────────────────── */}
        <div style={{ background: '#1a1a1a', borderRadius: '20px', padding: '20px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* SVG Ring */}
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
              <circle cx="65" cy="65" r="54" fill="none"
                stroke={totalCal >= CALORIE_GOAL ? '#f97316' : '#22c55e'}
                strokeWidth="10"
                strokeDasharray={`${dash} ${circumf}`}
                strokeLinecap="round"
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>{totalCal}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>/ {CALORIE_GOAL} kcal</span>
            </div>
          </div>

          {/* Macros */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Protein', value: totalProt, unit: 'q', max: 150, color: '#3b82f6' },
              { label: 'Karbohidrat', value: totalCarb, unit: 'q', max: 250, color: '#f59e0b' },
              { label: 'Yağ', value: totalFat, unit: 'q', max: 65, color: '#ec4899' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: m.color }}>{m.value}{m.unit}</span>
                </div>
                {macroBar(m.value, m.max, m.color)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Add Button ───────────────────────────────────────────── */}
        <button
          onClick={openModal}
          style={{ width: '100%', padding: '14px', background: '#22c55e', borderRadius: '14px',
            border: 'none', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <Plus size={18} strokeWidth={2.5} /> Yemək Əlavə Et
        </button>

        {/* ── Today's Log ──────────────────────────────────────────── */}
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Bugünkü qidalar</h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '24px 0' }}>Yüklənir...</p>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Flame size={32} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Hələ heç nə əlavə edilməyib</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {logs.map(row => (
              <div key={row.id} style={{ background: '#1a1a1a', borderRadius: '12px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    P {row.protein}q · K {row.carbs}q · Y {row.fat}q
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#f97316' }}>{row.calories}</span>
                  <button onClick={() => handleDelete(row.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)',
                      padding: '4px', display: 'flex' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 7-Day History ────────────────────────────────────────── */}
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Həftəlik kaloriya</h2>
        <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
            {weekData.map((d, i) => {
              const todayStr = todayISO();
              const isToday = d.date === todayStr;
              const barH = Math.max(4, (d.calories / maxWeekCal) * 72);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {d.calories > 0 && (
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                      {d.calories >= 1000 ? `${(d.calories / 1000).toFixed(1)}k` : d.calories}
                    </span>
                  )}
                  <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '72px' }}>
                    <div style={{ width: '100%', height: `${barH}px`, borderRadius: '4px 4px 0 0',
                      background: isToday ? '#f97316' : d.calories >= CALORIE_GOAL ? '#ea580c' : '#7c2d12',
                      opacity: d.calories > 0 ? (isToday ? 1 : 0.7) : 0.2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weekData.map((d, i) => {
              const isToday = d.date === todayISO();
              const dayName = new Date(d.date + 'T12:00:00').toLocaleDateString('az', { weekday: 'narrow' });
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 500,
                    color: isToday ? '#f97316' : 'rgba(255,255,255,0.3)' }}>{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Add Food Modal (bottom sheet) ────────────────────────── */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end' }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: '#1a1a1a', borderRadius: '24px 24px 0 0',
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom))', maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                {mode === 'text' ? 'Yemək adını yaz' : mode === 'photo_result' ? 'Nəticə' : 'Yemək əlavə et'}
              </h3>
              <button onClick={closeModal}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white' }}>
                <X size={16} />
              </button>
            </div>

            {/* Mode selection */}
            {!mode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => { setMode('photo'); handlePhotoScan(); }}
                  style={{ padding: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '14px', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📷</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '2px' }}>Şəkil çək</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>AI şəkli analiz edib kaloriyanı hesablayır</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode('text')}
                  style={{ padding: '16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '14px', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✏️</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ marginBottom: '2px' }}>Yazı ilə daxil et</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Yemək adını yazın, AI kaloriyanı hesablayır</p>
                  </div>
                </button>
              </div>
            )}

            {/* Scanning spinner (photo) */}
            {(mode === 'photo' || scanning) && !scanResult && !scanError && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)',
                  borderTop: '3px solid #22c55e', borderRadius: '50%', margin: '0 auto 12px',
                  animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>AI analiz edir...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Text input mode */}
            {mode === 'text' && !scanResult && (
              <div>
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTextScan()}
                  placeholder="məs. 2 yumurta, 200ml süd, toyuq döşü..."
                  autoFocus
                  style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'white',
                    fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />
                <button
                  onClick={handleTextScan}
                  disabled={scanning || !textInput.trim()}
                  style={{ width: '100%', padding: '14px', background: scanning || !textInput.trim() ? 'rgba(34,197,94,0.4)' : '#22c55e',
                    borderRadius: '12px', border: 'none', color: 'white', fontSize: '15px', fontWeight: 700,
                    cursor: scanning || !textInput.trim() ? 'default' : 'pointer' }}>
                  {scanning ? 'Hesablanır...' : 'Kaloriyanı hesabla'}
                </button>
              </div>
            )}

            {/* Error state */}
            {scanError && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{scanError}</p>
                <button onClick={() => { setScanError(''); setMode(null); }}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                  Yenidən cəhd et
                </button>
              </div>
            )}

            {/* Scan result */}
            {scanResult && !scanError && (
              <div>
                <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{scanResult.name}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{scanResult.calories}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>kcal</p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {[
                        { label: 'P', value: scanResult.protein, color: '#3b82f6' },
                        { label: 'K', value: scanResult.carbs, color: '#f59e0b' },
                        { label: 'Y', value: scanResult.fat, color: '#ec4899' },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}q</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setScanResult(null); setMode(null); setTextInput(''); }}
                    style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
                    Ləğv et
                  </button>
                  <button onClick={handleAdd} disabled={saving}
                    style={{ flex: 2, padding: '13px', background: saving ? 'rgba(34,197,94,0.5)' : '#22c55e',
                      borderRadius: '12px', border: 'none', color: 'white', fontSize: '15px',
                      fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
                    {saving ? 'Əlavə edilir...' : 'Logə əlavə et'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
