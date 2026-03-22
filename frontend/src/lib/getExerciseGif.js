import gifMap from '../data/exerciseGifMap.json';

// Normalize: lowercase, strip parenthetical suffixes like "(DB)", "(BW)", "(Barbell)"
const normalize = (name) =>
  name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')   // remove (DB), (BW), etc.
    .replace(/\s+/g, ' ')
    .trim();

// Manual aliases: program exercise name → exact exerciseGifMap key
const ALIASES = {
  // ── Barbell ──────────────────────────────────────────────
  'barbell back squat':             'barbell high bar squat',
  'barbell back squat heavy':       'barbell high bar squat',
  'barbell back squat light':       'barbell high bar squat',
  'barbell back squat moderate':    'barbell high bar squat',
  'barbell bent-over row':          'barbell bent over row',
  'barbell overhead press':         'barbell seated overhead press',
  'heavy barbell ohp':              'barbell seated overhead press',
  'incline barbell press':          'barbell incline bench press',
  'conventional deadlift':          'barbell deadlift',
  'conventional deadlift heavy':    'barbell deadlift',
  'conventional deadlift light':    'barbell deadlift',
  'ez bar skull crusher':           'barbell lying triceps extension skull crusher',
  'ez bar bicep curl':              'ez barbell curl',

  // ── Dumbbell ─────────────────────────────────────────────
  'db bicep curl':                  'dumbbell bicep curl with stork stance',
  'db hammer curl':                 'dumbbell hammer curls (with arm blaster)',
  'db lateral raise':               'dumbbell seated lateral raise',
  'db shoulder press':              'dumbbell standing overhead press',
  'db romanian deadlift':           'dumbbell romanian deadlift',
  'db rear delt raise':             'dumbbell rear delt raise',
  'db goblet squat':                'dumbbell goblet squat',
  'db one-arm row':                 'dumbbell bent over row',
  'db bench press':                 'dumbbell bench press',
  'db incline press':               'dumbbell incline press on exercise ball',
  'incline db press':               'dumbbell incline press on exercise ball',
  'incline db curl':                'dumbbell incline biceps curl',
  'db stiff-leg deadlift':          'dumbbell straight leg deadlift',
  'db preacher curl':               'lever preacher curl v. 2',
  'db shoulder press':              'dumbbell standing overhead press',

  // ── Machine / Lever ───────────────────────────────────────
  'machine chest press':            'lever chest press',
  'machine shoulder press':         'lever shoulder press',
  'machine incline press':          'lever incline chest press',
  'leg curl machine':               'lever lying leg curl',
  'leg press':                      'sled 45в° leg press',
  'leg extension':                  'lever leg extension',
  'calf raise machine':             'lever calf press',
  'hip abduction machine':          'lever seated hip abduction',
  'rear delt machine':              'dumbbell rear delt raise',
  'rear delt fly machine':          'dumbbell rear delt raise',
  'pec deck fly':                   'cable cross-over variation',

  // ── Cable ────────────────────────────────────────────────
  'cable fly':                      'cable cross-over variation',
  'cable tricep pushdown':          'cable one arm tricep pushdown',
  'cable tricep extension':         'cable one arm tricep pushdown',
  'face pull':                      'cable seated rear lateral raise',
  'face pull cable':                'cable seated rear lateral raise',
  'seated cable row':               'lever alternating narrow grip seated row',
  'close-grip seated row':          'lever alternating narrow grip seated row',
  'cable core rotation':            'cable cross-over revers fly',
  'cable lateral raise':            'cable seated rear lateral raise',
  'lat pulldown':                   'cable lat pulldown full range of motion',
  'wide-grip lat pulldown':         'lever front pulldown',

  // ── Bodyweight ───────────────────────────────────────────
  'plank hold':                     'weighted front plank',
  'glute bridge':                   'low glute bridge on floor',
  'superman hold':                  'superman push-up',
  'ab wheel rollout':               'standing wheel rollerout',
  'bulgarian split squat':          'barbell split squat v. 2',
  'weighted dips':                  'triceps dip (between benches)',
  'bodyweight squat':               'dumbbell squat',
  'bodyweight calf raise':          'standing calf raise (on a staircase)',
  'jumping jacks':                  'jack jump (male)',
  'table row':                      'inverted row bent knees',
  'table row inverted':             'inverted row bent knees',
  'isometric bicep hold':           'dumbbell bicep curl with stork stance',

  // ── Band / Resistance ────────────────────────────────────
  'band bicep curl':                'band pull down',
  'band romanian deadlift':         'band stiff leg deadlift',
  'band deadlift + row':            'band stiff leg deadlift',
  'band tricep pushdown':           'band side triceps extension',
  'band pull-aparts':               'band standing rear delt row',
  'band pull-apart':                'band standing rear delt row',
  'band lunge':                     'band stiff leg deadlift',
  'band thruster':                  'band twisting overhead press',
  'band woodchop':                  'band jack knife sit-up',
  'resistance band row':            'band standing rear delt row',
  'resistance band press':          'band one arm twisting chest press',

  // ── Other ────────────────────────────────────────────────
  'single-leg rdl':                 'dumbbell single leg deadlift',
  'bodyweight step-up':             'dumbbell step up single leg balance with bicep curl',
  'good morning + bodyweight row':  'barbell good morning',
  'squat + overhead reach':         'dumbbell squat',
  'standing + seated calf raise':   'standing calf raise (on a staircase)',
  'ayaq qaldırma':                  'high knee against wall',
  'high knees':                     'high knee against wall',
};

// Keys pre-normalized for fast lookup
const normalizedMap = Object.fromEntries(
  Object.entries(gifMap).map(([k, v]) => [normalize(k), v])
);
const normalizedKeys = Object.keys(normalizedMap);

/**
 * Returns a GIF URL for the given exercise name, or null if not found.
 */
export function getExerciseGif(exerciseName) {
  if (!exerciseName || normalizedKeys.length === 0) return null;

  const key = normalize(exerciseName);

  // 1. Manual alias lookup
  if (ALIASES[key] && normalizedMap[normalize(ALIASES[key])]) {
    return normalizedMap[normalize(ALIASES[key])];
  }

  // 2. Exact match in gifMap
  if (normalizedMap[key]) return normalizedMap[key];

  // 3. Prefix/suffix match
  const fwd = normalizedKeys.find(k => k.startsWith(key) || key.startsWith(k));
  if (fwd) return normalizedMap[fwd];

  // 4. Substring match
  const partial = normalizedKeys.find(k => key.includes(k) || k.includes(key));
  if (partial) return normalizedMap[partial];

  return null;
}
