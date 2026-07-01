export const storageKeys = {
  CAR_PROFILE: 'ai_car_profile',
  SERVICE_HISTORY: 'ai_car_services',
  EXPENSES: 'ai_car_expenses',
  REMINDERS: 'ai_car_reminders',
  THEME: 'ai_theme',
  GLASSMORPHISM: 'ai_glassmorphism',
  CARS: 'ai_cars',
  ACTIVE_CAR_VIN: 'ai_active_car_vin'
};

const validateServiceLog = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (typeof item.id !== 'string') return false;
  if (typeof item.date !== 'string') return false;
  if (typeof item.mileage !== 'number' || isNaN(item.mileage)) return false;
  if (typeof item.type !== 'string') return false;
  if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
  if (item.notes !== undefined && item.notes !== null && typeof item.notes !== 'string') return false;
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
    if (checker && !checker(parsed[key])) return false;
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
  getCars() {
    try {
      const data = localStorage.getItem(storageKeys.CARS);
      if (!data) {
        // Fallback migration from CAR_PROFILE
        const single = this.getCarProfileLegacy();
        if (single) {
          const cars = [single];
          this.saveCars(cars);
          return cars;
        }
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(validateCarProfile);
    } catch (e) {
      console.error('Error reading cars from storage', e);
      return [];
    }
  },

  saveCars(cars) {
    try {
      localStorage.setItem(storageKeys.CARS, JSON.stringify(cars || []));
    } catch (e) {
      console.error('Error saving cars to storage', e);
    }
  },

  getActiveCarVin() {
    try {
      const vin = localStorage.getItem(storageKeys.ACTIVE_CAR_VIN);
      if (vin) return vin;
      const cars = this.getCars();
      return cars[0] ? cars[0].vin : null;
    } catch (e) {
      console.error('Error reading active car VIN', e);
      return null;
    }
  },

  saveActiveCarVin(vin) {
    try {
      if (vin) {
        localStorage.setItem(storageKeys.ACTIVE_CAR_VIN, vin);
      } else {
        localStorage.removeItem(storageKeys.ACTIVE_CAR_VIN);
      }
    } catch (e) {
      console.error('Error saving active car VIN', e);
    }
  },

  getCarProfileLegacy() {
    try {
      const data = localStorage.getItem(storageKeys.CAR_PROFILE);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return validateCarProfile(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  },

  getCarProfile() {
    const legacy = this.getCarProfileLegacy();
    const cars = this.getCars();
    const activeVin = this.getActiveCarVin();
    const activeCar = cars.find(c => c.vin === activeVin) || cars[0] || null;

    if (legacy && (!activeCar || legacy.vin !== activeCar.vin || legacy.make !== activeCar.make || legacy.model !== activeCar.model || legacy.year !== activeCar.year || legacy.currentMileage !== activeCar.currentMileage)) {
      const index = cars.findIndex(c => c.vin === legacy.vin);
      if (index >= 0) {
        cars[index] = legacy;
      } else {
        cars.push(legacy);
      }
      this.saveCars(cars);
      this.saveActiveCarVin(legacy.vin || null);
      return legacy;
    }

    return activeCar;
  },

  saveCarProfile(profile) {
    try {
      if (profile) {
        localStorage.setItem(storageKeys.CAR_PROFILE, JSON.stringify(profile));
        const cars = this.getCars() || [];
        const index = cars.findIndex(c => c.vin === profile.vin);
        if (index >= 0) {
          cars[index] = profile;
        } else {
          cars.push(profile);
        }
        this.saveCars(cars);
        this.saveActiveCarVin(profile.vin);
      } else {
        localStorage.removeItem(storageKeys.CAR_PROFILE);
        this.saveCars([]);
        this.saveActiveCarVin(null);
      }
    } catch (e) {
      console.error('Error saving car profile', e);
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
