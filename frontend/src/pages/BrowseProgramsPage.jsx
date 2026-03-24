import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase, getStoredUser } from '../lib/supabase';

const GYM_PLANS = [
  {
    id: 'starter-2day',
    days: 2,
    label: '2x per week',
    name: '2-Day Gym Starter',
    description: 'Upper/Lower split · 4 weeks · Machine-friendly',
    details: ['Great if you\'re just starting out', 'Upper body Monday, Lower body Friday', 'Machine-based — no technique overwhelm', '4-week progressive plan'],
    recommended: false,
  },
  {
    id: 'starter',
    days: 3,
    label: '3x per week',
    name: 'Gym Starter',
    description: 'Push/Pull/Legs · 4 weeks · Progressive overload',
    details: ['Most popular for beginners', 'Push / Pull / Legs split', 'Built-in weight progression each week', '4-week structured program'],
    recommended: true,
  },
  {
    id: 'elite-beginner',
    days: 5,
    label: '5x per week',
    name: 'Elite Beginner',
    description: 'Push/Pull/Legs/Shoulders/Full · 9 weeks · 3-phase',
    details: ['Best if you can commit to 5 days', '5-day split for full body coverage', '3-phase progression over 9 weeks', 'Serious results for dedicated beginners'],
    recommended: false,
  },
];

const BrowseProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [ownedPrograms, setOwnedPrograms] = useState([]);

  useEffect(() => {
    const parsedUser = getStoredUser();
    if (!parsedUser) { navigate('/login'); return; }
    try {
      setUser(parsedUser);
      supabase.from('purchases').select('program_id').eq('user_id', parsedUser.id).then(({ data }) => {
        setOwnedPrograms((data || []).map(p => p.program_id));
      });
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEnroll = async () => {
    const plan = GYM_PLANS.find(p => p.id === selected);
    if (!plan || !user) return;

    if (ownedPrograms.includes(plan.id)) {
      navigate('/my-programs');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('purchases').insert({
        user_id: user.id,
        program_id: plan.id,
        program_name: plan.name,
        price: 0,
        status: 'active',
      });
      if (error) throw error;
      navigate('/my-programs');
    } catch (err) {
      alert('Failed to enroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const selectedPlan = GYM_PLANS.find(p => p.id === selected);
  const isOwned = ownedPrograms.includes(selected);

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="browse-programs-page">
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
            <Link to="/progress" className="text-sm font-medium text-zinc-400 hover:text-white">Progress</Link>
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

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              Gym Plan
            </h1>
            <p className="text-zinc-400">How many days per week can you train?</p>
          </div>

          {/* Frequency picker */}
          <div className="space-y-3 mb-8">
            {GYM_PLANS.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${
                  selected === plan.id
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className={`font-heading text-2xl font-bold ${selected === plan.id ? 'text-green-400' : 'text-white'}`}>
                      {plan.days}x
                    </span>
                    <span className={`text-sm font-medium ${selected === plan.id ? 'text-green-400' : 'text-zinc-300'}`}>
                      per week
                      {plan.recommended && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          Recommended
                        </span>
                      )}
                      {ownedPrograms.includes(plan.id) && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-300 border border-zinc-600">
                          Enrolled
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{plan.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                  selected === plan.id ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                }`}>
                  {selected === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                </div>
              </button>
            ))}
          </div>

          {/* Plan details */}
          {selectedPlan && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
              <h3 className="font-heading text-lg font-bold text-white uppercase mb-3">{selectedPlan.name}</h3>
              <ul className="space-y-2">
                {selectedPlan.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full py-6 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Starting your program...</>
            ) : isOwned ? (
              'View My Programs'
            ) : (
              `Start ${selectedPlan?.days}x/week Program`
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BrowseProgramsPage;
