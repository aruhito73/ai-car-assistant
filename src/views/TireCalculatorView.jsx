import React, { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import SelectField from '@/components/SelectField';

export const TireCalculatorView = () => {
  const { t } = useTheme();

  const widths = [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285];
  const profiles = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
  const rims = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  // Size A state
  const [wA, setWA] = useState(205);
  const [pA, setPA] = useState(55);
  const [rA, setRA] = useState(16);

  // Size B state
  const [wB, setWB] = useState(225);
  const [pB, setPB] = useState(45);
  const [rB, setRB] = useState(17);

  const calculateSpecs = (w, p, r) => {
    const profileHeight = w * (p / 100); // mm
    const rimDiameter = r * 25.4; // mm
    const wheelDiameter = rimDiameter + (2 * profileHeight); // mm
    const circumference = Math.PI * wheelDiameter; // mm
    const revsPerKm = 1000000 / circumference;
    return {
      profileHeight: parseFloat(profileHeight.toFixed(1)),
      rimDiameter: parseFloat(rimDiameter.toFixed(1)),
      wheelDiameter: parseFloat(wheelDiameter.toFixed(1)),
      circumference: parseFloat(circumference.toFixed(1)),
      revsPerKm: parseFloat(revsPerKm.toFixed(0))
    };
  };

  const comparison = useMemo(() => {
    const specA = calculateSpecs(wA, pA, rA);
    const specB = calculateSpecs(wB, pB, rB);

    const diffDiameter = specB.wheelDiameter - specA.wheelDiameter;
    const diffClearance = diffDiameter / 2;
    const speedoError = (diffDiameter / specA.wheelDiameter) * 100;

    return {
      specA,
      specB,
      diffDiameter: parseFloat(diffDiameter.toFixed(1)),
      diffClearance: parseFloat(diffClearance.toFixed(1)),
      speedoError: parseFloat(speedoError.toFixed(2))
    };
  }, [wA, pA, rA, wB, pB, rB]);

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Шинный калькулятор', 'Tire Size Calculator')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Size A Card */}
        <GlassCard>
          <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Исходный размер (A)', 'Original Size (A)')}</h3>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              id="width-a"
              label={t('Ширина', 'Width')}
              options={widths.map(w => ({ value: w, label: `${w} мм` }))}
              value={wA}
              onChange={(e) => setWA(Number(e.target.value))}
            />
            <SelectField
              id="profile-a"
              label={t('Профиль', 'Profile')}
              options={profiles.map(p => ({ value: p, label: `${p}%` }))}
              value={pA}
              onChange={(e) => setPA(Number(e.target.value))}
            />
            <SelectField
              id="rim-a"
              label={t('Диаметр', 'Diameter')}
              options={rims.map(r => ({ value: r, label: `R${r}` }))}
              value={rA}
              onChange={(e) => setRA(Number(e.target.value))}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/20 dark:border-white/5 space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>{t('Высота профиля:', 'Profile height:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specA.profileHeight} мм</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Диаметр колеса:', 'Wheel diameter:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specA.wheelDiameter} мм</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Длина окружности:', 'Circumference:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specA.circumference} мм</span>
            </div>
          </div>
        </GlassCard>

        {/* Size B Card */}
        <GlassCard>
          <h3 className="text-lg font-bold text-neonEmerald mb-4">{t('Новый размер (B)', 'New Size (B)')}</h3>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              id="width-b"
              label={t('Ширина', 'Width')}
              options={widths.map(w => ({ value: w, label: `${w} мм` }))}
              value={wB}
              onChange={(e) => setWB(Number(e.target.value))}
            />
            <SelectField
              id="profile-b"
              label={t('Профиль', 'Profile')}
              options={profiles.map(p => ({ value: p, label: `${p}%` }))}
              value={pB}
              onChange={(e) => setPB(Number(e.target.value))}
            />
            <SelectField
              id="rim-b"
              label={t('Диаметр', 'Diameter')}
              options={rims.map(r => ({ value: r, label: `R${r}` }))}
              value={rB}
              onChange={(e) => setRB(Number(e.target.value))}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/20 dark:border-white/5 space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>{t('Высота профиля:', 'Profile height:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specB.profileHeight} мм</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Диаметр колеса:', 'Wheel diameter:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specB.wheelDiameter} мм</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Длина окружности:', 'Circumference:')}</span>
              <span className="font-mono text-white font-semibold">{comparison.specB.circumference} мм</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Comparison table card */}
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">{t('Результаты сравнения', 'Comparison Summary')}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 border-b border-slate-200/20 dark:border-white/5 pb-2 text-xs uppercase tracking-wider text-slate-400 font-semibold">
            <span>{t('Параметр', 'Parameter')}</span>
            <span className="text-right">{t('Значение', 'Value')}</span>
            <span className="text-right">{t('Изменение', 'Difference')}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm items-center py-1">
            <span className="text-slate-350">{t('Ширина шины', 'Tire width')}</span>
            <span className="text-right font-mono text-slate-300">{wA} мм / {wB} мм</span>
            <span className={`text-right font-bold ${wB - wA === 0 ? 'text-slate-500' : wB - wA > 0 ? 'text-neonEmerald' : 'text-neonRose'}`}>
              {wB - wA > 0 ? `+${wB - wA}` : wB - wA} мм
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm items-center py-1">
            <span className="text-slate-350">{t('Высота профиля', 'Profile height')}</span>
            <span className="text-right font-mono text-slate-300">{comparison.specA.profileHeight} мм / {comparison.specB.profileHeight} мм</span>
            <span className={`text-right font-bold ${comparison.specB.profileHeight - comparison.specA.profileHeight === 0 ? 'text-slate-500' : comparison.specB.profileHeight - comparison.specA.profileHeight > 0 ? 'text-neonEmerald' : 'text-neonRose'}`}>
              {comparison.specB.profileHeight - comparison.specA.profileHeight > 0 ? `+${(comparison.specB.profileHeight - comparison.specA.profileHeight).toFixed(1)}` : (comparison.specB.profileHeight - comparison.specA.profileHeight).toFixed(1)} мм
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm items-center py-1">
            <span className="text-slate-350">{t('Внешний диаметр', 'Outer diameter')}</span>
            <span className="text-right font-mono text-slate-300">{comparison.specA.wheelDiameter} мм / {comparison.specB.wheelDiameter} мм</span>
            <span className={`text-right font-bold ${comparison.diffDiameter === 0 ? 'text-slate-500' : comparison.diffDiameter > 0 ? 'text-neonEmerald' : 'text-neonRose'}`}>
              {comparison.diffDiameter > 0 ? `+${comparison.diffDiameter}` : comparison.diffDiameter} мм
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm items-center py-1">
            <span className="text-slate-350">{t('Изменение клиренса', 'Ride height change')}</span>
            <span className="text-right font-mono text-slate-500">—</span>
            <span className={`text-right font-bold ${comparison.diffClearance === 0 ? 'text-slate-500' : comparison.diffClearance > 0 ? 'text-neonEmerald' : 'text-neonRose'}`}>
              {comparison.diffClearance > 0 ? `+${comparison.diffClearance}` : comparison.diffClearance} мм
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm items-center py-1">
            <span className="text-slate-350">{t('Погрешность спидометра', 'Speedometer deviation')}</span>
            <span className="text-right font-mono text-slate-500">—</span>
            <span className={`text-right font-bold ${comparison.speedoError === 0 ? 'text-slate-500' : comparison.speedoError > 0 ? 'text-neonRose' : 'text-neonEmerald'}`}>
              {comparison.speedoError > 0 ? `+${comparison.speedoError}%` : `${comparison.speedoError}%`}
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed">
          {comparison.speedoError > 0 ? (
            <p>
              ⚠️ {t('Реальная скорость автомобиля будет больше показаний спидометра.', 'Your actual speed will be higher than the speedometer reading.')} {t('При показании спидометра 100 км/ч фактическая скорость составит:', 'At speedometer reading of 100 km/h, actual speed will be:')} <strong className="text-neonRose font-semibold">{(100 + comparison.speedoError).toFixed(1)} {t('км/ч', 'km/h')}</strong>.
            </p>
          ) : comparison.speedoError < 0 ? (
            <p>
              ℹ️ {t('Реальная скорость автомобиля будет меньше показаний спидометра.', 'Your actual speed will be lower than the speedometer reading.')} {t('При показании спидометра 100 км/ч фактическая скорость составит:', 'At speedometer reading of 100 km/h, actual speed will be:')} <strong className="text-neonEmerald font-semibold">{(100 + comparison.speedoError).toFixed(1)} {t('км/ч', 'km/h')}</strong>.
            </p>
          ) : (
            <p>✅ {t('Размеры колес полностью совпадают. Показания спидометра не изменятся.', 'Wheel sizes match perfectly. Speedometer deviation is zero.')}</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default TireCalculatorView;
