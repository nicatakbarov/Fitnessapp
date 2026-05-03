import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const SECTIONS = [
  {
    title: 'Account',
    items: ['Edit profile', 'Change password', 'Notifications'],
  },
  {
    title: 'Training',
    items: ['Workout reminders', 'Units & measurements', 'Rest day preferences'],
  },
  {
    title: 'Support',
    items: ['Help center', 'Contact us', 'Send feedback'],
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    try { setUser(JSON.parse(stored)); } catch { navigate('/login'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

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
        {SECTIONS.map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 20 }}>
            <div style={{
              color: '#71717a', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0 6px 8px',
            }}>
              {title}
            </div>
            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {items.map((label, i) => (
                <button
                  key={label}
                  onClick={() => {}}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '15px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #27272a' : 'none',
                    background: 'none', border: 'none',
                    borderBottomColor: i < items.length - 1 ? '#27272a' : 'transparent',
                    borderBottomWidth: i < items.length - 1 ? 1 : 0,
                    borderBottomStyle: i < items.length - 1 ? 'solid' : 'none',
                    color: '#fafafa', cursor: 'pointer', textAlign: 'left',
                    fontSize: 14, fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span>{label}</span>
                  <ChevronRight size={16} color="#52525b" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Log out */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', marginTop: 8, padding: '15px 0',
            background: 'transparent',
            border: '1px solid #3f3f46',
            borderRadius: 9999,
            color: '#ef4444',
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700, fontSize: 15,
            cursor: 'pointer', letterSpacing: '0.03em',
          }}
        >
          Log out
        </button>

      </main>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
