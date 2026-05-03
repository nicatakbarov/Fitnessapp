import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, BarChart3 } from 'lucide-react';

const tabs = [
  { label: 'Home',      icon: LayoutDashboard,   path: '/dashboard' },
  { label: 'Program',   icon: Dumbbell,           path: '/my-programs' },
  { label: 'Qida',      icon: UtensilsCrossed,    path: '/calorie' },
  { label: 'Progress',  icon: BarChart3,           path: '/progress' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
      }}
    >
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              paddingTop: '10px',
              paddingBottom: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? '#22c55e' : 'rgba(255,255,255,0.35)',
              transition: 'color 0.2s ease',
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: '9px', fontWeight: active ? 600 : 400, letterSpacing: '0.01em' }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
