import React, { useState, useEffect, useMemo } from 'react';
import { useCar } from '@/context/CarContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import GlassButton from '@/components/GlassButton';
import { Trash2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const FinanceView = () => {
  const { t } = useTheme();
  const { expenses, addExpense, deleteExpense } = useCar();

  const categoryLabels = {
    Fuel: t('Топливо', 'Fuel'),
    Repair: t('ТО и Ремонт', 'Service & Repair'),
    Insurance: t('Страховка', 'Insurance'),
    Parking: t('Парковка и Мойка', 'Parking'),
    Fines: t('Штрафы', 'Fines'),
    Other: t('Другое', 'Other')
  };
  
  // Filter category state
  const [selectedCategory, setSelectedCategory] = useState('');

  // Inline form state
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalCost, setModalCost] = useState('');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalNotes, setModalNotes] = useState('');
  const [modalError, setModalError] = useState('');

  // Deletion confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const expenseCategories = [
    { value: 'Fuel', label: t('Топливо', 'Fuel') },
    { value: 'Repair', label: t('ТО и Ремонт', 'Service & Repair') },
    { value: 'Insurance', label: t('Страховка', 'Insurance') },
    { value: 'Parking', label: t('Парковка и Мойка', 'Parking') },
    { value: 'Fines', label: t('Штрафы', 'Fines') },
    { value: 'Other', label: t('Другое', 'Other') }
  ];

  // Shared Validation Logic
  const validateExpense = (categoryVal, costVal, dateVal) => {
    if (costVal !== '' && Number(costVal) <= 0) {
      return t('Сумма должна быть больше 0', 'Amount must be greater than 0');
    }
    if (dateVal) {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      if (dateVal > todayStr) {
        return t('Дата расхода не может быть в будущем', 'Expense date cannot be in the future');
      }
    }
    if (!categoryVal || costVal === '' || !dateVal) {
      return t('Пожалуйста, заполните все обязательные поля.', 'Please fill in all required fields.');
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateExpense(category, cost, date);
    if (validationError) {
      setError(validationError);
      return;
    }

    addExpense({
      category,
      cost: Number(cost),
      date,
      notes
    });

    setCategory('');
    setCost('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setModalError('');

    const validationError = validateExpense(modalCategory, modalCost, modalDate);
    if (validationError) {
      setModalError(validationError);
      return;
    }

    addExpense({
      category: modalCategory,
      cost: Number(modalCost),
      date: modalDate,
      notes: modalNotes
    });

    // Reset and close modal
    setModalCategory('');
    setModalCost('');
    setModalNotes('');
    setModalDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteExpense(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Dynamically compute active categories from active (non-deleted) expenses
  const activeCategories = useMemo(() => {
    return Array.from(
      new Set(
        expenses
          .filter((item) => item.id !== pendingDeleteId)
          .map((item) => item.category)
          .filter(Boolean)
      )
    );
  }, [expenses, pendingDeleteId]);

  // Sync filter category selection if it is no longer represented
  useEffect(() => {
    if (selectedCategory && !activeCategories.includes(selectedCategory)) {
      setSelectedCategory('');
    }
  }, [activeCategories, selectedCategory]);

  // Filtered expenses based on filter category and excluding pending deletion
  const visibleExpenses = useMemo(() => {
    return expenses
      .filter((item) => item.id !== pendingDeleteId)
      .filter((item) => !selectedCategory || item.category === selectedCategory);
  }, [expenses, pendingDeleteId, selectedCategory]);

  // Total cost of visible filtered expenses
  const totalCost = useMemo(() => {
    return visibleExpenses.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [visibleExpenses]);

  // Pie chart data
  const pieData = useMemo(() => {
    const grouped = visibleExpenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.cost || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [visibleExpenses]);

  const COLORS = ['#00F0FF', '#00FF66', '#FF007A', '#FFB800', '#8B5CF6', '#EC4899'];

  // Trend chart data
  const trendData = useMemo(() => {
    const monthlyGroups = {};
    visibleExpenses.forEach((item) => {
      if (!item.date) return;
      const key = item.date.substring(0, 7); // YYYY-MM
      monthlyGroups[key] = (monthlyGroups[key] || 0) + (item.cost || 0);
    });

    const sortedKeys = Object.keys(monthlyGroups).sort();
    return sortedKeys.map((key) => {
      const parts = key.split('-');
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const label = new Date(year, monthIndex, 1).toLocaleString(t('ru-RU', 'en-US'), { month: 'long', year: 'numeric' });
      return {
        month: label,
        amount: monthlyGroups[key]
      };
    });
  }, [visibleExpenses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Финансовая аналитика', 'Financial Analytics')}</h2>
        <GlassButton
          id="add-expense-btn"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
        >
          {t('Добавить расход', 'Add Expense')}
        </GlassButton>
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col h-[320px]">
            <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Распределение по категориям', 'Category Distribution')}</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {pieData.length === 0 ? (
                <p className="text-slate-400 text-sm">{t('Нет данных по фильтрам.', 'No data matching filters.')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        const percent = totalCost > 0 ? ((value / totalCost) * 100).toFixed(1) : 0;
                        const translatedName = categoryLabels[name] || name;
                        return [t(`${Number(value).toFixed(2)} ₽`, `$${Number(value).toFixed(2)}`) + ` (${percent}%)`, translatedName];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-[320px]">
            <h3 className="text-lg font-bold text-neonEmerald mb-4">{t('Динамика расходов', 'Monthly Expense Trend')}</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {trendData.length === 0 ? (
                <p className="text-slate-400 text-sm">{t('Нет данных по фильтрам.', 'No data matching filters.')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      tickFormatter={(v) => t(`${v} ₽`, `$${v}`)}
                    />
                    <Tooltip 
                      formatter={(v) => [t(`${Number(v).toFixed(2)} ₽`, `$${Number(v).toFixed(2)}`), t('Расходы', 'Expenses')]}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#00F0FF" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Внести расход', 'Log Expense')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField 
              id={isModalOpen ? "inline-expense-category" : "expense-category"}
              label={t('Категория *', 'Category *')} 
              options={expenseCategories} 
              placeholder={t('Выберите категорию', 'Select category')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <InputField 
              id={isModalOpen ? "inline-amount" : "amount"}
              label={t('Сумма (₽) *', 'Amount ($) *')} 
              type="number"
              placeholder={t('Например, 3500', 'e.g., 50.00')}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <InputField 
              id={isModalOpen ? "inline-expense-date" : "expense-date"}
              label={t('Дата *', 'Date *')} 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <InputField 
              id={isModalOpen ? "inline-expense-notes" : "expense-notes"}
              label={t('Описание / Заметки', 'Notes / Description')} 
              placeholder={t('Например, заправка до полного бака', 'e.g., Fuel top-up')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {error && <p className="text-xs text-neonRose">{error}</p>}
            <GlassButton variant="primary" type="submit" className="w-full">{t('Внести расход', 'Log Expense')}</GlassButton>
          </form>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-neonEmerald mb-2">{t('Итого расходов', 'Cost Summary')}</h3>
            <p className="text-3xl font-extrabold text-neonCyan">{t(`${totalCost.toFixed(2)} ₽`, `$${totalCost.toFixed(2)}`)}</p>
            <p className="text-xs text-slate-400 mt-1">{t('Всего накопленных расходов на автомобиль', 'Total accumulated vehicle expenses')}</p>
          </GlassCard>

          <GlassCard className="flex flex-col h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neonRose">{t('Книга учета расходов', 'Ledger & Breakdown')}</h3>
              {expenses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{t('Фильтр:', 'Filter:')}</span>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-2 py-1 bg-slate-850 dark:bg-slate-800 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-neonCyan cursor-pointer"
                  >
                    <option value="">{t('Все', 'All')}</option>
                    {activeCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat] || cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto pr-2">
              {visibleExpenses.length === 0 ? (
                <p className="text-slate-400 text-sm">{t('Внесите расходы, чтобы увидеть аналитику и тренды трат.', 'Log expenses to see annual and category trends.')}</p>
              ) : (
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-3">{t('Категория', 'Category')}</th>
                      <th className="py-2 px-3">{t('Дата', 'Date')}</th>
                      <th className="py-2 px-3">{t('Описание', 'Notes')}</th>
                      <th className="py-2 px-3">{t('Сумма', 'Amount')}</th>
                      <th className="py-2 px-3 text-right">{t('Действия', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visibleExpenses.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 text-sm font-medium text-slate-200">{categoryLabels[item.category] || item.category}</td>
                        <td className="py-2 px-3 text-sm text-slate-400 whitespace-nowrap">{item.date}</td>
                        <td className="py-2 px-3 text-sm text-slate-400 max-w-xs truncate" title={item.notes}>
                          <div className="rounded-xl flex items-center justify-between w-full">
                            <span className="truncate">{item.notes}</span>
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="delete-expense-btn p-1 text-slate-400 hover:text-neonRose rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all ml-2"
                              title={t('Удалить расход', 'Delete expense')}
                              data-testid={`delete-${item.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-sm font-semibold text-slate-200 whitespace-nowrap">
                          {t(`${item.cost?.toFixed(2)} ₽`, `$${item.cost?.toFixed(2)}`)}
                        </td>
                        <td className="py-2 px-3 text-sm text-right">
                          <button 
                            onClick={() => handleDeleteClick(item.id)}
                            className="delete-expense-btn p-1.5 text-slate-400 hover:text-neonRose rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            title={t('Удалить расход', 'Delete expense')}
                            data-testid={`delete-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modal Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <GlassCard className="max-w-md w-full p-6 mx-4 bg-slate-900 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-slate-200">{t('Добавить новый расход', 'Add New Expense')}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError('');
                }}
                className="text-slate-400 hover:text-white text-xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <SelectField 
                id="expense-category"
                label={t('Категория *', 'Category *')} 
                options={expenseCategories} 
                placeholder={t('Выберите категорию', 'Select category')}
                value={modalCategory}
                onChange={(e) => setModalCategory(e.target.value)}
              />
              <InputField 
                id="amount"
                label={t('Сумма (₽) *', 'Amount ($) *')} 
                type="number"
                placeholder={t('Например, 3500', 'e.g., 50.00')}
                value={modalCost}
                onChange={(e) => setModalCost(e.target.value)}
              />
              <InputField 
                id="date"
                label={t('Дата *', 'Date *')} 
                type="date"
                value={modalDate}
                onChange={(e) => setModalDate(e.target.value)}
              />
              <InputField 
                id="notes"
                label={t('Описание / Заметки', 'Notes / Description')} 
                placeholder={t('Например, заправка до полного бака', 'e.g., Fuel top-up')}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
              />
              {modalError && <p className="text-xs text-neonRose font-semibold">{modalError}</p>}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <GlassButton 
                  variant="secondary" 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError('');
                  }}
                >
                  {t('Отмена', 'Cancel')}
                </GlassButton>
                <GlassButton 
                  variant="primary" 
                  id="save-expense" 
                  type="submit"
                >
                  {t('Сохранить', 'Save Expense')}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Deletion Confirmation Modal Overlay */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <GlassCard className="max-w-sm w-full p-6 mx-4 bg-slate-900 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-2">{t('Подтверждение удаления', 'Confirm Deletion')}</h3>
            <p className="text-slate-400 text-sm mb-6">
              {t('Вы уверены, что хотите удалить эту запись о расходе?', 'Are you sure you want to delete this expense entry?')}
            </p>
            <div className="flex justify-end gap-3">
              <GlassButton 
                variant="secondary" 
                onClick={() => setPendingDeleteId(null)}
              >
                {t('Отмена', 'Cancel')}
              </GlassButton>
              <GlassButton 
                variant="danger" 
                id="confirm-delete"
                onClick={handleConfirmDelete}
              >
                {t('Подтвердить', 'Confirm')}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default FinanceView;

