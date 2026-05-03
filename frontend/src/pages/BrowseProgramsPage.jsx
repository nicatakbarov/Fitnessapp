import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, CheckCircle, Loader2, Home, Building2, Star, ArrowRight } from 'lucide-react';
import { supabase, getStoredUser } from '../lib/supabase';

const GYM_PLANS = [
  {
    id: 'starter-2day',
    days: 2,
    name: 'Gym Başlanğıc 2 Gün',
    description: 'Üst/Alt bölgü · 4 həftə · Maşın əsaslı',
    details: [
      'Yeni başlayanlar üçün ideal',
      'Bazar ertəsi üst, cümə alt bədən',
      'Maşın əsaslı — texnika problemsiz',
      '4 həftəlik proqressiv plan',
    ],
    recommended: false,
  },
  {
    id: 'starter',
    days: 3,
    name: 'Gym Starter',
    description: 'Push/Pull/Legs · 4 həftə · Proqressiv yük',
    details: [
      'Yeni başlayanlar arasında ən populyar',
      'Push / Pull / Legs bölgüsü',
      'Həftəlik çəki proqressiyası',
      '4 həftəlik strukturlu proqram',
    ],
    recommended: true,
  },
  {
    id: 'elite-beginner',
    days: 5,
    name: 'Elite Başlanğıc',
    description: 'PPL/Çiyn/Tam · 9 həftə · 3 mərhələ',
    details: [
      '5 günə həsr edə biləcəklər üçün',
      '5 günlük tam bədən bölgüsü',
      '9 həftə 3 mərhələli proqressiya',
      'Ciddi nəticə istəyənlər üçün',
    ],
    recommended: false,
  },
];

const PLAN_TYPES = [
  {
    id: 'home',
    emoji: '🏠',
    title: 'Evdə Məşq',
    duration: '4–8 həftə',
    frequency: '3–5x/həftə',
    level: 'Başlanğıc',
    popular: false,
    features: [
      'Öz avadanlıqların ilə',
      'Bodyweight məşqlər',
      'AI ilə fərdi plan',
      'İstənilən yerdə məşq et',
    ],
    cta: 'Plan Yarat',
  },
  {
    id: 'gym',
    emoji: '🏋️',
    title: 'Zalda Məşq',
    duration: '4–9 həftə',
    frequency: '2–5x/həftə',
    level: 'Hər səviyyə',
    popular: true,
    features: [
      'Barbell, dumbbell, maşınlar',
      'Proqressiv yük artımı',
      'AI ilə fərdi plan',
      'Push / Pull / Legs bölgüsü',
    ],
    cta: 'Plan Yarat',
  },
  {
    id: 'personal',
    emoji: '⭐',
    title: 'Şəxsi Plan',
    duration: 'Öz müddətin',
    frequency: 'Öz cədvəlin',
    level: 'Sənin seçimin',
    popular: false,
    features: [
      'Özün hərəkətləri seç',
      'Öz dəst/təkrar sayın',
      'Tam azadlıq',
      'İstədiyin kimi qur',
    ],
    cta: 'Planı Qur',
  },
];

export default function BrowseProgramsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('types');        // 'types' | 'gym'
  const [selectedId, setSelectedId] = useState('starter');
  const [ownedPrograms, setOwnedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { navigate('/login'); return; }
    setUser(u);
    supabase
      .from('purchases')
      .select('program_id')
      .eq('user_id', u.id)
      .then(({ data }) => setOwnedPrograms((data || []).map(p => p.program_id)));
  }, [navigate]);

  const handleTypeSelect = (typeId) => {
    if (typeId === 'home')     return navigate('/home-setup');
    if (typeId === 'gym')      return navigate('/create-plan', { state: { planType: 'gym'  } });
    if (typeId === 'personal') return navigate('/personal-plan');
  };

  const handleEnroll = async () => {
    const plan = GYM_PLANS.find(p => p.id === selectedId);
    if (!plan || !user) return;

    if (ownedPrograms.includes(plan.id)) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setEnrollError('');
    try {
      // Ensure Supabase session is active
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        // Try refresh
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
      }

      const { error } = await supabase.from('purchases').insert({
        user_id: user.id,
        program_id: plan.id,
        program_name: plan.name,
        price: 0,
        status: 'active',
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      console.error('Enroll error:', err);
      const msg = err?.message || err?.details || 'Xəta baş verdi';
      setEnrollError(msg.includes('row-level') || msg.includes('auth')
        ? 'Sessiya bitib. Yenidən daxil olun.'
        : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const selectedPlan = GYM_PLANS.find(p => p.id === selectedId);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Dumbbell size={26} color="#22c55e" />
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>FitStart</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717a' }}>
            <User size={16} />
            <span style={{ fontSize: 13 }}>{user.name}</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 6 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main style={{ paddingTop: 76, paddingBottom: 40, padding: '76px 20px 40px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* ── Plan növü seçimi ── */}
          {view === 'types' && (
            <>
              {/* Header */}
              <div style={{ padding: '8px 4px 24px' }}>
                <div style={{ color: '#71717a', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Yolunu seç
                </div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', color: 'white', lineHeight: 1.05 }}>
                  Plan Növü
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {PLAN_TYPES.map(type => (
                  <div
                    key={type.id}
                    style={{
                      background: '#18181b',
                      border: type.popular ? '1px solid #22c55e' : '1px solid #27272a',
                      borderRadius: 24,
                      padding: 20,
                      boxShadow: type.popular ? '0 0 30px -10px rgba(34,197,94,0.30)' : 'none',
                    }}
                  >
                    {/* Popular badge */}
                    {type.popular && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#16a34a', borderRadius: 9999,
                        padding: '5px 10px', marginBottom: 14,
                      }}>
                        <Star size={10} color="#fff" fill="#fff" />
                        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>ƏN POPULYAR</span>
                      </div>
                    )}

                    {/* Title */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{
                        fontFamily: 'Oswald, sans-serif', fontWeight: 700,
                        fontSize: 20, textTransform: 'uppercase', color: 'white', lineHeight: 1.1,
                      }}>
                        {type.title}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                      {[['Müddət', type.duration], ['Tezlik', type.frequency], ['Səviyyə', type.level]].map(([k, v]) => (
                        <div key={k} style={{ flex: 1 }}>
                          <div style={{ color: '#71717a', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                          <div style={{ color: '#d4d4d8', fontSize: 11, fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div style={{ marginBottom: 16 }}>
                      {type.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: '#a1a1aa', fontSize: 13 }}>
                          <CheckCircle size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>

                    {/* CTA button */}
                    <button
                      onClick={() => handleTypeSelect(type.id)}
                      style={{
                        width: '100%', height: 50, borderRadius: 9999, border: 0,
                        cursor: 'pointer', fontWeight: 700, fontSize: 14,
                        fontFamily: 'inherit',
                        background: type.popular ? '#16a34a' : '#27272a',
                        color: '#fff',
                        boxShadow: type.popular ? '0 8px 16px rgba(20,83,45,0.30)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s',
                      }}
                    >
                      {type.cta} <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Gym plan tezlik seçimi ── */}
          {view === 'gym' && (
            <>
              <button
                onClick={() => setView('types')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#71717a', fontSize: 13, marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                }}
              >
                ← Geri
              </button>

              <div style={{ marginBottom: 22 }}>
                <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 5 }}>
                  🏋️ Zalda Məşq
                </h1>
                <p style={{ color: '#71717a', fontSize: 13 }}>
                  Həftədə neçə gün məşq edə bilərsən?
                </p>
              </div>

              {/* Tezlik kartları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {GYM_PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedId(plan.id)}
                    style={{
                      width: '100%',
                      background: selectedId === plan.id ? 'rgba(34,197,94,0.08)' : 'rgba(39,39,42,0.6)',
                      border: `2px solid ${selectedId === plan.id ? '#22c55e' : '#27272a'}`,
                      borderRadius: 14,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                        <span style={{
                          color: selectedId === plan.id ? '#22c55e' : 'white',
                          fontWeight: 800, fontSize: 22,
                        }}>
                          {plan.days}x
                        </span>
                        <span style={{
                          color: selectedId === plan.id ? '#22c55e' : '#a1a1aa',
                          fontSize: 13, fontWeight: 500,
                        }}>
                          həftədə
                        </span>
                        {plan.recommended && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                            border: '1px solid rgba(34,197,94,0.3)',
                          }}>
                            Tövsiyə edilir
                          </span>
                        )}
                        {ownedPrograms.includes(plan.id) && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 20, fontSize: 11,
                            background: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46',
                          }}>
                            Qeydiyyatlı
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#71717a', fontSize: 11 }}>{plan.description}</p>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selectedId === plan.id ? '#22c55e' : '#3f3f46'}`,
                      background: selectedId === plan.id ? '#22c55e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedId === plan.id && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000' }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Plan detalları */}
              {selectedPlan && (
                <div style={{
                  background: 'rgba(39,39,42,0.5)',
                  border: '1px solid #27272a',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 18,
                }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                    {selectedPlan.name}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {selectedPlan.details.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                        <span style={{ color: '#d4d4d8', fontSize: 13 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enrollError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13,
                  marginBottom: 8, textAlign: 'center',
                }}>
                  {enrollError}
                </div>
              )}

              <button
                onClick={handleEnroll}
                disabled={loading}
                style={{
                  width: '100%', padding: '15px',
                  borderRadius: 50,
                  background: loading ? '#27272a' : '#22c55e',
                  color: loading ? '#71717a' : '#000',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Qeydiyyat olunur...</>
                ) : ownedPrograms.includes(selectedId) ? (
                  'Dashboard-a get'
                ) : (
                  `${selectedPlan?.days}x/həftə Proqramı Başlat`
                )}
              </button>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
