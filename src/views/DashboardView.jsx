import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileView from './ProfileView';
import GlassCard from '@/components/GlassCard';
import { recognizeDashboard } from '@/services/ocrService';
import { AlertTriangle } from 'lucide-react';

export const DashboardView = () => {
  const { t } = useTheme();
  const { 
    car, 
    updateCarProfile, 
    expenses, 
    serviceHistory,
    documents = [],
    customIntervals = [] 
  } = useCar();
  const [ocrError, setOcrError] = useState('');

  const totalSpent = ((expenses || []).reduce((sum, item) => sum + (item.cost || 0), 0)) +
                     ((serviceHistory || []).reduce((sum, item) => sum + (item.cost || 0), 0));

  const calculateDaysLeft = (expDateStr) => {
    if (!expDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expDateStr);
    expDate.setHours(0, 0, 0, 0);
    const diff = expDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const expiringDocsCount = documents.filter(d => calculateDaysLeft(d.expiryDate) <= 30).length;

  const overdueCustomIntervalsCount = customIntervals.filter(r => {
    const currentMileage = car?.currentMileage || 0;
    const nextDueMileage = r.lastPerformedMileage + (Number(r.intervalMileage) || 10000);
    return currentMileage >= nextDueMileage;
  }).length;

  const handleOdometerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrError('');
    try {
      const res = await recognizeDashboard(file);
      if (car) {
        updateCarProfile({
          ...car,
          currentMileage: res.mileage
        });
      }
    } catch (err) {
      setOcrError(err.message);
    }
  };

  // Delegate to ProfileView when no active car profile exists so E2E tests find inputs on default page
  if (!car) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('Добро пожаловать в ИИ Автоассистент', 'Welcome to AI Car Assistant')}</h2>
        <ProfileView />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('Добро пожаловать в ИИ Автоассистент', 'Welcome to AI Car Assistant')}</h2>

      {/* Alert banners for documents and service */}
      {(expiringDocsCount > 0 || overdueCustomIntervalsCount > 0) && (
        <div className="space-y-3">
          {expiringDocsCount > 0 && (
            <div 
              onClick={() => window.location.hash = 'documents'}
              className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-semibold rounded-2xl cursor-pointer hover:bg-amber-500/15 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 animate-pulse text-amber-500" />
              <span>
                {t(
                  `Внимание: У вас есть документы (${expiringDocsCount}), срок действия которых истекает или уже истек!`,
                  `Warning: You have documents (${expiringDocsCount}) expiring soon or already expired!`
                )}
              </span>
            </div>
          )}

          {overdueCustomIntervalsCount > 0 && (
            <div 
              onClick={() => window.location.hash = 'services'}
              className="p-4 bg-neonRose/10 border border-neonRose/30 text-neonRose text-sm font-semibold rounded-2xl cursor-pointer hover:bg-neonRose/15 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span>
                {t(
                  `Внимание: Требуется техническое обслуживание автомобиля (${overdueCustomIntervalsCount} задач)!`,
                  `Warning: Maintenance is overdue for your vehicle (${overdueCustomIntervalsCount} tasks)!`
                )}
              </span>
            </div>
          )}
        </div>
      )}
      
      {ocrError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium" role="alert">
          {ocrError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Active Vehicle Status */}
        <GlassCard className="flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neonCyan mb-3">{t('Активный автомобиль', 'Active Vehicle')}</h3>
          <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">{car.make} {car.model} <span className="text-slate-400 font-medium">({car.year})</span></p>
          <div className="mt-auto pt-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
              {t('Одометр:', 'Odometer:')} <span className="font-bold text-slate-900 dark:text-white text-lg ml-1">{car.currentMileage?.toLocaleString()} {t('км', 'km')}</span>
            </p>
            <label className="inline-block mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200">
              {t('Обновить по фото (OCR)', 'Update via Photo (OCR)')}
              <input 
                type="file" 
                id="odometer-upload" 
                data-testid="odometer-uploader" 
                onChange={handleOdometerUpload} 
                className="hidden" 
                accept=".png,.jpg,.jpeg" 
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard hover onClick={() => window.location.hash = 'chat'} className="cursor-pointer flex flex-col group">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neonCyan mb-3">{t('Диагностика и ИИ', 'Diagnostics & AI')}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{t('Запустите акустический анализ или поиск ошибок OBD-2 для поиска неисправностей.', 'Run acoustic diagnostic or OBD-2 code analyzer to lookup issues.')}</p>
          <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-white/[0.08] text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-400">{t('Статус ИИ:', 'AI Status:')}</span>
            <span className="text-neonCyan font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neonCyan animate-pulse"></span>
              {t('Активен', 'Online')}
            </span>
          </div>
        </GlassCard>
        
        <GlassCard hover onClick={() => window.location.hash = 'services'} className="cursor-pointer flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neonEmerald mb-3">{t('Сервисная книжка', 'Maintenance Book')}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{t('Записывайте регулярное обслуживание и отслеживайте интервалы ТО.', 'Register routine maintenance and track planner intervals.')}</p>
          <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-white/[0.08] text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-400">{t('Записей в журнале:', 'Logs registered:')}</span>
            <span className="text-neonEmerald font-bold text-lg">{serviceHistory ? serviceHistory.length : 0}</span>
          </div>
        </GlassCard>
        
        <GlassCard hover onClick={() => window.location.hash = 'finance'} className="cursor-pointer flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neonRose mb-3">{t('Расходы и финансы', 'Finance & Expenses')}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{t('Просматривайте графики трат по категориям, расходы на топливо и страховку.', 'View expense breakdown graphs, fuel logs, and insurance fees.')}</p>
          <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-white/[0.08] text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-400">{t('Всего потрачено:', 'Total spent:')}</span>
            <span className="text-neonRose font-bold text-lg">{totalSpent.toLocaleString()} {t('₽', 'RUB')}</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardView;
