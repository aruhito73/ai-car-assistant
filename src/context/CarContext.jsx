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
  const initialCars = storage.getCars() || [];
  const initialActiveVin = storage.getActiveCarVin() || (initialCars[0] ? initialCars[0].vin : null);

  const [cars, setCars] = useState(initialCars);
  const [activeCarVin, setActiveCarVinState] = useState(initialActiveVin);

  const [allServiceHistory, setAllServiceHistory] = useState(() => {
    const list = storage.getServiceHistory() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allExpenses, setAllExpenses] = useState(() => {
    const list = storage.getExpenses() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allReminders, setAllReminders] = useState(() => {
    const list = storage.getReminders() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });

  const activeCar = cars.find(c => c.vin === activeCarVin) || cars[0] || null;

  const setActiveCarVin = (vin) => {
    setActiveCarVinState(vin);
    storage.saveActiveCarVin(vin);
  };

  const addCarProfile = (profile) => {
    setCars((prev) => {
      const next = prev.some(c => c.vin === profile.vin)
        ? prev.map(c => c.vin === profile.vin ? profile : c)
        : [...prev, profile];
      storage.saveCars(next);
      return next;
    });
    setActiveCarVin(profile.vin);
  };

  const updateCarProfile = (profile) => {
    const oldVin = activeCar ? activeCar.vin : profile.vin;
    
    setCars((prev) => {
      let next;
      const index = prev.findIndex(c => c.vin === oldVin);
      if (index >= 0) {
        next = [...prev];
        next[index] = profile;
      } else {
        next = [...prev, profile];
      }
      storage.saveCars(next);
      return next;
    });

    if (oldVin !== profile.vin) {
      setAllServiceHistory((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveServiceHistory(next);
        return next;
      });
      setAllExpenses((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveExpenses(next);
        return next;
      });
      setAllReminders((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveReminders(next);
        return next;
      });
      setActiveCarVin(profile.vin);
    } else {
      setActiveCarVin(profile.vin);
    }
  };

  const deleteCarProfile = (vin) => {
    setCars((prev) => {
      const next = prev.filter(c => c.vin !== vin);
      storage.saveCars(next);
      return next;
    });

    setAllServiceHistory((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveServiceHistory(next);
      return next;
    });
    setAllExpenses((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveExpenses(next);
      return next;
    });
    setAllReminders((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveReminders(next);
      return next;
    });

    if (activeCarVin === vin) {
      const remainingCars = cars.filter(c => c.vin !== vin);
      const nextActiveVin = remainingCars[0] ? remainingCars[0].vin : null;
      setActiveCarVin(nextActiveVin);
    }
  };

  const serviceHistory = allServiceHistory.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const expenses = allExpenses.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const reminders = allReminders.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);

  const addServiceLog = (log) => {
    const newLog = { id: generateId(), carVin: activeCarVin, ...log };
    setAllServiceHistory((prev) => {
      const next = [...prev, newLog];
      storage.saveServiceHistory(next);
      return next;
    });
    return newLog;
  };

  const updateServiceLog = (id, updatedLog) => {
    setAllServiceHistory((prev) => {
      const next = prev.map((log) => (log.id === id ? { ...log, ...updatedLog } : log));
      storage.saveServiceHistory(next);
      return next;
    });
  };

  const deleteServiceLog = (id) => {
    setAllServiceHistory((prev) => {
      const next = prev.filter((log) => log.id !== id);
      storage.saveServiceHistory(next);
      return next;
    });
  };

  const addExpense = (expense) => {
    const newExpense = { id: generateId(), carVin: activeCarVin, ...expense };
    setAllExpenses((prev) => {
      const next = [...prev, newExpense];
      storage.saveExpenses(next);
      return next;
    });
    return newExpense;
  };

  const updateExpense = (id, updatedExpense) => {
    setAllExpenses((prev) => {
      const next = prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp));
      storage.saveExpenses(next);
      return next;
    });
  };

  const deleteExpense = (id) => {
    setAllExpenses((prev) => {
      const next = prev.filter((exp) => exp.id !== id);
      storage.saveExpenses(next);
      return next;
    });
  };

  const addReminder = (reminder) => {
    const newReminder = { id: generateId(), active: true, carVin: activeCarVin, ...reminder };
    setAllReminders((prev) => {
      const next = [...prev, newReminder];
      storage.saveReminders(next);
      return next;
    });
    return newReminder;
  };

  const updateReminder = (id, updatedReminder) => {
    setAllReminders((prev) => {
      const next = prev.map((rem) => (rem.id === id ? { ...rem, ...updatedReminder } : rem));
      storage.saveReminders(next);
      return next;
    });
  };

  const deleteReminder = (id) => {
    setAllReminders((prev) => {
      const next = prev.filter((rem) => rem.id !== id);
      storage.saveReminders(next);
      return next;
    });
  };

  const toggleReminder = (id) => {
    setAllReminders((prev) => {
      const next = prev.map((rem) => (rem.id === id ? { ...rem, active: !rem.active } : rem));
      storage.saveReminders(next);
      return next;
    });
  };

  const clearAllData = () => {
    setCars([]);
    setActiveCarVinState(null);
    setAllServiceHistory([]);
    setAllExpenses([]);
    setAllReminders([]);
    storage.clearAll();
  };

  return (
    <CarContext.Provider
      value={{
        car: activeCar,
        cars,
        activeCarVin,
        setActiveCarVin,
        addCarProfile,
        deleteCarProfile,
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
