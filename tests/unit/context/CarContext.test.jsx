import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CarProvider, useCar } from '../../../src/context/CarContext.jsx';
import { storage } from '../../../src/services/storage.js';

const CarTestComponent = () => {
  const {
    car,
    serviceHistory,
    expenses,
    reminders,
    updateCarProfile,
    addServiceLog,
    updateServiceLog,
    deleteServiceLog,
    addExpense,
    updateExpense,
    deleteExpense,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    clearAllData
  } = useCar();

  return (
    <div>
      <span data-testid="vin">{car ? car.vin : 'no-car'}</span>
      <span data-testid="make">{car ? car.make : ''}</span>
      <span data-testid="services-count">{serviceHistory.length}</span>
      <span data-testid="expenses-count">{expenses.length}</span>
      <span data-testid="reminders-count">{reminders.length}</span>

      {/* Car actions */}
      <button
        data-testid="btn-update-car"
        onClick={() => updateCarProfile({ vin: 'VIN12345678901234', make: 'Toyota', model: 'Camry' })}
      >
        Update Car
      </button>

      {/* Service history actions */}
      <button
        data-testid="btn-add-service"
        onClick={() => addServiceLog({ date: '2026-05-01', mileage: 15000, type: 'Oil Change', cost: 100 })}
      >
        Add Service
      </button>
      {serviceHistory.map(log => (
        <div key={log.id} data-testid={`service-${log.id}`}>
          <span data-testid={`service-type-${log.id}`}>{log.type}</span>
          <button
            data-testid={`btn-update-service-${log.id}`}
            onClick={() => updateServiceLog(log.id, { cost: 120 })}
          >
            Update Service Cost
          </button>
          <button
            data-testid={`btn-delete-service-${log.id}`}
            onClick={() => deleteServiceLog(log.id)}
          >
            Delete Service
          </button>
        </div>
      ))}

      {/* Expenses actions */}
      <button
        data-testid="btn-add-expense"
        onClick={() => addExpense({ date: '2026-05-02', category: 'Fuel', cost: 45, notes: 'Full tank' })}
      >
        Add Expense
      </button>
      {expenses.map(exp => (
        <div key={exp.id} data-testid={`expense-${exp.id}`}>
          <span data-testid={`expense-notes-${exp.id}`}>{exp.notes}</span>
          <button
            data-testid={`btn-update-expense-${exp.id}`}
            onClick={() => updateExpense(exp.id, { notes: 'Premium Fuel' })}
          >
            Update Expense Notes
          </button>
          <button
            data-testid={`btn-delete-expense-${exp.id}`}
            onClick={() => deleteExpense(exp.id)}
          >
            Delete Expense
          </button>
        </div>
      ))}

      {/* Reminders actions */}
      <button
        data-testid="btn-add-reminder"
        onClick={() => addReminder({ type: 'insurance', title: 'OSAGO renewal', dueDate: '2027-01-01' })}
      >
        Add Reminder
      </button>
      {reminders.map(rem => (
        <div key={rem.id} data-testid={`reminder-${rem.id}`}>
          <span data-testid={`reminder-title-${rem.id}`}>{rem.title}</span>
          <span data-testid={`reminder-active-${rem.id}`}>{rem.active ? 'active' : 'inactive'}</span>
          <button
            data-testid={`btn-update-reminder-${rem.id}`}
            onClick={() => updateReminder(rem.id, { title: 'New OSAGO' })}
          >
            Update Reminder Title
          </button>
          <button
            data-testid={`btn-toggle-reminder-${rem.id}`}
            onClick={() => toggleReminder(rem.id)}
          >
            Toggle Reminder
          </button>
          <button
            data-testid={`btn-delete-reminder-${rem.id}`}
            onClick={() => deleteReminder(rem.id)}
          >
            Delete Reminder
          </button>
        </div>
      ))}

      <button data-testid="btn-clear-all" onClick={clearAllData}>
        Clear All Data
      </button>
    </div>
  );
};

describe('CarContext Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default empty/null states from empty storage', () => {
    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    expect(screen.getByTestId('vin').textContent).toBe('no-car');
    expect(screen.getByTestId('services-count').textContent).toBe('0');
    expect(screen.getByTestId('expenses-count').textContent).toBe('0');
    expect(screen.getByTestId('reminders-count').textContent).toBe('0');
  });

  it('should initialize with values loaded from storage', () => {
    const mockCar = { vin: 'MOCKVIN1234567890', make: 'Lada', model: 'Vesta' };
    const mockServices = [{ id: 's1', date: '2026-04-01', mileage: 12000, type: 'Maintenance', cost: 150 }];
    const mockExpenses = [{ id: 'e1', date: '2026-04-02', category: 'Insurance', cost: 200, notes: 'annual' }];
    const mockReminders = [{ id: 'r1', type: 'tyres', title: 'Winter tyres', dueDate: '2026-10-15', active: true }];

    storage.saveCarProfile(mockCar);
    storage.saveServiceHistory(mockServices);
    storage.saveExpenses(mockExpenses);
    storage.saveReminders(mockReminders);

    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    expect(screen.getByTestId('vin').textContent).toBe('MOCKVIN1234567890');
    expect(screen.getByTestId('make').textContent).toBe('Lada');
    expect(screen.getByTestId('services-count').textContent).toBe('1');
    expect(screen.getByTestId('expenses-count').textContent).toBe('1');
    expect(screen.getByTestId('reminders-count').textContent).toBe('1');
  });

  it('should perform CRUD operations on car profile correctly', () => {
    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    const updateBtn = screen.getByTestId('btn-update-car');

    act(() => {
      updateBtn.click();
    });

    expect(screen.getByTestId('vin').textContent).toBe('VIN12345678901234');
    expect(screen.getByTestId('make').textContent).toBe('Toyota');
    expect(storage.getCarProfile()).toEqual({
      vin: 'VIN12345678901234',
      make: 'Toyota',
      model: 'Camry'
    });
  });

  it('should perform CRUD operations on service history logs correctly', () => {
    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    const addBtn = screen.getByTestId('btn-add-service');

    // Add service
    act(() => {
      addBtn.click();
    });

    expect(screen.getByTestId('services-count').textContent).toBe('1');
    const logs = storage.getServiceHistory();
    expect(logs.length).toBe(1);
    const addedId = logs[0].id;
    expect(addedId).toBeDefined();

    expect(screen.getByTestId(`service-type-${addedId}`).textContent).toBe('Oil Change');

    // Update service
    const updateBtn = screen.getByTestId(`btn-update-service-${addedId}`);
    act(() => {
      updateBtn.click();
    });

    const updatedLogs = storage.getServiceHistory();
    expect(updatedLogs[0].cost).toBe(120);

    // Delete service
    const deleteBtn = screen.getByTestId(`btn-delete-service-${addedId}`);
    act(() => {
      deleteBtn.click();
    });

    expect(screen.getByTestId('services-count').textContent).toBe('0');
    expect(storage.getServiceHistory().length).toBe(0);
  });

  it('should perform CRUD operations on expenses correctly', () => {
    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    const addBtn = screen.getByTestId('btn-add-expense');

    // Add expense
    act(() => {
      addBtn.click();
    });

    expect(screen.getByTestId('expenses-count').textContent).toBe('1');
    const stored = storage.getExpenses();
    expect(stored.length).toBe(1);
    const addedId = stored[0].id;

    expect(screen.getByTestId(`expense-notes-${addedId}`).textContent).toBe('Full tank');

    // Update expense
    const updateBtn = screen.getByTestId(`btn-update-expense-${addedId}`);
    act(() => {
      updateBtn.click();
    });

    expect(screen.getByTestId(`expense-notes-${addedId}`).textContent).toBe('Premium Fuel');
    expect(storage.getExpenses()[0].notes).toBe('Premium Fuel');

    // Delete expense
    const deleteBtn = screen.getByTestId(`btn-delete-expense-${addedId}`);
    act(() => {
      deleteBtn.click();
    });

    expect(screen.getByTestId('expenses-count').textContent).toBe('0');
    expect(storage.getExpenses().length).toBe(0);
  });

  it('should perform CRUD operations on reminders correctly', () => {
    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    const addBtn = screen.getByTestId('btn-add-reminder');

    // Add reminder
    act(() => {
      addBtn.click();
    });

    expect(screen.getByTestId('reminders-count').textContent).toBe('1');
    const stored = storage.getReminders();
    expect(stored.length).toBe(1);
    const addedId = stored[0].id;

    expect(screen.getByTestId(`reminder-title-${addedId}`).textContent).toBe('OSAGO renewal');
    expect(screen.getByTestId(`reminder-active-${addedId}`).textContent).toBe('active');

    // Update reminder
    const updateBtn = screen.getByTestId(`btn-update-reminder-${addedId}`);
    act(() => {
      updateBtn.click();
    });

    expect(screen.getByTestId(`reminder-title-${addedId}`).textContent).toBe('New OSAGO');
    expect(storage.getReminders()[0].title).toBe('New OSAGO');

    // Toggle reminder
    const toggleBtn = screen.getByTestId(`btn-toggle-reminder-${addedId}`);
    act(() => {
      toggleBtn.click();
    });

    expect(screen.getByTestId(`reminder-active-${addedId}`).textContent).toBe('inactive');
    expect(storage.getReminders()[0].active).toBe(false);

    // Delete reminder
    const deleteBtn = screen.getByTestId(`btn-delete-reminder-${addedId}`);
    act(() => {
      deleteBtn.click();
    });

    expect(screen.getByTestId('reminders-count').textContent).toBe('0');
    expect(storage.getReminders().length).toBe(0);
  });

  it('should clear all data correctly when clearAllData is called', () => {
    storage.saveCarProfile({ vin: 'VIN1', make: 'Ford', model: 'Focus' });
    storage.saveExpenses([{ id: 'e1', date: '2026-05-01', category: 'Fuel', cost: 10 }]);

    render(
      <CarProvider>
        <CarTestComponent />
      </CarProvider>
    );

    expect(screen.getByTestId('vin').textContent).toBe('VIN1');
    expect(screen.getByTestId('expenses-count').textContent).toBe('1');

    const clearBtn = screen.getByTestId('btn-clear-all');
    act(() => {
      clearBtn.click();
    });

    expect(screen.getByTestId('vin').textContent).toBe('no-car');
    expect(screen.getByTestId('expenses-count').textContent).toBe('0');
    expect(storage.getCarProfile()).toBeNull();
    expect(storage.getExpenses()).toEqual([]);
  });

  it('should support multiple vehicles management (adding, switching, and deleting)', () => {
    const MultiCarTestComponent = () => {
      const {
        car,
        cars,
        activeCarVin,
        setActiveCarVin,
        addCarProfile,
        deleteCarProfile,
        serviceHistory,
        addServiceLog
      } = useCar();

      return (
        <div>
          <span data-testid="active-vin">{activeCarVin || 'none'}</span>
          <span data-testid="cars-count">{cars ? cars.length : 0}</span>
          <span data-testid="services-count">{serviceHistory.length}</span>
          
          <button 
            data-testid="btn-add-lada" 
            onClick={() => addCarProfile({ vin: 'LADA1234567890123', make: 'Lada', model: 'Granta', year: 2017 })}
          >
            Add Lada
          </button>
          
          <button 
            data-testid="btn-add-jetta" 
            onClick={() => addCarProfile({ vin: 'JETTA123456789012', make: 'VW', model: 'Jetta', year: 2018 })}
          >
            Add Jetta
          </button>
          
          <button 
            data-testid="btn-select-lada" 
            onClick={() => setActiveCarVin('LADA1234567890123')}
          >
            Select Lada
          </button>

          <button 
            data-testid="btn-add-service" 
            onClick={() => addServiceLog({ date: '2026-01-01', mileage: 5000, type: 'Oil Change', cost: 100 })}
          >
            Add Service Log
          </button>

          <button 
            data-testid="btn-delete-lada" 
            onClick={() => deleteCarProfile('LADA1234567890123')}
          >
            Delete Lada
          </button>
        </div>
      );
    };

    render(
      <CarProvider>
        <MultiCarTestComponent />
      </CarProvider>
    );

    // Initial state: 0 cars
    expect(screen.getByTestId('cars-count').textContent).toBe('0');
    expect(screen.getByTestId('active-vin').textContent).toBe('none');

    // Add Lada
    act(() => {
      screen.getByTestId('btn-add-lada').click();
    });
    expect(screen.getByTestId('cars-count').textContent).toBe('1');
    expect(screen.getByTestId('active-vin').textContent).toBe('LADA1234567890123');

    // Add Service to Lada
    act(() => {
      screen.getByTestId('btn-add-service').click();
    });
    expect(screen.getByTestId('services-count').textContent).toBe('1');

    // Add Jetta
    act(() => {
      screen.getByTestId('btn-add-jetta').click();
    });
    expect(screen.getByTestId('cars-count').textContent).toBe('2');
    expect(screen.getByTestId('active-vin').textContent).toBe('JETTA123456789012');
    // Jetta service count should be 0 because it's scoped per vehicle!
    expect(screen.getByTestId('services-count').textContent).toBe('0');

    // Switch back to Lada
    act(() => {
      screen.getByTestId('btn-select-lada').click();
    });
    expect(screen.getByTestId('active-vin').textContent).toBe('LADA1234567890123');
    // Lada service count should be 1
    expect(screen.getByTestId('services-count').textContent).toBe('1');

    // Delete Lada
    act(() => {
      screen.getByTestId('btn-delete-lada').click();
    });
    expect(screen.getByTestId('cars-count').textContent).toBe('1');
    expect(screen.getByTestId('active-vin').textContent).toBe('JETTA123456789012'); // automatically switches to the remaining car
    expect(screen.getByTestId('services-count').textContent).toBe('0');
  });

  it('should throw an error when useCar is called outside CarProvider', () => {
    const BadComponent = () => {
      useCar();
      return null;
    };

    const originalError = console.error;
    console.error = () => {};

    expect(() => render(<BadComponent />)).toThrow(
      'useCar must be used within a CarProvider'
    );

    console.error = originalError;
  });
});
