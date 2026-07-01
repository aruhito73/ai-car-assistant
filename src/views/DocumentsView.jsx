import React, { useState } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import { Trash2, Shield, CreditCard, Award, FileText, AlertTriangle } from 'lucide-react';

export const DocumentsView = () => {
  const { t } = useTheme();
  const { car, documents = [], addDocument, deleteDocument } = useCar();

  const [type, setType] = useState('');
  const [number, setNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');

  const documentTypes = [
    { value: 'osago', label: t('ОСАГО', 'OSAGO Insurance') },
    { value: 'kasko', label: t('КАСКО', 'KASKO Insurance') },
    { value: 'driving_license', label: t('Водительские права', 'Driver\'s License') },
    { value: 'inspection', label: t('Диагностическая карта', 'Vehicle Inspection') },
    { value: 'other', label: t('Другой документ', 'Other Document') }
  ];

  const getDocIcon = (docType) => {
    switch (docType) {
      case 'osago':
      case 'kasko':
        return <Shield className="w-6 h-6" />;
      case 'driving_license':
        return <CreditCard className="w-6 h-6" />;
      case 'inspection':
        return <Award className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getDocColorClass = (docType) => {
    switch (docType) {
      case 'osago':
        return 'from-emerald-500/10 to-emerald-950/20 border-emerald-500/30 text-emerald-400';
      case 'kasko':
        return 'from-teal-500/10 to-teal-950/20 border-teal-500/30 text-teal-400';
      case 'driving_license':
        return 'from-blue-500/10 to-blue-950/20 border-blue-500/30 text-blue-400';
      case 'inspection':
        return 'from-amber-500/10 to-amber-950/20 border-amber-500/30 text-amber-400';
      default:
        return 'from-slate-500/10 to-slate-950/20 border-slate-200/20 text-slate-400';
    }
  };

  const calculateDaysLeft = (expDateStr) => {
    if (!expDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expDateStr);
    expDate.setHours(0, 0, 0, 0);
    const diff = expDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!type || !number || !issueDate || !expiryDate) {
      setError(t('Пожалуйста, заполните все поля.', 'Please fill in all fields.'));
      return;
    }

    if (new Date(issueDate) > new Date(expiryDate)) {
      setError(t('Дата выдачи не может быть позже даты окончания.', 'Issue date cannot be after expiry date.'));
      return;
    }

    addDocument({
      type,
      number,
      issueDate,
      expiryDate
    });

    setType('');
    setNumber('');
    setIssueDate('');
    setExpiryDate('');
  };

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-neonRose mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('Нет активного автомобиля', 'No Active Vehicle')}
        </h3>
        <p className="text-slate-550 dark:text-slate-400 max-w-md text-sm">
          {t('Пожалуйста, добавьте автомобиль в профиле, чтобы управлять его документами.', 'Please add a vehicle in profile tab first to manage its documents.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Документы автомобиля', 'Vehicle Documents')}</h2>
      
      {error && (
        <div className="p-4 bg-neonRose/10 border border-neonRose/20 text-neonRose text-sm rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Form */}
        <div className="lg:col-span-1">
          <GlassCard>
            <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Добавить документ', 'Add Document')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="doc-type" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('Тип документа *', 'Document Type *')}
                </label>
                <select
                  id="doc-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-xl outline-none transition-all duration-300 focus:ring-2 cursor-pointer bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus:border-neonCyan/50 focus:ring-neonCyan/30"
                >
                  <option value="" disabled>{t('Выберите тип', 'Select type')}</option>
                  {documentTypes.map((tOpt) => (
                    <option key={tOpt.value} value={tOpt.value} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-white">
                      {tOpt.label}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                id="doc-number"
                label={t('Номер/Серия документа *', 'Document Number *')}
                placeholder="e.g. 5432 987654"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="doc-issue-date"
                  label={t('Дата выдачи *', 'Issue Date *')}
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
                <InputField
                  id="doc-expiry-date"
                  label={t('Дата окончания *', 'Expiry Date *')}
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <GlassButton variant="primary" type="submit" className="w-full">
                {t('Сохранить', 'Save Document')}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-2 space-y-4">
          {documents.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-full">
              <FileText className="w-12 h-12 text-slate-400 mb-2" />
              <p className="text-slate-400 text-sm">{t('Нет зарегистрированных документов.', 'No registered documents.')}</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const daysLeft = calculateDaysLeft(doc.expiryDate);
                const isExpired = daysLeft <= 0;
                const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

                return (
                  <div
                    key={doc.id}
                    className={`bg-gradient-to-br border rounded-2xl p-5 flex flex-col justify-between h-48 transition-all duration-300 hover:scale-[1.02] shadow-lg dark:shadow-none ${getDocColorClass(doc.type)}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="opacity-80">
                          {getDocIcon(doc.type)}
                        </span>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1 text-slate-400 hover:text-neonRose dark:hover:text-neonRose hover:bg-neonRose/10 rounded-lg transition-colors"
                          title={t('Удалить документ', 'Delete Document')}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {documentTypes.find((opt) => opt.value === doc.type)?.label}
                      </h4>
                      <p className="text-xs font-mono tracking-wider opacity-70 mt-1">
                        {doc.number}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/20 dark:border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        {t('Срок действия:', 'Expires:')}
                      </span>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${
                          isExpired 
                            ? 'text-neonRose' 
                            : isExpiringSoon 
                              ? 'text-amber-500 dark:text-amber-400' 
                              : 'text-emerald-500 dark:text-emerald-400'
                        }`}>
                          {isExpired 
                            ? t('Просрочен', 'Expired') 
                            : isExpiringSoon 
                              ? t(`Истекает через ${daysLeft} дн.`, `Expires in ${daysLeft} d.`) 
                              : t(`Активен (${daysLeft} дн.)`, `Active (${daysLeft} d.)`)
                          }
                        </span>
                        <p className="text-[10px] text-slate-455">{doc.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
