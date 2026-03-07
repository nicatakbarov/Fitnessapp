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
      '3 sample workouts',
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
      'Basic movements library',
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
      'Progressive overload system',
      'Full workout video library',
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
      'Complete transformation system',
      '1-on-1 style video guidance',
      'Advanced nutrition protocols',
      'Priority support',
      'Lifetime access to updates',
    ],
    popular: false,
    isFree: false,
    cta: 'Get Elite',
  },
];

// Free Starter workout content
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
              { name: 'Jumping Jacks', sets: 2, reps: 20 },
              { name: 'Arm Circles', sets: 2, reps: 15 },
            ],
          },
          mainWorkout: [
            {
              name: 'Push-ups',
              sets: 3,
              reps: 10,
              rest: '60 sec',
              tip: 'Do on knees if needed',
            },
            {
              name: 'Bodyweight Squats',
              sets: 3,
              reps: 15,
              rest: '60 sec',
            },
            {
              name: 'Plank Hold',
              sets: 3,
              reps: '20 seconds',
              rest: '45 sec',
            },
            {
              name: 'Glute Bridges',
              sets: 3,
              reps: 12,
              rest: '45 sec',
            },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Standing Quad Stretch', duration: '30 sec each leg' },
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
              { name: 'Shoulder Rotations', sets: 2, reps: 15 },
              { name: 'Neck Stretches', duration: '30 sec each side' },
            ],
          },
          mainWorkout: [
            {
              name: 'Pike Push-ups',
              sets: 3,
              reps: 8,
              rest: '60 sec',
            },
            {
              name: 'Tricep Dips (Chair)',
              sets: 3,
              reps: 10,
              rest: '60 sec',
            },
            {
              name: 'Superman Hold',
              sets: 3,
              reps: 12,
              rest: '45 sec',
            },
            {
              name: 'Wall Push-ups',
              sets: 3,
              reps: 15,
              rest: '45 sec',
            },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Chest Stretch', duration: '45 sec' },
              { name: 'Tricep Stretch', duration: '30 sec each arm' },
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
              { name: 'High Knees', sets: 2, reps: 20 },
              { name: 'Leg Swings', reps: '15 each leg' },
            ],
          },
          mainWorkout: [
            {
              name: 'Lunges',
              sets: 3,
              reps: '10 each leg',
              rest: '60 sec',
            },
            {
              name: 'Wall Sit',
              sets: 3,
              reps: '30 seconds',
              rest: '60 sec',
            },
            {
              name: 'Calf Raises',
              sets: 3,
              reps: 20,
              rest: '45 sec',
            },
            {
              name: 'Donkey Kicks',
              sets: 3,
              reps: '15 each leg',
              rest: '45 sec',
            },
          ],
          cooldown: {
            duration: '5 min',
            exercises: [
              { name: 'Hamstring Stretch', duration: '45 sec each leg' },
              { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
            ],
          },
        },
      ],
    },
  ],
};
