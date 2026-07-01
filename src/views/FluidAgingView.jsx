import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import { AlertTriangle, Droplet, RefreshCw } from 'lucide-react';

export const FluidAgingView = () => {
  const { t } = useTheme();
  const { car, fluidReplacements = [], logFluidReplacement } = useCar();

  const [mileageInputs, setMileageInputs] = useState({});
  const [dateInputs, setDateInputs] = useState({});
  const [errors, setErrors] = useState({});

  const fluidsSpec = [
    {
      type: 'brake',
      title: t('Тормозная жидкость', 'Brake Fluid'),
      timeLimitMonths: 24,
      mileageLimit: 40000,
      description: t(
        'Тормозная жидкость гигроскопична (впитывает влагу), что снижает температуру её кипения и может привести к отказу тормозов.',
        'Brake fluid absorbs moisture over time, lowering its boiling point and causing internal corrosion in calipers.'
      )
    },
    {
      type: 'coolant',
      title: t('Антифриз (Охлаждающая жидкость)', 'Engine Coolant'),
      timeLimitMonths: 48,
      mileageLimit: 80000,
      description: t(
        'Антифриз со временем теряет антикоррозийные свойства, что приводит к коррозии каналов охлаждения и риску перегрева.',
        'Antifreeze loses its corrosion protection chemicals, leading to scale buildup and cooling efficiency drop.'
      )
    },
    {
      type: 'gearbox',
      title: t('Масло в коробке передач (Трансмиссионное)', 'Transmission Oil'),
      timeLimitMonths: 60,
      mileageLimit: 60000,
      description: t(
        'Масло в КПП/АКПП теряет вязкостные присадки под высокими нагрузками, вызывая износ шестерен и рывки при переключении.',
        'Gearbox oil shears and oxidizes under heavy mechanical loads, causing shifts delays and friction wear.'
      )
    },
    {
      type: 'psf',
      title: t('Жидкость ГУР', 'Power Steering Fluid'),
      timeLimitMonths: 36,
      mileageLimit: 50000,
      description: t(
        'Жидкость гидроусилителя стареет, накапливает металлические частицы и вызывает износ лопастей насоса ГУР.',
        'Power steering hydraulic fluid degrades and gets contaminated with wear debris, causing pump noise.'
      )
    }
  ];

  const handleSubmit = (e, type) => {
    e.preventDefault();
    const subErrors = { ...errors };
    subErrors[type] = '';

    const mileage = mileageInputs[type];
    const date = dateInputs[type] || new Date().toISOString().split('T')[0];

    if (!mileage) {
      subErrors[type] = t('Пробег обязателен', 'Mileage is required');
      setErrors(subErrors);
      return;
    }

    const numMileage = Number(mileage);
    if (isNaN(numMileage) || numMileage < 0) {
      subErrors[type] = t('Некорректный пробег', 'Invalid mileage value');
      setErrors(subErrors);
      return;
    }

    if (new Date(date) > new Date()) {
      subErrors[type] = t('Дата не может быть в будущем', 'Date cannot be in the future');
      setErrors(subErrors);
      return;
    }

    logFluidReplacement(type, date, numMileage);

    // Clear inputs
    setMileageInputs(prev => ({ ...prev, [type]: '' }));
    setDateInputs(prev => ({ ...prev, [type]: '' }));
    setErrors(subErrors);
  };

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-neonRose mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('Нет активного автомобиля', 'No Active Vehicle')}
        </h3>
        <p className="text-slate-550 dark:text-slate-400 max-w-md text-sm">
          {t('Пожалуйста, добавьте автомобиль в профиле, чтобы отслеживать технические жидкости.', 'Please add a vehicle in profile tab first to manage fluid status.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Состояние технических жидкостей', 'Technical Fluid Life')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fluidsSpec.map((spec) => {
          // Find last replacement entry
          const lastLog = fluidReplacements.find(f => f.type === spec.type);
          
          // Fallback to vehicle birth if never done
          const lastDateStr = lastLog ? lastLog.date : `${car.year}-01-01`;
          const lastMileage = lastLog ? lastLog.mileage : 0;

          // Calculate time elapsed
          const today = new Date();
          const lastDate = new Date(lastDateStr);
          const diffMonths = Math.max(0, (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth()));
          const timeProgress = Math.min(100, Math.max(0, (diffMonths / spec.timeLimitMonths) * 100));

          // Calculate mileage elapsed
          const currentMileage = car.currentMileage || 0;
          const diffMileage = Math.max(0, currentMileage - lastMileage);
          const mileageProgress = Math.min(100, Math.max(0, (diffMileage / spec.mileageLimit) * 100));

          // Global progress is the worst of the two
          const progress = Math.max(timeProgress, mileageProgress);
          const isOverdue = progress >= 100;

          return (
            <GlassCard key={spec.type} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-neonCyan" />
                      {spec.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{spec.description}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border rounded-lg ${
                    isOverdue 
                      ? 'text-neonRose border-neonRose/35 bg-neonRose/10' 
                      : progress >= 75 
                        ? 'text-amber-500 border-amber-500/35 bg-amber-500/10' 
                        : 'text-neonEmerald border-neonEmerald/35 bg-neonEmerald/10'
                  }`}>
                    {isOverdue ? t('Заменить!', 'Replace!') : t('В норме', 'OK')}
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-xs text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>{t('Срок последней замены:', 'Last Replaced:')}</span>
                    <span className="text-white font-semibold">{lastLog ? `${lastLog.date} (${lastLog.mileage.toLocaleString()} км)` : t('Неизвестно', 'Never')}</span>
                  </div>

                  {/* Lifespan progress bars */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>{t('Ресурс по времени', 'Time Lifespan')}</span>
                      <span>{diffMonths} / {spec.timeLimitMonths} {t('мес', 'mon')}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${timeProgress >= 100 ? 'bg-neonRose' : 'bg-neonCyan'}`}
                        style={{ width: `${timeProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>{t('Ресурс по пробегу', 'Mileage Lifespan')}</span>
                      <span>{diffMileage.toLocaleString()} / {spec.mileageLimit.toLocaleString()} км</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${mileageProgress >= 100 ? 'bg-neonRose' : 'bg-neonCyan'}`}
                        style={{ width: `${mileageProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Log replacement form */}
              <div className="mt-6 pt-4 border-t border-slate-200/20 dark:border-white/5">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-neonCyan" />
                  {t('Обновить дату замены', 'Update replacement log')}
                </h4>
                <form onSubmit={(e) => handleSubmit(e, spec.type)} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-1">
                    <InputField
                      id={`date-${spec.type}`}
                      label={t('Дата', 'Date')}
                      type="date"
                      value={dateInputs[spec.type] || ''}
                      onChange={(e) => setDateInputs(prev => ({ ...prev, [spec.type]: e.target.value }))}
                      className="px-2 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <InputField
                      id={`mileage-${spec.type}`}
                      label={t('Пробег (км)', 'Mileage (km)')}
                      placeholder={String(currentMileage)}
                      type="number"
                      value={mileageInputs[spec.type] || ''}
                      onChange={(e) => setMileageInputs(prev => ({ ...prev, [spec.type]: e.target.value }))}
                      className="px-2 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <GlassButton variant="primary" type="submit" className="w-full py-2.5 text-xs justify-center rounded-lg">
                      {t('Записать', 'Log')}
                    </GlassButton>
                  </div>
                </form>
                {errors[spec.type] && (
                  <p className="text-[10px] text-neonRose mt-2 font-semibold">{errors[spec.type]}</p>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default FluidAgingView;
