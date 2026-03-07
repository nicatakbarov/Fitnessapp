import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, CheckCircle2, Clock, Flame, Info, PartyPopper } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { FREE_STARTER_WORKOUTS } from '../data/programs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DayWorkoutPage = () => {
  const navigate = useNavigate();
  const { id, dayId } = useParams();
  const [user, setUser] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
      fetchProgress(token);
    } catch {
      navigate('/login');
    }
  }, [navigate, id]);

  const fetchProgress = async (token) => {
    try {
      const res = await axios.get(`${API}/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(res.data);
      const completed = res.data.some(p => p.day_id === dayId && p.completed);
      setIsCompleted(completed);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/progress/${id}/day/${dayId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCompleted(true);
      setShowCongrats(true);
      
      // Fetch updated progress
      await fetchProgress(token);
    } catch (err) {
      alert('Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  // Get workout data
  const workoutData = id === 'free-starter' ? FREE_STARTER_WORKOUTS : null;
  const dayData = workoutData?.weeks[0]?.days.find(d => d.id === dayId);
  
  // Calculate remaining days
  const totalDays = workoutData?.weeks[0]?.days.length || 0;
  const completedDays = progress.filter(p => p.completed).length + (isCompleted && !progress.some(p => p.day_id === dayId) ? 1 : 0);
  const remainingDays = totalDays - completedDays;

  if (!user) {
    return null;
  }

  if (!dayData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Workout Not Found</h1>
          <Button onClick={() => navigate(`/program/${id}`)} className="bg-green-600 hover:bg-green-700">
            Back to Program
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="day-workout-page">
      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="congrats-modal">
          <div className="bg-zinc-900 border border-green-500 rounded-3xl p-8 max-w-md mx-4 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-2">
              Great Job!
            </h2>
            <p className="text-zinc-400 mb-2">
              Day {dayData.dayNumber} complete!
            </p>
            <p className="text-green-400 font-medium mb-6" data-testid="remaining-days-message">
              {remainingDays > 0 
                ? `${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining this week.`
                : 'You completed all workouts this week! 🎉'
              }
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCongrats(false)}
                variant="outline"
                className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Stay Here
              </Button>
              <Button
                onClick={() => navigate(`/program/${id}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Back to Program
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(`/program/${id}`)}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-6 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Program
          </Button>

          {/* Day Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-2">
              <span>{dayData.dayName}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
            <h1 
              className="font-heading text-3xl md:text-4xl font-bold text-white uppercase"
              data-testid="day-title"
            >
              Day {dayData.dayNumber} - {dayData.title}
            </h1>
          </div>

          {/* Warm-up Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white uppercase">Warm-up</h2>
                <p className="text-sm text-zinc-500">{dayData.warmup.duration}</p>
              </div>
            </div>
            <div className="space-y-3">
              {dayData.warmup.exercises.map((exercise, index) => (
                <div 
                  key={index}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                >
                  <p className="font-medium text-white">{exercise.name}</p>
                  <p className="text-sm text-zinc-400">
                    {exercise.sets && exercise.reps 
                      ? `${exercise.sets} sets × ${exercise.reps} reps`
                      : exercise.duration || exercise.reps
                    }
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Main Workout Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="font-heading text-lg font-bold text-white uppercase">Main Workout</h2>
            </div>
            <div className="space-y-4">
              {dayData.mainWorkout.map((exercise, index) => (
                <div 
                  key={index}
                  data-testid={`exercise-card-${index}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white text-lg">{exercise.name}</h3>
                    <div className="flex items-center gap-1 text-zinc-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Rest {exercise.rest}</span>
                    </div>
                  </div>
                  <p className="text-green-400 font-medium mb-2">
                    {exercise.sets} sets × {exercise.reps} {typeof exercise.reps === 'number' ? 'reps' : ''}
                  </p>
                  {exercise.tip && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-300">
                        <span className="font-medium">Beginner tip:</span> {exercise.tip}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Cool-down Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white uppercase">Cool-down</h2>
                <p className="text-sm text-zinc-500">{dayData.cooldown.duration}</p>
              </div>
            </div>
            <div className="space-y-3">
              {dayData.cooldown.exercises.map((exercise, index) => (
                <div 
                  key={index}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                >
                  <p className="font-medium text-white">{exercise.name}</p>
                  <p className="text-sm text-zinc-400">{exercise.duration}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handleMarkComplete}
            disabled={loading || isCompleted}
            data-testid="mark-complete-btn"
            className={`w-full py-6 rounded-full font-bold text-lg transition-all ${
              isCompleted
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Day Completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Mark Day Complete
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayWorkoutPage;
