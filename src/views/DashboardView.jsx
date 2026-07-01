import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileView from './ProfileView';
import GlassCard from '@/components/GlassCard';
import { recognizeDashboard } from '@/services/ocrService';

export const DashboardView = () => {
  const { t } = useTheme();
  const { car, updateCarProfile } = useCar();
  const [ocrError, setOcrError] = useState('');

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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Добро пожаловать в ИИ Автоассистент', 'Welcome to AI Car Assistant')}</h2>
        <ProfileView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Добро пожаловать в ИИ Автоассистент', 'Welcome to AI Car Assistant')}</h2>
      
      {ocrError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-sm" role="alert">
          {ocrError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Vehicle Status */}
        <GlassCard>
          <h3 className="text-lg font-bold text-neonCyan mb-2">{t('Активный автомобиль', 'Active Vehicle')}</h3>
          <p className="text-slate-200 text-base font-semibold">{car.make} {car.model} ({car.year})</p>
          <p className="text-slate-400 text-sm mt-1">
            {t('Одометр:', 'Odometer:')} <span className="font-semibold text-white">{car.currentMileage?.toLocaleString()} {t('км', 'km')}</span>
          </p>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-neonCyan hover:underline cursor-pointer">
              {t('Обновить пробег по фото (OCR)', 'Update Mileage via Photo (OCR)')}
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

        <GlassCard hover>
          <h3 className="text-lg font-bold text-neonCyan mb-2">{t('Диагностика и ИИ', 'Diagnostics & AI')}</h3>
          <p className="text-slate-400 text-sm">{t('Запустите акустический анализ или поиск ошибок OBD-2 для поиска неисправностей.', 'Run acoustic diagnostic or OBD-2 code analyzer to lookup issues.')}</p>
        </GlassCard>
        
        <GlassCard hover>
          <h3 className="text-lg font-bold text-neonEmerald mb-2">{t('Сервисная книжка', 'Maintenance Book')}</h3>
          <p className="text-slate-400 text-sm">{t('Записывайте регулярное обслуживание и отслеживайте интервалы ТО.', 'Register routine maintenance and track planner intervals.')}</p>
        </GlassCard>
        
        <GlassCard hover>
          <h3 className="text-lg font-bold text-neonRose mb-2">{t('Расходы и финансы', 'Finance & Expenses')}</h3>
          <p className="text-slate-400 text-sm">{t('Просматривайте графики трат по категориям, расходы на топливо и страховку.', 'View expense breakdown graphs, fuel logs, and insurance fees.')}</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardView;
