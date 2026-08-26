const DAY_MS = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_GOAL = 64;
const MOODS = ['Great','Good','Okay','Meh','Rough'];
const ENERGIES = ['High','Okay','Low'];
const MEAL_TYPES = ['Breakfast','Lunch','Dinner','Snack','Other'];
const AFFIRMATIONS = [
  'Small care still counts.',
  'You do not have to do everything today.',
  'A softer pace is still a pace.',
  'You are allowed to make this easy.',
  'One kind choice is enough for now.'
];

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
export const nonNegative = value => Math.max(0, finiteNumber(value, 0));
export const localDate = (value = new Date()) => {
  if (typeof value === 'string' && DATE_RE.test(value)) return value;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return localDate(new Date());
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};
export const localNoon = value => {
  const date = typeof value === 'string' && DATE_RE.test(value)
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)), 12)
    : new Date(value instanceof Date ? value : value || new Date());
  date.setHours(12, 0, 0, 0);
  return date;
};
export const shiftLocalDate = (value, amount) => {
  const date = localNoon(value);
  date.setDate(date.getDate() + amount);
  return localDate(date);
};
const defaultDay = () => ({
  mood: '',
  energy: 'Okay',
  sleep: 0,
  rest: false,
  note: '',
  waterEntries: [],
  legacyWaterOz: 0,
  meals: [],
  legacyMealCount: 0,
  movement: false,
  gym: false,
  movementNote: '',
  movementMinutes: 0,
  steps: 0,
  medicationLogs: {}
});
const dateKey = key => typeof key === 'string' && DATE_RE.test(key);
const normalizeEntry = (entry, index, type) => {
  const source = entry && typeof entry === 'object' ? entry : {};
  if (type === 'water') return {
    ...source,
    id: source.id ?? 'water-' + Date.now() + '-' + index,
    amountOz: nonNegative(source.amountOz ?? source.amount ?? 0),
    time: source.time || ''
  };
  return {
    ...source,
    id: source.id ?? 'meal-' + Date.now() + '-' + index,
    type: MEAL_TYPES.includes(source.type) ? source.type : 'Other',
    time: source.time || '',
    note: source.note || ''
  };
};
const normalizeDay = (raw, legacy = {}) => {
  const source = raw && typeof raw === 'object' ? raw : {};
  const old = legacy && typeof legacy === 'object' ? legacy : {};
  const oldWater = nonNegative(old.water) * 8;
  const oldMeals = Math.floor(nonNegative(old.meals));
  return {
    ...old,
    ...source,
    mood: source.mood ?? old.mood ?? '',
    energy: source.energy ?? old.energy ?? 'Okay',
    sleep: nonNegative(source.sleep ?? old.sleep ?? 0),
    rest: Boolean(source.rest ?? old.rest),
    note: source.note ?? old.note ?? '',
    waterEntries: (Array.isArray(source.waterEntries) ? source.waterEntries : []).map((entry, index) => normalizeEntry(entry, index, 'water')),
    legacyWaterOz: nonNegative(source.legacyWaterOz ?? oldWater),
    meals: (Array.isArray(source.meals) ? source.meals : []).map((entry, index) => normalizeEntry(entry, index, 'meal')),
    legacyMealCount: Math.floor(nonNegative(source.legacyMealCount ?? oldMeals)),
    movement: Boolean(source.movement ?? old.movement),
    gym: Boolean(source.gym),
    movementNote: source.movementNote ?? '',
    movementMinutes: nonNegative(source.movementMinutes),
    steps: Math.floor(nonNegative(source.steps ?? old.steps)),
    medicationLogs: source.medicationLogs && typeof source.medicationLogs === 'object' ? source.medicationLogs : {}
  };
};
export function normalizeWellnessRoot(rawWellness) {
  const source = rawWellness && typeof rawWellness === 'object' ? rawWellness : {};
  const sourceDays = source.days && typeof source.days === 'object' ? source.days : {};
  const days = {};
  Object.keys(source).filter(dateKey).forEach(key => { days[key] = normalizeDay(sourceDays[key], source[key]); });
  Object.keys(sourceDays).filter(dateKey).forEach(key => { days[key] = normalizeDay(sourceDays[key], source[key]); });
  const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};
  return {
    ...source,
    settings: {
      ...settings,
      waterGoalOz: nonNegative(settings.waterGoalOz) || DEFAULT_GOAL,
      showWeight: settings.showWeight === true || (settings.showWeight === undefined && Array.isArray(source.measurements) && source.measurements.length > 0),
      showMedication: settings.showMedication === true || (settings.showMedication === undefined && Array.isArray(source.medications) && source.medications.length > 0),
      showAppointments: settings.showAppointments !== false
    },
    days,
    goals: Array.isArray(source.goals) ? source.goals : [],
    measurements: Array.isArray(source.measurements) ? source.measurements : [],
    medications: Array.isArray(source.medications) ? source.medications : [],
    affirmations: Array.isArray(source.affirmations) ? source.affirmations : [],
    weeklyReflections: source.weeklyReflections && typeof source.weeklyReflections === 'object' ? source.weeklyReflections : {}
  };
}
export function getWellnessDay(rawWellness, date = localDate()) {
  const root = normalizeWellnessRoot(rawWellness);
  return normalizeDay(root.days[localDate(date)]);
}
export function getWaterTotalOz(rawWellness, date = localDate()) {
  const day = getWellnessDay(rawWellness, date);
  return day.waterEntries.reduce((total, entry) => total + nonNegative(entry.amountOz), 0) + nonNegative(day.legacyWaterOz);
}
export function getMealCount(rawWellness, date = localDate()) {
  const day = getWellnessDay(rawWellness, date);
  return day.meals.length + Math.floor(nonNegative(day.legacyMealCount));
}
export function getWeekDates(anchorDate = localDate()) {
  const anchor = localNoon(anchorDate);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  anchor.setDate(anchor.getDate() - mondayOffset);
  return Array.from({length: 7}, (_, index) => shiftLocalDate(anchor, index));
}
const mode = values => {
  const counts = {};
  values.filter(Boolean).forEach(value => { counts[value] = (counts[value] || 0) + 1; });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0] || '';
};
export function getWeeklyWellnessSummary(rawWellness, anchorDate = localDate()) {
  const dates = getWeekDates(anchorDate);
  const rows = dates.map(date => {
    const day = getWellnessDay(rawWellness, date);
    return {date, day, waterOz: getWaterTotalOz(rawWellness, date), meals: getMealCount(rawWellness, date)};
  });
  const sleepValues = rows.map(row => nonNegative(row.day.sleep)).filter(value => value > 0);
  const stepValues = rows.map(row => nonNegative(row.day.steps)).filter(value => value > 0);
  const waterValues = rows.map(row => row.waterOz).filter(value => value > 0);
  return {
    dates,
    rows,
    waterTotalOz: rows.reduce((total, row) => total + row.waterOz, 0),
    waterAverageOz: waterValues.length ? Math.round(rows.reduce((total, row) => total + row.waterOz, 0) / waterValues.length) : 0,
    meals: rows.reduce((total, row) => total + row.meals, 0),
    averageSleep: sleepValues.length ? Math.round((sleepValues.reduce((total, value) => total + value, 0) / sleepValues.length) * 10) / 10 : null,
    movementDays: rows.filter(row => row.day.movement).length,
    gymDays: rows.filter(row => row.day.gym).length,
    stepsTotal: rows.reduce((total, row) => total + Math.floor(nonNegative(row.day.steps)), 0),
    averageSteps: stepValues.length ? Math.round(rows.reduce((total, row) => total + nonNegative(row.day.steps), 0) / stepValues.length) : null,
    restDays: rows.filter(row => row.day.rest).length,
    mood: mode(rows.map(row => row.day.mood)),
    energy: mode(rows.map(row => row.day.energy))
  };
}
export function isLowEnergyDay(rawWellness, date = localDate()) {
  return String(getWellnessDay(rawWellness, date).energy || '').trim().toLowerCase() === 'low';
}
export function getWellnessHomeSummary(rawWellness, date = localDate()) {
  const root = normalizeWellnessRoot(rawWellness);
  const day = getWellnessDay(root, date);
  const waterOz = getWaterTotalOz(root, date);
  const goalOz = root.settings.waterGoalOz || DEFAULT_GOAL;
  const meals = getMealCount(root, date);
  const label = waterOz > 0 ? 'Water ' + waterOz + '/' + goalOz + ' oz · Energy ' + (day.energy || 'Okay') : meals > 0 ? meals + ' meal' + (meals === 1 ? '' : 's') + (day.rest ? ' · Rest day' : '') : day.energy && day.energy !== 'Okay' ? 'Energy ' + day.energy : 'No check-in today';
  return {date: localDate(date), day, waterOz, goalOz, meals, energy: day.energy, mood: day.mood, rest: day.rest, label};
}
export function getWeekKey(anchorDate = localDate()) {
  return getWeekDates(anchorDate)[0];
}
export function getDailyAffirmation(rawWellness, date = localDate()) {
  const root = normalizeWellnessRoot(rawWellness);
  const custom = root.affirmations.map(item => typeof item === 'string' ? item : item?.text).filter(Boolean);
  const bank = [...AFFIRMATIONS, ...custom];
  return bank.length ? bank[Math.abs(Array.from(localDate(date)).reduce((total, char) => total + char.charCodeAt(0), 0)) % bank.length] : AFFIRMATIONS[0];
}
export { MOODS, ENERGIES, MEAL_TYPES, DEFAULT_GOAL };
