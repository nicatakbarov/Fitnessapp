import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, Play, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import axios from 'axios';
import { FREE_STARTER_WORKOUTS } from '../data/programs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MyProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      fetchData(token);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const purchasesRes = await axios.get(`${API}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(purchasesRes.data);

      // Fetch progress for each program
      const progressData = {};
      for (const purchase of purchasesRes.data) {
        try {
          const progressRes = await axios.get(`${API}/progress/${purchase.program_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          progressData[purchase.program_id] = progressRes.data;
        } catch {
          progressData[purchase.program_id] = [];
        }
      }
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getProgramTotalDays = (programId) => {
    if (programId === 'free-starter') {
      return FREE_STARTER_WORKOUTS.weeks[0].days.length;
    }
    return 0;
  };

  const getCompletedDays = (programId) => {
    const prog = progress[programId] || [];
    return prog.filter(p => p.completed).length;
  };

  const getProgressPercentage = (programId) => {
    const total = getProgramTotalDays(programId);
    const completed = getCompletedDays(programId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="my-programs-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 text-zinc-400 hover:text-green-400 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Browse Programs</span>
            </Link>
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              data-testid="logout-btn"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              My Programs
            </h1>
            <p className="text-zinc-400">
              Track your progress and continue your workouts.
            </p>
          </div>

          {/* Programs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-400">Loading your programs...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Programs Yet</h3>
              <p className="text-zinc-400 mb-6">Start your fitness journey by getting a program.</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
              >
                Browse Programs
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => {
                const totalDays = getProgramTotalDays(purchase.program_id);
                const completedDays = getCompletedDays(purchase.program_id);
                const progressPercent = getProgressPercentage(purchase.program_id);
                const isComplete = totalDays > 0 && completedDays >= totalDays;

                return (
                  <div
                    key={purchase.id}
                    data-testid={`my-program-card-${purchase.program_id}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-xl font-bold text-white uppercase">
                            {purchase.program_name}
                          </h3>
                          <span 
                            data-testid={`status-badge-${purchase.program_id}`}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              isComplete 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}
                          >
                            {isComplete ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        
                        {totalDays > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-zinc-400">
                                {completedDays}/{totalDays} days completed
                              </span>
                              <span className="text-sm font-medium text-green-400">
                                {progressPercent}%
                              </span>
                            </div>
                            <Progress 
                              value={progressPercent} 
                              className="h-2 bg-zinc-800"
                              data-testid={`progress-bar-${purchase.program_id}`}
                            />
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => navigate(`/program/${purchase.program_id}`)}
                        data-testid={`start-workout-${purchase.program_id}`}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-5 font-bold group"
                      >
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Review Program
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Start Workout
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProgramsPage;
