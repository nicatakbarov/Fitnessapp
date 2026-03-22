import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { EQUIPMENT_DB } from '../data/programs';
import DayBuilder from '../components/CustomPlan/DayBuilder';

const CreateCustomPlanPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Plan Metadata
  const [planMetadata, setPlanMetadata] = useState({
    name: '',
    description: '',
    weeksCount: 4,
    daysPerWeek: 3
  });

  // Step 2: Weeks/Days Builder
  const [weeksData, setWeeksData] = useState([]);

  // Initialize
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  // Generate template week (single week, repeated N times when saving)
  useEffect(() => {
    if (currentStep === 2 && weeksData.length === 0) {
      const days = [];
      for (let d = 1; d <= planMetadata.daysPerWeek; d++) {
        days.push({
          id: `custom-w1-d${d}`,
          weekNumber: 1,
          dayNumber: d,
          dayName: getDayName(d),
          title: '',
          warmup: { duration: '5 min', exercises: [] },
          mainWorkout: [],
          cooldown: { duration: '5 min', exercises: [] }
        });
      }
      setWeeksData([{ week: 1, days }]);
    }
  }, [currentStep, planMetadata.daysPerWeek, weeksData.length]);

  function getDayName(dayNum) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[(dayNum - 1) % 7];
  }

  const validateStep1 = () => {
    if (!planMetadata.name.trim()) {
      setError('Plan name is required');
      return false;
    }
    if (planMetadata.name.length < 2) {
      setError('Plan name must be at least 2 characters');
      return false;
    }
    if (planMetadata.weeksCount < 1 || planMetadata.weeksCount > 52) {
      setError('Weeks must be between 1 and 52');
      return false;
    }
    if (planMetadata.daysPerWeek < 1 || planMetadata.daysPerWeek > 7) {
      setError('Days per week must be between 1 and 7');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    for (const week of weeksData) {
      for (const day of week.days) {
        if (day.mainWorkout.length === 0) {
          setError(`${day.dayName} has no main workout exercises`);
          return false;
        }
      }
    }
    setError('');
    return true;
  };

  const handleSavePlan = async () => {
    if (!user) return;

    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build final plan JSON — clone template week for each week
      const templateDays = weeksData[0]?.days || [];
      const planJson = {
        id: `custom-${Date.now()}`,
        name: planMetadata.name,
        weeks: Array.from({ length: planMetadata.weeksCount }, (_, i) => ({
          week: i + 1,
          days: templateDays.map(day => ({
            id: `custom-w${i + 1}-d${day.dayNumber}`,
            dayNumber: day.dayNumber,
            dayName: day.dayName,
            title: day.title,
            warmup: day.warmup,
            mainWorkout: day.mainWorkout,
            cooldown: day.cooldown
          }))
        }))
      };

      // Insert into custom_plans
      const { data: customPlan, error: planError } = await supabase
        .from('custom_plans')
        .insert({
          user_id: user.id,
          name: planMetadata.name,
          description: planMetadata.description,
          weeks_count: planMetadata.weeksCount,
          days_per_week: planMetadata.daysPerWeek,
          plan_data: planJson,
          required_equipment: ['bodyweight']
        })
        .select()
        .single();

      if (planError) throw planError;

      // Insert into purchases
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          program_id: `custom-${customPlan.id}`,
          program_name: planMetadata.name,
          price: 0,
          status: 'active'
        });

      if (purchaseError) throw purchaseError;

      navigate('/my-programs');
    } catch (err) {
      setError(err.message || 'Failed to save plan. Please try again.');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="create-custom-plan-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-white">Create Custom Plan</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator — 3 steps */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-green-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Plan Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Plan Details</h2>
                <p className="text-zinc-400">Let's start by naming your plan</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Plan Name *</Label>
                  <Input
                    value={planMetadata.name}
                    onChange={(e) => setPlanMetadata({ ...planMetadata, name: e.target.value })}
                    placeholder="e.g. My Home Strength Plan"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Description (Optional)</Label>
                  <textarea
                    value={planMetadata.description}
                    onChange={(e) => setPlanMetadata({ ...planMetadata, description: e.target.value })}
                    placeholder="Describe your plan goals..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Duration (Weeks)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={planMetadata.weeksCount}
                      onChange={(e) => setPlanMetadata({ ...planMetadata, weeksCount: parseInt(e.target.value) || 1 })}
                      className="bg-zinc-900 border-zinc-800 text-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">Workouts Per Week</Label>
                    <Input
                      type="number"
                      min="1"
                      max="7"
                      value={planMetadata.daysPerWeek}
                      onChange={(e) => setPlanMetadata({ ...planMetadata, daysPerWeek: parseInt(e.target.value) || 1 })}
                      className="bg-zinc-900 border-zinc-800 text-white h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Weekly Template Builder */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Build Your Weekly Template</h2>
                <p className="text-zinc-400">
                  Set up your {planMetadata.daysPerWeek}-day workout routine. This template will repeat for all {planMetadata.weeksCount} weeks.
                </p>
              </div>

              <div className="space-y-4">
                {weeksData.map((week, wIdx) => (
                  <div key={week.week}>
                    <div className="space-y-3">
                      {week.days.map((day, dIdx) => (
                        <DayBuilder
                          key={day.id}
                          weekNumber={week.week}
                          dayNumber={day.dayNumber}
                          defaultData={day}
                          onSave={(updatedDay) => {
                            const newWeeks = [...weeksData];
                            newWeeks[wIdx].days[dIdx] = updatedDay;
                            setWeeksData(newWeeks);
                          }}
                          onClose={() => {}}
                          availableEquipment={EQUIPMENT_DB.map(e => e.key)}
                          bilingual={true}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Review <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Save */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Review Your Plan</h2>
                <p className="text-zinc-400">Make sure everything looks good before saving</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-zinc-500 text-sm">Plan Name</p>
                  <p className="text-white font-bold text-lg">{planMetadata.name}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm">Duration</p>
                  <p className="text-white">{planMetadata.weeksCount} weeks, {planMetadata.daysPerWeek} workouts/week</p>
                </div>

                {planMetadata.description ? (
                  <div>
                    <p className="text-zinc-500 text-sm">Description</p>
                    <p className="text-white">{planMetadata.description}</p>
                  </div>
                ) : null}

                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-500 text-sm">Weekly Template</p>
                  <p className="text-white text-lg">
                    {weeksData[0]?.days.reduce((t, d) => t + d.mainWorkout.length, 0) || 0} exercises/week
                    × {planMetadata.weeksCount} weeks = {(weeksData[0]?.days.reduce((t, d) => t + d.mainWorkout.length, 0) || 0) * planMetadata.weeksCount} total
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSavePlan}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Plan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCustomPlanPage;
