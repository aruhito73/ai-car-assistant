import React, { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import { Search, AlertOctagon, AlertTriangle, Info, BookOpen } from 'lucide-react';

export const ObdLookupView = () => {
  const { t } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Common OBD-2 codes database
  const obdDatabase = useMemo(() => [
    {
      code: 'P0300',
      title: t('Случайные/множественные пропуски зажигания', 'Random/Multiple Cylinder Misfire Detected'),
      severity: 'critical',
      description: t(
        'Компьютер двигателя обнаружил пропуски зажигания в одном или нескольких цилиндрах, что может привести к повреждению катализатора.',
        'The engine computer detected that cylinders are misfiring, which can cause unburnt fuel to damage the catalytic converter.'
      ),
      causes: [
        t('Свечи зажигания изношены или неисправны', 'Worn or faulty spark plugs'),
        t('Катушки зажигания вышли из строя', 'Failed ignition coils'),
        t('Проблемы с топливными форсунками', 'Clogged or faulty fuel injectors'),
        t('Подсос воздуха во впускной коллектор', 'Vacuum/intake manifold air leaks')
      ],
      actions: t(
        'Проверьте состояние свечей зажигания и катушек. При обнаружении пропусков в конкретном цилиндре, поменяйте катушки местами для локализации проблемы.',
        'Inspect spark plugs and swap ignition coils to diagnose cylinder specific faults. Check for intake vacuum leaks.'
      )
    },
    {
      code: 'P0171',
      title: t('Слишком бедная смесь (Банк 1)', 'System Too Lean (Bank 1)'),
      severity: 'warning',
      description: t(
        'Топливно-воздушная смесь содержит слишком много кислорода или слишком мало топлива. Компьютер двигателя исчерпал лимит корректировки подачи топлива.',
        'The engine is running lean because there is too much air or too little fuel. Fuel trim limits have been exceeded.'
      ),
      causes: [
        t('Загрязнение датчика массового расхода воздуха (ДМРВ)', 'Dirty Mass Air Flow (MAF) sensor'),
        t('Подсос воздуха после ДМРВ', 'Vacuum leaks in the intake boots/gaskets'),
        t('Забит топливный фильтр или неисправен бензонасос', 'Weak fuel pump or clogged filter'),
        t('Клапан PCV неисправен', 'Leaky PCV valve')
      ],
      actions: t(
        'Очистите ДМРВ специальным спреем. Проверьте впускной патрубок на наличие трещин. Замерьте давление топлива в рампе.',
        'Clean the MAF sensor using dedicated electronics cleaner. Check intake ducts for splits. Verify fuel line pressure.'
      )
    },
    {
      code: 'P0420',
      title: t('Эффективность катализатора ниже порога (Банк 1)', 'Catalyst System Efficiency Below Threshold (Bank 1)'),
      severity: 'warning',
      description: t(
        'Каталитический нейтрализатор не справляется с очисткой выхлопных газов должным образом. Датчик кислорода после катализатора показывает некорректную осциллограмму.',
        'The catalytic converter is not operating at peak efficiency. The downstream oxygen sensor is mirroring the upstream reading.'
      ),
      causes: [
        t('Износ каталитического нейтрализатора', 'Degraded or melted catalytic converter'),
        t('Неисправен задний лямбда-зонд (датчик кислорода)', 'Faulty downstream oxygen sensor'),
        t('Утечка в выхлопной системе до датчика', 'Exhaust leaks near the converter'),
        t('Попадание несгоревшего топлива в катализатор из-за пропусков', 'Engine misfires flooding converter with unburnt fuel')
      ],
      actions: t(
        'Проверьте выхлопной тракт на герметичность. Оцените показания датчиков кислорода на графиках. При необходимости замените нейтрализатор или установите обманку.',
        'Check exhaust manifold and gaskets for leaks. Graph oxygen sensor voltages. Replace converter if damaged.'
      )
    },
    {
      code: 'P0113',
      title: t('Высокий показатель датчика температуры впускаемого воздуха', 'Intake Air Temperature Sensor 1 Circuit High'),
      severity: 'info',
      description: t(
        'Напряжение на датчике температуры воздуха (IAT) выше допустимого предела. Обычно означает обрыв цепи или плохой контакт.',
        'The engine control module detects high voltage on the IAT sensor circuit, usually indicating an open circuit.'
      ),
      causes: [
        t('Разрыв проводки или окисление контактов датчика', 'Damaged wire harness or corroded connector'),
        t('Неисправность датчика IAT (встроенного в ДМРВ)', 'Defective IAT sensor element (integrated into MAF)'),
        t('Плохо вставлен разъем датчика', 'Loose connector plug')
      ],
      actions: t(
        'Проверьте разъем ДМРВ, очистите контакты очистителем. Замерьте сопротивление датчика мультиметром.',
        'Unplug MAF sensor harness, inspect pins for corrosion, clean and re-seat. Measure IAT resistance values.'
      )
    },
    {
      code: 'P0505',
      title: t('Неисправность системы управления холостым ходом', 'Idle Control System Malfunction'),
      severity: 'warning',
      description: t(
        'Компьютер не может стабилизировать обороты холостого хода двигателя в заданных пределах.',
        'The engine control module is unable to control and maintain steady target idle speeds.'
      ),
      causes: [
        t('Загрязнение дроссельной заслонки или регулятора холостого хода (РХХ)', 'Dirty/carbon-caked throttle body or Idle Air Control (IAC) valve'),
        t('Неисправность обмоток шагового двигателя РХХ', 'Failed IAC electrical motor'),
        t('Подсос воздуха мимо дросселя', 'Unmetered vacuum leak')
      ],
      actions: t(
        'Снимите и тщательно очистите дроссельную заслонку и РХХ очистителем карбюратора. Проведите адаптацию заслонки.',
        'Clean throttle plate and IAC ports with throttle cleaner spray. Perform idle re-learn procedure.'
      )
    },
    {
      code: 'P0102',
      title: t('Низкий показатель датчика массового расхода воздуха (ДМРВ)', 'Mass or Volume Air Flow Circuit Low Input'),
      severity: 'warning',
      description: t(
        'Компьютер получает слишком низкое напряжение от ДМРВ, что мешает правильно рассчитать топливную смесь.',
        'The MAF sensor frequency/voltage output signal is below the calibrated diagnostic range.'
      ),
      causes: [
        t('Грязный или поврежденный чувствительный элемент', 'Contaminated MAF sensor hot wire'),
        t('Подсос воздуха после датчика', 'Air leaks in intake boot'),
        t('Забился воздушный фильтр', 'Severely clogged engine air filter')
      ],
      actions: t(
        'Проверьте воздушный фильтр. Очистите чувствительный элемент ДМРВ спиртовым аэрозолем. Проверьте цепь питания датчика.',
        'Inspect air filter. Clean MAF wire gently with sensor spray cleaner. Check ground and 12V supply leads.'
      )
    }
  ], [t]);

  const filteredCodes = useMemo(() => {
    const query = searchQuery.toUpperCase().trim();
    if (!query) return obdDatabase;
    return obdDatabase.filter(
      (item) =>
        item.code.includes(query) ||
        item.title.toUpperCase().includes(query) ||
        item.description.toUpperCase().includes(query)
    );
  }, [searchQuery, obdDatabase]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-neonRose bg-neonRose/15 border border-neonRose/35 px-2 py-0.5 rounded-lg">
            <AlertOctagon className="w-3.5 h-3.5" />
            {t('Критично', 'Critical')}
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('Предупреждение', 'Warning')}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-neonCyan bg-neonCyan/15 border border-neonCyan/35 px-2 py-0.5 rounded-lg">
            <Info className="w-3.5 h-3.5" />
            {t('Инфо', 'Info')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Справочник кодов OBD-2', 'OBD-2 Code Finder')}</h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <BookOpen className="w-4 h-4" />
          <span>{obdDatabase.length} {t('кодов в базе', 'codes indexed')}</span>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder={t('Введите код ошибки (например: P0300) или симптом...', 'Enter fault code (e.g. P0300) or keywords...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-300 focus:ring-2 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:border-neonCyan/50 focus:ring-neonCyan/30"
          />
        </div>
      </GlassCard>

      {filteredCodes.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <AlertOctagon className="w-12 h-12 text-slate-400 mb-2" />
          <p className="text-slate-400 text-sm">{t('Код ошибки не найден в оффлайн-базе.', 'No matching diagnostic codes found.')}</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCodes.map((item) => (
            <GlassCard key={item.code} className="flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black tracking-wider text-neonCyan font-mono">{item.code}</span>
                  {getSeverityBadge(item.severity)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/20 dark:border-white/5">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('Возможные причины:', 'Common Causes:')}</h5>
                  <ul className="list-disc pl-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    {item.causes.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5">
                <h5 className="text-xs font-bold text-neonEmerald mb-1">{t('Что проверить / Рекомендации:', 'Repair Instructions:')}</h5>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">{item.actions}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObdLookupView;
