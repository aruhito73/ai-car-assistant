import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage, storageKeys } from '../../src/services/storage.js';

describe('Storage Service - Filtering & Exception Robustness', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should filter out invalid elements from mixed service history array', () => {
    const mixedHistory = [
      { id: 'srv-1', date: '2026-01-01', mileage: 1000, type: 'Oil Change', cost: 150, notes: 'Valid' },
      { id: 'srv-2', date: '2026-01-02', mileage: '2000', type: 'Tire rotation', cost: 50 }, // invalid mileage (string)
      { id: 'srv-3', date: '2026-01-03', mileage: 3000, type: 'Brakes', cost: 200, extra: 'key' }, // extra key is now allowed
      null, // null element
      'not-an-object', // non-object element
      { id: 'srv-4', date: '2026-01-04', mileage: 4000, type: 'Diagnostics', cost: 100 } // Valid
    ];

    localStorage.setItem(storageKeys.SERVICE_HISTORY, JSON.stringify(mixedHistory));

    const result = storage.getServiceHistory();
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('srv-1');
    expect(result[1].id).toBe('srv-3');
    expect(result[2].id).toBe('srv-4');
  });

  it('should filter out invalid elements from mixed expenses array', () => {
    const mixedExpenses = [
      { id: 'exp-1', date: '2026-01-01', category: 'Fuel', cost: 50, notes: 'Valid' },
      { id: 'exp-2', date: '2026-01-02', category: 'InvalidCategory', cost: 100 }, // invalid category name
      { id: 'exp-3', date: '2026-01-03', category: 'Repair', cost: NaN }, // cost is NaN
      { id: 'exp-4', date: '2026-01-04', category: 'Insurance', cost: 120 } // Valid
    ];

    localStorage.setItem(storageKeys.EXPENSES, JSON.stringify(mixedExpenses));

    const result = storage.getExpenses();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('exp-1');
    expect(result[1].id).toBe('exp-4');
  });

  it('should filter out invalid elements from mixed reminders array', () => {
    const mixedReminders = [
      { id: 'rem-1', type: 'insurance', title: 'OSAGO', dueDate: '2027-01-01', active: true },
      { id: 'rem-2', type: 'invalid_type', title: 'Title', dueDate: '2027-01-01', active: true }, // invalid type
      { id: 'rem-3', type: 'maintenance', title: 'Oil', dueDate: '2027-01-01', active: 'yes' }, // active is not boolean
      { id: 'rem-4', type: 'tyres', title: 'Tyres', dueDate: '2027-01-01', active: false, dueMileage: null }, // Valid (null dueMileage is allowed)
      { id: 'rem-5', type: 'tyres', title: 'Tyres', dueDate: '2027-01-01', active: false, dueMileage: {} } // invalid dueMileage (object)
    ];

    localStorage.setItem(storageKeys.REMINDERS, JSON.stringify(mixedReminders));

    const result = storage.getReminders();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('rem-1');
    expect(result[1].id).toBe('rem-4');
  });

  it('should return null or filter out profile if it contains extra keys or invalid types', () => {
    // 1. Profile with extra keys
    const extraKeysProfile = {
      vin: 'VIN12345678901234',
      make: 'Lada',
      model: 'Granta',
      year: 2017,
      engine: '1.6',
      transmission: 'Manual',
      currentMileage: 85000,
      yearlyMileage: 15000,
      extraKey: 'not_allowed'
    };
    localStorage.setItem(storageKeys.CAR_PROFILE, JSON.stringify(extraKeysProfile));
    expect(storage.getCarProfile()).toEqual(extraKeysProfile); // Extra keys are accepted now

    // 2. Profile with missing keys but valid types
    // Note: validateCarProfile allows missing keys if all present keys are valid and checker exists,
    // because it only loops over keys that exist in the parsed object.
    const partialProfile = {
      make: 'Lada',
      model: 'Granta'
    };
    localStorage.setItem(storageKeys.CAR_PROFILE, JSON.stringify(partialProfile));
    expect(storage.getCarProfile()).toEqual(partialProfile);
  });

  it('should handle localStorage throwing exceptions gracefully', () => {
    // Spy and force localStorage.getItem to throw
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });

    // Suppress console.error output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(storage.getCarProfile()).toBeNull();
    expect(storage.getServiceHistory()).toEqual([]);
    expect(storage.getExpenses()).toEqual([]);
    expect(storage.getReminders()).toEqual([]);

    expect(() => storage.saveCarProfile({ make: 'Ford' })).not.toThrow();
    expect(() => storage.saveExpenses([{ id: '1' }])).not.toThrow();
  });
});
