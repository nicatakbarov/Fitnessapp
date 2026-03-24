import { Capacitor } from '@capacitor/core';

const isIOS = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

// Module-level cache — prevents thenable trap when returning plugin proxy from async fn
let _hkPlugin = null;

const initPlugin = async () => {
  if (_hkPlugin !== null) return;
  if (!isIOS()) return;
  try {
    const mod = await import('@perfood/capacitor-healthkit');
    // Wrap in plain object to break thenable chain
    _hkPlugin = { instance: mod.CapacitorHealthkit };
    console.log('[HealthKit] Plugin initialized');
  } catch (e) {
    console.error('[HealthKit] Plugin import failed:', e);
    _hkPlugin = { instance: null };
  }
};

const getPlugin = () => _hkPlugin?.instance || null;

const READ_PERMISSIONS = ['steps', 'calories', 'heartRate', 'activity', 'weight'];

export const requestHealthPermissions = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    console.log('[HealthKit] Requesting permissions...');
    await plugin.requestAuthorization({ all: [], read: READ_PERMISSIONS, write: [] });
    console.log('[HealthKit] Permissions granted');
    return true;
  } catch (e) {
    console.error('[HealthKit] Permission error:', e.message || String(e));
    return false;
  }
};

export const getTodaySteps = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'stepCount',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    return Math.round((res.resultData || []).reduce((s, r) => s + (r.value || 0), 0));
  } catch (e) {
    console.error('[HealthKit] steps error:', e.message || String(e));
    return null;
  }
};

export const getTodayCalories = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'activeEnergyBurned',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    return Math.round((res.resultData || []).reduce((s, r) => s + (r.value || 0), 0));
  } catch (e) {
    console.error('[HealthKit] calories error:', e.message || String(e));
    return null;
  }
};

export const getLatestHeartRate = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'heartRate',
      startDate: start.toISOString(), endDate: new Date().toISOString(), limit: 0,
    });
    const data = res.resultData || [];
    if (!data.length) return null;
    return Math.round(data[data.length - 1].value);
  } catch (e) {
    console.error('[HealthKit] heartRate error:', e.message || String(e));
    return null;
  }
};

export const getWorkoutCaloriesAndHR = async (workoutStart) => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return { calories: null, avgHeartRate: null };
  try {
    const start = workoutStart.toISOString();
    const end = new Date().toISOString();
    const [calRes, hrRes] = await Promise.all([
      plugin.queryHKitSampleType({ sampleName: 'activeEnergyBurned', startDate: start, endDate: end, limit: 0 }),
      plugin.queryHKitSampleType({ sampleName: 'heartRate', startDate: start, endDate: end, limit: 0 }),
    ]);
    const calories = Math.round((calRes.resultData || []).reduce((s, r) => s + (r.value || 0), 0)) || null;
    const hrData = hrRes.resultData || [];
    const avgHeartRate = hrData.length
      ? Math.round(hrData.reduce((s, r) => s + r.value, 0) / hrData.length)
      : null;
    return { calories, avgHeartRate };
  } catch (e) {
    console.error('[HealthKit] workout stats error:', e.message || String(e));
    return { calories: null, avgHeartRate: null };
  }
};

export const getSleepLast7Days = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setDate(start.getDate() - 7);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'sleepAnalysis',
      startDate: start.toISOString(), endDate: end.toISOString(), limit: 0,
    });
    const nights = {};
    for (const r of (res.resultData || [])) {
      if (r.value === 1) {
        const key = new Date(r.startDate).toISOString().split('T')[0];
        const mins = (new Date(r.endDate) - new Date(r.startDate)) / 60000;
        nights[key] = (nights[key] || 0) + mins;
      }
    }
    return Object.entries(nights)
      .map(([date, mins]) => ({ date, hours: +(mins / 60).toFixed(1) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    console.error('[HealthKit] sleep error:', e.message || String(e));
    return [];
  }
};

export const getWeightHistory = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setMonth(start.getMonth() - 6);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'weight',
      startDate: start.toISOString(), endDate: end.toISOString(), limit: 0,
    });
    return (res.resultData || []).map(r => ({
      date: r.startDate,
      weight: +r.value.toFixed(1),
    }));
  } catch (e) {
    console.error('[HealthKit] weight error:', e.message || String(e));
    return [];
  }
};

const WORKOUT_TYPE_NAMES = {
  1: 'American Football', 2: 'Archery', 3: 'Australian Football', 4: 'Badminton',
  5: 'Baseball', 6: 'Basketball', 7: 'Bowling', 8: 'Boxing',
  9: 'Climbing', 10: 'Cricket', 11: 'Cross Training', 12: 'Curling',
  13: 'Cycling', 16: 'Elliptical', 20: 'Functional Strength', 21: 'Golf',
  24: 'Hiking', 37: 'Running', 46: 'Swimming', 50: 'Traditional Strength',
  52: 'Walking', 57: 'Yoga', 3000: 'Other',
};

export const getAppleWatchWorkouts = async () => {
  await initPlugin();
  const plugin = getPlugin();
  if (!plugin) return [];
  try {
    const end = new Date();
    const start = new Date(); start.setDate(start.getDate() - 30);
    const res = await plugin.queryHKitSampleType({
      sampleName: 'workoutType',
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
  } catch (e) {
    console.error('[HealthKit] workouts error:', e.message || String(e));
    return [];
  }
};
