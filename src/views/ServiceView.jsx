import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import GlassButton from '@/components/GlassButton';
import { Trash2, Edit } from 'lucide-react';

export const ServiceView = () => {
  const { t } = useTheme();
  const {
    serviceHistory,
    addServiceLog,
    deleteServiceLog,
    updateServiceLog,
    car,
    reminders,
    addReminder,
    deleteReminder,
    toggleReminder,
    customIntervals = [],
    addCustomInterval,
    deleteCustomInterval
  } = useCar();
  const [type, setType] = useState('');
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Modal and Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLogId, setEditLogId] = useState(null);
  const [modalType, setModalType] = useState('');
  const [modalMileage, setModalMileage] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalCost, setModalCost] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalErrors, setModalErrors] = useState({});
  const [saveWarning, setSaveWarning] = useState('');

  // Reminders Modal State
  const [isRemModalOpen, setIsRemModalOpen] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState('');
  const [remType, setRemType] = useState('insurance');
  const [remMileage, setRemMileage] = useState('');
  const [remError, setRemError] = useState('');

  // Custom Intervals Modal/Form state
  const [isCustIntervalModalOpen, setIsCustIntervalModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custIntervalMileage, setCustIntervalMileage] = useState('');
  const [custLastPerformedMileage, setCustLastPerformedMileage] = useState('');
  const [custLastPerformedDate, setCustLastPerformedDate] = useState(new Date().toISOString().split('T')[0]);
  const [custError, setCustError] = useState('');

  // Helper for consistent comma-based mileage formatting
  const formatMileage = (val) => {
    if (val === undefined || val === null) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const plannerSpecs = [
    {
      key: 'oil',
      title: t('Замена масла', 'Oil Change'),
      interval: 15000,
      keywords: ['oil', 'то-1', 'то-2', 'engine oil', 'масло', 'масл'],
      description: t('Замените моторное масло и масляный фильтр для долгой службы двигателя.', 'Replace engine oil and filter for optimal performance.')
    },
    {
      key: 'brakes',
      title: t('Обслуживание тормозов', 'Brake Inspection'),
      interval: 30000,
      keywords: ['brake', 'колодки', 'тормоз', 'диски'],
      description: t('Проверьте износ тормозных колодок, дисков и уровень тормозной жидкости.', 'Inspect brake pads, rotors, and fluid.')
    },
    {
      key: 'tyres',
      title: t('Ротация и смена шин', 'Tire Rotation'),
      interval: 10000,
      keywords: ['tire', 'tyre', 'shina', 'шины', 'колеса', 'rotation'],
      description: t('Проведите перестановку шин для равномерного износа протектора.', 'Rotate tyres for uniform tread wear.')
    }
  ];

  const getRecommendations = () => {
    const currentMileage = car?.currentMileage || 0;
    const yearlyMileage = car?.yearlyMileage || 15000;

    return plannerSpecs.map(spec => {
      const matches = serviceHistory.filter(log => {
        const typeLower = (log.type || '').toLowerCase();
        const notesLower = (log.notes || '').toLowerCase();
        return spec.keywords.some(k => typeLower.includes(k) || notesLower.includes(k));
      });

      const lastMileage = matches.length > 0 ? Math.max(...matches.map(m => m.mileage || 0)) : 0;
      const nextDueMileage = lastMileage + spec.interval;
      const isOverdue = currentMileage >= nextDueMileage;
      const remainingMileage = nextDueMileage - currentMileage;

      let timeEstimate = '';
      if (isOverdue) {
        timeEstimate = t(
          `Просрочено на ${formatMileage(currentMileage - nextDueMileage)} км`,
          `Overdue by ${formatMileage(currentMileage - nextDueMileage)} km`
        );
      } else if (yearlyMileage > 0) {
        const months = Math.round((remainingMileage / yearlyMileage) * 12);
        timeEstimate = months <= 1 
          ? t('Рекомендуется в этом месяце', 'Due this month')
          : t(`Рекомендуется через ~${months} мес.`, `Due in approx. ${months} months`);
      }

      return {
        ...spec,
        lastMileage,
        nextDueMileage,
        isOverdue,
        timeEstimate
      };
    });
  };

  const serviceOptions = [
    { value: 'Oil Change', label: t('Замена масла', 'Oil Change') },
    { value: 'Brake Inspection', label: t('Обслуживание тормозов', 'Brake Inspection') },
    { value: 'Tire Rotation', label: t('Ротация и смена шин', 'Tire Rotation') },
    { value: 'General Diagnostics', label: t('Общая диагностика', 'General Diagnostics') }
  ];

  const odometerWarning = !isEditMode && modalMileage !== '' && car && typeof car.currentMileage === 'number' && Number(modalMileage) < car.currentMileage
    ? t("Введенный пробег меньше текущего пробега автомобиля", "Mileage entered is less than the vehicle's current mileage")
    : '';

  // Inline Form (Test 11 Happy Path) Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!type || !mileage || !date || !cost) {
      setError(t('Пожалуйста, заполните все обязательные поля.', 'Please fill in all required fields.'));
      return;
    }

    // Future Date Validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (date > todayStr) {
      setError(t('Дата обслуживания не может быть в будущем', 'Service date cannot be in the future'));
      return;
    }

    // Cost Range Validation
    const costVal = Number(cost);
    if (isNaN(costVal) || costVal <= 0 || costVal > 1000000) {
      setError(t('Стоимость должна быть положительным числом', 'Cost must be a positive number'));
      return;
    }

    addServiceLog({
      type,
      mileage: Number(mileage),
      date,
      cost: Number(cost),
      notes
    });

    setType('');
    setMileage('');
    setCost('');
    setNotes('');
  };

  // Open Modal in Add Mode
  const openAddModal = () => {
    setModalType('');
    setModalMileage('');
    setModalDate('');
    setModalCost('');
    setModalNotes('');
    setModalErrors({});
    setSaveWarning('');
    setIsEditMode(false);
    setEditLogId(null);
    setIsModalOpen(true);
  };

  // Open Modal in Edit Mode
  const openEditModal = (log) => {
    setModalType(log.type || '');
    setModalMileage(log.mileage !== undefined && log.mileage !== null ? String(log.mileage) : '');
    setModalDate(log.date || '');
    setModalCost(log.cost !== undefined && log.cost !== null ? String(log.cost) : '');
    setModalNotes(log.notes || '');
    setModalErrors({});
    setSaveWarning('');
    setIsEditMode(true);
    setEditLogId(log.id);
    setIsModalOpen(true);
  };

  // Modal Submit (Save/Edit Record with validations)
  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Required Field check: Service Type
    if (!modalType) {
      newErrors.type = t('Укажите тип обслуживания', 'Service Type is required');
    }

    // 2. Required Field check: Service Date
    if (!modalDate) {
      newErrors.date = t('Укажите дату обслуживания', 'Service Date is required');
    } else {
      // 3. Future Date Validation
      const todayStr = new Date().toISOString().split('T')[0];
      if (modalDate > todayStr) {
        newErrors.date = t('Дата обслуживания не может быть в будущем', 'Service date cannot be in the future');
      }
    }

    // 4. Cost Range Validation (Cost > 0 and <= 1,000,000)
    if (modalCost !== '') {
      const costVal = Number(modalCost);
      if (isNaN(costVal) || costVal <= 0 || costVal > 1000000) {
        newErrors.cost = t('Стоимость должна быть положительным числом', 'Cost must be a positive number');
      }
    }

    // Odometer warning check removed from validation to prevent blocking save

    if (Object.keys(newErrors).length > 0) {
      setModalErrors(newErrors);
      return;
    }

    // Prepare and sanitize data for storage/state
    const logData = {
      type: modalType,
      mileage: modalMileage !== '' ? Number(modalMileage) : 0,
      date: modalDate,
      cost: modalCost !== '' ? Number(modalCost) : 0,
      notes: modalNotes
    };

    if (!isEditMode && modalMileage !== '') {
      const mileageVal = Number(modalMileage);
      if (car && typeof car.currentMileage === 'number' && mileageVal < car.currentMileage) {
        setSaveWarning(t("Введенный пробег меньше текущего пробега автомобиля", "Mileage entered is less than the vehicle's current mileage"));
      } else {
        setSaveWarning('');
      }
    } else {
      setSaveWarning('');
    }

    if (isEditMode) {
      updateServiceLog(editLogId, logData);
    } else {
      addServiceLog(logData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('Журнал обслуживания', 'Maintenance Log')}</h2>
      {saveWarning && (
        <div data-testid="odometer-warning" className="p-4 bg-neonRose/20 border border-neonRose/40 rounded-xl text-neonRose text-sm">
          {saveWarning}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Добавить запись ТО', 'Add Service Record')}</h3>
          {!isModalOpen ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <SelectField 
                id={isModalOpen ? "inline-service-type" : "service-type"}
                label={t('Тип обслуживания *', 'Service Type *')} 
                options={serviceOptions} 
                placeholder={t('Выберите тип', 'Select service type')}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <InputField 
                id={isModalOpen ? "inline-odometer" : "odometer"}
                label={t('Пробег на одометре (км) *', 'Odometer (km) *')} 
                type="number"
                placeholder={t('Например, 85000', 'e.g., 85000')}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  id="service-date"
                  label={t('Дата *', 'Date *')} 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <InputField 
                  id="service-cost"
                  label={t('Стоимость (₽) *', 'Cost ($) *')} 
                  type="number"
                  placeholder={t('Например, 5000', 'e.g., 120')}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <InputField 
                id="service-notes"
                label={t('Заметки', 'Notes')} 
                placeholder={t('Например, залил масло синтетику 5W-30', 'e.g., used fully synthetic 5W-30')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {error && <p className="text-xs text-neonRose">{error}</p>}
              <GlassButton variant="primary" type="submit" className="w-full">{t('Добавить запись', 'Add Record')}</GlassButton>
            </form>
          ) : (
            <p className="text-slate-400 text-sm">{t('Форма активна в модальном окне.', 'Form is active in the popup modal.')}</p>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neonEmerald">{t('История обслуживания', 'Past Records')}</h3>
            <button 
              id="add-service-btn" 
              onClick={openAddModal}
              className="px-3 py-1.5 bg-neonCyan/20 hover:bg-neonCyan/35 text-neonCyan border border-neonCyan/30 rounded-lg text-sm transition-all"
            >
              {t('Новое ТО', 'Add Service')}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {serviceHistory.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('История обслуживания пуста. Заполните форму для добавления записи.', 'No service records registered yet. Fill in the form to register maintenance history.')}</p>
            ) : (
              serviceHistory.map((log) => (
                <div key={log.id} className="p-3 bg-white/5 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{log.type}</span>
                      <span className="text-xs text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('Пробег', 'Mileage')}: {log.mileage?.toLocaleString()} {t('км', 'km')} • {t('Стоимость', 'Cost')}: {t(formatMileage(log.cost) + ' ₽', '$' + formatMileage(log.cost))}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-350 italic mt-1 border-t border-slate-200/30 dark:border-white/5 pt-1">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(log)}
                      className="edit-service-btn p-1.5 text-slate-400 hover:text-neonCyan rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      data-testid={`edit-${log.id}`}
                      title={t('Редактировать', 'Edit log')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteServiceLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-neonRose rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      title={t('Удалить', 'Delete log')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Maintenance Planner Grid (M3.2) */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neonCyan">{t('Планировщик обслуживания', 'Maintenance Planner')}</h3>
            <button 
              onClick={() => setIsCustIntervalModalOpen(true)}
              className="px-2.5 py-1.5 bg-neonCyan/10 hover:bg-neonCyan/20 text-neonCyan border border-neonCyan/30 rounded-lg text-xs font-semibold transition-all"
            >
              + {t('Интервал', 'Add Interval')}
            </button>
          </div>
          <div className="space-y-4">
            {getRecommendations().map(rec => (
              <div key={rec.key} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{rec.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t(`Следующая ${rec.title} на ${formatMileage(rec.nextDueMileage)} км`, `Next ${rec.title} due at ${formatMileage(rec.nextDueMileage)} km`)}
                  </p>
                  <span className={`text-[10px] mt-1 inline-block font-medium ${rec.isOverdue ? 'text-neonRose' : 'text-neonEmerald'}`}>
                    {rec.timeEstimate}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {t('Прошлый раз', 'Last')}: {rec.lastMileage > 0 ? `${formatMileage(rec.lastMileage)} ${t('км', 'km')}` : t('Никогда', 'Never')}
                </div>
              </div>
            ))}

            {/* Custom intervals */}
            {customIntervals.map(rule => {
              const currentMileage = car?.currentMileage || 0;
              const nextDueMileage = rule.lastPerformedMileage + (Number(rule.intervalMileage) || 10000);
              const isOverdue = currentMileage >= nextDueMileage;
              const progress = Math.min(100, Math.max(0, ((currentMileage - rule.lastPerformedMileage) / (Number(rule.intervalMileage) || 10000)) * 100));

              return (
                <div key={rule.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{rule.name}</h4>
                      <p className="text-xs text-slate-400">
                        {t(`След. ТО при ${formatMileage(nextDueMileage)} км`, `Next service at ${formatMileage(nextDueMileage)} km`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {t('Прошлый раз:', 'Last:')} {formatMileage(rule.lastPerformedMileage)} км
                      </span>
                      <button
                        onClick={() => deleteCustomInterval(rule.id)}
                        className="p-1 text-slate-400 hover:text-neonRose rounded-lg transition-colors"
                        title={t('Удалить интервал', 'Delete Interval')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${isOverdue ? 'bg-neonRose' : 'bg-neonCyan'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={isOverdue ? 'text-neonRose font-bold' : 'text-slate-450'}>
                      {isOverdue 
                        ? t(`Просрочено на ${formatMileage(currentMileage - nextDueMileage)} км`, `Overdue by ${formatMileage(currentMileage - nextDueMileage)} km`)
                        : t(`Осталось ${formatMileage(nextDueMileage - currentMileage)} км`, `Remaining ${formatMileage(nextDueMileage - currentMileage)} km`)}
                    </span>
                    <span className="text-slate-500 font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Reminders & Alerts List (M3.3) */}
        <GlassCard className="flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neonEmerald">{t('Напоминания и уведомления', 'Reminders & Alerts')}</h3>
            <button 
              id="add-reminder-btn" 
              onClick={() => setIsRemModalOpen(true)}
              className="px-3 py-1.5 bg-neonCyan/20 hover:bg-neonCyan/35 text-neonCyan border border-neonCyan/30 rounded-lg text-sm transition-all"
            >
              {t('Добавить', 'Add Reminder')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {reminders.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('Напоминания отсутствуют.', 'No reminders set.')}</p>
            ) : (
              reminders.map(rem => (
                <div 
                  key={rem.id} 
                  data-testid={rem.id.startsWith('rem-') ? rem.id : `rem-${rem.id}`}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-semibold text-slate-200 text-sm block">{rem.title}</span>
                    <span className="text-xs text-slate-400 block">{t('Срок', 'Due')}: {rem.dueDate}</span>
                    {rem.dueMileage && (
                      <span className="text-xs text-slate-400 block">{t('На пробеге', 'At mileage')}: {formatMileage(rem.dueMileage)} {t('км', 'km')}</span>
                    )}
                    <span className={`text-[10px] uppercase font-bold mt-1 inline-block ${rem.active ? 'text-neonEmerald' : 'text-slate-500'}`}>
                      {rem.active ? t('Активно', 'Active') : t('Неактивно', 'Inactive')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id={rem.id.startsWith('rem-') ? `toggle-${rem.id}` : `toggle-rem-${rem.id}`}
                      data-testid={rem.id.startsWith('rem-') ? `toggle-${rem.id}` : `toggle-rem-${rem.id}`}
                      checked={rem.active}
                      onChange={() => toggleReminder(rem.id)}
                      className="w-4 h-4 rounded text-neonCyan bg-slate-800 border-white/10 focus:ring-neonCyan"
                    />
                    <button 
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-neonRose rounded-lg hover:bg-white/5 transition-all"
                      title={t('Удалить напоминание', 'Delete Reminder')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Modal Popup for Add/Edit and Validations */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md">
            <GlassCard className="border border-white/10 dark:border-white/5 relative">
              <h3 className="text-lg font-bold text-neonCyan mb-4">
                {isEditMode ? t('Редактировать запись ТО', 'Edit Service Record') : t('Добавить запись ТО', 'Add Service Record')}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <SelectField 
                  id={isModalOpen ? "service-type" : "modal-service-type"}
                  label={t('Тип обслуживания *', 'Service Type *')} 
                  options={serviceOptions} 
                  placeholder={t('Выберите тип', 'Select service type')}
                  value={modalType}
                  onChange={(e) => setModalType(e.target.value)}
                  error={modalErrors.type}
                />
                
                <div className="space-y-1">
                  <InputField 
                    id={isModalOpen ? "odometer" : "modal-odometer"}
                    label={t('Пробег на одометре (км)', 'Odometer (km)')} 
                    type="number"
                    placeholder={t('Например, 85000', 'e.g., 85000')}
                    value={modalMileage}
                    onChange={(e) => setModalMileage(e.target.value)}
                    error={odometerWarning ? ' ' : undefined}
                  />
                  {odometerWarning && (
                    <span data-testid="odometer-warning" className="text-xs text-neonRose mt-0.5 block font-medium">
                      {odometerWarning}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    id="date"
                    label={t('Дата *', 'Date *')} 
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    error={modalErrors.date}
                  />
                  <InputField 
                    id="cost"
                    label={t('Стоимость (₽) *', 'Cost ($) *')} 
                    type="number"
                    placeholder={t('Например, 5000', 'e.g., 120')}
                    value={modalCost}
                    onChange={(e) => setModalCost(e.target.value)}
                    error={modalErrors.cost}
                  />
                </div>
                
                <InputField 
                  id="notes"
                  label={t('Заметки', 'Notes')} 
                  placeholder={t('Например, залил масло синтетику 5W-30', 'e.g., used fully synthetic 5W-30')}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
                
                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {t('Отмена', 'Cancel')}
                  </button>
                  <button 
                    id="save-service-record"
                    type="submit" 
                    className="px-4 py-2 text-sm bg-neonCyan text-slate-950 font-semibold rounded-xl hover:bg-neonCyan/80 transition-colors"
                  >
                    {t('Сохранить', 'Save')}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Add Reminder Modal (M3.3) */}
      {isRemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <GlassCard className="border border-white/10 relative">
              <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Добавить напоминание', 'Add Reminder')}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!remTitle || !remDate) {
                  setRemError(t('Название и дата обязательны', 'Title and Date are required'));
                  return;
                }
                addReminder({
                  title: remTitle,
                  dueDate: remDate,
                  type: remType,
                  dueMileage: remMileage ? Number(remMileage) : undefined
                });
                setRemTitle('');
                setRemDate('');
                setRemType('insurance');
                setRemMileage('');
                setRemError('');
                setIsRemModalOpen(false);
              }} className="space-y-4">
                <InputField 
                  id="reminder-title"
                  label={t('Название *', 'Title *')}
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder={t('Например, Продление ОСАГО', 'e.g. OSAGO Renewal')}
                />
                <InputField 
                  id="reminder-date"
                  label={t('Срок (Дата) *', 'Due Date *')}
                  type="date"
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                />
                <SelectField 
                  id="reminder-type"
                  label={t('Тип', 'Type')}
                  options={[
                    { value: 'insurance', label: t('Страховка', 'Insurance') },
                    { value: 'tyres', label: t('Шины/Колеса', 'Tyres') },
                    { value: 'maintenance', label: t('ТО / Обслуживание', 'ТО / Maintenance') }
                  ]}
                  value={remType}
                  onChange={(e) => setRemType(e.target.value)}
                />
                <InputField 
                  id="reminder-mileage"
                  label={t('Срок (Пробег, необязательно)', 'Due Mileage (Optional)')}
                  type="number"
                  value={remMileage}
                  onChange={(e) => setRemMileage(e.target.value)}
                  placeholder={t('Например, 120000', 'e.g. 120000')}
                />
                {remError && <p className="text-xs text-neonRose">{remError}</p>}
                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsRemModalOpen(false);
                      setRemError('');
                    }}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {t('Отмена', 'Cancel')}
                  </button>
                  <button 
                    id="save-reminder"
                    type="submit" 
                    className="px-4 py-2 text-sm bg-neonCyan text-slate-950 font-semibold rounded-xl hover:bg-neonCyan/80 transition-colors"
                  >
                    {t('Сохранить', 'Save')}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Add Custom Interval Modal */}
      {isCustIntervalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <GlassCard className="border border-white/10 relative">
              <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Добавить интервал ТО', 'Add Service Interval')}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!custName || !custIntervalMileage || !custLastPerformedMileage) {
                  setCustError(t('Все поля со звездочкой обязательны', 'All starred fields are required'));
                  return;
                }
                addCustomInterval({
                  name: custName,
                  intervalMileage: Number(custIntervalMileage),
                  lastPerformedMileage: Number(custLastPerformedMileage),
                  lastPerformedDate: custLastPerformedDate
                });
                setCustName('');
                setCustIntervalMileage('');
                setCustLastPerformedMileage('');
                setCustLastPerformedDate(new Date().toISOString().split('T')[0]);
                setCustError('');
                setIsCustIntervalModalOpen(false);
              }} className="space-y-4">
                <InputField 
                  id="cust-name"
                  label={t('Название работы *', 'Service Name *')}
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder={t('Например, Замена масла АКПП', 'e.g. Gearbox Oil Change')}
                />
                <InputField 
                  id="cust-interval"
                  label={t('Периодичность (км) *', 'Interval Mileage (km) *')}
                  type="number"
                  value={custIntervalMileage}
                  onChange={(e) => setCustIntervalMileage(e.target.value)}
                  placeholder="e.g. 60000"
                />
                <InputField 
                  id="cust-last-mileage"
                  label={t('Пробег при последнем выполнении *', 'Last Performed Mileage (km) *')}
                  type="number"
                  value={custLastPerformedMileage}
                  onChange={(e) => setCustLastPerformedMileage(e.target.value)}
                  placeholder="e.g. 45000"
                />
                <InputField 
                  id="cust-last-date"
                  label={t('Дата последнего выполнения *', 'Last Performed Date *')}
                  type="date"
                  value={custLastPerformedDate}
                  onChange={(e) => setCustLastPerformedDate(e.target.value)}
                />
                {custError && <p className="text-xs text-neonRose">{custError}</p>}
                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCustIntervalModalOpen(false);
                      setCustError('');
                    }}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {t('Отмена', 'Cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm bg-neonCyan text-slate-950 font-semibold rounded-xl hover:bg-neonCyan/80 transition-colors"
                  >
                    {t('Сохранить', 'Save')}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceView;
