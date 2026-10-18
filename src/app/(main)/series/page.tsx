'use client';

import AdvertBanner from '@/components/advert-banner';
import ContentCard from '@/components/content-card';
import { Button } from '@/components/ui/button';
import { series } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import type { Series } from '@/lib/types';

const FAVORITES_KEY = 'favorite_series';
const ADULT_CONTENT_KEY = 'hide_adult_content';

export default function SeriesPage() {
  const { t, language } = useLanguage();

  const [activeChip, setActiveChip] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(true);
  const [hideAdult, setHideAdult] = useState(true);
  const [shuffledSeries, setShuffledSeries] = useState<Series[]>([]);

  // Local helper to ensure unique series by ID
  const getUniqueSeries = (items: Series[]) => {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  useEffect(() => {
    const uniqueList = getUniqueSeries(series);
    setShuffledSeries([...uniqueList].sort(() => Math.random() - 0.5));

    const timer = setTimeout(() => setLoading(false), 1500);

    const syncSettings = () => {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }
      const storedHideAdult = localStorage.getItem(ADULT_CONTENT_KEY);
      if (storedHideAdult !== null) {
        setHideAdult(JSON.parse(storedHideAdult));
      }
    };

    syncSettings();

    window.addEventListener('focus', syncSettings);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', syncSettings);
    };
  }, []);

  const entertainment4Chip = "03. 4Entertainment";
  const vivaChip = "04. VIVA";
  const virginsOneChip = "05. VirginsOne";
  const netflixChip = "06. Netflix";
  const youthClassicsChip = "07. " + t('youthClassics');
  const animationCategoryChip = `08. ${t('animationCategory')}`;
  const fantasySeriesChip = `09. ${t('fantasySeries')}`;
  const comedySeriesChip = `10. ${t('comedySeries')}`;
  const dramaSeriesChip = `11. ${t('dramaSeries')}`;
  const ramadanChip = `12. ${t('ramadan')}`;

  const chips = useMemo(() => {
    const baseChips = [
      `01. ${t('favorites')}`, 
      `02. ${t('all')}`, 
      entertainment4Chip, 
      vivaChip,
      virginsOneChip,
      netflixChip,
      youthClassicsChip,
      animationCategoryChip, 
      fantasySeriesChip,
      comedySeriesChip,
      dramaSeriesChip,
      ramadanChip
    ];
    if (!hideAdult) {
      baseChips.push(t('adultContent'));
    }
    return baseChips;
  }, [t, hideAdult, youthClassicsChip, animationCategoryChip, fantasySeriesChip, comedySeriesChip, dramaSeriesChip, ramadanChip]);

  useEffect(() => {
    if (chips.length > 1 && !activeChip) {
        setActiveChip(chips[1]);
    } else if (chips.length > 1 && !chips.some(c => c === activeChip)) {
        setActiveChip(chips[1]);
    }
  }, [chips, activeChip]);

  const handleFavoriteToggle = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
  };

  const formatPremiereDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = language === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  const displayedSeries = useMemo(() => {
    const favoritesChip = `01. ${t('favorites')}`;
    const adultContentChip = t('adultContent');

    let filteredSeries = shuffledSeries;

    if (activeChip === entertainment4Chip) {
      filteredSeries = shuffledSeries.filter(item => 
        item.category === '4Entertainment' || 
        item.category === 'MineScope' || 
        item.category === 'VIVA' ||
        item.id === 'yomyat-daaboul-wa-alishko' ||
        item.id === 'yomyat-hamody-saif' ||
        item.id === 'kaido-moon-craft' ||
        item.id === 'sharara-show' ||
        item.category === 'VirginsOne' ||
        item.id === 'mystery-lies' ||
        item.id === 'bobby-world' ||
        item.id === 'the-purge' ||
        item.id === 'kvgd69' ||
        item.id === 'blades-magic'
      );
    } else if (activeChip === vivaChip) {
      filteredSeries = shuffledSeries.filter(item => item.category === 'VIVA');
    } else if (activeChip === virginsOneChip) {
        filteredSeries = shuffledSeries.filter(item => item.category === 'VirginsOne');
    } else if (activeChip === netflixChip) {
        filteredSeries = shuffledSeries.filter(item => item.category === 'Netflix');
    } else if (activeChip === youthClassicsChip) {
        filteredSeries = shuffledSeries.filter(item => 
          item.category === 'Youth Classics' || 
          ['mystery-lies', 'the-music-freaks', 'telegachers', 'love-island-minescope', 'bobby-world', 'the-purge', 'kvgd69', 'blades-magic'].includes(item.id)
        );
    } else if (activeChip === animationCategoryChip) {
      filteredSeries = shuffledSeries.filter(item => item.category === 'رسوم متحركة');
    } else if (activeChip === fantasySeriesChip) {
        filteredSeries = shuffledSeries.filter(item => item.category === 'Fantasy Series' || item.id === 'blades-magic');
    } else if (activeChip === comedySeriesChip) {
        filteredSeries = shuffledSeries.filter(item => item.category === 'Comedy Series' || item.id === 'abousi-al-jameel' || item.id === 'yomyat-saleh-yasser' || item.id === 'blades-magic' || item.genres.includes('Comedy'));
    } else if (activeChip === dramaSeriesChip) {
        filteredSeries = shuffledSeries.filter(item => item.category === 'Drama Series' || item.genres.includes('Drama'));
    } else if (activeChip === ramadanChip) {
      filteredSeries = shuffledSeries.filter(item => item.category === 'Ramadan' || item.id === 'tango' || item.id === 'cello' || item.id === 'julia' || item.id === 'abousi-al-jameel' || item.id === 'yomyat-fawazeer');
    } else if (activeChip === adultContentChip) {
        filteredSeries = shuffledSeries.filter(item => item.ageRating >= 18 || item.id === 'kvgd69');
    } else if (activeChip === favoritesChip) {
        filteredSeries = shuffledSeries.filter(item => favorites.has(item.id));
    }
    
    if (hideAdult && activeChip !== adultContentChip) {
      filteredSeries = filteredSeries.filter(item => item.ageRating < 18);
    }
    
    return filteredSeries;
  }, [activeChip, favorites, t, hideAdult, shuffledSeries, youthClassicsChip, animationCategoryChip, fantasySeriesChip, comedySeriesChip, dramaSeriesChip, ramadanChip]);

  const handleChipClick = (chip: string) => {
    if (chip !== activeChip) {
      setShowBanner(false);
      setLoading(true);
      setActiveChip(chip);
      const uniqueList = getUniqueSeries(series);
      setShuffledSeries([...uniqueList].sort(() => Math.random() - 0.5));
      setTimeout(() => setLoading(false), 500);
    }
  };

  const adultContentChip = t('adultContent');

  return (
    <div className="space-y-2">
      {!loading && showBanner && <AdvertBanner />}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-30 pt-2 space-y-1">
        <div className="px-4 md:px-8 flex gap-2 overflow-x-auto flex-nowrap pb-1 no-scrollbar">
          {chips.map((chip) => (
            <Button
              key={chip}
              size="sm"
              variant={activeChip === chip ? 'default' : 'secondary'}
              style={activeChip === chip && chip === youthClassicsChip ? {
                  background: 'linear-gradient(to right, #6912ff, #12d4ff, #ff1231, #4912ff)',
                  color: 'white',
                  border: 'none'
              } : {}}
              className={cn("rounded-full h-7 px-3 shrink-0",
                activeChip === chip && chip === adultContentChip && "bg-gradient-to-r from-[#cf2929] to-[#e80000] text-white border-transparent",
                activeChip === chip && chip === entertainment4Chip && "bg-gradient-to-r from-[#000000] to-[#121212] text-white border-transparent",
                activeChip === chip && chip === vivaChip && "bg-[#752EE5] hover:bg-[#752EE5]/90 text-white border-transparent",
                activeChip === chip && chip === virginsOneChip && "bg-[#e30000] text-white hover:bg-[#e30000]/90",
                activeChip === chip && chip === netflixChip && "bg-[#E50914] text-white hover:bg-[#E50914]/90 border-transparent",
                activeChip === chip && chip === animationCategoryChip && "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                activeChip === chip && chip === fantasySeriesChip && "bg-gradient-to-r from-[#007d73] to-[#00c99a] text-white border-transparent",
                activeChip === chip && chip === comedySeriesChip && "bg-[linear-gradient(to_right,#ffa200,#ff8400)] text-white border-transparent",
                activeChip === chip && chip === dramaSeriesChip && "bg-gradient-to-r from-[#9003fc] to-[#6200ad] text-white border-transparent",
                activeChip === chip && chip === ramadanChip && "bg-gradient-to-r from-[#001b47] to-[#000f5c] text-[#ffe58f] border-transparent"
              )}
              onClick={() => handleChipClick(chip)}
            >
              {chip}
            </Button>
          ))}
        </div>
        <Separator />
      </div>
      <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 18 }).map((_, index) => (
              <ContentCardSkeleton key={index} type="series" />
            ))
          : displayedSeries.map((item) => {
              const isFuture = item.premiereDate && new Date(item.premiereDate) > new Date();
              const subtitleText = isFuture 
                ? t('startingIn').replace('{{date}}', formatPremiereDate(item.premiereDate!))
                : t(String(item.year));

              return (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  title={t(item.title)}
                  subtitle={subtitleText}
                  imageUrl={item.posterUrl}
                  type="series"
                  ageRating={item.ageRating}
                  isFavorite={favorites.has(item.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            })}
      </div>
      { !loading && displayedSeries.length === 0 && activeChip === `01. ${t('favorites')}` && (
        <div className="text-center text-muted-foreground pt-16">
          <p>{t('noFavoriteSeries')}</p>
          <p>{t('addFavoriteSeries')}</p>
        </div>
      )}
    </div>
  );
}
