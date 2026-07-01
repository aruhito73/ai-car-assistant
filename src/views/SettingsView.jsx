import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import { Download, Upload, Trash2, AlertOctagon, HelpCircle } from 'lucide-react';
import { storage } from '@/services/storage';

export const SettingsView = () => {
  const { t } = useTheme();
  const { clearAllData } = useCar();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);

  const handleExport = () => {
    setMessage('');
    setError('');
    try {
      const data = {
        cars: storage.getCars(),
        activeCarVin: storage.getActiveCarVin(),
        serviceHistory: storage.getServiceHistory(),
        expenses: storage.getExpenses(),
        reminders: storage.getReminders(),
        documents: storage.getDocuments(),
        fuelLog: storage.getFuelLog(),
        customIntervals: storage.getCustomIntervals()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai_car_assistant_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage(t('Резервная копия успешно скачана.', 'Backup downloaded successfully.'));
    } catch (err) {
      setError(t('Не удалось экспортировать данные: ', 'Failed to export data: ') + err.message);
    }
  };

  const handleImport = (e) => {
    setMessage('');
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validation checks
        if (!parsed || typeof parsed !== 'object') {
          throw new Error(t('Некорректный формат JSON.', 'Invalid JSON format.'));
        }

        // Restore arrays to local storage
        if (parsed.cars && Array.isArray(parsed.cars)) {
          storage.saveCars(parsed.cars);
        }
        if (parsed.activeCarVin !== undefined) {
          storage.saveActiveCarVin(parsed.activeCarVin);
        }
        if (parsed.serviceHistory && Array.isArray(parsed.serviceHistory)) {
          storage.saveServiceHistory(parsed.serviceHistory);
        }
        if (parsed.expenses && Array.isArray(parsed.expenses)) {
          storage.saveExpenses(parsed.expenses);
        }
        if (parsed.reminders && Array.isArray(parsed.reminders)) {
          storage.saveReminders(parsed.reminders);
        }
        if (parsed.documents && Array.isArray(parsed.documents)) {
          storage.saveDocuments(parsed.documents);
        }
        if (parsed.fuelLog && Array.isArray(parsed.fuelLog)) {
          storage.saveFuelLog(parsed.fuelLog);
        }
        if (parsed.customIntervals && Array.isArray(parsed.customIntervals)) {
          storage.saveCustomIntervals(parsed.customIntervals);
        }

        // Set active legacy profile if activeCarVin exists
        const cars = parsed.cars || [];
        const activeCar = cars.find(c => c.vin === parsed.activeCarVin) || cars[0];
        if (activeCar) {
          storage.saveCarProfile(activeCar);
        }

        setMessage(t('Данные импортированы! Перезагрузка страницы...', 'Data imported successfully! Reloading page...'));
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setError(t('Ошибка при импорте: ', 'Import failed: ') + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleWipeAll = () => {
    clearAllData();
    setShowConfirmWipe(false);
    setMessage(t('Все данные удалены! Перезагрузка страницы...', 'All data cleared! Reloading page...'));
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Настройки приложения', 'Settings')}</h2>

      {message && (
        <div className="p-4 bg-neonEmerald/10 border border-neonEmerald/20 text-neonEmerald text-sm rounded-xl font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-neonRose/10 border border-neonRose/20 text-neonRose text-sm rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore card */}
        <GlassCard>
          <h3 className="text-lg font-bold text-neonCyan mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('Резервное копирование', 'Backup & Restore')}
          </h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-6">
            {t(
              'Сохраните все данные вашего гаража, заправок, документов и расходов в один JSON файл для резервного хранения или переноса на другое устройство.',
              'Save your entire garage configuration, service documents, fuel logs, and expense ledgers into a single JSON file for offline backups.'
            )}
          </p>

          <div className="space-y-4">
            <GlassButton variant="primary" onClick={handleExport} className="w-full justify-center">
              <Download className="w-4 h-4 mr-2" />
              {t('Скачать резервную копию', 'Export Database')}
            </GlassButton>

            <div className="relative">
              <label className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 focus:ring-neonCyan/50 shadow-sm px-4 py-2 text-sm rounded-xl cursor-pointer w-full text-center">
                <Upload className="w-4 h-4 mr-1" />
                {t('Импортировать из файла', 'Import Backup')}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Danger zone card */}
        <GlassCard className="border-neonRose/30">
          <h3 className="text-lg font-bold text-neonRose mb-2 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5" />
            {t('Опасная зона', 'Danger Zone')}
          </h3>
          <p className="text-xs text-slate-555 dark:text-slate-400 leading-relaxed mb-6">
            {t(
              'Очистка всех локальных данных профилей автомобилей, напоминаний, заправок и документов. Это действие необратимо.',
              'Permanently delete all local vehicle profiles, logs, document records, and expenses. This action cannot be undone.'
            )}
          </p>

          {showConfirmWipe ? (
            <div className="space-y-3 p-4 bg-neonRose/10 border border-neonRose/35 rounded-2xl">
              <p className="text-xs text-neonRose font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                {t('Вы действительно хотите удалить ВСЕ данные?', 'Are you absolutely sure you want to delete EVERYTHING?')}
              </p>
              <div className="flex gap-2">
                <GlassButton variant="danger" onClick={handleWipeAll} className="flex-1 justify-center">
                  {t('Да, удалить всё', 'Yes, clear all')}
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => setShowConfirmWipe(false)} className="flex-1 justify-center">
                  {t('Отмена', 'Cancel')}
                </GlassButton>
              </div>
            </div>
          ) : (
            <GlassButton variant="danger" onClick={() => setShowConfirmWipe(true)} className="w-full justify-center">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('Сбросить все данные', 'Reset All Data')}
            </GlassButton>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default SettingsView;
