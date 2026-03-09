// Shared program data for the app
export const PROGRAMS = [
  {
    id: 'free-starter',
    name: 'Free Starter',
    price: 0,
    duration: '1 week',
    frequency: '3x per week',
    level: 'Beginner',
    location: 'gym',
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
    price: 0,
    duration: '4 weeks',
    frequency: '3x per week',
    level: 'Beginner',
    location: 'gym',
    features: [
      'Basic movements library',
      'Warm-up & cool-down routines',
      'Beginner nutrition guide',
      'Email support',
    ],
    popular: false,
    isFree: true,
    cta: 'Get Free Access',
  },
  {
    id: 'transformer',
    name: 'Transformer',
    price: 0,
    duration: '8 weeks',
    frequency: '4x per week',
    level: 'Beginner–Intermediate',
    location: 'gym',
    features: [
      'Progressive overload system',
      'Full workout video library',
      'Complete meal plan',
      'Weekly check-ins',
      'Private community access',
    ],
    popular: true,
    isFree: true,
    cta: 'Get Free Access',
  },
  {
    id: 'elite-beginner',
    name: 'Elite Beginner',
    price: 0,
    duration: '12 weeks',
    frequency: '5x per week',
    level: 'Full beginner system',
    location: 'gym',
    features: [
      'Complete transformation system',
      '1-on-1 style video guidance',
      'Advanced nutrition protocols',
      'Priority support',
      'Lifetime access to updates',
    ],
    popular: false,
    isFree: true,
    cta: 'Get Free Access',
  },
  {
    id: 'home-starter',
    name: 'FitStart @ Home',
    price: 0,
    duration: '4 weeks',
    frequency: '3x per week',
    level: 'Beginner',
    location: 'home',
    features: [
      'Full bodyweight system',
      'No equipment needed',
      'Progressive difficulty',
      'Video form guidance',
      'Nutrition for home success',
    ],
    popular: false,
    isFree: true,
    cta: 'Get Free Access',
  },
];

import { ALL_PROGRAMS_CONTENT } from './workoutContent';

// Helper to get workout content for a specific program
export const getProgramContent = (programId) => {
  return ALL_PROGRAMS_CONTENT[programId] || null;
};

// For backward compatibility (if needed)
export const FREE_STARTER_WORKOUTS = ALL_PROGRAMS_CONTENT['free-starter'];
