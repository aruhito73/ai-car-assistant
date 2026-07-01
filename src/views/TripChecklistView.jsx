import React from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import { CheckSquare, Square, RefreshCw, AlertTriangle } from 'lucide-react';

export const TripChecklistView = () => {
  const { t } = useTheme();
  const { car, tripChecklists = [], toggleChecklistItem, resetChecklist } = useCar();

  const templates = [
    {
      id: 'long_trip',
      title: t('Подготовка к дальней поездке', 'Long Road Trip Preparation'),
      description: t('Чек-лист для безопасности на скоростных трассах и длинных перегонах.', 'Essential checks before driving long distances or highway trips.'),
      items: [
        { id: 'oil', label: t('Проверить уровень моторного масла', 'Check engine oil level') },
        { id: 'coolant', label: t('Проверить антифриз / охлаждающую жидкость', 'Check engine coolant level') },
        { id: 'washer', label: t('Долить жидкость стеклоомывателя', 'Top up windshield washer fluid') },
        { id: 'tires', label: t('Проверить давление в шинах (включая запаску)', 'Verify tire pressure (including spare)') },
        { id: 'tools', label: t('Проверить домкрат, баллонник и трос', 'Verify jack, wheel wrench, and tow strap') },
        { id: 'safety', label: t('Убедиться в наличии аптечки, огнетушителя, знака', 'Check first-aid kit, fire extinguisher, warning triangle') }
      ]
    },
    {
      id: 'winter_prep',
      title: t('Подготовка к зимнему сезону', 'Winter Driving Preparation'),
      description: t('Чек-лист для уверенного запуска в мороз и безопасности на льду.', 'Essential checks to prepare for sub-zero temperatures and snowy roads.'),
      items: [
        { id: 'winter_tires', label: t('Установить зимние шипованные/нешипованные шины', 'Install winter studded/friction tires') },
        { id: 'winter_washer', label: t('Залить незамерзайку с запасом температуры', 'Fill windshield washer reservoir with winter fluid') },
        { id: 'battery', label: t('Замерить напряжение и обслужить АКБ', 'Measure car battery voltage and clean terminals') },
        { id: 'wiper_blades', label: t('Проверить состояние резинок дворников', 'Inspect wiper blades rubbers') },
        { id: 'silicone', label: t('Смазать уплотнители дверей силиконовым спреем', 'Spray door weatherstripping with silicone defroster') },
        { id: 'winter_kit', label: t('Положить в багажник щетку-скребок и лопату', 'Pack snow brush, ice scraper, and folding shovel') }
      ]
    },
    {
      id: 'weekly',
      title: t('Еженедельный быстрый осмотр', 'Weekly Safety Checklist'),
      description: t('Простые регламентные проверки для поддержания авто в тонусе.', 'Simple routine inspections to keep your car healthy.'),
      items: [
        { id: 'lights', label: t('Проверить ближний/дальний свет, стоп-сигналы', 'Check headlights, high beams, brake lights') },
        { id: 'turn_signals', label: t('Проверить поворотники и аварийку', 'Check turn signals and hazards') },
        { id: 'brake_fluid_level', label: t('Оценить уровень тормозной жидкости в бачке', 'Inspect brake fluid level visually') },
        { id: 'tire_visual', label: t('Визуальный осмотр шин на наличие проколов/грыж', 'Inspect tires visually for punctures or bulges') }
      ]
    }
  ];

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-neonRose mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('Нет активного автомобиля', 'No Active Vehicle')}
        </h3>
        <p className="text-slate-550 dark:text-slate-400 max-w-md text-sm">
          {t('Пожалуйста, добавьте автомобиль в профиле, чтобы использовать чек-листы.', 'Please add a vehicle in profile tab first to manage checklists.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Чек-листы подготовки авто', 'Car Preparation Checklists')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => {
          const listCheckedItems = tripChecklists.filter((c) => c.listId === tmpl.id && c.checked);
          const checkedItemIds = listCheckedItems.map((c) => c.itemId);
          const checkedCount = listCheckedItems.length;
          const totalCount = tmpl.items.length;
          const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

          // SVG Circle computations for progress wheel
          const radius = 24;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (percent / 100) * circumference;

          return (
            <GlassCard key={tmpl.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{tmpl.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{tmpl.description}</p>
                  </div>

                  {/* Circular Progress Wheel */}
                  <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className="stroke-slate-800"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className={`transition-all duration-500 ease-in-out ${
                          percent === 100 
                            ? 'stroke-neonEmerald' 
                            : percent >= 50 
                              ? 'stroke-neonCyan' 
                              : 'stroke-amber-500'
                        }`}
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">{percent}%</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {tmpl.items.map((item) => {
                    const isChecked = checkedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklistItem(tmpl.id, item.id)}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 select-none ${
                          isChecked 
                            ? 'bg-neonCyan/5 border-neonCyan/20 text-slate-350 line-through opacity-70' 
                            : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/[0.08]'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-neonCyan flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {percent > 0 && (
                <div className="mt-5 pt-3 border-t border-slate-200/20 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => resetChecklist(tmpl.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-neonRose transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t('Сбросить чек-лист', 'Reset Checklist')}
                  </button>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default TripChecklistView;
