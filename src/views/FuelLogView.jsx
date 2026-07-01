import React, { useState, useMemo } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import EmptyState from '@/components/EmptyState';
import { Trash2, Fuel, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const FuelLogView = () => {
  const { t } = useTheme();
  const { car, fuelLog = [], addFuelEntry, deleteFuelEntry, addExpense } = useCar();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [error, setError] = useState('');

  const calculateConsumption = useMemo(() => {
    // Sort fuel entries chronologically
    const sorted = [...fuelLog].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find consecutive pairs of fullTank заправок
    let totalLiters = 0;
    let totalKm = 0;
    let lastFullTankOdometer = null;
    let accumulatedLiters = 0;

    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      if (lastFullTankOdometer === null) {
        if (entry.fullTank) {
          lastFullTankOdometer = entry.odometer;
          accumulatedLiters = 0;
        }
      } else {
        accumulatedLiters += entry.liters;
        if (entry.fullTank) {
          const distance = entry.odometer - lastFullTankOdometer;
          if (distance > 0) {
            totalKm += distance;
            totalLiters += accumulatedLiters;
          }
          lastFullTankOdometer = entry.odometer;
          accumulatedLiters = 0;
        }
      }
    }

    if (totalKm === 0) return null;
    return parseFloat(((totalLiters / totalKm) * 100).toFixed(1));
  }, [fuelLog]);

  const priceHistoryData = useMemo(() => {
    return [...fuelLog]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => ({
        date: entry.date,
        price: entry.pricePerLiter
      }));
  }, [fuelLog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!date || !odometer || !liters || !pricePerLiter) {
      setError(t('Пожалуйста, заполните все поля.', 'Please fill in all fields.'));
      return;
    }

    const numOdometer = Number(odometer);
    const numLiters = Number(liters);
    const numPrice = Number(pricePerLiter);

    if (isNaN(numOdometer) || isNaN(numLiters) || isNaN(numPrice)) {
      setError(t('Введенные данные должны быть числами.', 'Inputs must be valid numbers.'));
      return;
    }

    if (numOdometer < 0 || numLiters <= 0 || numPrice <= 0) {
      setError(t('Введенные показатели должны быть положительными.', 'Inputs must be positive numbers.'));
      return;
    }

    if (new Date(date) > new Date()) {
      setError(t('Дата заправки не может быть в будущем.', 'Date cannot be in the future.'));
      return;
    }

    const totalCost = parseFloat((numLiters * numPrice).toFixed(2));

    // Save fuel entry
    const entry = addFuelEntry({
      date,
      odometer: numOdometer,
      liters: numLiters,
      pricePerLiter: numPrice,
      totalCost,
      fullTank
    });

    // Also automatically log to Expenses category 'Fuel' so the finance tracker aggregates it!
    addExpense({
      date,
      category: 'Fuel',
      cost: totalCost,
      notes: `${t('Заправка:', 'Refuel:')} ${numLiters} ${t('л', 'L')} @ ${numPrice} ${t('₽/л', 'RUB/L')}`,
      refuelId: entry.id // link to fuel entry so we can clean up if deleted
    });

    setOdometer('');
    setLiters('');
    setPricePerLiter('');
    setFullTank(true);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (id) => {
    deleteFuelEntry(id);
    // Note: expenses clean up is handled inside context or can be cleared.
    // For simplicity, we can let CarContext handle it or delete manually.
  };

  if (!car) {
    return (
      <EmptyState 
        icon={AlertTriangle}
        title={t('Нет активного автомобиля', 'No Active Vehicle')}
        description={t('Пожалуйста, добавьте автомобиль в профиле, чтобы вести журнал заправок.', 'Please add a vehicle in profile tab first to manage fuel logs.')}
        actionLabel={t('Добавить авто', 'Add Vehicle')}
        onAction={() => window.location.hash = 'profile'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Журнал заправок', 'Fuel Diary')}</h2>

      {error && (
        <div className="p-4 bg-neonRose/10 border border-neonRose/20 text-neonRose text-sm rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neonCyan mb-1">{t('Средний расход', 'Average Efficiency')}</h3>
            <p className="text-3xl font-extrabold text-white mt-2">
              {calculateConsumption ? `${calculateConsumption} ${t('л/100 км', 'L/100 km')}` : '—'}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {calculateConsumption
              ? t('Рассчитано по заправкам до полного бака.', 'Calculated from full-to-full refuels.')
              : t('Заправьте полный бак дважды, чтобы рассчитать средний расход.', 'Fill up to full tank at least twice to calculate efficiency.')}
          </p>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neonEmerald mb-1">{t('Всего заправлено', 'Total Fueled')}</h3>
            <p className="text-3xl font-extrabold text-white mt-2">
              {fuelLog.reduce((sum, e) => sum + e.liters, 0).toLocaleString()} {t('л', 'liters')}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {t('Накопленный объем топлива за все время.', 'Total liters accumulated across all logs.')}
          </p>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neonRose mb-1">{t('Затраты на топливо', 'Total Spent')}</h3>
            <p className="text-3xl font-extrabold text-white mt-2">
              {fuelLog.reduce((sum, e) => sum + e.totalCost, 0).toLocaleString()} {t('₽', 'RUB')}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {t('Все заправки автоматически дублируются в финансовый раздел.', 'All refuel logs are automatically registered in finance tab.')}
          </p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Refuel Form */}
        <div className="lg:col-span-1">
          <GlassCard>
            <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Новая заправка', 'Log Refuel')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="fuel-date"
                label={t('Дата *', 'Date *')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <InputField
                id="fuel-odometer"
                label={t('Показания одометра (км) *', 'Odometer Reading (km) *')}
                placeholder="e.g. 85400"
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="fuel-liters"
                  label={t('Объем (л) *', 'Volume (L) *')}
                  placeholder="e.g. 45"
                  type="number"
                  step="0.01"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
                <InputField
                  id="fuel-price"
                  label={t('Цена (₽/л) *', 'Price (RUB/L) *')}
                  placeholder="e.g. 56.50"
                  type="number"
                  step="0.01"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  id="fuel-full"
                  type="checkbox"
                  checked={fullTank}
                  onChange={(e) => setFullTank(e.target.checked)}
                  className="w-4.5 h-4.5 text-neonCyan focus:ring-neonCyan border-slate-300 rounded"
                />
                <label htmlFor="fuel-full" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                  {t('Полный бак', 'Full Tank')}
                </label>
              </div>

              <GlassButton variant="primary" type="submit" className="w-full">
                {t('Добавить заправку', 'Save Log')}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Charts & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {priceHistoryData.length > 0 && (
            <GlassCard className="flex flex-col h-[280px]">
              <h3 className="text-lg font-bold text-neonCyan mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('Динамика цены на топливо (₽/л)', 'Fuel Price History (RUB/L)')}
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistoryData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="price" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          <GlassCard className="flex flex-col">
            <h3 className="text-lg font-bold text-neonEmerald mb-4">{t('История заправок', 'Fuel Ledger')}</h3>
            {fuelLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Fuel className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-slate-400 text-sm">{t('Нет записей.', 'No refuels logged.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-white/5 pb-2 text-slate-500 font-semibold text-xs uppercase">
                      <th className="py-2">{t('Дата', 'Date')}</th>
                      <th className="py-2 text-right">{t('Пробег (км)', 'Odometer')}</th>
                      <th className="py-2 text-right">{t('Литры', 'Liters')}</th>
                      <th className="py-2 text-right">{t('Цена (л)', 'Price/L')}</th>
                      <th className="py-2 text-right">{t('Всего', 'Cost')}</th>
                      <th className="py-2 text-right">{t('Действие', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...fuelLog]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="py-2.5 font-medium text-slate-900 dark:text-slate-200">{log.date}</td>
                          <td className="py-2.5 text-right font-mono">{log.odometer.toLocaleString()}</td>
                          <td className="py-2.5 text-right">{log.liters} {t('л', 'L')}</td>
                          <td className="py-2.5 text-right font-mono">{log.pricePerLiter} ₽</td>
                          <td className="py-2.5 text-right font-bold text-neonRose">{log.totalCost.toLocaleString()} ₽</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="p-1 text-slate-400 hover:text-neonRose hover:bg-neonRose/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FuelLogView;
