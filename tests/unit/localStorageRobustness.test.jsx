import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CarProvider, useCar } from '../../src/context/CarContext.jsx';
import { storage, storageKeys } from '../../src/services/storage.js';
import App from '../../src/App.jsx';

// Simple component to dump context state for testing
const DumpStateComponent = () => {
  const { car, serviceHistory, expenses, reminders, addExpense, updateCarProfile } = useCar();
  return (
    <div>
      <div data-testid="car-state">{car ? JSON.stringify(car) : 'null'}</div>
      <div data-testid="services-state">{JSON.stringify(serviceHistory)}</div>
      <div data-testid="expenses-state">{JSON.stringify(expenses)}</div>
      <div data-testid="reminders-state">{JSON.stringify(reminders)}</div>
      <button data-testid="btn-add-expense" onClick={() => addExpense({ cost: 10, category: 'Fuel', date: '2026-06-30' })}>
        Add Expense
      </button>
      <button data-testid="btn-update-car" onClick={() => updateCarProfile({ vin: '12345', make: 'Ford', model: 'Mustang' })}>
        Update Car
      </button>
    </div>
  );
};

describe('LocalStorage Robustness and Error Parsing Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Spy on console.error to avoid test output noise during parsing failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const malformedValues = [
    { label: 'null string', value: 'null' },
    { label: 'undefined string', value: 'undefined' },
    { label: 'empty object', value: '{}' },
    { label: 'non-empty object', value: '{"foo": "bar"}' },
    { label: 'non-json plain string', value: 'plain_string' },
    { label: 'quoted string', value: '"quoted_string"' },
    { label: 'number literal', value: '12345' },
    { label: 'empty array', value: '[]' },
    { label: 'non-empty array', value: '[{"id": 1}]' },
  ];

  describe('Storage Service - Direct API checks', () => {
    malformedValues.forEach(({ label, value }) => {
      it(`should handle malformed value "${label}" for Array-based keys`, () => {
        localStorage.setItem(storageKeys.SERVICE_HISTORY, value);
        localStorage.setItem(storageKeys.EXPENSES, value);
        localStorage.setItem(storageKeys.REMINDERS, value);

        // For array keys: empty array is valid, any other input (or invalid shape) fallbacks/filters to []
        const expectedServices = value === '[]' ? JSON.parse(value) : [];
        const expectedExpenses = value === '[]' ? JSON.parse(value) : [];
        const expectedReminders = value === '[]' ? JSON.parse(value) : [];

        expect(storage.getServiceHistory()).toEqual(expectedServices);
        expect(storage.getExpenses()).toEqual(expectedExpenses);
        expect(storage.getReminders()).toEqual(expectedReminders);
      });

      it(`should handle malformed value "${label}" for Object-based car profile`, () => {
        localStorage.setItem(storageKeys.CAR_PROFILE, value);

        // For car profile: under strict schema validation, only objects with correct known attributes are accepted.
        let expectedCar = null;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const checkers = {
              vin: (v) => typeof v === 'string',
              make: (v) => typeof v === 'string',
              model: (v) => typeof v === 'string',
              year: (v) => typeof v === 'number' && !isNaN(v),
              currentMileage: (v) => typeof v === 'number' && !isNaN(v),
              yearlyMileage: (v) => typeof v === 'number' && !isNaN(v),
              engine: (v) => typeof v === 'string',
              transmission: (v) => typeof v === 'string'
            };
            let isValid = true;
            if (Object.keys(parsed).length === 0) isValid = false;
            else if (typeof parsed.make !== 'string' || typeof parsed.model !== 'string') isValid = false;
            else {
              for (const key of Object.keys(parsed)) {
                const checker = checkers[key];
                if (!checker || !checker(parsed[key])) {
                  isValid = false;
                  break;
                }
              }
            }
            if (isValid) expectedCar = parsed;
          }
        } catch (e) {
          // ignore parsing error
        }

        expect(storage.getCarProfile()).toEqual(expectedCar);
      });
    });
  });

  describe('CarContext & App Integration checks with malformed localStorage', () => {
    malformedValues.forEach(({ label, value }) => {
      it(`should render CarProvider and not crash when all keys are set to "${label}"`, () => {
        localStorage.setItem(storageKeys.CAR_PROFILE, value);
        localStorage.setItem(storageKeys.SERVICE_HISTORY, value);
        localStorage.setItem(storageKeys.EXPENSES, value);
        localStorage.setItem(storageKeys.REMINDERS, value);

        expect(() => {
          render(
            <CarProvider>
              <DumpStateComponent />
            </CarProvider>
          );
        }).not.toThrow();

        // Check correct parsing/fallback
        let expectedCar = null;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const checkers = {
              vin: (v) => typeof v === 'string',
              make: (v) => typeof v === 'string',
              model: (v) => typeof v === 'string',
              year: (v) => typeof v === 'number' && !isNaN(v),
              currentMileage: (v) => typeof v === 'number' && !isNaN(v),
              yearlyMileage: (v) => typeof v === 'number' && !isNaN(v),
              engine: (v) => typeof v === 'string',
              transmission: (v) => typeof v === 'string'
            };
            let isValid = true;
            if (Object.keys(parsed).length === 0) isValid = false;
            else if (typeof parsed.make !== 'string' || typeof parsed.model !== 'string') isValid = false;
            else {
              for (const key of Object.keys(parsed)) {
                const checker = checkers[key];
                if (!checker || !checker(parsed[key])) {
                  isValid = false;
                  break;
                }
              }
            }
            if (isValid) expectedCar = parsed;
          }
        } catch (e) {}

        const expectedServices = value === '[]' ? JSON.parse(value) : [];
        const expectedExpenses = value === '[]' ? JSON.parse(value) : [];
        const expectedReminders = value === '[]' ? JSON.parse(value) : [];

        expect(screen.getByTestId('car-state').textContent).toBe(expectedCar ? JSON.stringify(expectedCar) : 'null');
        expect(screen.getByTestId('services-state').textContent).toBe(JSON.stringify(expectedServices));
        expect(screen.getByTestId('expenses-state').textContent).toBe(JSON.stringify(expectedExpenses));
        expect(screen.getByTestId('reminders-state').textContent).toBe(JSON.stringify(expectedReminders));
      });
    });

    it('should recover and allow writing/overwriting to storage after initializing from corrupt storage', () => {
      localStorage.setItem(storageKeys.CAR_PROFILE, '12345'); // invalid profile (number)
      localStorage.setItem(storageKeys.EXPENSES, '{"not": "an_array"}'); // invalid expenses (object)

      render(
        <CarProvider>
          <DumpStateComponent />
        </CarProvider>
      );

      // Verify fallback initial state
      expect(screen.getByTestId('car-state').textContent).toBe('null');
      expect(screen.getByTestId('expenses-state').textContent).toBe('[]');

      // Click add expense to write to expenses
      const addExpBtn = screen.getByTestId('btn-add-expense');
      act(() => {
        addExpBtn.click();
      });

      // Verify UI state updated
      const parsedExpenses = JSON.parse(screen.getByTestId('expenses-state').textContent);
      expect(parsedExpenses.length).toBe(1);
      expect(parsedExpenses[0].cost).toBe(10);

      // Verify storage was overwritten and holds valid array
      const storageExpenses = storage.getExpenses();
      expect(storageExpenses.length).toBe(1);
      expect(storageExpenses[0].cost).toBe(10);

      // Click update car to write to profile
      const updateCarBtn = screen.getByTestId('btn-update-car');
      act(() => {
        updateCarBtn.click();
      });

      // Verify UI updated
      expect(screen.getByTestId('car-state').textContent).toContain('Ford');

      // Verify storage holds the new valid car profile
      expect(storage.getCarProfile()).toEqual({ vin: '12345', make: 'Ford', model: 'Mustang' });
    });

    it('should render main App component without crashing with fully malformed localStorage keys', () => {
      localStorage.setItem(storageKeys.CAR_PROFILE, 'invalid_vin_non_json');
      localStorage.setItem(storageKeys.SERVICE_HISTORY, 'invalid_history_non_json');
      localStorage.setItem(storageKeys.EXPENSES, 'invalid_expenses_non_json');
      localStorage.setItem(storageKeys.REMINDERS, 'invalid_reminders_non_json');

      expect(() => {
        render(<App />);
      }).not.toThrow();

      // App should render heading and remain stable
      const heading = screen.getByRole('heading', { name: /AI Car Assistant/i });
      expect(heading).toBeInTheDocument();
    });
  });
});
