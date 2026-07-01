import { describe, it, expect, beforeEach } from 'vitest';
import { storage, storageKeys } from '../../../src/services/storage.js';

describe('Storage Service Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve car profile correctly', () => {
    const mockProfile = {
      vin: 'XTA219000H1234567',
      make: 'Lada',
      model: 'Granta',
      year: 2017,
      engine: '1.6 MPI',
      transmission: 'Manual',
      currentMileage: 85200,
      yearlyMileage: 15000
    };

    expect(storage.getCarProfile()).toBeNull();
    storage.saveCarProfile(mockProfile);
    expect(storage.getCarProfile()).toEqual(mockProfile);
    
    const rawVal = localStorage.getItem(storageKeys.CAR_PROFILE);
    expect(JSON.parse(rawVal)).toEqual(mockProfile);
  });

  it('should handle removing car profile when passing null or undefined', () => {
    const mockProfile = { vin: 'XTA219000H1234567', make: 'Lada', model: 'Granta' };
    storage.saveCarProfile(mockProfile);
    expect(storage.getCarProfile()).toEqual(mockProfile);

    storage.saveCarProfile(null);
    expect(storage.getCarProfile()).toBeNull();
  });

  it('should save and retrieve service history logs', () => {
    const mockHistory = [
      { id: 'srv-1', date: '2026-01-01', mileage: 1000, type: 'Oil Change', cost: 150, notes: 'Synthetic' }
    ];

    expect(storage.getServiceHistory()).toEqual([]);
    storage.saveServiceHistory(mockHistory);
    expect(storage.getServiceHistory()).toEqual(mockHistory);
  });

  it('should save and retrieve financial expenses', () => {
    const mockExpenses = [
      { id: 'exp-1', date: '2026-01-02', category: 'Fuel', cost: 50, notes: 'Filled up' }
    ];

    expect(storage.getExpenses()).toEqual([]);
    storage.saveExpenses(mockExpenses);
    expect(storage.getExpenses()).toEqual(mockExpenses);
  });

  it('should save and retrieve reminders', () => {
    const mockReminders = [
      { id: 'rem-1', type: 'insurance', title: 'OSAGO', dueDate: '2027-01-01', active: true }
    ];

    expect(storage.getReminders()).toEqual([]);
    storage.saveReminders(mockReminders);
    expect(storage.getReminders()).toEqual(mockReminders);
  });

  it('should clear all stored keys', () => {
    storage.saveCarProfile({ vin: '123', make: 'Ford', model: 'Focus', year: 2018, currentMileage: 10000 });
    storage.saveExpenses([{ id: 'exp-1', date: '2026-01-02', category: 'Fuel', cost: 50, notes: 'Filled up' }]);
    
    expect(storage.getCarProfile()).not.toBeNull();
    expect(storage.getExpenses().length).toBe(1);

    storage.clearAll();

    expect(storage.getCarProfile()).toBeNull();
    expect(storage.getExpenses()).toEqual([]);
  });

  it('should prevent fatal crashes and return empty arrays when parsing corrupt non-array JSON types', () => {
    // 1. Corrupt Service History
    localStorage.setItem(storageKeys.SERVICE_HISTORY, '{"invalid_key": "not_an_array"}');
    expect(storage.getServiceHistory()).toEqual([]);

    localStorage.setItem(storageKeys.SERVICE_HISTORY, '12345');
    expect(storage.getServiceHistory()).toEqual([]);

    localStorage.setItem(storageKeys.SERVICE_HISTORY, '"string_literal"');
    expect(storage.getServiceHistory()).toEqual([]);

    localStorage.setItem(storageKeys.SERVICE_HISTORY, 'null');
    expect(storage.getServiceHistory()).toEqual([]);

    // 2. Corrupt Expenses
    localStorage.setItem(storageKeys.EXPENSES, '{"invalid_key": "not_an_array"}');
    expect(storage.getExpenses()).toEqual([]);

    // 3. Corrupt Reminders
    localStorage.setItem(storageKeys.REMINDERS, '{"invalid_key": "not_an_array"}');
    expect(storage.getReminders()).toEqual([]);
  });

  it('should prevent fatal crashes and return null if vehicle profile is saved as a JSON array or string', () => {
    localStorage.setItem(storageKeys.CAR_PROFILE, '[{"vin": "XTA219000H1234567"}]');
    expect(storage.getCarProfile()).toBeNull();

    localStorage.setItem(storageKeys.CAR_PROFILE, '"string_literal"');
    expect(storage.getCarProfile()).toBeNull();
  });
});
