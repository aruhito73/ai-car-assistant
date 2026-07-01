import React, { useState, useEffect, useRef } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import { 
  sendMessageToAI, 
  parseOBDCode, 
  analyzeAcousticNoise, 
  generateSaleAd 
} from '@/services/aiService';

export const ChatView = () => {
  const { t } = useTheme();
  const { car, serviceHistory } = useCar();
  const [activeTab, setActiveTab] = useState('chat');

  // Chat Tab State
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      text: t('Привет! Я твой ИИ-автомеханик. Спроси меня об ошибках OBD-2, странных звуках машины или техническом обслуживании.', 'Hello! I am your AI Mechanic. Ask me about diagnostic faults, odd car sounds, or maintenance questions.')
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // OBD Tab State
  const [obdInputValue, setObdInputValue] = useState('');
  const [obdResult, setObdResult] = useState(null);
  const [obdError, setObdError] = useState('');

  // Acoustic Tab State
  const [audioFile, setAudioFile] = useState(null);
  const [acousticResult, setAcousticResult] = useState(null);
  const [acousticError, setAcousticError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Copilot Tab State
  const [saleAdResult, setSaleAdResult] = useState(null);
  const [saleAdError, setSaleAdError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSend = async (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const userMsg = { id: `msg-user-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    try {
      const replyText = await sendMessageToAI(query, serviceHistory, car);
      const botMsg = { id: `msg-bot-${Date.now()}`, sender: 'bot', text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg = { id: `msg-bot-${Date.now()}`, sender: 'bot', text: t(`Ошибка: ${error.message}`, `Error: ${error.message}`) };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const handleOBDLookup = (e) => {
    e.preventDefault();
    try {
      setObdError('');
      setObdResult(null);
      const result = parseOBDCode(obdInputValue);
      setObdResult(result);
    } catch (error) {
      setObdError(error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setAudioFile(file || null);
    setAcousticResult(null);
    
    if (file) {
      const name = file.name || '';
      const ext = name.split('.').pop().toLowerCase();
      if (!['mp3', 'wav', 'm4a'].includes(ext)) {
        setAcousticError(t("Поддерживаемые форматы аудио: только MP3, WAV, M4A", "Supported audio formats: MP3, WAV, M4A only"));
      } else {
        setAcousticError('');
      }
    } else {
      setAcousticError('');
    }
  };

  const handleAnalyzeAcoustic = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setAcousticError(t("Поддерживаемые форматы аудио: только MP3, WAV, M4A", "Supported audio formats: MP3, WAV, M4A only"));
      return;
    }
    if (acousticError) return;

    try {
      setIsAnalyzing(true);
      setAcousticError('');
      const result = await analyzeAcousticNoise(audioFile);
      setAcousticResult(result);
    } catch (error) {
      setAcousticError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAd = () => {
    try {
      setSaleAdError('');
      const ad = generateSaleAd(car, serviceHistory, t('ru', 'en') === 'ru');
      setSaleAdResult(ad);
    } catch (error) {
      setSaleAdError(error.message);
    }
  };

  const isProfileEmpty = !car || !car.make || !car.model;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('ИИ-помощник и автомеханик', 'AI Mechanic Copilot')}</h2>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-white/10 mb-6 gap-2 overflow-x-auto">
        <button
          id="chat-tab"
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'chat'
              ? 'border-neonCyan text-neonCyan dark:text-cyan-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('Чат', 'Chat')}
        </button>
        <button
          id="obd-tab"
          onClick={() => setActiveTab('obd')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'obd'
              ? 'border-neonCyan text-neonCyan dark:text-cyan-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('Коды ошибок OBD-2', 'OBD-2 Codes')}
        </button>

        <button
          id="copilot-tab"
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'copilot'
              ? 'border-neonCyan text-neonCyan dark:text-cyan-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {t('Помощник продажи', 'Sale Copilot')}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[500px] gap-4">
          <GlassCard className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-2xl p-3 max-w-[80%] text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-neonCyan/25 text-slate-800 dark:text-cyan-100 border border-neonCyan/30' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-slate-200 dark:border-white/5">
              <InputField 
                id="chat-message"
                placeholder={t('Задать вопрос...', 'Ask a question...')} 
                className="flex-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <GlassButton variant="primary" type="submit">{t('Отправить', 'Send')}</GlassButton>
            </form>
          </GlassCard>
        </div>
      )}

      {activeTab === 'obd' && (
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Расшифровка кодов ошибок OBD-2', 'OBD-2 Fault Code Dictionary')}</h3>
          <form onSubmit={handleOBDLookup} className="flex gap-4">
            <InputField 
              id="obd-code-input"
              placeholder={t('Например, P0300, P0420, P0113', 'e.g. P0300, P0420, P0113')} 
              className="flex-1"
              value={obdInputValue}
              onChange={(e) => setObdInputValue(e.target.value)}
            />
            <GlassButton id="search-obd-btn" variant="primary" type="submit">
              {t('Расшифровать', 'Lookup Code')}
            </GlassButton>
          </form>

          {obdError && (
            <div className="text-red-500 font-medium p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              {obdError}
            </div>
          )}

          {obdResult && (
            <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-neonCyan">{obdResult.code}: {obdResult.description}</h4>
              <div>
                <span className="font-bold text-slate-400">{t('Критичность: ', 'Severity: ')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  obdResult.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                  obdResult.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {obdResult.severity === 'high' ? t('ВЫСОКАЯ', 'HIGH') : obdResult.severity === 'medium' ? t('СРЕДНЯЯ', 'MEDIUM') : t('НИЗКАЯ', 'LOW')}
                </span>
              </div>
              <div>
                <h5 className="font-bold text-slate-400">{t('Возможные причины:', 'Possible Causes:')}</h5>
                <ul className="list-disc list-inside pl-2 text-slate-300 space-y-1">
                  {obdResult.causes.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-white/5">
                <h5 className="font-bold text-slate-400">{t('Рекомендация:', 'Recommendation:')}</h5>
                <p className="text-slate-300 italic">{obdResult.recommendation}</p>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'acoustic' && (
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Акустическая диагностика шумов', 'Acoustic Noise Diagnostics')}</h3>
          <p className="text-sm text-slate-400">
            {t('Загрузите аудиозапись шума двигателя или подвески, чтобы проанализировать возможные неисправности.', 'Upload an audio recording of your engine noise to analyze potential mechanical issues.')}
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <input 
                id="audio-upload"
                data-testid="audio-uploader"
                type="file"
                accept=".mp3,.wav,.m4a"
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neonCyan/10 file:text-neonCyan hover:file:bg-neonCyan/20 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>

            <GlassButton 
              id="analyze-audio-btn" 
              variant="primary" 
              onClick={handleAnalyzeAcoustic}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? t("Анализ звука...", "Analyzing Sound...") : t("Анализировать звук", "Analyze Sound")}
            </GlassButton>
          </div>

          {acousticError && (
            <div className="text-red-500 font-medium p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              {acousticError}
            </div>
          )}

          {acousticResult && (
            <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-neonCyan">{t('Результаты акустического анализа', 'Acoustic Analysis Results')}</h4>
              <div>
                <span className="font-bold text-slate-400">{t('Диагноз: ', 'Diagnosis: ')}</span>
                <span className="text-slate-200">{acousticResult.diagnosis}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400">{t('Вероятность: ', 'Confidence: ')}</span>
                <span className="text-neonCyan font-bold">{acousticResult.confidence}</span>
              </div>
              {acousticResult.partsNeeded && acousticResult.partsNeeded.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-400">{t('Рекомендуемые запчасти:', 'Recommended Parts:')}</h5>
                  <ul className="list-disc list-inside pl-2 text-slate-300 space-y-1">
                    {acousticResult.partsNeeded.map((part, index) => (
                      <li key={index}>{part}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'copilot' && (
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Помощник продажи', 'Sale Copilot')}</h3>
          
          {isProfileEmpty ? (
            <div className="text-yellow-500 font-medium p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              {t('Пожалуйста, сначала создайте профиль автомобиля, чтобы сгенерировать объявление о продаже', 'Please create a vehicle profile first to generate a sales ad')}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">
                {t(`Создайте оптимизированное объявление о продаже в формате Markdown на основе данных вашего автомобиля: ${car.year} ${car.make} ${car.model}.`, `Generate optimized sales description markdown using details from your active vehicle profile: ${car.year} ${car.make} ${car.model}.`)}
              </p>
              
              <GlassButton 
                id="generate-ad-btn" 
                variant="primary" 
                onClick={handleGenerateAd}
              >
                {t('Создать объявление', 'Generate Ad')}
              </GlassButton>

              {saleAdError && (
                <div className="text-red-500 font-medium p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  {saleAdError}
                </div>
              )}

              {saleAdResult && (
                <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-bold text-neonCyan">{t('Сгенерированный текст объявления', 'Generated Ad Copy')}</h4>
                  <div className="text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed p-3 bg-black/25 rounded-lg border border-white/5">
                    {saleAdResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default ChatView;
