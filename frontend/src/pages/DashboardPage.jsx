import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, Check, Zap, Star, User } from 'lucide-react';
import { Button } from '../components/ui/button';

const programs = [
  {
    name: 'Starter',
    price: 19,
    duration: '4 weeks',
    frequency: '3x per week',
    level: 'Beginner',
    features: [
      'Basic movements library',
      'Warm-up & cool-down routines',
      'Beginner nutrition guide',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Transformer',
    price: 39,
    duration: '8 weeks',
    frequency: '4x per week',
    level: 'Beginner–Intermediate',
    features: [
      'Progressive overload system',
      'Full workout video library',
      'Complete meal plan',
      'Weekly check-ins',
      'Private community access',
    ],
    popular: true,
  },
  {
    name: 'Elite Beginner',
    price: 59,
    duration: '12 weeks',
    frequency: '5x per week',
    level: 'Full beginner system',
    features: [
      'Complete transformation system',
      '1-on-1 style video guidance',
      'Advanced nutrition protocols',
      'Priority support',
      'Lifetime access to updates',
    ],
    popular: false,
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
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

  const handleBuyNow = (programName) => {
    // Placeholder - will be functional in Phase 2
    alert(`Checkout for ${programName} coming soon!`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="dashboard-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline" data-testid="user-name">{user.name}</span>
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
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 
              className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2"
              data-testid="welcome-message"
            >
              Welcome back, {user.name?.split(' ')[0]}!
            </h1>
            <p className="text-zinc-400">
              Ready to start your fitness transformation? Choose a program below.
            </p>
          </div>

          {/* Programs Section */}
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold text-white uppercase mb-6">
              Available Programs
            </h2>
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                data-testid={`dashboard-program-card-${program.name.toLowerCase().replace(' ', '-')}`}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  program.popular
                    ? 'bg-gradient-to-b from-green-500/10 to-zinc-900 border-2 border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                    : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Popular Badge */}
                {program.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-green-500 text-black text-xs font-bold uppercase">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Program Name */}
                <h3 className="font-heading text-2xl font-bold text-white uppercase mb-2">
                  {program.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-zinc-500">$</span>
                  <span className="font-heading text-5xl font-bold text-white">{program.price}</span>
                  <span className="text-zinc-500">/program</span>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-zinc-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Duration</span>
                    <span className="text-white font-medium">{program.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Frequency</span>
                    <span className="text-white font-medium">{program.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Level</span>
                    <span className="text-white font-medium">{program.level}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleBuyNow(program.name)}
                  data-testid={`buy-now-${program.name.toLowerCase().replace(' ', '-')}`}
                  className={`w-full py-6 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 ${
                    program.popular
                      ? 'bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-900/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {program.popular && <Zap className="w-4 h-4 mr-2 fill-current" />}
                  Buy Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
