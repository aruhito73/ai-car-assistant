import React, { useState, useEffect } from 'react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';
import { getPartsWithShopLinks, searchParts } from '@/services/partsService';
import GlassCard from '@/components/GlassCard';
import InputField from '@/components/InputField';
import GlassButton from '@/components/GlassButton';
import { Bookmark, Search, ExternalLink } from 'lucide-react';

export const PartsView = () => {
  const { t } = useTheme();
  const { car } = useCar();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [originalParts, setOriginalParts] = useState([]);
  const [displayedParts, setDisplayedParts] = useState([]);
  
  // Bookmarks state (persistent in localStorage)
  const [bookmarkedParts, setBookmarkedParts] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_saved_parts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ai_saved_parts', JSON.stringify(bookmarkedParts));
  }, [bookmarkedParts]);

  // Load parts if vehicle profile is active
  useEffect(() => {
    if (car) {
      const parts = getPartsWithShopLinks(car);
      setOriginalParts(parts);
      setDisplayedParts(parts);
    } else {
      setOriginalParts([]);
      setDisplayedParts([]);
    }
  }, [car]);

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {t('Сначала добавьте профиль автомобиля, чтобы увидеть подходящие OEM-запчасти', 'Add a vehicle profile first to see auto-matched OEM parts')}
        </p>
      </div>
    );
  }

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const results = searchParts(originalParts, searchQuery);
    setDisplayedParts(results);
  };

  const toggleBookmark = (part) => {
    const isBookmarked = bookmarkedParts.some(bp => bp.oem === part.oem);
    if (isBookmarked) {
      setBookmarkedParts(prev => prev.filter(bp => bp.oem !== part.oem));
    } else {
      setBookmarkedParts(prev => [...prev, part]);
    }
  };

  const renderPartList = (partsToRender) => {
    if (partsToRender.length === 0) {
      return (
        <div className="text-center p-8 text-slate-500 dark:text-slate-400">
          {t('Подходящие запчасти не найдены', 'No matching parts found')}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partsToRender.map((part, index) => {
          const isSaved = bookmarkedParts.some(bp => bp.oem === part.oem);
          const links = part.shopLinks || {};
          
          return (
            <GlassCard key={`${part.oem}-${index}`} className="flex flex-col justify-between break-words">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight break-all">
                    {part.name}
                  </h4>
                  <button
                    data-testid={`bookmark-part-${index}`}
                    className="bookmark-btn p-1.5 text-slate-400 hover:text-cyan-500 dark:hover:text-neonCyan transition-colors"
                    onClick={() => toggleBookmark(part)}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-cyan-500 text-cyan-500 dark:fill-neonCyan dark:text-neonCyan' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono break-all">
                  OEM: {part.oem}
                </p>
              </div>

              {/* Shop Links */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">{t('Поиск в магазинах:', 'Shop Search:')}</div>
                <div className="flex flex-wrap gap-2">
                  {/* Exist and Autodoc side-by-side */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {links.autodoc ? (
                      <a
                        href={links.autodoc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                      >
                        Autodoc <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href="https://autodoc.ru"
                        aria-disabled="true"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 pointer-events-none opacity-50 cursor-not-allowed"
                      >
                        Autodoc
                      </a>
                    )}

                    {links.exist ? (
                      <a
                        href={links.exist}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                      >
                        Exist <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href="https://exist.ru"
                        aria-disabled="true"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 pointer-events-none opacity-50 cursor-not-allowed"
                      >
                        Exist
                      </a>
                    )}
                  </div>

                  {/* Ozon and Emex */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {links.ozon ? (
                      <a
                        href={links.ozon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                      >
                        Ozon <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href="https://ozon.ru"
                        aria-disabled="true"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 pointer-events-none opacity-50 cursor-not-allowed"
                      >
                        Ozon
                      </a>
                    )}

                    {links.emex ? (
                      <a
                        href={links.emex}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                      >
                        Emex <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href="https://emex.ru"
                        aria-disabled="true"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 pointer-events-none opacity-50 cursor-not-allowed"
                      >
                        Emex
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tab switch buttons */}
        <div className="flex rounded-xl bg-slate-200/50 dark:bg-white/5 p-1 border border-slate-200/20">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-neonCyan shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            {t('Все запчасти', 'All Parts')}
          </button>
          <button
            id="saved-parts-tab"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'saved' ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-neonCyan shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            {t('Сохраненные', 'Saved Parts')}
          </button>
        </div>

        {/* Search filter input (Visible when in all parts catalog) */}
        {activeTab === 'all' && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-72">
            <InputField
              id="parts-search"
              placeholder={t('Поиск по OEM или названию...', 'Search by OEM or part name...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <GlassButton id="search-parts-btn" type="submit" variant="primary" icon={Search}>
              {t('Найти', 'Search')}
            </GlassButton>
          </form>
        )}
      </div>

      {activeTab === 'all' ? renderPartList(displayedParts) : renderPartList(bookmarkedParts)}
    </div>
  );
};

export default PartsView;
