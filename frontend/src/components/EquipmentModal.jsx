import { useState, useMemo } from 'react';
import { X, Search, Plus, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const EQUIPMENT_DB = [
  // ── Kardio Aparatları ──────────────────────────────────────────
  { key: 'treadmill',         az: 'Qaçış lenti',              en: 'Treadmill',                        emoji: '🏃', cat: 'Kardio' },
  { key: 'elliptical',        az: 'Elliptik trenajor',         en: 'Elliptical trainer',               emoji: '🔄', cat: 'Kardio' },
  { key: 'stationary_bike',   az: 'Sabit velosiped',           en: 'Stationary / upright bike',        emoji: '🚴', cat: 'Kardio' },
  { key: 'recumbent_bike',    az: 'Yaslanma velosipedi',       en: 'Recumbent bike',                   emoji: '🛋️', cat: 'Kardio' },
  { key: 'spin_bike',         az: 'Spin velosipedi',           en: 'Spin / indoor cycling bike',       emoji: '⚡', cat: 'Kardio' },
  { key: 'rowing_machine',    az: 'Avarçəkmə aparatı',         en: 'Rowing machine / ergometer',       emoji: '🚣', cat: 'Kardio' },
  { key: 'skierg',            az: 'Xizəkçi trenajoru',         en: 'SkiErg',                           emoji: '⛷️', cat: 'Kardio' },
  { key: 'air_bike',          az: 'Hava velosipedi',           en: 'Air bike / Assault bike / Fan bike',emoji: '💨', cat: 'Kardio' },
  { key: 'stair_climber',     az: 'Pilləkən trenajoru',        en: 'Stair climber / StairMaster',      emoji: '🪜', cat: 'Kardio' },
  { key: 'jump_rope',         az: 'Atlama ipi',                en: 'Jump rope / Skipping rope',        emoji: '🪢', cat: 'Kardio' },
  { key: 'speed_rope',        az: 'Sürət ipi',                 en: 'Speed rope (double-unders)',       emoji: '🌀', cat: 'Kardio' },

  // ── Azad Çəkilər ──────────────────────────────────────────────
  { key: 'dumbbells',         az: 'Əl çəkiləri',               en: 'Dumbbells',                        emoji: '🏋️', cat: 'Azad çəkilər' },
  { key: 'adjustable_dumbbells', az: 'Tənzimlənən əl çəkiləri', en: 'Adjustable dumbbells',            emoji: '🔧', cat: 'Azad çəkilər' },
  { key: 'kettlebell',        az: 'Kettlebell (topçəki)',       en: 'Kettlebell',                       emoji: '⚫', cat: 'Azad çəkilər' },
  { key: 'barbell',           az: 'Olimpik ştanqa',             en: 'Olympic barbell',                  emoji: '🏗️', cat: 'Azad çəkilər' },
  { key: 'ez_bar',            az: 'EZ çubuğu',                  en: 'EZ curl bar',                      emoji: '〰️', cat: 'Azad çəkilər' },
  { key: 'trap_bar',          az: 'Altıbucaqlı ştanqa',         en: 'Trap bar / Hex bar',               emoji: '⬡', cat: 'Azad çəkilər' },
  { key: 'safety_squat_bar',  az: 'Təhlükəsiz çömbəlmə çubuğu',en: 'Safety squat bar',                emoji: '🦺', cat: 'Azad çəkilər' },
  { key: 'weight_plates',     az: 'Disk çəkilər',               en: 'Weight plates / Bumper plates',   emoji: '🔵', cat: 'Azad çəkilər' },
  { key: 'steel_mace',        az: 'Polad gürz',                 en: 'Steel mace / Gada',               emoji: '🔨', cat: 'Azad çəkilər' },
  { key: 'steel_club',        az: 'Polad topuz',                en: 'Steel club',                      emoji: '🪃', cat: 'Azad çəkilər' },
  { key: 'bulgarian_bag',     az: 'Bolqar çantası',             en: 'Bulgarian bag',                   emoji: '🌙', cat: 'Azad çəkilər' },
  { key: 'sandbag',           az: 'Qum çantası',                en: 'Sandbag',                         emoji: '🛍️', cat: 'Azad çəkilər' },

  // ── Aparatlar ─────────────────────────────────────────────────
  { key: 'power_rack',        az: 'Güc çərçivəsi (squat kafes)',en: 'Power rack / Squat cage',         emoji: '🏟️', cat: 'Aparatlar' },
  { key: 'smith_machine',     az: 'Smit aparatı',               en: 'Smith machine',                   emoji: '🔩', cat: 'Aparatlar' },
  { key: 'cable_machine',     az: 'Kabel aparatı',              en: 'Cable machine / Functional trainer',emoji: '🔗', cat: 'Aparatlar' },
  { key: 'lat_pulldown',      az: 'Lat pulldown aparatı',       en: 'Lat pulldown machine',            emoji: '⬇️', cat: 'Aparatlar' },
  { key: 'seated_row',        az: 'Oturaq çəkmə aparatı',       en: 'Seated row machine',              emoji: '↩️', cat: 'Aparatlar' },
  { key: 'leg_press',         az: 'Ayaq presi aparatı',         en: 'Leg press machine',               emoji: '🦵', cat: 'Aparatlar' },
  { key: 'leg_extension',     az: 'Ayaq uzatma aparatı',        en: 'Leg extension machine',           emoji: '↗️', cat: 'Aparatlar' },
  { key: 'leg_curl',          az: 'Ayaq bükmə aparatı',         en: 'Leg curl machine',                emoji: '↙️', cat: 'Aparatlar' },
  { key: 'pec_deck',          az: 'Döş uçuş aparatı',           en: 'Pec deck / Chest fly machine',    emoji: '🦋', cat: 'Aparatlar' },
  { key: 'home_gym_station',  az: 'Çox stansiyalı ev trenajoru',en: 'Multi-station home gym',          emoji: '🏠', cat: 'Aparatlar' },

  // ── Bədən çəkisi / Kalistenik ─────────────────────────────────
  { key: 'pullup_bar',        az: 'Çəkilmə çubuğu',             en: 'Pull-up bar / Chin-up bar',       emoji: '🔝', cat: 'Kalistenik' },
  { key: 'dip_bars',          az: 'Dip çubuqları',              en: 'Dip bars / Parallel bars',        emoji: '📊', cat: 'Kalistenik' },
  { key: 'parallettes',       az: 'Paralel çubuqlar',           en: 'Parallettes',                     emoji: '⎰⎱', cat: 'Kalistenik' },
  { key: 'gymnastic_rings',   az: 'Gimnastika halqaları',        en: 'Gymnastic rings',                 emoji: '⭕', cat: 'Kalistenik' },
  { key: 'trx',               az: 'Asma lentlər (TRX)',         en: 'TRX / Suspension trainer',        emoji: '🧗', cat: 'Kalistenik' },
  { key: 'pullup_tower',      az: 'Sərbəst çəkilmə qülləsi',    en: 'Freestanding pull-up tower',      emoji: '🗼', cat: 'Kalistenik' },
  { key: 'push_up_handles',   az: 'Buraxma tutacaqları',         en: 'Push-up handles / Push-up bars',  emoji: '✊', cat: 'Kalistenik' },
  { key: 'ab_wheel',          az: 'Qarın çarxı',                 en: 'Ab wheel / Ab roller',            emoji: '⚙️', cat: 'Kalistenik' },

  // ── Funksional İdman ──────────────────────────────────────────
  { key: 'battle_ropes',      az: 'Döyüş ipləri',               en: 'Battle ropes',                    emoji: '🌊', cat: 'Funksional' },
  { key: 'landmine',          az: 'Yer mıxı (landmine)',         en: 'Landmine attachment',             emoji: '📌', cat: 'Funksional' },
  { key: 'plyo_box',          az: 'Atlama qutusu',               en: 'Plyo box / Jump box',             emoji: '📦', cat: 'Funksional' },
  { key: 'medicine_ball',     az: 'Tibbi top',                   en: 'Medicine ball',                   emoji: '⚽', cat: 'Funksional' },
  { key: 'wall_ball',         az: 'Divar topu',                  en: 'Wall ball',                       emoji: '🏀', cat: 'Funksional' },
  { key: 'slam_ball',         az: 'Slam top',                    en: 'Slam ball',                       emoji: '💥', cat: 'Funksional' },
  { key: 'sled',              az: 'İtələmə/çəkmə sürüşkəni',    en: 'Push/pull sled (prowler)',         emoji: '🛷', cat: 'Funksional' },
  { key: 'agility_ladder',    az: 'Çeviklik nərdivanı',          en: 'Agility ladder',                  emoji: '🪜', cat: 'Funksional' },
  { key: 'hurdles',           az: 'Maneə çubuqları',             en: 'Agility hurdles',                 emoji: '🏁', cat: 'Funksional' },
  { key: 'step_platform',     az: 'Addım platforması',           en: 'Step platform / Aerobic step',    emoji: '🟫', cat: 'Funksional' },

  // ── Çeviklik / Bərpa ─────────────────────────────────────────
  { key: 'yoga_mat',          az: 'Yoga / idman döşəyi',         en: 'Yoga mat / Exercise mat',         emoji: '🧘', cat: 'Çeviklik' },
  { key: 'foam_roller',       az: 'Köpük rulon',                 en: 'Foam roller',                     emoji: '🟤', cat: 'Çeviklik' },
  { key: 'massage_gun',       az: 'Masaj silahı',                en: 'Massage gun / Percussion device', emoji: '🔫', cat: 'Çeviklik' },
  { key: 'massage_ball',      az: 'Masaj topu',                  en: 'Lacrosse ball / Massage ball',    emoji: '🎱', cat: 'Çeviklik' },
  { key: 'stretching_strap',  az: 'Gərginlik lenti',             en: 'Stretching strap / Yoga strap',   emoji: '🎀', cat: 'Çeviklik' },
  { key: 'stability_ball',    az: 'Stabillik topu',              en: 'Stability ball / Swiss ball',     emoji: '🔵', cat: 'Çeviklik' },
  { key: 'bosu_ball',         az: 'Bosu topu',                   en: 'Bosu ball',                       emoji: '🌕', cat: 'Çeviklik' },
  { key: 'balance_board',     az: 'Balans taxtası',              en: 'Balance board / Wobble board',    emoji: '🏄', cat: 'Çeviklik' },
  { key: 'inversion_table',   az: 'İnversiya masası',            en: 'Inversion table',                 emoji: '🔃', cat: 'Çeviklik' },

  // ── Aksessuarlar ──────────────────────────────────────────────
  { key: 'resistance_bands',  az: 'Rezin lentlər',               en: 'Resistance bands / Loop bands',   emoji: '〰️', cat: 'Aksessuarlar' },
  { key: 'resistance_tubes',  az: 'Rezin borular',               en: 'Resistance tubes with handles',   emoji: '🔵', cat: 'Aksessuarlar' },
  { key: 'ankle_weights',     az: 'Ayaq biləyi çəkiləri',        en: 'Ankle weights',                   emoji: '🦶', cat: 'Aksessuarlar' },
  { key: 'wrist_weights',     az: 'Biləklik çəkilər',            en: 'Wrist weights',                   emoji: '⌚', cat: 'Aksessuarlar' },
  { key: 'weight_vest',       az: 'Çəkili jilet',                en: 'Weight vest / Weighted vest',     emoji: '🦺', cat: 'Aksessuarlar' },
  { key: 'dip_belt',          az: 'Çəki kəməri',                 en: 'Dip belt / Weight belt',          emoji: '🥋', cat: 'Aksessuarlar' },
  { key: 'lifting_belt',      az: 'Qaldırma kəməri',             en: 'Weightlifting belt',              emoji: '🛡️', cat: 'Aksessuarlar' },
  { key: 'knee_sleeves',      az: 'Diz qoruyucu',                en: 'Knee sleeves / Knee wraps',       emoji: '🦵', cat: 'Aksessuarlar' },
  { key: 'wrist_wraps',       az: 'Biləklik sarğı',              en: 'Wrist wraps',                     emoji: '🩹', cat: 'Aksessuarlar' },
  { key: 'lifting_straps',    az: 'Qaldırma lentləri',           en: 'Lifting straps / Wrist straps',   emoji: '✊', cat: 'Aksessuarlar' },
  { key: 'workout_gloves',    az: 'İdman əlcəkləri',             en: 'Workout gloves / Gym gloves',     emoji: '🧤', cat: 'Aksessuarlar' },
  { key: 'chalk',             az: 'Maqnezium tozu',              en: 'Lifting chalk / Magnesium carbonate', emoji: '🤍', cat: 'Aksessuarlar' },
  { key: 'bench',             az: 'İdman skamyası',              en: 'Weight bench (flat/adjustable)',  emoji: '🛋️', cat: 'Aksessuarlar' },
];

const EquipmentModal = ({ onConfirm, onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    if (!query.trim()) return EQUIPMENT_DB;
    const q = query.toLowerCase();
    return EQUIPMENT_DB.filter(
      e =>
        e.az.toLowerCase().includes(q) ||
        e.en.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q) ||
        e.cat.toLowerCase().includes(q)
    );
  }, [query]);

  const addItem = (item) => {
    if (!selected.find(s => s.key === item.key)) {
      setSelected(prev => [...prev, item]);
    }
    setQuery('');
  };

  const removeItem = (key) => {
    setSelected(prev => prev.filter(s => s.key !== key));
  };

  const handleConfirm = () => {
    const keys = ['bodyweight', ...selected.map(s => s.key)];
    localStorage.setItem('fitstart_equipment', JSON.stringify(keys));
    onConfirm(keys);
  };

  const totalCount = 1 + selected.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="font-heading text-xl font-bold text-white uppercase mb-1">
              Evdəki Avadanlıq
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sahib olduğunuz alətləri axtarın və əlavə edin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors ml-4 mt-1 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Axtar: əl çəkisi, rezin, ştanqa, kettlebell..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
              autoFocus
            />
          </div>
          {query.trim() && (
            <p className="text-zinc-600 text-xs mt-1.5 ml-1">
              {filtered.length} nəticə tapıldı
            </p>
          )}
        </div>

        {/* Results list */}
        <div className="px-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-1.5 pb-2">
            {filtered.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">Heç nə tapılmadı</p>
            ) : (
              filtered.map(item => {
                const isAdded = selected.some(s => s.key === item.key);
                // Category-based gradient backgrounds
                const catGradients = {
                  'Kardio': 'from-blue-600/30 to-blue-600/10 border-blue-500/30',
                  'Azad çəkilər': 'from-red-600/30 to-red-600/10 border-red-500/30',
                  'Aparatlar': 'from-purple-600/30 to-purple-600/10 border-purple-500/30',
                  'Kalistenik': 'from-yellow-600/30 to-yellow-600/10 border-yellow-500/30',
                  'Funksional': 'from-orange-600/30 to-orange-600/10 border-orange-500/30',
                  'Çeviklik': 'from-cyan-600/30 to-cyan-600/10 border-cyan-500/30',
                  'Aksessuarlar': 'from-pink-600/30 to-pink-600/10 border-pink-500/30',
                };
                const gradient = catGradients[item.cat] || 'from-gray-600/30 to-gray-600/10 border-gray-500/30';

                return (
                  <button
                    key={item.key}
                    onClick={() => isAdded ? removeItem(item.key) : addItem(item)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 transition-all text-left ${
                      isAdded
                        ? 'bg-green-500/20 border-green-500/60 shadow-lg shadow-green-500/20'
                        : `bg-gradient-to-r ${gradient} hover:border-opacity-60`
                    }`}
                  >
                    {/* Large emoji icon */}
                    <div className={`w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-4xl ${
                      isAdded
                        ? 'bg-green-500/30 border-2 border-green-500/50'
                        : 'bg-black/30 border border-white/20'
                    }`}>
                      {item.emoji}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white">{item.az}</p>
                      <p className="text-zinc-400 text-xs truncate">{item.en}</p>
                      <p className="text-zinc-600 text-xs mt-1">{item.cat}</p>
                    </div>

                    {/* Check/Add button */}
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                      isAdded ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'border-2 border-zinc-500 hover:border-white'
                    }`}>
                      {isAdded
                        ? <CheckCircle className="w-5 h-5 text-black" />
                        : <Plus className="w-4 h-4 text-zinc-400" />
                      }
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="px-6 pt-4 flex-shrink-0 border-t border-zinc-700">
            <p className="text-zinc-500 text-xs font-semibold mb-3 uppercase">Seçilmişlər</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border-2 border-green-500/40 rounded-lg text-xs text-green-300 font-medium">
                <span className="text-lg">🤸</span>
                Bədən çəkisi
              </div>
              {selected.map(item => (
                <button
                  key={item.key}
                  onClick={() => removeItem(item.key)}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 border border-zinc-600 rounded-lg text-xs text-white hover:bg-red-500/20 hover:border-red-500/60 transition-colors group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <span className="truncate max-w-[100px]">{item.az}</span>
                  <X className="w-3.5 h-3.5 ml-1 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-4 flex-shrink-0">
          <Button
            onClick={handleConfirm}
            className="w-full py-5 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            Proqramı Hazırla ({totalCount} avadanlıq)
          </Button>
          <p className="text-zinc-600 text-xs text-center mt-3">
            Avadanlıq olmasa da idman etmək olar — bədən çəkisi kifayətdir
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;
