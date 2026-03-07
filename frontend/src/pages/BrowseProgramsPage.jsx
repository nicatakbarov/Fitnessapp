import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, Check, Zap, Star, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PROGRAMS } from '../data/programs';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrowseProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownedPrograms, setOwnedPrograms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      fetchPurchases(token);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchPurchases = async (token) => {
    try {
      const response = await axios.get(`${API}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwnedPrograms(response.data.map(p => p.program_id));
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleGetProgram = async (program) => {
    if (ownedPrograms.includes(program.id)) {
      navigate('/my-programs');
      return;
    }

    if (program.isFree) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API}/purchases`, {
          program_id: program.id,
          program_name: program.name,
          price: 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/my-programs');
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to get program');
      } finally {
        setLoading(false);
      }
    } else {
      alert(`Checkout for ${program.name} ($${program.price}) coming soon!`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="browse-programs-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white">Dashboard</Link>
            <Link to="/my-programs" className="text-sm font-medium text-zinc-400 hover:text-white">My Programs</Link>
            <Link to="/progress" className="text-sm font-medium text-zinc-400 hover:text-white">Progress</Link>
            <Link to="/nutrition" className="text-sm font-medium text-zinc-400 hover:text-white">Nutrition</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              Browse Programs
            </h1>
            <p className="text-zinc-400">
              Choose a program that fits your fitness goals.
            </p>
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAMS.map((program, index) => {
              const isOwned = ownedPrograms.includes(program.id);
              
              return (
                <div
                  key={index}
                  data-testid={`browse-program-card-${program.id}`}
                  className={`relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${
                    program.isFree
                      ? 'bg-gradient-to-b from-emerald-500/20 to-zinc-900 border-2 border-emerald-500 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]'
                      : program.popular
                      ? 'bg-gradient-to-b from-green-500/10 to-zinc-900 border-2 border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                      : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Badge */}
                  {program.isFree && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold uppercase">
                        <Gift className="w-3 h-3" />
                        FREE
                      </div>
                    </div>
                  )}
                  {program.popular && !program.isFree && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-green-500 text-black text-xs font-bold uppercase">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Program Name */}
                  <h3 className="font-heading text-xl font-bold text-white uppercase mb-2 mt-2">
                    {program.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    {program.isFree ? (
                      <span className="font-heading text-4xl font-bold text-emerald-400">FREE</span>
                    ) : (
                      <>
                        <span className="text-zinc-500">$</span>
                        <span className="font-heading text-4xl font-bold text-white">{program.price}</span>
                      </>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-zinc-800 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Duration</span>
                      <span className="text-white font-medium">{program.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Frequency</span>
                      <span className="text-white font-medium">{program.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Level</span>
                      <span className="text-white font-medium">{program.level}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {program.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${program.isFree ? 'text-emerald-400' : 'text-green-500'}`} />
                        <span className="text-zinc-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleGetProgram(program)}
                    disabled={loading}
                    className={`w-full py-5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                      isOwned
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                        : program.isFree
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-900/30'
                        : program.popular
                        ? 'bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-900/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {isOwned ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Owned - View
                      </>
                    ) : program.isFree ? (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        {program.cta}
                      </>
                    ) : program.popular ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 fill-current" />
                        {program.cta}
                      </>
                    ) : (
                      program.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseProgramsPage;
