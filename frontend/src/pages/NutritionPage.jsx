import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, ArrowLeft, Apple, Droplets, Beef, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

const NutritionPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const sections = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Pre-Workout Nutrition',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      tips: [
        'Eat 1-2 hours before your workout',
        'Banana + peanut butter (quick energy)',
        'Oats with fruit (sustained energy)',
        'Avoid heavy or fatty foods before training',
        'Keep it light - around 200-300 calories'
      ]
    },
    {
      icon: <Apple className="w-6 h-6" />,
      title: 'Post-Workout Nutrition',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      tips: [
        'Eat within 30-60 minutes after workout',
        'Protein shake + banana (fast recovery)',
        'Chicken + rice + vegetables (complete meal)',
        'Greek yogurt + berries (protein + carbs)',
        'Aim for 20-40g protein post-workout'
      ]
    },
    {
      icon: <Beef className="w-6 h-6" />,
      title: 'Daily Protein Guide',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      tips: [
        'Beginner goal: 0.8g per pound of bodyweight',
        'Good sources: eggs, chicken, fish, beans, tofu',
        'Aim for protein in every meal',
        'Spread intake across 3-4 meals',
        'Consider protein powder if struggling to hit goals'
      ]
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: 'Hydration Tips',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      tips: [
        'Drink 8 glasses (2L) of water daily',
        'Drink 500ml before your workout',
        'Sip water during workout (don\'t gulp)',
        'Rehydrate with electrolytes after intense sessions',
        'Check urine color - light yellow is ideal'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="nutrition-page">
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
            <Link to="/nutrition" className="text-sm font-medium text-green-400">Nutrition</Link>
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
      <main className="pt-24 pb-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-6 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              Nutrition Tips 🥗
            </h1>
            <p className="text-zinc-400">
              Fuel your workouts right and maximize your results with these beginner-friendly nutrition guidelines.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                data-testid={`nutrition-section-${index}`}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center ${section.color}`}>
                    {section.icon}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-white uppercase">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full ${section.color.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                      <span className="text-zinc-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <p className="text-zinc-500 mb-4">
              Remember: Consistency beats perfection. Start with small changes!
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 rounded-full px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default NutritionPage;
