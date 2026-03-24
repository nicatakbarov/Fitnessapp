import { Capacitor } from '@capacitor/core';

const isIOS = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

const getPlugin = async () => {
  if (!isIOS()) return null;
  const { CapacitorHealthkit } = await import('@perfood/capacitor-healthkit');
  return CapacitorHealthkit;
};

const READ_PERMISSIONS = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierHeartRate',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierBodyMass',
  'HKWorkoutTypeIdentifier',
];

export const requestHealthPermissions = async () => {
  const plugin = await getPlugin();
  if (!plugin) return false;
  try {
    await plugin.requestAuthorization({ all: [], read: READ_PERMISSIONS, write: [] });
    return true;
  } catch (e) {
    console.error('HealthKit permission error:', e);
    return false;
  }
};

export const getTodaySteps = async () => {
  const plugin = await getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKQuantityTypeIdentifierStepCount',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    return Math.round((res.resultData || []).reduce((s, r) => s + (r.value || 0), 0));
  } catch { return null; }
};

export const getTodayCalories = async () => {
  const plugin = await getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKQuantityTypeIdentifierActiveEnergyBurned',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    return Math.round((res.resultData || []).reduce((s, r) => s + (r.value || 0), 0));
  } catch { return null; }
};

export const getLatestHeartRate = async () => {
  const plugin = await getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKQuantityTypeIdentifierHeartRate',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    const data = res.resultData || [];
    if (!data.length) return null;
    return Math.round(data[data.length - 1].value);
  } catch { return null; }
};

export const getWorkoutCaloriesAndHR = async (workoutStart) => {
  const plugin = await getPlugin();
  if (!plugin) return { calories: null, avgHeartRate: null };
  try {
    const start = workoutStart.toISOString();
    const end = new Date().toISOString();
    const [calRes, hrRes] = await Promise.all([
      plugin.queryHKitSampleType({ sampleName: 'HKQuantityTypeIdentifierActiveEnergyBurned', startDate: start, endDate: end, limit: 0 }),
      plugin.queryHKitSampleType({ sampleName: 'HKQuantityTypeIdentifierHeartRate', startDate: start, endDate: end, limit: 0 }),
    ]);
    const calories = Math.round((calRes.resultData || []).reduce((s, r) => s + (r.value || 0), 0)) || null;
    const hrData = hrRes.resultData || [];
    const avgHeartRate = hrData.length
      ? Math.round(hrData.reduce((s, r) => s + r.value, 0) / hrData.length)
      : null;
    return { calories, avgHeartRate };
  } catch { return { calories: null, avgHeartRate: null }; }
};

export const getSleepLast7Days = async () => {
  const plugin = await getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setDate(start.getDate() - 7);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKCategoryTypeIdentifierSleepAnalysis',
      startDate: start.toISOString(), endDate: end.toISOString(), limit: 0,
    });
    const nights = {};
    for (const r of (res.resultData || [])) {
      if (r.value === 1) { // Asleep
        const key = new Date(r.startDate).toISOString().split('T')[0];
        const mins = (new Date(r.endDate) - new Date(r.startDate)) / 60000;
        nights[key] = (nights[key] || 0) + mins;
      }
    }
    return Object.entries(nights)
      .map(([date, mins]) => ({ date, hours: +(mins / 60).toFixed(1) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch { return []; }
};

export const getWeightHistory = async () => {
  const plugin = await getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setMonth(start.getMonth() - 6);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKQuantityTypeIdentifierBodyMass',
      startDate: start.toISOString(), endDate: end.toISOString(), limit: 0,
    });
    return (res.resultData || []).map(r => ({
      date: r.startDate,
      weight: +r.value.toFixed(1),
    }));
  } catch { return []; }
};

const WORKOUT_TYPE_NAMES = {
  1: 'American Football', 2: 'Archery', 3: 'Australian Football', 4: 'Badminton',
  5: 'Baseball', 6: 'Basketball', 7: 'Bowling', 8: 'Boxing',
  9: 'Climbing', 10: 'Cricket', 11: 'Cross Training', 12: 'Curling',
  13: 'Cycling', 16: 'Elliptical', 17: 'Equestrian Sports', 18: 'Fencing',
  19: 'Fishing', 20: 'Functional Strength Training', 21: 'Golf', 22: 'Gymnastics',
  23: 'Handball', 24: 'Hiking', 25: 'Hockey', 26: 'Hunting',
  27: 'Lacrosse', 28: 'Martial Arts', 29: 'Mind and Body', 31: 'Paddle Sports',
  32: 'Play', 33: 'Preparation and Recovery', 34: 'Racquetball', 35: 'Rowing',
  36: 'Rugby', 37: 'Running', 38: 'Sailing', 39: 'Skating Sports',
  40: 'Snow Sports', 41: 'Soccer', 42: 'Softball', 43: 'Squash',
  44: 'Stair Climbing', 45: 'Surfing Sports', 46: 'Swimming', 47: 'Table Tennis',
  48: 'Tennis', 49: 'Track and Field', 50: 'Traditional Strength Training',
  51: 'Volleyball', 52: 'Walking', 53: 'Water Fitness', 54: 'Water Polo',
  55: 'Water Sports', 56: 'Wrestling', 57: 'Yoga', 3000: 'Other',
};

export const getAppleWatchWorkouts = async () => {
  const plugin = await getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setDate(start.getDate() - 30);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'HKWorkoutTypeIdentifier',
      startDate: start.toISOString(), endDate: end.toISOString(), limit: 10,
    });
    return (res.resultData || [])
      .map(r => ({
        type: WORKOUT_TYPE_NAMES[r.workoutActivityType] || 'Workout',
        startDate: r.startDate,
        duration: Math.round((new Date(r.endDate) - new Date(r.startDate)) / 60000),
        calories: r.totalEnergyBurned ? Math.round(r.totalEnergyBurned) : null,
        distance: r.totalDistance ? +(r.totalDistance / 1000).toFixed(2) : null,
      }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch { return []; }
};
