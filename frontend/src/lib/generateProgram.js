// ─────────────────────────────────────────────────────────────
// Home Program Generator
// Exercise pool sourced from free-exercise-db (public domain)
// ─────────────────────────────────────────────────────────────

// Equipment priority for picking best exercises
const EQUIP_PRIORITY = [
  'dumbbells', 'kettlebell', 'resistance_bands', 'bodyweight',
];

// ── Exercise pools ────────────────────────────────────────────
// equipment: array of keys user must have at least ONE of

const PUSH_EXERCISES = [
  { name: 'Pushups', equipment: ['bodyweight'] },
  { name: 'Decline Push-Up', equipment: ['bodyweight'] },
  { name: 'Incline Push-Up', equipment: ['bodyweight'] },
  { name: 'Push-Ups With Feet Elevated', equipment: ['bodyweight'] },
  { name: 'Push-Ups - Close Triceps Position', equipment: ['bodyweight'] },
  { name: 'Plyo Push-up', equipment: ['bodyweight'] },
  { name: 'Single-Arm Push-Up', equipment: ['bodyweight'] },
  { name: 'Clock Push-Up', equipment: ['bodyweight'] },
  { name: 'Push Up to Side Plank', equipment: ['bodyweight'] },
  { name: 'Bench Dips', equipment: ['bodyweight'] },
  { name: 'Dips - Triceps Version', equipment: ['bodyweight'] },
  { name: 'Body Tricep Press', equipment: ['bodyweight'] },
  { name: 'Dumbbell Bench Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Flyes', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Incline Dumbbell Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Incline Dumbbell Flyes', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Decline Dumbbell Bench Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Decline Dumbbell Flyes', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Shoulder Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Arnold Dumbbell Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Side Lateral Raise', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Front Dumbbell Raise', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Alternating Deltoid Raise', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Cuban Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Tricep Dumbbell Kickback', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Close-Grip Dumbbell Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Lying Dumbbell Tricep Extension', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Standing Dumbbell Triceps Extension', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Seated Triceps Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Tate Press', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Alternating Floor Press', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Alternating Kettlebell Press', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Kettlebell Arnold Press', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Kettlebell Thruster', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'One-Arm Kettlebell Push Press', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Two-Arm Kettlebell Military Press', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Band Skull Crusher', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Shoulder Press - With Bands', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Lateral Raise - With Bands', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Cross Over - With Bands', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Speed Band Overhead Triceps', equipment: ['resistance_bands', 'bodyweight'] },
];

const PULL_EXERCISES = [
  { name: 'Pullups', equipment: ['bodyweight'] },
  { name: 'Chin-Up', equipment: ['bodyweight'] },
  { name: 'V-Bar Pullup', equipment: ['bodyweight'] },
  { name: 'Wide-Grip Rear Pull-Up', equipment: ['bodyweight'] },
  { name: 'Inverted Row', equipment: ['bodyweight'] },
  { name: 'Dumbbell Bicep Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Alternate Hammer Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Hammer Curls', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Concentration Curls', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Incline Dumbbell Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Zottman Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Cross Body Hammer Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Standing Dumbbell Reverse Curl', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'One-Arm Dumbbell Row', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Bent Over Two-Dumbbell Row', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Bent Over Two-Dumbbell Row With Palms In', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Incline Row', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Middle Back Shrug', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Alternating Kettlebell Row', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'One-Arm Kettlebell Row', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Two-Arm Kettlebell Row', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Band Pull Apart', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Hyperextensions With No Hyperextension Bench', equipment: ['bodyweight'] },
];

const LEGS_EXERCISES = [
  { name: 'Bodyweight Squat', equipment: ['bodyweight'] },
  { name: 'Bodyweight Walking Lunge', equipment: ['bodyweight'] },
  { name: 'Freehand Jump Squat', equipment: ['bodyweight'] },
  { name: 'Mountain Climbers', equipment: ['bodyweight'] },
  { name: 'Butt Lift (Bridge)', equipment: ['bodyweight'] },
  { name: 'Single Leg Glute Bridge', equipment: ['bodyweight'] },
  { name: 'Glute Kickback', equipment: ['bodyweight'] },
  { name: 'Flutter Kicks', equipment: ['bodyweight'] },
  { name: 'Natural Glute Ham Raise', equipment: ['bodyweight'] },
  { name: 'Step-up with Knee Raise', equipment: ['bodyweight'] },
  { name: 'Scissors Jump', equipment: ['bodyweight'] },
  { name: 'Split Jump', equipment: ['bodyweight'] },
  { name: 'Knee Tuck Jump', equipment: ['bodyweight'] },
  { name: 'Rocket Jump', equipment: ['bodyweight'] },
  { name: 'Dumbbell Squat', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Lunges', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Rear Lunge', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Split Squat with Dumbbells', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Stiff-Legged Dumbbell Deadlift', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Step Ups', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Dumbbell Seated One-Leg Calf Raise', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Standing Dumbbell Calf Raise', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Plie Dumbbell Squat', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Vertical Swing', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Goblet Squat', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'One-Arm Kettlebell Swings', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Kettlebell One-Legged Deadlift', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Front Squats With Two Kettlebells', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Squats - With Bands', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Hip Extension with Bands', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Band Hip Adductions', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Monster Walk', equipment: ['resistance_bands', 'bodyweight'] },
  { name: 'Calf Raises - With Bands', equipment: ['resistance_bands', 'bodyweight'] },
];

const CORE_EXERCISES = [
  { name: 'Crunches', equipment: ['bodyweight'] },
  { name: 'Sit-Up', equipment: ['bodyweight'] },
  { name: 'Reverse Crunch', equipment: ['bodyweight'] },
  { name: 'Leg Pull-In', equipment: ['bodyweight'] },
  { name: 'Russian Twist', equipment: ['bodyweight'] },
  { name: 'Dead Bug', equipment: ['bodyweight'] },
  { name: 'Flat Bench Lying Leg Raise', equipment: ['bodyweight'] },
  { name: 'Mountain Climbers', equipment: ['bodyweight'] },
  { name: 'Cross-Body Crunch', equipment: ['bodyweight'] },
  { name: 'Oblique Crunches', equipment: ['bodyweight'] },
  { name: 'Jackknife Sit-Up', equipment: ['bodyweight'] },
  { name: 'Air Bike', equipment: ['bodyweight'] },
  { name: 'Alternate Heel Touchers', equipment: ['bodyweight'] },
  { name: 'Tuck Crunch', equipment: ['bodyweight'] },
  { name: 'Side Jackknife', equipment: ['bodyweight'] },
  { name: 'Cocoons', equipment: ['bodyweight'] },
  { name: 'Butt-Ups', equipment: ['bodyweight'] },
  { name: 'Spider Crawl', equipment: ['bodyweight'] },
  { name: 'Frog Sit-Ups', equipment: ['bodyweight'] },
  { name: 'Decline Oblique Crunch', equipment: ['bodyweight'] },
  { name: 'Dumbbell Side Bend', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Spell Caster', equipment: ['dumbbells', 'bodyweight'] },
  { name: 'Kettlebell Windmill', equipment: ['kettlebell', 'bodyweight'] },
  { name: 'Kettlebell Figure 8', equipment: ['kettlebell', 'bodyweight'] },
];

// ── Warmup / Cooldown ──────────────────────────────────────────
const WARMUP = {
  duration: '5 min',
  exercises: [
    { name: 'Arm Circles',      sets: 2, reps: 15 },
    { name: 'Hip Circles',      sets: 2, reps: 10 },
    { name: 'Leg Swings',       sets: 2, reps: '10 each leg' },
    { name: 'Bodyweight Squat', sets: 2, reps: 10 },
    { name: 'Jumping Jacks',    sets: 1, reps: 20 },
  ],
};

const COOLDOWN = {
  duration: '5 min',
  exercises: [
    { name: 'Quad Stretch',      duration: '30 sec each leg' },
    { name: 'Hamstring Stretch', duration: '30 sec each leg' },
    { name: "Child's Pose",      duration: '60 sec' },
    { name: 'Chest Stretch',     duration: '45 sec' },
  ],
};

// ── Day schedule by frequency ──────────────────────────────────
const FREQUENCY_CONFIG = {
  2: { indices: [1, 4], dayNames: ['Monday', 'Thursday'], templates: ['upper', 'lower'] },
  3: { indices: [1, 3, 5], dayNames: ['Monday', 'Wednesday', 'Friday'], templates: ['upper', 'lower', 'fullbody'] },
  4: { indices: [1, 2, 4, 5], dayNames: ['Monday', 'Tuesday', 'Thursday', 'Friday'], templates: ['push', 'pull', 'legs', 'upper'] },
  5: { indices: [1, 2, 3, 5, 6], dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'], templates: ['push', 'pull', 'legs', 'upper', 'fullbody'] },
};

const DAY_TITLES = {
  upper:    'Upper Body',
  lower:    'Lower Body',
  fullbody: 'Full Body',
  push:     'Push Day — Chest, Shoulders & Triceps',
  pull:     'Pull Day — Back & Biceps',
  legs:     'Leg Day — Quads, Glutes & Hamstrings',
};

// ── Exercise selector ──────────────────────────────────────────
function pickExercises(pool, userEquipment, count) {
  // Filter to exercises user can do (has at least one matching equipment)
  const available = pool.filter(ex =>
    ex.equipment.some(e => userEquipment.includes(e))
  );

  // Sort: prefer equipment user actually has (not just bodyweight fallback)
  const sorted = [...available].sort((a, b) => {
    const aBest = Math.min(...a.equipment.map(e => {
      const i = EQUIP_PRIORITY.indexOf(e);
      return i === -1 ? 99 : i;
    }));
    const bBest = Math.min(...b.equipment.map(e => {
      const i = EQUIP_PRIORITY.indexOf(e);
      return i === -1 ? 99 : i;
    }));
    // Prefer exercises matching user's non-bodyweight equipment
    const aHasSpecific = a.equipment.some(e => e !== 'bodyweight' && userEquipment.includes(e)) ? 0 : 1;
    const bHasSpecific = b.equipment.some(e => e !== 'bodyweight' && userEquipment.includes(e)) ? 0 : 1;
    if (aHasSpecific !== bHasSpecific) return aHasSpecific - bHasSpecific;
    return aBest - bBest;
  });

  // Shuffle within each priority tier to add variety across weeks
  const result = [];
  const seen = new Set();
  for (const ex of sorted) {
    if (result.length >= count) break;
    if (!seen.has(ex.name)) {
      seen.add(ex.name);
      result.push(ex);
    }
  }
  return result;
}

// ── Build a single workout day ─────────────────────────────────
function buildDay(template, dayNumber, dayName, sets, reps, userEquipment) {
  let exercises = [];

  switch (template) {
    case 'upper':
      exercises = [
        ...pickExercises(PUSH_EXERCISES, userEquipment, 3),
        ...pickExercises(PULL_EXERCISES, userEquipment, 2),
        ...pickExercises(CORE_EXERCISES, userEquipment, 1),
      ];
      break;
    case 'lower':
      exercises = [
        ...pickExercises(LEGS_EXERCISES, userEquipment, 4),
        ...pickExercises(CORE_EXERCISES, userEquipment, 1),
      ];
      break;
    case 'fullbody':
      exercises = [
        ...pickExercises(PUSH_EXERCISES, userEquipment, 2),
        ...pickExercises(PULL_EXERCISES, userEquipment, 2),
        ...pickExercises(LEGS_EXERCISES, userEquipment, 1),
        ...pickExercises(CORE_EXERCISES, userEquipment, 1),
      ];
      break;
    case 'push':
      exercises = pickExercises(PUSH_EXERCISES, userEquipment, 5);
      break;
    case 'pull':
      exercises = pickExercises(PULL_EXERCISES, userEquipment, 5);
      break;
    case 'legs':
      exercises = [
        ...pickExercises(LEGS_EXERCISES, userEquipment, 4),
        ...pickExercises(CORE_EXERCISES, userEquipment, 1),
      ];
      break;
    default:
      exercises = pickExercises(PUSH_EXERCISES, userEquipment, 5);
  }

  const mainWorkout = exercises.map(ex => ({
    name: ex.name,
    equipment: ex.equipment,
    sets,
    reps,
    rest: '60 sec',
  }));

  return {
    id: `hw-w${Math.ceil(dayNumber / 10)}-d${dayNumber}`,
    dayNumber,
    dayName,
    title: DAY_TITLES[template] || 'Workout',
    warmup: WARMUP,
    mainWorkout,
    cooldown: COOLDOWN,
  };
}

// ── Main generator ─────────────────────────────────────────────
export function generateHomeProgram(equipment, daysPerWeek) {
  const userEquipment = equipment.includes('bodyweight')
    ? equipment
    : ['bodyweight', ...equipment];

  const config = FREQUENCY_CONFIG[daysPerWeek] || FREQUENCY_CONFIG[3];

  const phases = [
    { weeks: [1, 2], sets: 3, reps: 12 },
    { weeks: [3, 4], sets: 4, reps: 10 },
  ];

  const weeks = [];
  let globalDayNumber = 1;

  for (const phase of phases) {
    for (const weekNum of phase.weeks) {
      const days = config.templates.map((template, i) => {
        const day = buildDay(
          template,
          globalDayNumber,
          config.dayNames[i],
          phase.sets,
          phase.reps,
          userEquipment
        );
        globalDayNumber++;
        return day;
      });
      weeks.push({ week: weekNum, days });
    }
  }

  return {
    name: 'My Home Program',
    daysPerWeek,
    workoutDayIndices: config.indices,
    equipment: userEquipment,
    weeks,
  };
}

export const FREQUENCY_DAY_LABELS = {
  2: 'Mon · Thu',
  3: 'Mon · Wed · Fri',
  4: 'Mon · Tue · Thu · Fri',
  5: 'Mon · Tue · Wed · Fri · Sat',
};

export const FREQUENCY_DESCRIPTIONS = {
  2: 'Light schedule — full body focus',
  3: 'Recommended for beginners — balanced split',
  4: 'Intermediate — upper/lower split',
  5: 'Advanced — push/pull/legs split',
};
