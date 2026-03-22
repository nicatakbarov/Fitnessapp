import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LogOut, User, Search, CheckCircle, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase, getStoredUser } from '../lib/supabase';
import { EQUIPMENT_DB } from '../data/programs';
import { generateHomeProgram, FREQUENCY_DAY_LABELS, FREQUENCY_DESCRIPTIONS } from '../lib/generateProgram';

// Home-relevant equipment keys only (37 items)
const HOME_EQUIPMENT_KEYS = new Set([
  'jump_rope', 'speed_rope',
  'dumbbells', 'adjustable_dumbbells', 'kettlebell', 'barbell', 'weight_plates',
  'pullup_bar', 'dip_bars', 'parallettes', 'gymnastic_rings', 'trx',
  'push_up_handles', 'ab_wheel',
  'plyo_box', 'medicine_ball', 'agility_ladder', 'step_platform',
  'yoga_mat', 'foam_roller', 'massage_gun', 'massage_ball',
  'stretching_strap', 'stability_ball', 'bosu_ball', 'balance_board',
  'resistance_bands', 'resistance_tubes', 'ankle_weights', 'wrist_weights',
  'weight_vest', 'lifting_belt', 'knee_sleeves', 'workout_gloves',
  'bench', 'sandbag', 'steel_mace',
]);

const HOME_EQUIPMENT = EQUIPMENT_DB.filter(e => HOME_EQUIPMENT_KEYS.has(e.key));

// English category names for home equipment
const EN_CATEGORIES = {
  'Kardio': 'Cardio',
  'Azad çəkilər': 'Free Weights',
  'Kalistenik': 'Calisthenics',
  'Funksional': 'Functional',
  'Çeviklik': 'Flexibility & Recovery',
  'Aksessuarlar': 'Accessories',
};

const FREQUENCY_OPTIONS = [2, 3, 4, 5];

const HomeSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const user = getStoredUser();

  // Redirect must be in useEffect, not before hooks
  useEffect(() => {
    if (!user) navigate('/login');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!query.trim()) return HOME_EQUIPMENT;
    const q = query.toLowerCase();
    return HOME_EQUIPMENT.filter(e =>
      e.en.toLowerCase().includes(q) ||
      e.key.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleItem = (key) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const equipment = ['bodyweight', ...selectedKeys];
      const program = generateHomeProgram(equipment, daysPerWeek);

      // Save to Supabase custom_plans
      const { data: planData, error: planError } = await supabase
        .from('custom_plans')
        .insert({
          user_id: user.id,
          name: 'My Home Program',
          description: `${daysPerWeek}x/week home workout with ${equipment.length} equipment types`,
          weeks_count: 4,
          days_per_week: daysPerWeek,
          plan_data: JSON.stringify(program),
        })
        .select()
        .single();

      if (planError) {
        console.error('Plan insert error:', JSON.stringify(planError));
        throw new Error(planError.message || planError.details || 'Plan insert failed');
      }

      const programId = `custom-${planData.id}`;
      const fullProgram = { ...program, id: programId };

      // Save to purchases
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          program_id: programId,
          program_name: 'My Home Program',
          price: 0,
          status: 'active',
        });

      if (purchaseError) {
        console.error('Purchase insert error:', JSON.stringify(purchaseError));
        throw new Error(purchaseError.message || 'Purchase insert failed');
      }

      // Cache in sessionStorage for dashboard to pick up immediately
      const existing = JSON.parse(sessionStorage.getItem('customPlans') || '{}');
      sessionStorage.setItem('customPlans', JSON.stringify({
        ...existing,
        [programId]: fullProgram,
      }));

      localStorage.setItem('fitstart_equipment', JSON.stringify(equipment));
      navigate('/generating', { state: { programName: fullProgram.name } });
    } catch (err) {
      console.error('Failed to generate program:', err?.message || err);
      setError(err?.message || 'Something went wrong. Please try again.');
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-green-500 transition-colors">
            <Dumbbell className="w-8 h-8 text-green-500" />
            <span className="font-heading text-2xl font-bold tracking-tight">FitStart</span>
          </Link>
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

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-green-500' : 'bg-zinc-800'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
          </div>

          {/* ── STEP 1: Equipment ── */}
          {step === 1 && (
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase mb-2">
                What equipment do you have at home?
              </h1>
              <p className="text-zinc-400 mb-6">
                Select all that apply. Every exercise has a bodyweight fallback — no equipment required.
              </p>

              {/* Bodyweight always selected */}
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/40">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Bodyweight only</p>
                  <p className="text-xs text-zinc-500">Always included — no equipment needed</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search equipment (e.g. dumbbells, resistance bands...)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                  autoFocus
                />
                {query.trim() && (
                  <p className="text-zinc-600 text-xs mt-1.5 ml-1">{filtered.length} results</p>
                )}
              </div>

              {/* Equipment list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 mb-4">
                {filtered.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-8">No equipment found</p>
                ) : (
                  filtered.map(item => {
                    const isSelected = selectedKeys.includes(item.key);
                    const catEn = EN_CATEGORIES[item.cat] || item.cat;
                    return (
                      <button
                        key={item.key}
                        onClick={() => toggleItem(item.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'bg-green-500/10 border-green-500/50'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-green-400' : 'text-white'}`}>
                            {item.en}
                          </p>
                          <p className="text-xs text-zinc-600">{catEn}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-green-500' : 'border-2 border-zinc-700'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected chips */}
              {selectedKeys.length > 0 && (
                <div className="mb-6">
                  <p className="text-zinc-500 text-xs font-semibold uppercase mb-2">
                    Selected ({selectedKeys.length + 1} items including bodyweight)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      Bodyweight
                    </span>
                    {selectedKeys.map(key => {
                      const item = HOME_EQUIPMENT.find(e => e.key === key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleItem(key)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors"
                        >
                          {item?.en} ×
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                className="w-full py-6 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* ── STEP 2: Frequency ── */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase mb-2">
                How many days per week?
              </h1>
              <p className="text-zinc-400 mb-6">
                Choose your training frequency. You can always adjust later.
              </p>

              <div className="space-y-3 mb-8">
                {FREQUENCY_OPTIONS.map(days => (
                  <button
                    key={days}
                    onClick={() => setDaysPerWeek(days)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${
                      daysPerWeek === days
                        ? 'bg-green-500/10 border-green-500'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className={`font-heading text-2xl font-bold ${daysPerWeek === days ? 'text-green-400' : 'text-white'}`}>
                          {days}x
                        </span>
                        <span className={`text-sm font-medium ${daysPerWeek === days ? 'text-green-400' : 'text-zinc-300'}`}>
                          per week
                          {days === 3 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                              Recommended
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{FREQUENCY_DESCRIPTIONS[days]}</p>
                      <p className="text-xs text-zinc-600 mt-1">{FREQUENCY_DAY_LABELS[days]}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                      daysPerWeek === days ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                    }`}>
                      {daysPerWeek === days && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-6 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating your 4-week program...
                  </>
                ) : (
                  <>
                    Generate My Program
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <p className="text-zinc-600 text-xs text-center mt-3">
                Your program is tailored to your {selectedKeys.length + 1} equipment item{selectedKeys.length !== 0 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeSetupPage;
