import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Search, CheckCircle, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getStoredUser } from '../lib/supabase';
import { EQUIPMENT_DB } from '../data/programs';
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

const HomeSetupPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);   // keys from DB list
  const [customItems, setCustomItems] = useState([]);      // manually added names
  const [customInput, setCustomInput] = useState('');

  const user = getStoredUser();

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

  const addCustomItem = () => {
    const name = customInput.trim();
    if (!name) return;
    if (customItems.includes(name)) { setCustomInput(''); return; }
    setCustomItems(prev => [...prev, name]);
    setCustomInput('');
  };

  const removeCustomItem = (name) => {
    setCustomItems(prev => prev.filter(i => i !== name));
  };

  const handleContinue = () => {
    const dbEquipment = selectedKeys.map(k => {
      const item = HOME_EQUIPMENT.find(e => e.key === k);
      return item?.en || k;
    });
    const equipment = ['bodyweight', ...dbEquipment, ...customItems];
    localStorage.setItem('fitstart_home_equipment', JSON.stringify(equipment));
    navigate('/create-plan', { state: { planType: 'home' } });
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
      <nav className="safe-nav fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/browse" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Link>
          <div className="flex items-center gap-2 text-zinc-400">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.name}</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">

              <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase mb-2">
                Evdə hansı avadanlıqlar var?
              </h1>
              <p className="text-zinc-400 mb-6">
                Sahib olduqlarını seç. Hər məşqin bodyweight variantı mövcuddur.
              </p>

              {/* Bodyweight always selected */}
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/40">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Bodyweight</p>
                  <p className="text-xs text-zinc-500">Həmişə daxildir — heç bir avadanlıq lazım deyil</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Axtar (məs. dumbbells, resistance bands...)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                  autoFocus
                />
                {query.trim() && (
                  <p className="text-zinc-600 text-xs mt-1.5 ml-1">{filtered.length} results</p>
                )}
              </div>

              {/* Equipment list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                {filtered.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-8">Tapılmadı</p>
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

              {/* Manual add */}
              <div className="mb-5">
                <p className="text-zinc-500 text-xs font-semibold uppercase mb-2">Özün əlavə et</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomItem()}
                    placeholder="məs. TRX, Pull-up bar..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <button
                    onClick={addCustomItem}
                    disabled={!customInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Əlavə et
                  </button>
                </div>
              </div>

              {/* Selected chips */}
              {(selectedKeys.length > 0 || customItems.length > 0) && (
                <div className="mb-6">
                  <p className="text-zinc-500 text-xs font-semibold uppercase mb-2">
                    Seçilmiş ({1 + selectedKeys.length + customItems.length} avadanlıq)
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
                    {customItems.map(name => (
                      <button
                        key={name}
                        onClick={() => removeCustomItem(name)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors"
                      >
                        {name} <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleContinue}
                className="w-full py-6 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2"
              >
                Davam et
                <ChevronRight className="w-5 h-5" />
              </Button>
              <p className="text-zinc-600 text-xs text-center mt-3">
                {1 + selectedKeys.length + customItems.length} avadanlıq seçildi (bodyweight daxil)
              </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeSetupPage;
