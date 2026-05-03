import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, X, Eye, EyeOff } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

// ─── Settings helpers ───────────────────────────────────────────────────────
const SETTINGS_KEY = 'fitstart_settings';
const getSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
};
const saveSettings = (patch) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...getSettings(), ...patch }));
};

// ─── Constants ───────────────────────────────────────────────────────────────
const DAY_LABELS = ['Bazar', 'Baz.ert.', 'Çərş.a.', 'Çərşənbə', 'Cümə.a.', 'Cümə', 'Şənbə'];

const FAQ = [
  {
    q: 'Məşq planımı necə dəyişim?',
    a: 'Proqramlarım səhifəsindən aktiv planını aç, AI koç düyməsini istifadə edərək istənilən məşqi dəyişə bilərsən.',
  },
  {
    q: 'Proqressimi necə izlədim?',
    a: 'Alt naviqasiyadan "Proqres" bölməsinə keç. Orada addım sayı, yandırılan kalori, ürək ritmi və tamamlanan məşqlər görünür.',
  },
  {
    q: 'AI koçdan necə istifadə edirəm?',
    a: 'DashboardPage-dən "AI Koç" düyməsini tap. Qida, məşq, ya bərpa haqqında istənilən sualı yaz — AI sənə fərdi cavab verəcək.',
  },
  {
    q: 'Hesabımı necə silə bilərəm?',
    a: 'Hesabını silmək üçün bizimlə əlaqə saxla: support@fitstart.app. Məlumatların 7 iş günü ərzində silinəcək.',
  },
];

// ─── Reusable sheet wrapper ──────────────────────────────────────────────────
const Sheet = ({ onClose, title, children }) => (
  <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 100, WebkitTapHighlightColor: 'transparent',
      }}
    />
    {/* Panel */}
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
      background: '#18181b', borderRadius: '20px 20px 0 0',
      padding: '0 0 calc(env(safe-area-inset-bottom) + 24px)',
      maxHeight: '85vh', overflowY: 'auto',
    }}>
      {/* Handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#3f3f46' }} />
      </div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 18, color: '#fafafa', textTransform: 'uppercase' }}>
          {title}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: '0 20px' }}>{children}</div>
    </div>
  </>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
      background: value ? '#22c55e' : '#3f3f46',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      WebkitTapHighlightColor: 'transparent',
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: value ? 23 : 3,
      width: 22, height: 22, borderRadius: '50%', background: '#fff',
      transition: 'left 0.2s',
    }} />
  </button>
);

// ─── Input style ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', background: '#27272a', border: '1px solid #3f3f46',
  borderRadius: 12, color: '#fafafa', fontSize: 15, padding: '13px 14px',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

// ─── Primary button ───────────────────────────────────────────────────────────
const PrimaryBtn = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '100%', padding: '15px 0', borderRadius: 9999,
      background: disabled ? '#166534' : '#22c55e',
      border: 'none', color: disabled ? '#4ade80' : '#000',
      fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15,
      cursor: disabled ? 'default' : 'pointer', letterSpacing: '0.03em',
      transition: 'background 0.2s',
    }}
  >
    {children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════════
const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Sheet state
  const [activeSheet, setActiveSheet] = useState(null); // null | string

  // ── Settings state (from localStorage) ──────────────────────────────────
  const [settings, setSettings] = useState(getSettings);

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  // ── Edit Profile ──────────────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Change Password ───────────────────────────────────────────────────────
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  // ── Workout Reminders ────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  // ── Rest Days ─────────────────────────────────────────────────────────────
  const [restDays, setRestDays] = useState([]);

  // ── Help FAQ ──────────────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState(null);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const [feedbackText, setFeedbackText] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    try { setUser(JSON.parse(stored)); } catch { navigate('/login'); }
  }, [navigate]);

  // Sync sheet-local state when a sheet opens
  useEffect(() => {
    if (activeSheet === 'editProfile' && user) {
      setEditName(user.name || '');
      setEditSuccess(false);
      setEditError('');
    }
    if (activeSheet === 'changePassword') {
      setNewPass(''); setConfirmPass('');
      setPassSuccess(false); setPassError('');
    }
    if (activeSheet === 'workoutReminders') {
      setReminderEnabled(settings.reminderEnabled ?? false);
      setReminderTime(settings.reminderTime ?? '09:00');
    }
    if (activeSheet === 'restDays') {
      setRestDays(settings.restDays ?? [0, 6]);
    }
    if (activeSheet === 'feedback') {
      setFeedbackText('');
    }
    if (activeSheet === 'help') {
      setOpenFaq(null);
    }
  }, [activeSheet]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeSheet = () => setActiveSheet(null);

  // ─────────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editName.trim()) { setEditError('Ad boş ola bilməz.'); return; }
    setEditLoading(true); setEditError('');
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: editName.trim() } });
      if (error) throw error;
      const updated = { ...user, name: editName.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setEditSuccess(true);
      setTimeout(closeSheet, 1200);
    } catch (e) {
      setEditError(e.message || 'Xəta baş verdi.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPass.length < 6) { setPassError('Şifrə ən az 6 simvol olmalıdır.'); return; }
    if (newPass !== confirmPass) { setPassError('Şifrələr üst-üstə düşmür.'); return; }
    setPassLoading(true); setPassError('');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setPassSuccess(true);
      setTimeout(closeSheet, 1400);
    } catch (e) {
      setPassError(e.message || 'Xəta baş verdi.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSaveReminders = () => {
    updateSettings({ reminderEnabled, reminderTime });
    closeSheet();
  };

  const handleSelectUnit = (unit) => {
    updateSettings({ units: unit });
    closeSheet();
  };

  const toggleRestDay = (idx) => {
    setRestDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  };

  const handleSaveRestDays = () => {
    updateSettings({ restDays });
    closeSheet();
  };

  const handleSendFeedback = () => {
    if (feedbackText.trim().length < 3) return;
    window.open(`mailto:feedback@fitstart.app?subject=FitStart%20R%C9%99y&body=${encodeURIComponent(feedbackText.trim())}`);
    closeSheet();
  };

  // ─── Row subtitles ────────────────────────────────────────────────────────
  const reminderSubtitle = settings.reminderEnabled ? settings.reminderTime ?? '09:00' : null;
  const unitsSubtitle = settings.units === 'imperial' ? 'lbs' : 'kg';
  const restDaysCount = (settings.restDays ?? [0, 6]).length;
  const restDaysSubtitle = `${restDaysCount} istirahət günü`;

  // ─── Sections config ──────────────────────────────────────────────────────
  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Edit profile', key: 'editProfile' },
        { label: 'Change password', key: 'changePassword' },
        { label: 'Notifications', key: 'notifications', isToggle: true },
      ],
    },
    {
      title: 'Training',
      items: [
        { label: 'Workout reminders', key: 'workoutReminders', subtitle: reminderSubtitle },
        { label: 'Units & measurements', key: 'units', subtitle: unitsSubtitle },
        { label: 'Rest day preferences', key: 'restDays', subtitle: restDaysSubtitle },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help center', key: 'help' },
        { label: 'Contact us', key: 'contactUs', direct: true },
        { label: 'Send feedback', key: 'feedback' },
      ],
    },
  ];

  const handleRowClick = (item) => {
    if (item.isToggle) return; // handled by toggle itself
    if (item.direct) {
      if (item.key === 'contactUs') window.open('mailto:support@fitstart.app');
      return;
    }
    setActiveSheet(item.key);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fafafa' }}>
      {/* Navbar */}
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 14 }}
          >
            <ArrowLeft size={18} /> Geri
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px 120px' }}>

        {/* Avatar + name + email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            border: '2px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 26, color: '#22c55e',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
              {user.name}
            </div>
            <div style={{ color: '#71717a', fontSize: 13, marginTop: 2 }}>
              {user.email}
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 20 }}>
            <div style={{
              color: '#71717a', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0 6px 8px',
            }}>
              {title}
            </div>
            <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, overflow: 'hidden' }}>
              {items.map((item, i) => (
                <div
                  key={item.key}
                  onClick={() => handleRowClick(item)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '15px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #27272a' : 'none',
                    cursor: item.isToggle ? 'default' : 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#fafafa' }}>{item.label}</span>

                  {item.isToggle ? (
                    <ToggleSwitch
                      value={settings.notificationsEnabled ?? true}
                      onChange={(val) => updateSettings({ notificationsEnabled: val })}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.subtitle && (
                        <span style={{ fontSize: 12, color: '#71717a' }}>{item.subtitle}</span>
                      )}
                      <ChevronRight size={16} color="#52525b" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Log out */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', marginTop: 8, padding: '15px 0',
            background: 'transparent', border: '1px solid #3f3f46',
            borderRadius: 9999, color: '#ef4444',
            fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', letterSpacing: '0.03em',
          }}
        >
          Log out
        </button>
      </main>

      <BottomNav />

      {/* ── Bottom Sheets ──────────────────────────────────────────────────── */}

      {/* 1. Edit Profile */}
      {activeSheet === 'editProfile' && (
        <Sheet onClose={closeSheet} title="Profili Düzəlt">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: '#71717a', marginBottom: 2 }}>Ad Soyad</label>
            <input
              style={inputStyle}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Adınızı daxil edin"
              autoFocus
            />
            {editError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{editError}</p>}
            {editSuccess && <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>Saxlanıldı ✓</p>}
            <div style={{ marginTop: 8 }}>
              <PrimaryBtn onClick={handleSaveProfile} disabled={editLoading}>
                {editLoading ? 'Saxlanılır...' : 'Saxla'}
              </PrimaryBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* 2. Change Password */}
      {activeSheet === 'changePassword' && (
        <Sheet onClose={closeSheet} title="Şifrə Dəyiş">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: '#71717a' }}>Yeni şifrə</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Ən az 6 simvol"
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 0 }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>Şifrəni təsdiqlə</label>
            <input
              style={inputStyle}
              type={showPass ? 'text' : 'password'}
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Şifrəni təkrar daxil edin"
            />

            {passError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{passError}</p>}
            {passSuccess && <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>Şifrə dəyişdirildi ✓</p>}

            <div style={{ marginTop: 8 }}>
              <PrimaryBtn onClick={handleChangePassword} disabled={passLoading}>
                {passLoading ? 'Saxlanılır...' : 'Şifrəni Dəyiş'}
              </PrimaryBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* 3. Workout Reminders */}
      {activeSheet === 'workoutReminders' && (
        <Sheet onClose={closeSheet} title="Məşq Xatırlatması">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Enable toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#27272a', borderRadius: 12, padding: '14px 16px' }}>
              <div>
                <div style={{ fontSize: 14, color: '#fafafa' }}>Xatırlatmanı aktiv et</div>
                <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Gündəlik məşq bildirişi</div>
              </div>
              <ToggleSwitch value={reminderEnabled} onChange={setReminderEnabled} />
            </div>

            {/* Time picker */}
            <div style={{ opacity: reminderEnabled ? 1 : 0.4, transition: 'opacity 0.2s' }}>
              <label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 8 }}>Vaxt seç</label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                disabled={!reminderEnabled}
                style={{
                  ...inputStyle,
                  colorScheme: 'dark',
                }}
              />
            </div>

            <PrimaryBtn onClick={handleSaveReminders}>Saxla</PrimaryBtn>
          </div>
        </Sheet>
      )}

      {/* 4. Units & Measurements */}
      {activeSheet === 'units' && (
        <Sheet onClose={closeSheet} title="Ölçü Vahidləri">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'metric', label: 'Metrik', desc: 'kg · km · kcal' },
              { key: 'imperial', label: 'İmperial', desc: 'lbs · mil · kcal' },
            ].map(u => {
              const selected = (settings.units ?? 'metric') === u.key;
              return (
                <button
                  key={u.key}
                  onClick={() => handleSelectUnit(u.key)}
                  style={{
                    width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                    background: selected ? 'rgba(34,197,94,0.1)' : '#27272a',
                    border: `1.5px solid ${selected ? '#22c55e' : '#3f3f46'}`,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 16, color: selected ? '#22c55e' : '#fafafa', textTransform: 'uppercase' }}>
                    {u.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>{u.desc}</div>
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {/* 5. Rest Day Preferences */}
      {activeSheet === 'restDays' && (
        <Sheet onClose={closeSheet} title="İstirahət Günləri">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Hansı günlər istirahət günündür?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {DAY_LABELS.map((label, idx) => {
                const selected = restDays.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleRestDay(idx)}
                    style={{
                      padding: '10px 4px', borderRadius: 10, fontSize: 12,
                      fontFamily: 'inherit', cursor: 'pointer',
                      background: selected ? 'rgba(34,197,94,0.15)' : '#27272a',
                      border: `1.5px solid ${selected ? '#22c55e' : '#3f3f46'}`,
                      color: selected ? '#22c55e' : '#a1a1aa',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 4 }}>
              <PrimaryBtn onClick={handleSaveRestDays}>
                {restDays.length} günü saxla
              </PrimaryBtn>
            </div>
          </div>
        </Sheet>
      )}

      {/* 6. Help Center */}
      {activeSheet === 'help' && (
        <Sheet onClose={closeSheet} title="Yardım Mərkəzi">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
            {FAQ.map((item, i) => (
              <div
                key={i}
                style={{ background: '#27272a', borderRadius: 12, overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', background: 'none', border: 'none',
                    color: '#fafafa', cursor: 'pointer', textAlign: 'left',
                    fontSize: 14, fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ flex: 1, marginRight: 12 }}>{item.q}</span>
                  <ChevronRight
                    size={16}
                    color="#52525b"
                    style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Sheet>
      )}

      {/* 7. Send Feedback */}
      {activeSheet === 'feedback' && (
        <Sheet onClose={closeSheet} title="Rəy Göndər">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: '#71717a' }}>Fikirlərinizi bizimlə bölüşün</label>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Tətbiq haqqında fikirlərinizi yazın..."
              rows={5}
              style={{
                ...inputStyle,
                resize: 'none', lineHeight: 1.6,
              }}
            />
            <div style={{ marginTop: 4 }}>
              <PrimaryBtn onClick={handleSendFeedback} disabled={feedbackText.trim().length < 3}>
                Göndər
              </PrimaryBtn>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};

export default ProfilePage;
