import React, { useState, useEffect } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import { decodeVin } from '@/services/vinService';
import { recognizeSTS, recognizeDashboard } from '@/services/ocrService';
import { Trash2 } from 'lucide-react';

export const ProfileView = () => {
  const { t } = useTheme();
  const { 
    car, 
    cars = [], 
    activeCarVin, 
    setActiveCarVin, 
    addCarProfile, 
    deleteCarProfile, 
    updateCarProfile 
  } = useCar();

  const [vin, setVin] = useState(car?.vin || '');
  const [vinError, setVinError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [isEditing, setIsEditing] = useState(!car && cars.length === 0);
  const [isAdding, setIsAdding] = useState(false);

  const [make, setMake] = useState(car?.make || '');
  const [model, setModel] = useState(car?.model || '');
  const [year, setYear] = useState(car?.year || '');
  const [mileage, setMileage] = useState(car?.currentMileage || '');
  const [engine, setEngine] = useState(car?.engine || '');
  const [transmission, setTransmission] = useState(car?.transmission || 'Automatic');

  // Sync inputs on active car change
  useEffect(() => {
    if (!isAdding) {
      setVin(car?.vin || '');
      setMake(car?.make || '');
      setModel(car?.model || '');
      setYear(car?.year || '');
      setMileage(car?.currentMileage || '');
      setEngine(car?.engine || '');
      setTransmission(car?.transmission || 'Automatic');
    }
  }, [car, isAdding]);

  // Adjust edit state if cars count changes to 0
  useEffect(() => {
    if (cars.length === 0) {
      setIsEditing(true);
    }
  }, [cars]);

  const handleDecodeVIN = async () => {
    setVinError('');
    setValidationError('');
    setOcrError('');
    
    const cleanVin = vin.toUpperCase().trim();
    if (!cleanVin) {
      setVinError(t('VIN должен состоять ровно из 17 символов.', 'VIN must be exactly 17 characters.'));
      return;
    }

    try {
      const decoded = await decodeVin(cleanVin);
      setMake(decoded.make);
      setModel(decoded.model);
      setYear(decoded.year);
      setEngine(decoded.engine || '');
      setTransmission(decoded.transmission || 'Automatic');
      setIsEditing(true);
    } catch (err) {
      setVinError(err.message);
    }
  };

  const handleStartAdd = () => {
    setVin('');
    setMake('');
    setModel('');
    setYear('');
    setMileage('');
    setEngine('');
    setTransmission('Automatic');
    setIsEditing(true);
    setIsAdding(true);
    setValidationError('');
    setVinError('');
    setOcrError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setVin(car?.vin || '');
    setMake(car?.make || '');
    setModel(car?.model || '');
    setYear(car?.year || '');
    setMileage(car?.currentMileage || '');
    setEngine(car?.engine || '');
    setTransmission(car?.transmission || 'Automatic');
    setValidationError('');
    setVinError('');
    setOcrError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setValidationError('');
    setVinError('');
    setOcrError('');

    if (!make || !model || !year || !mileage) {
      setValidationError(t('Пожалуйста, заполните все обязательные поля.', 'Please fill in all required fields.'));
      return;
    }

    const numericYear = Number(year);
    const numericMileage = Number(mileage);

    if (isNaN(numericYear) || isNaN(numericMileage)) {
      setValidationError(t('Год и пробег должны быть корректными числами.', 'Year and Mileage must be valid numbers.'));
      return;
    }

    if (numericMileage < 0 || numericMileage > 9999999) {
      setValidationError(t('Пробег должен быть от 0 до 9 999 999 км.', 'Mileage must be between 0 and 9,999,999 km'));
      return;
    }

    if (numericYear > new Date().getFullYear()) {
      setValidationError(t('Год выпуска не может быть в будущем.', 'Year cannot be in the future'));
      return;
    }

    const profileData = {
      vin: vin.toUpperCase().trim() || 'MANUAL-ENTRY',
      make,
      model,
      year: numericYear,
      engine,
      transmission,
      currentMileage: numericMileage,
      yearlyMileage: car?.yearlyMileage || 15000
    };

    if (isAdding || !car) {
      addCarProfile(profileData);
    } else {
      updateCarProfile(profileData);
    }
    
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleStsUpload = async (e) => {
    setOcrError('');
    setVinError('');
    setValidationError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await recognizeSTS(file);
      if (result && result.vin) {
        setVin(result.vin);
        const decoded = await decodeVin(result.vin);
        setMake(decoded.make);
        setModel(decoded.model);
        setYear(decoded.year);
        setEngine(decoded.engine || '');
        setTransmission(decoded.transmission || 'Automatic');
        setIsEditing(true);
      }
    } catch (err) {
      setOcrError(err.message);
    }
  };

  const handleOdometerUpload = async (e) => {
    setOcrError('');
    setVinError('');
    setValidationError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await recognizeDashboard(file);
      if (result && typeof result.mileage === 'number') {
        setMileage(result.mileage);
        setIsEditing(true);
      }
    } catch (err) {
      setOcrError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('Профиль автомобиля', 'Vehicle Profile')}</h2>
      
      {validationError && (
        <div className="p-4 bg-neonRose/10 border border-neonRose/20 text-neonRose text-sm rounded-xl font-semibold">
          {validationError}
        </div>
      )}

      {ocrError && (
        <div className="p-4 bg-neonRose/10 border border-neonRose/20 text-neonRose text-sm rounded-xl font-semibold">
          {ocrError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* My Garage */}
          <GlassCard>
            <h3 className="text-lg font-bold text-neonEmerald mb-4">{t('Мой гараж', 'My Garage')}</h3>
            {cars.length === 0 ? (
              <p className="text-sm text-slate-400 mb-4">{t('Гараж пуст. Добавьте свой первый автомобиль.', 'Garage is empty. Add your first vehicle.')}</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cars.map((c) => {
                  const isActive = c.vin === activeCarVin;
                  return (
                    <div 
                      key={c.vin}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                        isActive 
                          ? 'bg-neonCyan/10 border-neonCyan dark:border-cyan-500/50 shadow-neon-cyan/5' 
                          : 'bg-white/5 border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setActiveCarVin(c.vin)}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.make} {c.model}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neonCyan/25 text-neonCyan">
                              {t('Активен', 'Active')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-450 mt-0.5">
                          {c.year} • {c.currentMileage?.toLocaleString()} {t('км', 'km')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCarProfile(c.vin)}
                        className="p-1.5 text-slate-400 hover:text-neonRose hover:bg-neonRose/10 rounded-lg transition-colors"
                        title={t('Удалить автомобиль', 'Delete Vehicle')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <GlassButton variant="primary" onClick={handleStartAdd} className="w-full">
              {t('Добавить новый автомобиль', 'Add New Vehicle')}
            </GlassButton>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Декодер VIN', 'VIN Decoder')}</h3>
            <div className="space-y-4">
              <InputField 
                id="vin-input"
                label={t('Идентификационный номер автомобиля (VIN)', 'Vehicle Identification Number (VIN)')} 
                placeholder={t('Введите 17-значный VIN-код', 'Enter 17-character VIN')}
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                error={vinError}
                helperText={t('Декодирует марку, модельный год и технические характеристики.', 'Decodes manufacturer, model year, and assembly details.')}
              />
              <GlassButton variant="primary" onClick={handleDecodeVIN}>{t('Декодировать VIN', 'Decode VIN')}</GlassButton>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-bold text-neonCyan mb-4">{t('Распознавание документов (OCR)', 'OCR Document Upload')}</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="sts-upload" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('Загрузить фото СТС (для распознавания VIN)', 'Upload STS Card (registration document)')}
                </label>
                <input
                  id="sts-upload"
                  data-testid="sts-uploader"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleStsUpload}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neonCyan/10 file:text-neonCyan hover:file:bg-neonCyan/20 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="odometer-upload" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('Загрузить фото приборной панели (для пробега)', 'Upload Dashboard Photo (for mileage)')}
                </label>
                <input
                  id="odometer-upload"
                  data-testid="odometer-uploader"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleOdometerUpload}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neonEmerald/10 file:text-neonEmerald hover:file:bg-neonEmerald/20 cursor-pointer"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="text-lg font-bold text-neonEmerald mb-4">{t('Характеристики автомобиля', 'Vehicle Details')}</h3>
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField id="make" label={t('Марка *', 'Make *')} value={make} onChange={(e) => setMake(e.target.value)} />
                <InputField id="model" label={t('Модель *', 'Model *')} value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField id="year" label={t('Год выпуска *', 'Year *')} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                <InputField id="current-mileage" label={t('Пробег (км) *', 'Mileage (km) *')} type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField id="engine" label={t('Двигатель', 'Engine')} value={engine} onChange={(e) => setEngine(e.target.value)} />
                <InputField id="transmission" label={t('Трансмиссия', 'Transmission')} value={transmission} onChange={(e) => setTransmission(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <GlassButton id="save-profile" variant="success" type="submit">{t('Сохранить профиль', 'Save Profile')}</GlassButton>
                {(car || cars.length > 0) && <GlassButton variant="secondary" type="button" onClick={handleCancel}>{t('Отмена', 'Cancel')}</GlassButton>}
              </div>
            </form>
          ) : (
            car && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">VIN</span>
                  <span className="font-semibold text-right">{car.vin}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('Марка / Модель', 'Make / Model')}</span>
                  <span className="font-semibold text-right">{car.make} {car.model}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('Год выпуска', 'Year')}</span>
                  <span className="font-semibold text-right">{car.year}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('Пробег', 'Mileage')}</span>
                  <span className="font-semibold text-right">{car.currentMileage?.toLocaleString()} {t('км', 'km')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('Двигатель', 'Engine')}</span>
                  <span className="font-semibold text-right">{car.engine || t('Н/Д', 'N/A')}</span>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-neonCyan hover:underline font-semibold text-left"
                >
                  {t('Редактировать профиль', 'Edit Profile')}
                </button>
              </div>
            )
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ProfileView;
