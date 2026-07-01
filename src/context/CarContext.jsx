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
  const [allDocuments, setAllDocuments] = useState(() => {
    const list = storage.getDocuments() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allFuelLog, setAllFuelLog] = useState(() => {
    const list = storage.getFuelLog() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allCustomIntervals, setAllCustomIntervals] = useState(() => {
    const list = storage.getCustomIntervals() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allTripChecklists, setAllTripChecklists] = useState(() => {
    const list = storage.getTripChecklists() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [allFluidReplacements, setAllFluidReplacements] = useState(() => {
    const list = storage.getFluidReplacements() || [];
    return list.map(item => (!item.carVin && initialActiveVin) ? { ...item, carVin: initialActiveVin } : item);
  });
  const [lastWashDate, setLastWashDate] = useState(() => {
    return storage.getLastWashDate() || '';
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
      setAllDocuments((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveDocuments(next);
        return next;
      });
      setAllFuelLog((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveFuelLog(next);
        return next;
      });
      setAllCustomIntervals((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveCustomIntervals(next);
        return next;
      });
      setAllTripChecklists((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveTripChecklists(next);
        return next;
      });
      setAllFluidReplacements((prev) => {
        const next = prev.map(item => item.carVin === oldVin ? { ...item, carVin: profile.vin } : item);
        storage.saveFluidReplacements(next);
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
    setAllDocuments((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveDocuments(next);
      return next;
    });
    setAllFuelLog((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveFuelLog(next);
      return next;
    });
    setAllCustomIntervals((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveCustomIntervals(next);
      return next;
    });
    setAllTripChecklists((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveTripChecklists(next);
      return next;
    });
    setAllFluidReplacements((prev) => {
      const next = prev.filter(item => item.carVin !== vin);
      storage.saveFluidReplacements(next);
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
  const documents = allDocuments.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const fuelLog = allFuelLog.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const customIntervals = allCustomIntervals.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const tripChecklists = allTripChecklists.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);
  const fluidReplacements = allFluidReplacements.filter(item => !activeCarVin ? !item.carVin : item.carVin === activeCarVin);

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

  const addDocument = (doc) => {
    const newDoc = { id: generateId(), carVin: activeCarVin, ...doc };
    setAllDocuments((prev) => {
      const next = [...prev, newDoc];
      storage.saveDocuments(next);
      return next;
    });
    return newDoc;
  };

  const updateDocument = (id, updatedDoc) => {
    setAllDocuments((prev) => {
      const next = prev.map((doc) => (doc.id === id ? { ...doc, ...updatedDoc } : doc));
      storage.saveDocuments(next);
      return next;
    });
  };

  const deleteDocument = (id) => {
    setAllDocuments((prev) => {
      const next = prev.filter((doc) => doc.id !== id);
      storage.saveDocuments(next);
      return next;
    });
  };

  const addFuelEntry = (entry) => {
    const newEntry = { id: generateId(), carVin: activeCarVin, ...entry };
    setAllFuelLog((prev) => {
      const next = [...prev, newEntry];
      storage.saveFuelLog(next);
      return next;
    });
    return newEntry;
  };

  const updateFuelEntry = (id, updatedEntry) => {
    setAllFuelLog((prev) => {
      const next = prev.map((entry) => (entry.id === id ? { ...entry, ...updatedEntry } : entry));
      storage.saveFuelLog(next);
      return next;
    });
  };

  const deleteFuelEntry = (id) => {
    setAllFuelLog((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      storage.saveFuelLog(next);
      return next;
    });
    setAllExpenses((prev) => {
      const next = prev.filter((exp) => exp.refuelId !== id);
      storage.saveExpenses(next);
      return next;
    });
  };

  const addCustomInterval = (interval) => {
    const newInterval = { id: generateId(), carVin: activeCarVin, ...interval };
    setAllCustomIntervals((prev) => {
      const next = [...prev, newInterval];
      storage.saveCustomIntervals(next);
      return next;
    });
    return newInterval;
  };

  const updateCustomInterval = (id, updatedInterval) => {
    setAllCustomIntervals((prev) => {
      const next = prev.map((interval) => (interval.id === id ? { ...interval, ...updatedInterval } : interval));
      storage.saveCustomIntervals(next);
      return next;
    });
  };

  const deleteCustomInterval = (id) => {
    setAllCustomIntervals((prev) => {
      const next = prev.filter((interval) => interval.id !== id);
      storage.saveCustomIntervals(next);
      return next;
    });
  };

  const toggleChecklistItem = (listId, itemId) => {
    setAllTripChecklists((prev) => {
      const existsIndex = prev.findIndex(item => item.carVin === activeCarVin && item.listId === listId && item.itemId === itemId);
      let next;
      if (existsIndex >= 0) {
        next = prev.map((item, idx) => idx === existsIndex ? { ...item, checked: !item.checked } : item);
      } else {
        const newItem = {
          id: generateId(),
          carVin: activeCarVin,
          listId,
          itemId,
          checked: true
        };
        next = [...prev, newItem];
      }
      storage.saveTripChecklists(next);
      return next;
    });
  };

  const resetChecklist = (listId) => {
    setAllTripChecklists((prev) => {
      const next = prev.filter(item => !(item.carVin === activeCarVin && item.listId === listId));
      storage.saveTripChecklists(next);
      return next;
    });
  };

  const logFluidReplacement = (type, date, mileage) => {
    const newReplacement = {
      id: generateId(),
      carVin: activeCarVin,
      type,
      date,
      mileage: Number(mileage)
    };
    setAllFluidReplacements((prev) => {
      const next = prev.some(f => f.carVin === activeCarVin && f.type === type)
        ? prev.map(f => (f.carVin === activeCarVin && f.type === type) ? newReplacement : f)
        : [...prev, newReplacement];
      storage.saveFluidReplacements(next);
      return next;
    });
    return newReplacement;
  };

  const updateLastWashDate = (date) => {
    setLastWashDate(date);
    storage.saveLastWashDate(date);
  };

  const clearAllData = () => {
    setCars([]);
    setActiveCarVinState(null);
    setAllServiceHistory([]);
    setAllExpenses([]);
    setAllReminders([]);
    setAllDocuments([]);
    setAllFuelLog([]);
    setAllCustomIntervals([]);
    setAllTripChecklists([]);
    setAllFluidReplacements([]);
    setLastWashDate('');
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
        documents,
        fuelLog,
        customIntervals,
        tripChecklists,
        fluidReplacements,
        lastWashDate,
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
        addDocument,
        updateDocument,
        deleteDocument,
        addFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
        addCustomInterval,
        updateCustomInterval,
        deleteCustomInterval,
        toggleChecklistItem,
        resetChecklist,
        logFluidReplacement,
        updateLastWashDate,
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
