// Shared program data for the app
export const PROGRAMS = [
  {
    id: 'free-starter',
    name: 'Free Starter',
    price: 0,
    duration: '1 week',
    frequency: '3x per week',
    level: 'Beginner',
    features: [
      '3 sample gym workouts',
      'Basic nutrition tips',
      'Progress tracking',
    ],
    popular: false,
    isFree: true,
    cta: 'Get Free Access',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    duration: '4 weeks',
    frequency: '3x per week',
    level: 'Beginner',
    features: [
      'Push / Pull / Legs split',
      'Machine + dumbbell progression',
      'Warm-up & cool-down routines',
      'Beginner nutrition guide',
      'Email support',
    ],
    popular: false,
    isFree: false,
    cta: 'Get Starter',
  },
  {
    id: 'transformer',
    name: 'Transformer',
    price: 39,
    duration: '8 weeks',
    frequency: '4x per week',
    level: 'Beginner–Intermediate',
    features: [
      'Upper / Lower split',
      'Progressive overload system',
      'Barbell & machine library',
      'Complete meal plan',
      'Weekly check-ins',
      'Private community access',
    ],
    popular: true,
    isFree: false,
    cta: 'Get Transformer',
  },
  {
    id: 'elite-beginner',
    name: 'Elite Beginner',
    price: 59,
    duration: '12 weeks',
    frequency: '5x per week',
    level: 'Full beginner system',
    features: [
      'Push / Pull / Legs + specialisation',
      '4-phase periodisation',
      'Advanced nutrition protocols',
      'Priority support',
      'Lifetime access to updates',
    ],
    popular: false,
    isFree: false,
    cta: 'Get Elite',
  },
];

// ─────────────────────────────────────────────
// FREE STARTER  (1 week · 3 days · gym-based)
// ─────────────────────────────────────────────
export const FREE_STARTER_WORKOUTS = {
  id: 'free-starter',
  name: 'Free Starter',
  weeks: [
    {
      week: 1,
      days: [
        {
          id: 'day-1',
          dayNumber: 1,
          dayName: 'Monday',
          title: 'Full Body Basics',
          warmup: {
            duration: '5 min',
            exercises: [
              { name: 'Treadmill Walk', duration: '3 min' },
              { name: 'Hip Circles', sets: 2, reps: 10 },
              { name: 'Shoulder Circles', sets: 2, reps: 10 },
            ],
          },
          mainWorkout: [
            { name: 'Goblet Squat (DB)', sets: 3, reps: 12, rest: '60 sec', tip: 'Hold DB at chest, feet shoulder-width, squat deep' },
            { name: 'Machine Chest Press', sets: 3, reps: 12, rest: '60 sec', tip: 'Keep shoulders back and down on the pad' },
            { name: 'Lat Pulldown', sets: 3, reps: 12, rest: '60 sec', tip: 'Pull bar to upper chest, lean back slightly' },
            { name: 'Plank Hold', sets: 3, reps: '30 seconds', rest: '45 sec', tip: 'Keep hips level, brace your core' },
            { name: 'Glute Bridge', sets: 3, reps: 15, rest: '45 sec', tip: 'Drive hips up, squeeze glutes at the top' },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Quad Stretch', duration: '30 sec each leg' },
              { name: 'Hamstring Stretch', duration: '30 sec each leg' },
              { name: "Child's Pose", duration: '60 sec' },
            ],
          },
        },
        {
          id: 'day-2',
          dayNumber: 2,
          dayName: 'Wednesday',
          title: 'Upper Body',
          warmup: {
            duration: '5 min',
            exercises: [
              { name: 'Bike Ride', duration: '3 min easy' },
              { name: 'Arm Swings', sets: 2, reps: 15 },
              { name: 'Shoulder Rotations', sets: 2, reps: 10 },
            ],
          },
          mainWorkout: [
            { name: 'Machine Shoulder Press', sets: 3, reps: 12, rest: '60 sec', tip: 'Full range of motion, don\'t lock elbows' },
            { name: 'Cable Tricep Pushdown', sets: 3, reps: 12, rest: '60 sec', tip: 'Keep elbows pinned to your sides' },
            { name: 'DB Bicep Curl', sets: 3, reps: 12, rest: '60 sec', tip: 'Full range, no swinging of the back' },
            { name: 'Face Pull (Cable)', sets: 3, reps: 15, rest: '45 sec', tip: 'Pull to eye level, elbows high' },
            { name: 'DB Lateral Raise', sets: 3, reps: 12, rest: '45 sec', tip: 'Lead with elbows, slight bend in arms' },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Chest Doorframe Stretch', duration: '45 sec' },
              { name: 'Tricep Stretch', duration: '30 sec each arm' },
              { name: 'Neck Side Stretch', duration: '30 sec each side' },
            ],
          },
        },
        {
          id: 'day-3',
          dayNumber: 3,
          dayName: 'Friday',
          title: 'Lower Body',
          warmup: {
            duration: '5 min',
            exercises: [
              { name: 'Elliptical', duration: '3 min easy' },
              { name: 'Leg Swings', sets: 2, reps: '15 each leg' },
              { name: 'Bodyweight Squat', sets: 2, reps: 10 },
            ],
          },
          mainWorkout: [
            { name: 'Leg Press', sets: 3, reps: 15, rest: '75 sec', tip: 'Feet shoulder-width, push through heels, don\'t lock knees' },
            { name: 'Leg Curl Machine', sets: 3, reps: 12, rest: '60 sec', tip: 'Controlled movement both ways' },
            { name: 'Leg Extension', sets: 3, reps: 12, rest: '60 sec', tip: 'Light weight first — feel the quad squeeze' },
            { name: 'Calf Raise Machine', sets: 3, reps: 20, rest: '45 sec', tip: 'Full stretch at the bottom, pause at top' },
            { name: 'Hip Abduction Machine', sets: 3, reps: 15, rest: '45 sec' },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Hamstring Stretch', duration: '45 sec each leg' },
              { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
              { name: 'Calf Stretch', duration: '30 sec each leg' },
            ],
          },
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// STARTER  ($19 · 4 weeks · 3x/week · Push/Pull/Legs)
// Phase 1 = Weeks 1-2 (Foundation 3×12-15)
// Phase 2 = Weeks 3-4 (Build 4×8-12, introduce barbell)
// ─────────────────────────────────────────────

const starterPushPhase1 = (week) => ({
  id: `w${week}-d1`,
  dayNumber: (week - 1) * 3 + 1,
  dayName: 'Monday',
  title: 'Push — Chest, Shoulders & Triceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Treadmill Walk', duration: '3 min' },
      { name: 'Chest Stretch', sets: 2, reps: '30 sec' },
      { name: 'Shoulder Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: [
    { name: 'Machine Chest Press', sets: 3, reps: 12, rest: '75 sec', tip: week === 2 ? 'Add 2.5 kg vs last week' : 'Keep chest up, control the eccentric' },
    { name: 'Incline DB Press', sets: 3, reps: 12, rest: '75 sec', tip: 'Lower slowly over 3 seconds' },
    { name: 'Machine Shoulder Press', sets: 3, reps: 12, rest: '60 sec' },
    { name: 'DB Lateral Raise', sets: 3, reps: 15, rest: '45 sec', tip: 'Lead with elbows, slight bend in arms' },
    { name: 'Cable Tricep Pushdown', sets: 3, reps: 15, rest: '45 sec', tip: 'Keep elbows pinned to sides' },
    { name: 'Pec Deck Fly', sets: 3, reps: 15, rest: '45 sec' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Chest Doorframe Stretch', duration: '45 sec' },
      { name: 'Cross-Body Shoulder Stretch', duration: '30 sec each arm' },
      { name: 'Tricep Overhead Stretch', duration: '30 sec each arm' },
    ],
  },
});

const starterPullPhase1 = (week) => ({
  id: `w${week}-d2`,
  dayNumber: (week - 1) * 3 + 2,
  dayName: 'Wednesday',
  title: 'Pull — Back & Biceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
      { name: 'Arm Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: [
    { name: 'Lat Pulldown', sets: 3, reps: 12, rest: '75 sec', tip: week === 2 ? 'Add 2.5 kg vs last week' : 'Pull to upper chest, squeeze lats at bottom' },
    { name: 'Seated Cable Row', sets: 3, reps: 12, rest: '75 sec', tip: 'Drive elbows back, keep chest up' },
    { name: 'Face Pull', sets: 3, reps: 15, rest: '45 sec', tip: 'Pull to eye level, elbows high' },
    { name: 'DB Bicep Curl', sets: 3, reps: 12, rest: '60 sec', tip: 'Full range, no swinging' },
    { name: 'DB Hammer Curl', sets: 3, reps: 12, rest: '60 sec' },
    { name: 'DB Rear Delt Raise', sets: 3, reps: 15, rest: '45 sec', tip: 'Hinge forward, arms slightly bent' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Lat Doorframe Stretch', duration: '30 sec each side' },
      { name: 'Bicep Wall Stretch', duration: '30 sec each arm' },
      { name: 'Upper Back Stretch', duration: '45 sec' },
    ],
  },
});

const starterLegsPhase1 = (week) => ({
  id: `w${week}-d3`,
  dayNumber: (week - 1) * 3 + 3,
  dayName: 'Friday',
  title: 'Legs — Quads, Hamstrings & Glutes',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Elliptical', duration: '3 min easy' },
      { name: 'Leg Swings', sets: 2, reps: '15 each leg' },
      { name: 'Bodyweight Squat', sets: 2, reps: 10 },
    ],
  },
  mainWorkout: [
    { name: 'Leg Press', sets: 3, reps: 15, rest: '90 sec', tip: week === 2 ? 'Add 5 kg vs last week' : 'Feet shoulder-width, push through heels' },
    { name: 'DB Romanian Deadlift', sets: 3, reps: 12, rest: '75 sec', tip: 'Hinge at hips, back flat, feel the hamstring stretch' },
    { name: 'Leg Curl Machine', sets: 3, reps: 12, rest: '60 sec' },
    { name: 'Leg Extension', sets: 3, reps: 12, rest: '60 sec', tip: 'Light weight — focus on the quad squeeze' },
    { name: 'Calf Raise Machine', sets: 3, reps: 20, rest: '45 sec' },
    { name: 'Plank Hold', sets: 3, reps: '30 seconds', rest: '45 sec' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Quad Stretch', duration: '30 sec each leg' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
    ],
  },
});

const starterPushPhase2 = (week) => ({
  id: `w${week}-d1`,
  dayNumber: (week - 1) * 3 + 1,
  dayName: 'Monday',
  title: 'Push — Chest, Shoulders & Triceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Treadmill Walk/Jog', duration: '3 min' },
      { name: 'Chest Stretch', sets: 2, reps: '30 sec' },
      { name: 'Shoulder Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: [
    { name: 'Barbell Bench Press', sets: 4, reps: 10, rest: '90 sec', tip: week === 4 ? 'Add 2.5 kg vs last week' : 'Arch slightly, feet flat, lower bar to lower chest' },
    { name: 'Incline DB Press', sets: 4, reps: 10, rest: '75 sec', tip: 'Control the descent, 3 seconds down' },
    { name: 'Cable Fly', sets: 4, reps: 12, rest: '60 sec', tip: 'Slight bend in elbows, squeeze chest at peak' },
    { name: 'DB Shoulder Press', sets: 4, reps: 10, rest: '75 sec' },
    { name: 'Cable Lateral Raise', sets: 4, reps: 12, rest: '45 sec' },
    { name: 'EZ Bar Skull Crusher', sets: 4, reps: 12, rest: '60 sec', tip: 'Lower bar to forehead, keep elbows pointed up' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Chest Doorframe Stretch', duration: '45 sec' },
      { name: 'Cross-Body Shoulder Stretch', duration: '30 sec each arm' },
      { name: 'Tricep Overhead Stretch', duration: '30 sec each arm' },
    ],
  },
});

const starterPullPhase2 = (week) => ({
  id: `w${week}-d2`,
  dayNumber: (week - 1) * 3 + 2,
  dayName: 'Wednesday',
  title: 'Pull — Back & Biceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
      { name: 'Arm Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: [
    { name: 'Barbell Bent-Over Row', sets: 4, reps: 10, rest: '90 sec', tip: week === 4 ? 'Add 2.5 kg vs last week' : 'Hinge to 45°, pull bar to belly, keep back flat' },
    { name: 'Lat Pulldown', sets: 4, reps: 10, rest: '75 sec', tip: 'Wide grip, pull to upper chest' },
    { name: 'Seated Cable Row', sets: 4, reps: 10, rest: '75 sec' },
    { name: 'Face Pull', sets: 4, reps: 15, rest: '45 sec' },
    { name: 'EZ Bar Bicep Curl', sets: 4, reps: 10, rest: '60 sec' },
    { name: 'DB Hammer Curl', sets: 4, reps: 12, rest: '60 sec' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Lat Doorframe Stretch', duration: '30 sec each side' },
      { name: 'Bicep Wall Stretch', duration: '30 sec each arm' },
      { name: 'Upper Back Stretch', duration: '45 sec' },
    ],
  },
});

const starterLegsPhase2 = (week) => ({
  id: `w${week}-d3`,
  dayNumber: (week - 1) * 3 + 3,
  dayName: 'Friday',
  title: 'Legs — Quads, Hamstrings & Glutes',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Elliptical', duration: '3 min easy' },
      { name: 'Leg Swings', sets: 2, reps: '15 each leg' },
      { name: 'Bodyweight Squat', sets: 2, reps: 10 },
    ],
  },
  mainWorkout: [
    { name: 'Barbell Back Squat', sets: 4, reps: 10, rest: '2 min', tip: week === 4 ? 'Add 2.5 kg vs last week' : 'Feet shoulder-width, chest up, squat to parallel' },
    { name: 'DB Romanian Deadlift', sets: 4, reps: 10, rest: '90 sec', tip: 'Feel full hamstring stretch at bottom' },
    { name: 'Leg Press', sets: 4, reps: 12, rest: '75 sec' },
    { name: 'Leg Curl Machine', sets: 4, reps: 12, rest: '60 sec' },
    { name: 'Leg Extension', sets: 4, reps: 12, rest: '60 sec' },
    { name: 'Calf Raise Machine', sets: 4, reps: 20, rest: '45 sec' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: 10, rest: '60 sec', tip: 'Keep hips level, don\'t let lower back sag' },
  ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Quad Stretch', duration: '30 sec each leg' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
    ],
  },
});

export const STARTER_WORKOUTS = {
  id: 'starter',
  name: 'Starter',
  weeks: [
    { week: 1, days: [starterPushPhase1(1), starterPullPhase1(1), starterLegsPhase1(1)] },
    { week: 2, days: [starterPushPhase1(2), starterPullPhase1(2), starterLegsPhase1(2)] },
    { week: 3, days: [starterPushPhase2(3), starterPullPhase2(3), starterLegsPhase2(3)] },
    { week: 4, days: [starterPushPhase2(4), starterPullPhase2(4), starterLegsPhase2(4)] },
  ],
};

// ─────────────────────────────────────────────
// TRANSFORMER  ($39 · 8 weeks · 4x/week · Upper/Lower)
// Schedule: Mon=Upper A (Push), Tue=Lower A, Thu=Upper B (Pull), Fri=Lower B
// Phase 1 W1-2: Foundation 3×15
// Phase 2 W3-4: Build 3×12
// Phase 3 W5-6: Strength 4×10
// Phase 4 W7-8: Peak 4×8
// ─────────────────────────────────────────────

const transformerUpperA = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d1`,
  dayNumber: (week - 1) * 4 + 1,
  dayName: 'Monday',
  title: 'Upper A — Chest, Shoulders & Triceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Treadmill Walk/Jog', duration: '3 min' },
      { name: 'Chest Stretch', sets: 2, reps: '30 sec' },
      { name: 'Shoulder Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: week <= 2
    ? [
        { name: 'Machine Chest Press', sets, reps, rest: '60 sec', tip: addWeightNote || 'Full ROM, slow eccentric (3 sec down)' },
        { name: 'Machine Incline Press', sets, reps, rest: '60 sec' },
        { name: 'Machine Shoulder Press', sets, reps, rest: '60 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec', tip: 'Lead with elbows' },
        { name: 'Cable Tricep Pushdown', sets, reps, rest: '45 sec' },
        { name: 'Pec Deck Fly', sets, reps, rest: '45 sec' },
      ]
    : week <= 4
    ? [
        { name: 'Barbell Bench Press', sets, reps, rest: '90 sec', tip: addWeightNote || 'Arch slightly, lower bar to lower chest' },
        { name: 'Incline DB Press', sets, reps, rest: '75 sec', tip: '3 seconds down' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'DB Shoulder Press', sets, reps, rest: '75 sec' },
        { name: 'Cable Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Skull Crusher', sets, reps, rest: '60 sec', tip: 'Keep elbows pointed up' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Bench Press', sets, reps, rest: '2 min', tip: addWeightNote || 'Heavy, controlled eccentric' },
        { name: 'Incline Barbell Press', sets, reps, rest: '90 sec' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'Barbell Overhead Press', sets, reps, rest: '90 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Weighted Dips', sets, reps, rest: '75 sec', tip: 'Lean forward slightly for chest focus' },
      ]
    : [
        { name: 'Barbell Bench Press', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak week — go heavy with good form' },
        { name: 'DB Incline Press', sets, reps, rest: '90 sec' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'DB Shoulder Press', sets, reps, rest: '90 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Tricep Pushdown', sets, reps, rest: '60 sec' },
        { name: 'Close-Grip Bench Press', sets, reps, rest: '75 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Chest Doorframe Stretch', duration: '45 sec' },
      { name: 'Cross-Body Shoulder Stretch', duration: '30 sec each arm' },
      { name: 'Tricep Overhead Stretch', duration: '30 sec each arm' },
    ],
  },
});

const transformerLowerA = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d2`,
  dayNumber: (week - 1) * 4 + 2,
  dayName: 'Tuesday',
  title: 'Lower A — Quads & Hamstrings',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Leg Swings', sets: 2, reps: '15 each leg' },
      { name: 'Bodyweight Squat', sets: 2, reps: 10 },
    ],
  },
  mainWorkout: week <= 2
    ? [
        { name: 'Leg Press', sets, reps, rest: '75 sec', tip: addWeightNote || 'Push through full foot' },
        { name: 'DB Romanian Deadlift', sets, reps, rest: '75 sec', tip: 'Hinge at hips, back flat' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Seated Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Plank Hold', sets, reps: '30 seconds', rest: '45 sec' },
      ]
    : week <= 4
    ? [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Chest up, squat to parallel' },
        { name: 'DB Romanian Deadlift', sets, reps, rest: '90 sec' },
        { name: 'Leg Press', sets, reps, rest: '75 sec' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Calf Raise Machine', sets, reps, rest: '45 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 10, rest: '60 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Go heavier, maintain depth' },
        { name: 'Barbell Romanian Deadlift', sets, reps, rest: '90 sec' },
        { name: 'Hack Squat', sets, reps, rest: '90 sec', tip: 'Feet high on plate for hamstring focus' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Seated Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 12, rest: '60 sec' },
      ]
    : [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest squat of the program' },
        { name: 'Barbell Romanian Deadlift', sets, reps, rest: '90 sec' },
        { name: 'Leg Press', sets, reps, rest: '90 sec' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Seated Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 12, rest: '60 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Quad Stretch', duration: '30 sec each leg' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
    ],
  },
});

const transformerUpperB = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d3`,
  dayNumber: (week - 1) * 4 + 3,
  dayName: 'Thursday',
  title: 'Upper B — Back & Biceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
      { name: 'Arm Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: week <= 2
    ? [
        { name: 'Lat Pulldown', sets, reps, rest: '60 sec', tip: addWeightNote || 'Pull to upper chest, squeeze lats' },
        { name: 'Seated Cable Row', sets, reps, rest: '60 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec', tip: 'Pull to eye level, elbows high' },
        { name: 'DB Bicep Curl', sets, reps, rest: '45 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '45 sec' },
        { name: 'DB Rear Delt Raise', sets, reps, rest: '45 sec' },
      ]
    : week <= 4
    ? [
        { name: 'Barbell Bent-Over Row', sets, reps, rest: '90 sec', tip: addWeightNote || 'Pull bar to belly, keep back flat' },
        { name: 'Lat Pulldown', sets, reps, rest: '75 sec' },
        { name: 'Seated Cable Row', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Bicep Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '60 sec' },
      ]
    : week <= 6
    ? [
        { name: 'T-Bar Row', sets, reps, rest: '90 sec', tip: addWeightNote || 'Drive elbows back, squeeze shoulder blades' },
        { name: 'Wide-Grip Lat Pulldown', sets, reps, rest: '75 sec' },
        { name: 'Seated Cable Row', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'Incline DB Curl', sets, reps, rest: '60 sec', tip: 'Full stretch at the bottom' },
        { name: 'Overhead Tricep Extension', sets, reps, rest: '60 sec' },
      ]
    : [
        { name: 'Barbell Bent-Over Row', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest row of the program' },
        { name: 'Lat Pulldown', sets, reps, rest: '75 sec' },
        { name: 'Close-Grip Seated Row', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Bicep Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '60 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Lat Doorframe Stretch', duration: '30 sec each side' },
      { name: 'Bicep Wall Stretch', duration: '30 sec each arm' },
      { name: 'Upper Back Stretch', duration: '45 sec' },
    ],
  },
});

const transformerLowerB = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d4`,
  dayNumber: (week - 1) * 4 + 4,
  dayName: 'Friday',
  title: 'Lower B — Glutes, Deadlift & Core',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Elliptical', duration: '3 min easy' },
      { name: 'Hip Circles', sets: 2, reps: 10 },
      { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each' },
    ],
  },
  mainWorkout: week <= 2
    ? [
        { name: 'DB Goblet Squat', sets, reps, rest: '75 sec', tip: addWeightNote || 'Hold DB at chest, squat deep' },
        { name: 'DB Stiff-Leg Deadlift', sets, reps, rest: '75 sec' },
        { name: 'Hip Thrust (BW or DB)', sets, reps, rest: '60 sec', tip: 'Drive hips up, squeeze glutes at top' },
        { name: 'Walking Lunges', sets, reps: '12 each leg', rest: '75 sec' },
        { name: 'Standing Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Crunch', sets, reps, rest: '45 sec' },
      ]
    : week <= 4
    ? [
        { name: 'Conventional Deadlift', sets, reps, rest: '2 min', tip: addWeightNote || 'Hinge at hips, bar close to shins, chest up' },
        { name: 'Bulgarian Split Squat', sets, reps: `${reps} each leg`, rest: '90 sec', tip: 'Rear foot elevated, front knee tracks toes' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Walking Lunges', sets, reps: '12 each leg', rest: '75 sec' },
        { name: 'Calf Raise Machine', sets, reps, rest: '45 sec' },
        { name: 'Plank Hold', sets, reps: '45 seconds', rest: '45 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Conventional Deadlift', sets, reps, rest: '2 min', tip: addWeightNote || 'Strength phase — push the weight' },
        { name: 'Bulgarian Split Squat', sets, reps: `${reps} each leg`, rest: '90 sec' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Standing Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Crunch', sets, reps, rest: '45 sec' },
      ]
    : [
        { name: 'Conventional Deadlift', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest deadlift of the program' },
        { name: 'Bulgarian Split Squat', sets, reps: `${reps} each leg`, rest: '90 sec' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Seated Calf Raise', sets, reps, rest: '45 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 12, rest: '60 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
      { name: 'Glute Figure-4 Stretch', duration: '45 sec each side' },
    ],
  },
});

export const TRANSFORMER_WORKOUTS = {
  id: 'transformer',
  name: 'Transformer',
  weeks: [
    { week: 1, days: [transformerUpperA(1,3,15,null), transformerLowerA(1,3,15,null), transformerUpperB(1,3,15,null), transformerLowerB(1,3,15,null)] },
    { week: 2, days: [transformerUpperA(2,3,15,'Add 2.5 kg vs Week 1'), transformerLowerA(2,3,15,'Add 5 kg vs Week 1'), transformerUpperB(2,3,15,'Add 2.5 kg vs Week 1'), transformerLowerB(2,3,15,'Add 2.5 kg vs Week 1')] },
    { week: 3, days: [transformerUpperA(3,3,12,null), transformerLowerA(3,3,12,null), transformerUpperB(3,3,12,null), transformerLowerB(3,3,12,null)] },
    { week: 4, days: [transformerUpperA(4,3,12,'Add 2.5 kg vs Week 3'), transformerLowerA(4,3,12,'Add 5 kg vs Week 3'), transformerUpperB(4,3,12,'Add 2.5 kg vs Week 3'), transformerLowerB(4,3,12,'Add 2.5 kg vs Week 3')] },
    { week: 5, days: [transformerUpperA(5,4,10,null), transformerLowerA(5,4,10,null), transformerUpperB(5,4,10,null), transformerLowerB(5,4,10,null)] },
    { week: 6, days: [transformerUpperA(6,4,10,'Add 2.5 kg vs Week 5'), transformerLowerA(6,4,10,'Add 5 kg vs Week 5'), transformerUpperB(6,4,10,'Add 2.5 kg vs Week 5'), transformerLowerB(6,4,10,'Add 2.5 kg vs Week 5')] },
    { week: 7, days: [transformerUpperA(7,4,8,null), transformerLowerA(7,4,8,null), transformerUpperB(7,4,8,null), transformerLowerB(7,4,8,null)] },
    { week: 8, days: [transformerUpperA(8,4,8,'Add 2.5 kg vs Week 7'), transformerLowerA(8,4,8,'Add 5 kg vs Week 7'), transformerUpperB(8,4,8,'Add 2.5 kg vs Week 7'), transformerLowerB(8,4,8,'Add 2.5 kg vs Week 7')] },
  ],
};

// ─────────────────────────────────────────────
// ELITE BEGINNER  ($59 · 12 weeks · 5x/week · PPL+)
// Schedule: Mon=Push, Tue=Pull, Wed=Legs, Thu=Shoulders+Arms, Fri=Full Body
// Phase 1 W1-3: Foundation 3×15 (machine-based)
// Phase 2 W4-6: Build 4×12 (free weights introduced)
// Phase 3 W7-9: Strength 4×10 (barbell focus)
// Phase 4 W10-12: Peak 5×8 (advanced compounds)
// ─────────────────────────────────────────────

const elitePush = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d1`,
  dayNumber: (week - 1) * 5 + 1,
  dayName: 'Monday',
  title: 'Push — Chest, Shoulders & Triceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Treadmill Walk/Jog', duration: '3 min' },
      { name: 'Chest Stretch', sets: 2, reps: '30 sec' },
      { name: 'Shoulder Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: week <= 3
    ? [
        { name: 'Machine Chest Press', sets, reps, rest: '60 sec', tip: addWeightNote || 'Focus on slow eccentric — 3 seconds down' },
        { name: 'Machine Incline Press', sets, reps, rest: '60 sec' },
        { name: 'Pec Deck Fly', sets, reps, rest: '45 sec' },
        { name: 'Machine Shoulder Press', sets, reps, rest: '60 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec', tip: 'Lead with elbows' },
        { name: 'Cable Tricep Pushdown', sets, reps, rest: '45 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Bench Press', sets, reps, rest: '90 sec', tip: addWeightNote || 'Arch slightly, feet flat, lower to chest' },
        { name: 'DB Incline Press', sets, reps, rest: '75 sec' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'DB Shoulder Press', sets, reps, rest: '75 sec' },
        { name: 'Cable Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Skull Crusher', sets, reps, rest: '60 sec', tip: 'Elbows pointed up, controlled' },
        { name: 'Cable Tricep Pushdown', sets, reps, rest: '45 sec' },
      ]
    : week <= 9
    ? [
        { name: 'Barbell Bench Press', sets, reps, rest: '2 min', tip: addWeightNote || 'Strength phase — push the weight up' },
        { name: 'Incline Barbell Press', sets, reps, rest: '90 sec' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'Barbell Overhead Press', sets, reps, rest: '90 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Weighted Dips', sets, reps, rest: '75 sec', tip: 'Lean forward for chest' },
        { name: 'Tricep Pushdown', sets, reps, rest: '45 sec' },
      ]
    : [
        { name: 'Barbell Bench Press', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest bench of the program' },
        { name: 'DB Incline Press', sets, reps, rest: '90 sec' },
        { name: 'Cable Fly', sets, reps, rest: '60 sec' },
        { name: 'Heavy Barbell OHP', sets, reps, rest: '90 sec' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Weighted Dips', sets, reps, rest: '75 sec' },
        { name: 'Close-Grip Bench Press', sets, reps, rest: '75 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Chest Doorframe Stretch', duration: '45 sec' },
      { name: 'Cross-Body Shoulder Stretch', duration: '30 sec each arm' },
      { name: 'Tricep Overhead Stretch', duration: '30 sec each arm' },
    ],
  },
});

const elitePull = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d2`,
  dayNumber: (week - 1) * 5 + 2,
  dayName: 'Tuesday',
  title: 'Pull — Back & Biceps',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
      { name: 'Arm Circles', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: week <= 3
    ? [
        { name: 'Lat Pulldown', sets, reps, rest: '60 sec', tip: addWeightNote || 'Pull to upper chest, squeeze lats' },
        { name: 'Seated Cable Row', sets, reps, rest: '60 sec', tip: 'Drive elbows back, keep chest up' },
        { name: 'Face Pull', sets, reps, rest: '45 sec', tip: 'Elbows high, pull to eye level' },
        { name: 'DB Bicep Curl', sets, reps, rest: '45 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '45 sec' },
        { name: 'Rear Delt Machine', sets, reps, rest: '45 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Bent-Over Row', sets, reps, rest: '90 sec', tip: addWeightNote || 'Pull to belly, back flat at 45°' },
        { name: 'Lat Pulldown', sets, reps, rest: '75 sec' },
        { name: 'Seated Cable Row', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Bicep Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Rear Delt Raise', sets, reps, rest: '45 sec' },
      ]
    : week <= 9
    ? [
        { name: 'Conventional Deadlift', sets, reps, rest: '2 min', tip: addWeightNote || 'Hinge at hips, bar close to body' },
        { name: 'Weighted Pull-ups', sets, reps, rest: '90 sec', tip: 'Use assisted machine if needed' },
        { name: 'T-Bar Row', sets, reps, rest: '90 sec' },
        { name: 'Lat Pulldown', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'EZ Bar Bicep Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '60 sec' },
      ]
    : [
        { name: 'Conventional Deadlift', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest deadlift of the program' },
        { name: 'Weighted Pull-ups', sets, reps, rest: '90 sec' },
        { name: 'Barbell Bent-Over Row', sets, reps, rest: '90 sec' },
        { name: 'T-Bar Row', sets, reps, rest: '75 sec' },
        { name: 'Face Pull', sets, reps, rest: '45 sec' },
        { name: 'Preacher Curl', sets, reps, rest: '60 sec' },
        { name: 'DB Hammer Curl', sets, reps, rest: '60 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Lat Doorframe Stretch', duration: '30 sec each side' },
      { name: 'Bicep Wall Stretch', duration: '30 sec each arm' },
      { name: 'Upper Back Stretch', duration: '45 sec' },
    ],
  },
});

const eliteLegs = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d3`,
  dayNumber: (week - 1) * 5 + 3,
  dayName: 'Wednesday',
  title: 'Legs — Full Lower Body',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Elliptical', duration: '3 min easy' },
      { name: 'Leg Swings', sets: 2, reps: '15 each leg' },
      { name: 'Bodyweight Squat', sets: 2, reps: 10 },
    ],
  },
  mainWorkout: week <= 3
    ? [
        { name: 'Leg Press', sets, reps, rest: '75 sec', tip: addWeightNote || 'Push through full foot, controlled eccentric' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec', tip: 'Squeeze quad at top' },
        { name: 'Hip Thrust (Bodyweight)', sets, reps, rest: '60 sec', tip: 'Drive hips up, squeeze glutes at top' },
        { name: 'Calf Raise Machine', sets, reps, rest: '45 sec' },
        { name: 'Plank Hold', sets, reps: '30 seconds', rest: '45 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Chest up, squat to parallel' },
        { name: 'DB Romanian Deadlift', sets, reps, rest: '90 sec', tip: 'Feel full hamstring stretch' },
        { name: 'Leg Press', sets, reps, rest: '75 sec' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Calf Raise Machine', sets, reps, rest: '45 sec' },
      ]
    : week <= 9
    ? [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Strength phase — heavier than last phase' },
        { name: 'Barbell Romanian Deadlift', sets, reps, rest: '90 sec' },
        { name: 'Hack Squat', sets, reps, rest: '90 sec', tip: 'High feet for hamstring focus' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Seated Calf Raise', sets, reps, rest: '45 sec' },
      ]
    : [
        { name: 'Barbell Back Squat', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest squat of the program' },
        { name: 'Barbell Romanian Deadlift', sets, reps, rest: '90 sec' },
        { name: 'Hack Squat', sets, reps, rest: '90 sec' },
        { name: 'Leg Curl Machine', sets, reps, rest: '60 sec' },
        { name: 'Leg Extension', sets, reps, rest: '60 sec' },
        { name: 'Hip Thrust (Barbell)', sets, reps, rest: '75 sec' },
        { name: 'Standing + Seated Calf Raise', sets, reps, rest: '45 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Quad Stretch', duration: '30 sec each leg' },
      { name: 'Glute Figure-4 Stretch', duration: '45 sec each side' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
    ],
  },
});

const eliteShoulders = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d4`,
  dayNumber: (week - 1) * 5 + 4,
  dayName: 'Thursday',
  title: 'Shoulders & Arms Specialisation',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Bike Ride', duration: '3 min easy' },
      { name: 'Shoulder Circles', sets: 2, reps: 15 },
      { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
    ],
  },
  mainWorkout: week <= 3
    ? [
        { name: 'Machine Shoulder Press', sets, reps, rest: '60 sec', tip: addWeightNote || 'Full range, control the weight' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Front Raise', sets, reps, rest: '45 sec' },
        { name: 'Rear Delt Fly Machine', sets, reps, rest: '45 sec' },
        { name: 'DB Preacher Curl', sets, reps, rest: '60 sec', tip: 'Full stretch at bottom' },
        { name: 'Cable Tricep Extension', sets, reps, rest: '60 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Overhead Press', sets, reps, rest: '90 sec', tip: addWeightNote || 'Brace core, press in straight line' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Front Raise', sets, reps, rest: '45 sec' },
        { name: 'DB Rear Delt Raise', sets, reps, rest: '45 sec', tip: 'Hinge forward, control the movement' },
        { name: 'Preacher Curl (EZ Bar)', sets, reps, rest: '60 sec' },
        { name: 'Overhead Tricep Extension', sets, reps, rest: '60 sec' },
        { name: 'Dips', sets, reps, rest: '75 sec' },
      ]
    : week <= 9
    ? [
        { name: 'Barbell Overhead Press', sets, reps, rest: '90 sec', tip: addWeightNote || 'Heavy pressing — push the weight' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Front Raise', sets, reps, rest: '45 sec' },
        { name: 'DB Rear Delt Raise', sets, reps, rest: '45 sec' },
        { name: 'Preacher Curl (EZ Bar)', sets, reps, rest: '60 sec' },
        { name: 'EZ Bar Skull Crusher', sets, reps, rest: '60 sec' },
        { name: 'Weighted Dips', sets, reps, rest: '75 sec' },
      ]
    : [
        { name: 'Heavy Barbell OHP', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak — heaviest OHP of the program' },
        { name: 'DB Lateral Raise', sets, reps, rest: '45 sec' },
        { name: 'Cable Front Raise', sets, reps, rest: '45 sec' },
        { name: 'Rear Delt Fly Machine', sets, reps, rest: '45 sec' },
        { name: 'Preacher Curl (EZ Bar)', sets, reps, rest: '60 sec' },
        { name: 'EZ Bar Skull Crusher', sets, reps, rest: '60 sec' },
        { name: 'Overhead Tricep Extension', sets, reps, rest: '60 sec' },
      ],
  cooldown: {
    duration: '5 min',
    exercises: [
      { name: 'Cross-Body Shoulder Stretch', duration: '30 sec each arm' },
      { name: 'Bicep Wall Stretch', duration: '30 sec each arm' },
      { name: 'Tricep Overhead Stretch', duration: '30 sec each arm' },
      { name: 'Neck Side Stretch', duration: '30 sec each side' },
    ],
  },
});

const eliteFullBody = (week, sets, reps, addWeightNote) => ({
  id: `w${week}-d5`,
  dayNumber: (week - 1) * 5 + 5,
  dayName: 'Friday',
  title: week >= 10 ? 'Peak Conditioning & Compounds' : 'Full Body & Conditioning',
  warmup: {
    duration: '5 min',
    exercises: [
      { name: 'Treadmill Jog', duration: '3 min moderate' },
      { name: 'Hip Circles', sets: 2, reps: 10 },
      { name: 'Arm Circles', sets: 2, reps: 10 },
    ],
  },
  mainWorkout: week <= 3
    ? [
        { name: 'DB Goblet Squat', sets, reps, rest: '75 sec', tip: addWeightNote || 'Hold DB at chest, squat deep' },
        { name: 'DB One-Arm Row', sets, reps: `${reps} each side`, rest: '75 sec' },
        { name: 'DB Bench Press', sets, reps, rest: '75 sec' },
        { name: 'DB Romanian Deadlift', sets, reps, rest: '75 sec' },
        { name: 'Plank Hold', sets, reps: '30 seconds', rest: '45 sec' },
        { name: 'Mountain Climbers', sets, reps: '20 each leg', rest: '45 sec' },
      ]
    : week <= 6
    ? [
        { name: 'Barbell Back Squat (light)', sets, reps, rest: '90 sec', tip: addWeightNote || 'Lighter than Wed — focus on technique' },
        { name: 'Conventional Deadlift (light)', sets, reps, rest: '90 sec' },
        { name: 'Pull-ups or Assisted Pull-ups', sets, reps, rest: '90 sec' },
        { name: 'DB Bench Press', sets, reps, rest: '75 sec' },
        { name: 'Cable Core Rotation', sets, reps: '12 each side', rest: '45 sec' },
        { name: 'HIIT Treadmill', sets: 1, reps: '10 min (30s sprint / 30s walk)', rest: '—' },
      ]
    : week <= 9
    ? [
        { name: 'Barbell Back Squat (moderate)', sets, reps, rest: '2 min', tip: addWeightNote || 'Moderate load — volume day' },
        { name: 'Barbell Deadlift (moderate)', sets, reps, rest: '2 min' },
        { name: 'Weighted Pull-ups', sets, reps, rest: '90 sec' },
        { name: 'Barbell Bench Press (moderate)', sets, reps, rest: '90 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 12, rest: '60 sec' },
        { name: 'HIIT Bike', sets: 1, reps: '12 min (40s hard / 20s easy)', rest: '—' },
      ]
    : [
        { name: 'Barbell Back Squat (heavy)', sets, reps, rest: '2 min', tip: addWeightNote || 'Peak week — go heavy across the board' },
        { name: 'Conventional Deadlift (heavy)', sets, reps, rest: '2 min' },
        { name: 'Weighted Pull-ups', sets, reps, rest: '90 sec' },
        { name: 'Barbell Bench Press (heavy)', sets, reps, rest: '90 sec' },
        { name: 'Ab Wheel Rollout', sets, reps: 15, rest: '60 sec' },
        { name: 'HIIT Treadmill', sets: 1, reps: '15 min (45s sprint / 15s walk)', rest: '—' },
      ],
  cooldown: {
    duration: '7 min',
    exercises: [
      { name: 'Full-Body Foam Roll', duration: '3 min' },
      { name: 'Hamstring Stretch', duration: '45 sec each leg' },
      { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
      { name: 'Child\'s Pose', duration: '60 sec' },
    ],
  },
});

export const ELITE_WORKOUTS = {
  id: 'elite-beginner',
  name: 'Elite Beginner',
  weeks: [
    // Phase 1 – Foundation (W1-3) 3×15
    { week: 1,  days: [elitePush(1,3,15,null), elitePull(1,3,15,null), eliteLegs(1,3,15,null), eliteShoulders(1,3,15,null), eliteFullBody(1,3,15,null)] },
    { week: 2,  days: [elitePush(2,3,15,'Add 2.5 kg vs W1'), elitePull(2,3,15,'Add 2.5 kg vs W1'), eliteLegs(2,3,15,'Add 5 kg vs W1'), eliteShoulders(2,3,15,'Add 2.5 kg vs W1'), eliteFullBody(2,3,15,'Add 2.5 kg vs W1')] },
    { week: 3,  days: [elitePush(3,3,15,'Add 2.5 kg vs W2'), elitePull(3,3,15,'Add 2.5 kg vs W2'), eliteLegs(3,3,15,'Add 5 kg vs W2'), eliteShoulders(3,3,15,'Add 2.5 kg vs W2'), eliteFullBody(3,3,15,'Add 2.5 kg vs W2')] },
    // Phase 2 – Build (W4-6) 4×12
    { week: 4,  days: [elitePush(4,4,12,null), elitePull(4,4,12,null), eliteLegs(4,4,12,null), eliteShoulders(4,4,12,null), eliteFullBody(4,4,12,null)] },
    { week: 5,  days: [elitePush(5,4,12,'Add 2.5 kg vs W4'), elitePull(5,4,12,'Add 2.5 kg vs W4'), eliteLegs(5,4,12,'Add 5 kg vs W4'), eliteShoulders(5,4,12,'Add 2.5 kg vs W4'), eliteFullBody(5,4,12,'Add 2.5 kg vs W4')] },
    { week: 6,  days: [elitePush(6,4,12,'Add 2.5 kg vs W5'), elitePull(6,4,12,'Add 2.5 kg vs W5'), eliteLegs(6,4,12,'Add 5 kg vs W5'), eliteShoulders(6,4,12,'Add 2.5 kg vs W5'), eliteFullBody(6,4,12,'Add 2.5 kg vs W5')] },
    // Phase 3 – Strength (W7-9) 4×10
    { week: 7,  days: [elitePush(7,4,10,null), elitePull(7,4,10,null), eliteLegs(7,4,10,null), eliteShoulders(7,4,10,null), eliteFullBody(7,4,10,null)] },
    { week: 8,  days: [elitePush(8,4,10,'Add 2.5 kg vs W7'), elitePull(8,4,10,'Add 2.5 kg vs W7'), eliteLegs(8,4,10,'Add 5 kg vs W7'), eliteShoulders(8,4,10,'Add 2.5 kg vs W7'), eliteFullBody(8,4,10,'Add 2.5 kg vs W7')] },
    { week: 9,  days: [elitePush(9,4,10,'Add 2.5 kg vs W8'), elitePull(9,4,10,'Add 2.5 kg vs W8'), eliteLegs(9,4,10,'Add 5 kg vs W8'), eliteShoulders(9,4,10,'Add 2.5 kg vs W8'), eliteFullBody(9,4,10,'Add 2.5 kg vs W8')] },
    // Phase 4 – Peak (W10-12) 5×8
    { week: 10, days: [elitePush(10,5,8,null), elitePull(10,5,8,null), eliteLegs(10,5,8,null), eliteShoulders(10,5,8,null), eliteFullBody(10,5,8,null)] },
    { week: 11, days: [elitePush(11,5,8,'Add 2.5 kg vs W10'), elitePull(11,5,8,'Add 2.5 kg vs W10'), eliteLegs(11,5,8,'Add 5 kg vs W10'), eliteShoulders(11,5,8,'Add 2.5 kg vs W10'), eliteFullBody(11,5,8,'Add 2.5 kg vs W10')] },
    { week: 12, days: [elitePush(12,5,8,'Add 2.5 kg vs W11'), elitePull(12,5,8,'Add 2.5 kg vs W11'), eliteLegs(12,5,8,'Add 5 kg vs W11'), eliteShoulders(12,5,8,'Add 2.5 kg vs W11'), eliteFullBody(12,5,8,'Add 2.5 kg vs W11')] },
  ],
};
