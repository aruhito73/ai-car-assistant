import React, { createContext, useContext, useState } from 'react';
import { storage } from '@/services/storage.js';

export const CarContext = createContext(null);

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const CarProvider = ({ children }) => {
  const [car, setCar] = useState(() => storage.getCarProfile());
  const [serviceHistory, setServiceHistory] = useState(() => storage.getServiceHistory() || []);
  const [expenses, setExpenses] = useState(() => storage.getExpenses() || []);
  const [reminders, setReminders] = useState(() => storage.getReminders() || []);

  const updateCarProfile = (profile) => {
    setCar(profile);
    storage.saveCarProfile(profile);
  };

  const addServiceLog = (log) => {
    const newLog = { id: generateId(), ...log };
    setServiceHistory((prev) => {
      const next = [...prev, newLog];
      storage.saveServiceHistory(next);
      return next;
    });
    return newLog;
  };

  const updateServiceLog = (id, updatedLog) => {
    setServiceHistory((prev) => {
      const next = prev.map((log) => (log.id === id ? { ...log, ...updatedLog } : log));
      storage.saveServiceHistory(next);
      return next;
    });
  };

  const deleteServiceLog = (id) => {
    setServiceHistory((prev) => {
      const next = prev.filter((log) => log.id !== id);
      storage.saveServiceHistory(next);
      return next;
    });
  };

  const addExpense = (expense) => {
    const newExpense = { id: generateId(), ...expense };
    setExpenses((prev) => {
      const next = [...prev, newExpense];
      storage.saveExpenses(next);
      return next;
    });
    return newExpense;
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses((prev) => {
      const next = prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp));
      storage.saveExpenses(next);
      return next;
    });
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => {
      const next = prev.filter((exp) => exp.id !== id);
      storage.saveExpenses(next);
      return next;
    });
  };

  const addReminder = (reminder) => {
    const newReminder = { id: generateId(), active: true, ...reminder };
    setReminders((prev) => {
      const next = [...prev, newReminder];
      storage.saveReminders(next);
      return next;
    });
    return newReminder;
  };

  const updateReminder = (id, updatedReminder) => {
    setReminders((prev) => {
      const next = prev.map((rem) => (rem.id === id ? { ...rem, ...updatedReminder } : rem));
      storage.saveReminders(next);
      return next;
    });
  };

  const deleteReminder = (id) => {
    setReminders((prev) => {
      const next = prev.filter((rem) => rem.id !== id);
      storage.saveReminders(next);
      return next;
    });
  };

  const toggleReminder = (id) => {
    setReminders((prev) => {
      const next = prev.map((rem) => (rem.id === id ? { ...rem, active: !rem.active } : rem));
      storage.saveReminders(next);
      return next;
    });
  };

  const clearAllData = () => {
    setCar(null);
    setServiceHistory([]);
    setExpenses([]);
    setReminders([]);
    storage.clearAll();
  };

  return (
    <CarContext.Provider
      value={{
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
      }}
    >
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
};

export default CarProvider;
