export const storageKeys = {
  CAR_PROFILE: 'ai_car_profile',
  SERVICE_HISTORY: 'ai_car_services',
  EXPENSES: 'ai_car_expenses',
  REMINDERS: 'ai_car_reminders',
  THEME: 'ai_theme',
  GLASSMORPHISM: 'ai_glassmorphism'
};

const validateServiceLog = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (typeof item.id !== 'string') return false;
  if (typeof item.date !== 'string') return false;
  if (typeof item.mileage !== 'number' || isNaN(item.mileage)) return false;
  if (typeof item.type !== 'string') return false;
  if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
  if (item.notes !== undefined && item.notes !== null && typeof item.notes !== 'string') return false;
  const allowedKeys = ['id', 'date', 'mileage', 'type', 'cost', 'notes'];
  for (const key of Object.keys(item)) {
    if (!allowedKeys.includes(key)) return false;
  }
  return true;
};

const validateExpense = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (typeof item.id !== 'string') return false;
  if (typeof item.date !== 'string') return false;
  if (typeof item.category !== 'string') return false;
  if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
  const categories = ["Fuel", "Repair", "Insurance", "Parking", "Fines", "Other"];
  if (!categories.includes(item.category)) return false;
  if (item.notes !== undefined && item.notes !== null && typeof item.notes !== 'string') return false;
  const allowedKeys = ['id', 'date', 'category', 'cost', 'notes'];
  for (const key of Object.keys(item)) {
    if (!allowedKeys.includes(key)) return false;
  }
  return true;
};

const validateReminder = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (typeof item.id !== 'string') return false;
  if (typeof item.type !== 'string') return false;
  if (typeof item.title !== 'string') return false;
  if (typeof item.dueDate !== 'string') return false;
  if (typeof item.active !== 'boolean') return false;
  const types = ["insurance", "tyres", "maintenance"];
  if (!types.includes(item.type)) return false;
  if (item.dueMileage !== undefined && item.dueMileage !== null && (typeof item.dueMileage !== 'number' || isNaN(item.dueMileage))) return false;
  const allowedKeys = ['id', 'type', 'title', 'dueDate', 'active', 'dueMileage'];
  for (const key of Object.keys(item)) {
    if (!allowedKeys.includes(key)) return false;
  }
  return true;
};

const validateCarProfile = (parsed) => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  if (Object.keys(parsed).length === 0) return false;
  if (typeof parsed.make !== 'string' || typeof parsed.model !== 'string') return false;
  const checkers = {
    vin: (v) => typeof v === 'string',
    make: (v) => typeof v === 'string',
    model: (v) => typeof v === 'string',
    year: (v) => typeof v === 'number' && !isNaN(v),
    currentMileage: (v) => typeof v === 'number' && !isNaN(v),
    yearlyMileage: (v) => typeof v === 'number' && !isNaN(v),
    engine: (v) => typeof v === 'string',
    transmission: (v) => typeof v === 'string',
    specs: (v) => typeof v === 'object' && v !== null,
    diseases: (v) => Array.isArray(v),
    parts: (v) => Array.isArray(v)
  };
  for (const key of Object.keys(parsed)) {
    const checker = checkers[key];
    if (!checker || !checker(parsed[key])) return false;
  }
  return true;
};

const parseArray = (key, validator, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return defaultValue;
    return validator ? parsed.filter(validator) : parsed;
  } catch (e) {
    console.error(`Error reading key "${key}" from storage`, e);
    return defaultValue;
  }
};

export const storage = {
  getCarProfile() {
    try {
      const data = localStorage.getItem(storageKeys.CAR_PROFILE);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return validateCarProfile(parsed) ? parsed : null;
    } catch (e) {
      console.error('Error reading car profile from storage', e);
      return null;
    }
  },

  saveCarProfile(profile) {
    try {
      if (profile) {
        localStorage.setItem(storageKeys.CAR_PROFILE, JSON.stringify(profile));
      } else {
        localStorage.removeItem(storageKeys.CAR_PROFILE);
      }
    } catch (e) {
      console.error('Error saving car profile to storage', e);
    }
  },

  getServiceHistory() {
    return parseArray(storageKeys.SERVICE_HISTORY, validateServiceLog, []);
  },

  saveServiceHistory(history) {
    try {
      localStorage.setItem(storageKeys.SERVICE_HISTORY, JSON.stringify(history || []));
    } catch (e) {
      console.error('Error saving service history to storage', e);
    }
  },

  getExpenses() {
    return parseArray(storageKeys.EXPENSES, validateExpense, []);
  },

  saveExpenses(expenses) {
    try {
      localStorage.setItem(storageKeys.EXPENSES, JSON.stringify(expenses || []));
    } catch (e) {
      console.error('Error saving expenses to storage', e);
    }
  },

  getReminders() {
    return parseArray(storageKeys.REMINDERS, validateReminder, []);
  },

  saveReminders(reminders) {
    try {
      localStorage.setItem(storageKeys.REMINDERS, JSON.stringify(reminders || []));
    } catch (e) {
      console.error('Error saving reminders to storage', e);
    }
  },

  getTheme() {
    try {
      return localStorage.getItem(storageKeys.THEME) || 'dark';
    } catch (e) {
      console.error('Error reading theme from storage', e);
      return 'dark';
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(storageKeys.THEME, theme || 'dark');
    } catch (e) {
      console.error('Error saving theme to storage', e);
    }
  },

  getGlassmorphism() {
    try {
      const val = localStorage.getItem(storageKeys.GLASSMORPHISM);
      return val === null ? true : val === 'true';
    } catch (e) {
      console.error('Error reading glassmorphism from storage', e);
      return true;
    }
  },

  saveGlassmorphism(enabled) {
    try {
      localStorage.setItem(storageKeys.GLASSMORPHISM, String(enabled));
    } catch (e) {
      console.error('Error saving glassmorphism to storage', e);
    }
  },

  clearAll() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  }
};
