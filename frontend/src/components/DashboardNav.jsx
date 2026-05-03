import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, User } from 'lucide-react';
import { Button } from './ui/button';

const DashboardNav = ({ user, onLogout, activePage }) => {
  const navigate = useNavigate();
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', key: 'dashboard' },
    { name: 'My Programs', path: '/my-programs', key: 'my-programs' },
    { name: 'Progress', path: '/progress', key: 'progress' },
    { name: 'Nutrition', path: '/nutrition', key: 'nutrition' },
  ];

  return (
    <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
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
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline text-sm">{user?.name}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
