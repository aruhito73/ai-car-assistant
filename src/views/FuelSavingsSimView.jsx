import React, { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, DollarSign, Award } from 'lucide-react';

export const FuelSavingsSimView = () => {
  const { t } = useTheme();

  // Slider States
  const [mileage, setMileage] = useState(20000);
  const [consumption, setConsumption] = useState(9);
  const [gasPrice, setGasPrice] = useState(56);
  const [lpgCost, setLpgCost] = useState(50000);
  const [evDiffCost, setEvDiffCost] = useState(500000);

  const results = useMemo(() => {
    // 1. Gasoline Cost
    const gasCostYear = (mileage * (consumption / 100)) * gasPrice;

    // 2. LPG/Propane Cost (50% price, 15% higher consumption)
    const lpgPrice = gasPrice * 0.5;
    const lpgConsumption = consumption * 1.15;
    const lpgCostYear = (mileage * (lpgConsumption / 100)) * lpgPrice;
    const lpgSavingsYear = Math.max(0, gasCostYear - lpgCostYear);
    const lpgPayback = lpgSavingsYear > 0 ? (lpgCost / lpgSavingsYear) * 12 : 0;

    // 3. EV Cost (Average 1.00 ₽ per km home charging + public charging mix)
    const evCostYear = mileage * 1.00;
    const evSavingsYear = Math.max(0, gasCostYear - evCostYear);
    const evPayback = evSavingsYear > 0 ? (evDiffCost / evSavingsYear) * 12 : 0;

    return {
      gasCostYear: Math.round(gasCostYear),
      lpgCostYear: Math.round(lpgCostYear),
      lpgSavingsYear: Math.round(lpgSavingsYear),
      lpgPayback: parseFloat(lpgPayback.toFixed(1)),
      evCostYear: Math.round(evCostYear),
      evSavingsYear: Math.round(evSavingsYear),
      evPayback: parseFloat(evPayback.toFixed(1))
    };
  }, [mileage, consumption, gasPrice, lpgCost, evDiffCost]);

  const chartData = [
    { name: t('Бензин', 'Gasoline'), Cost: results.gasCostYear, fill: '#ef4444' },
    { name: t('Пропан (ГБО)', 'LPG (Propane)'), Cost: results.lpgCostYear, fill: '#06b6d4' },
    { name: t('Электро (EV)', 'Electric (EV)'), Cost: results.evCostYear, fill: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Симулятор окупаемости топлива', 'Alternative Fuel Simulator')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-5">
            <h3 className="text-lg font-bold text-neonCyan">{t('Параметры симуляции', 'Simulation Inputs')}</h3>
            
            {/* Mileage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>{t('Пробег в год', 'Annual Mileage')}</span>
                <span className="text-white font-mono">{mileage.toLocaleString()} км</span>
              </div>
              <input
                type="range"
                min="5000"
                max="80000"
                step="1000"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonCyan"
              />
            </div>

            {/* Consumption Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>{t('Расход бензина', 'Average Fuel Consumption')}</span>
                <span className="text-white font-mono">{consumption} л/100 км</span>
              </div>
              <input
                type="range"
                min="4"
                max="22"
                step="0.5"
                value={consumption}
                onChange={(e) => setConsumption(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonCyan"
              />
            </div>

            {/* Gas Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>{t('Цена бензина (₽/л)', 'Gasoline Price (RUB/L)')}</span>
                <span className="text-white font-mono">{gasPrice} ₽/л</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="1"
                value={gasPrice}
                onChange={(e) => setGasPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonCyan"
              />
            </div>

            {/* LPG installation price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>{t('Стоимость установки ГБО', 'LPG Installation Cost')}</span>
                <span className="text-white font-mono">{lpgCost.toLocaleString()} ₽</span>
              </div>
              <input
                type="range"
                min="25000"
                max="100000"
                step="5000"
                value={lpgCost}
                onChange={(e) => setLpgCost(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonCyan"
              />
            </div>

            {/* EV difference price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>{t('Разница стоимости EV/ДВС', 'EV Purchase Price Premium')}</span>
                <span className="text-white font-mono">{evDiffCost.toLocaleString()} ₽</span>
              </div>
              <input
                type="range"
                min="100000"
                max="1500000"
                step="50000"
                value={evDiffCost}
                onChange={(e) => setEvDiffCost(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonCyan"
              />
            </div>
          </GlassCard>
        </div>

        {/* Chart & Payback dashboard */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LPG Payback Card */}
            <GlassCard className="flex items-center gap-4">
              <div className="p-3 bg-neonCyan/10 rounded-2xl text-neonCyan">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Окупаемость ГБО', 'LPG Payback')}</h4>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {results.lpgPayback > 0 ? `${results.lpgPayback} ${t('мес.', 'mon.')}` : '—'}
                </p>
                <p className="text-[10px] text-slate-450 mt-1">
                  {t('Сэкономлено в год:', 'Saved per year:')} <span className="text-neonEmerald font-bold font-mono">+{results.lpgSavingsYear.toLocaleString()} ₽</span>
                </p>
              </div>
            </GlassCard>

            {/* EV Payback Card */}
            <GlassCard className="flex items-center gap-4">
              <div className="p-3 bg-neonEmerald/10 rounded-2xl text-neonEmerald">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Окупаемость Электро (EV)', 'EV Payback')}</h4>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {results.evPayback > 0 ? `${results.evPayback} ${t('мес.', 'mon.')}` : '—'}
                </p>
                <p className="text-[10px] text-slate-450 mt-1">
                  {t('Сэкономлено в год:', 'Saved per year:')} <span className="text-neonEmerald font-bold font-mono">+{results.evSavingsYear.toLocaleString()} ₽</span>
                </p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="h-[280px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neonEmerald" />
              {t('Сравнение годовых затрат на топливо (₽/год)', 'Annual Fuel Cost Comparison (RUB/year)')}
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="Cost" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FuelSavingsSimView;
