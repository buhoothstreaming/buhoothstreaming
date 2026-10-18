'use client';

import AdvertBanner from '@/components/advert-banner';
import ContentCard from '@/components/content-card';
import { Button } from '@/components/ui/button';
import { movies } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/types';

const FAVORITES_KEY = 'favorite_movies';
const ADULT_CONTENT_KEY = 'hide_adult_content';

export default function MoviesPage() {
  const { t, language } = useLanguage();
  
  const [activeChip, setActiveChip] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(true);
  const [hideAdult, setHideAdult] = useState(true);
  const [shuffledMovies, setShuffledMovies] = useState<Movie[]>([]);

  useEffect(() => {
    setShuffledMovies([...movies].sort(() => Math.random() - 0.5));
    
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

  const chips = useMemo(() => {
    let index = 1;
    const getLabel = (label: string) => `${String(index++).padStart(2, '0')}. ${label}`;

    const categories = [
      { id: 'favorites', label: getLabel(t('favorites')) },
      { id: 'all', label: getLabel(t('all')) },
      { id: 'minescope', label: getLabel("MineScope Original Movies") },
      { id: 'four-ent', label: getLabel("4Entertainment Original Movies") },
      { id: 'docstory', label: getLabel("DocStory") },
    ];

    // Conditionally add Pepin Original (Adult Content)
    if (!hideAdult) {
      categories.push({ id: 'pepin', label: getLabel("Pepin Original") });
    }

    // Add remaining public categories
    categories.push(
      { id: 'family', label: getLabel(t('familyMovies')) },
      { id: 'romantic', label: getLabel(t('romanticMovies')) },
      { id: 'action', label: getLabel(t('actionMovies')) },
      { id: 'egyptian', label: getLabel(t('egyptianMovies')) },
      { id: 'russian', label: getLabel(t('russianMovies')) },
      { id: 'horror', label: getLabel(t('horrorMovies')) },
      { id: 'drama', label: getLabel(t('dramaMovies')) },
      { id: 'comedy', label: getLabel(t('comedyMovies')) },
      { id: 'fantasy', label: getLabel(t('fantasyMovies')) }
    );

    // Add general Adult Content toggle chip if not hidden
    if (!hideAdult) {
      categories.push({ id: 'adult-toggle', label: t('adultContent') });
    }

    return categories;
  }, [t, hideAdult]);

  useEffect(() => {
    if (chips.length > 0 && (!activeChip || !chips.some(c => c.label === activeChip))) {
        setActiveChip(chips[1]?.label || chips[0].label);
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

  const displayedMovies = useMemo(() => {
    const activeCategory = chips.find(c => c.label === activeChip)?.id;
    if (!activeCategory) return [];

    let filteredMovies = shuffledMovies;

    switch (activeCategory) {
      case 'favorites':
        filteredMovies = shuffledMovies.filter(movie => favorites.has(movie.id));
        break;
      case 'minescope':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'MineScope Original' || movie.category === '4Entertainment Original');
        break;
      case 'four-ent':
        filteredMovies = shuffledMovies.filter(movie => movie.category === '4Entertainment Original');
        break;
      case 'docstory':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'DocStory');
        break;
      case 'pepin':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'Pepin Original');
        break;
      case 'family':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'أفلام العائلة' || movie.id === 'al-hareefa' || movie.id === 'al-hareefa-2');
        break;
      case 'romantic':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'أفلام رومانسية' || movie.id === 'qessat-hob');
        break;
      case 'action':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'أفلام الأكشن');
        break;
      case 'egyptian':
        filteredMovies = shuffledMovies.filter(movie => 
          movie.category === 'أفلام مصرية' || 
          ['welad-rizq', 'welad-rizq-2', 'welad-rizq-3'].includes(movie.id)
        );
        break;
      case 'russian':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'Russian');
        break;
      case 'horror':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'Horror' || movie.genres.includes('Horror'));
        break;
      case 'drama':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'Drama' || movie.genres.includes('Drama'));
        break;
      case 'comedy':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'أفلام كوميدية' || movie.genres.includes('Comedy'));
        break;
      case 'fantasy':
        filteredMovies = shuffledMovies.filter(movie => movie.category === 'أفلام خيالية' || movie.genres.includes('Fantasy'));
        break;
      case 'adult-toggle':
        filteredMovies = shuffledMovies.filter(movie => movie.ageRating >= 18);
        break;
      default:
        // 'all' category or others not caught
        break;
    }
    
    // Apply global adult content filter unless specific adult category is selected
    if (hideAdult && activeCategory !== 'adult-toggle' && activeCategory !== 'pepin') {
        filteredMovies = filteredMovies.filter(movie => movie.ageRating < 18);
    }
    
    return filteredMovies;
  }, [activeChip, chips, favorites, hideAdult, shuffledMovies]);

  const handleChipClick = (label: string) => {
    if (label !== activeChip) {
      setShowBanner(false);
      setLoading(true);
      setActiveChip(label);
      setShuffledMovies([...movies].sort(() => Math.random() - 0.5));
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="space-y-2">
      {!loading && showBanner && <AdvertBanner />}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-30 pt-2 space-y-1">
        <div className="px-4 md:px-8 flex gap-2 overflow-x-auto flex-nowrap pb-1 no-scrollbar">
          {chips.map((chip) => (
            <Button
              key={chip.id}
              size="sm"
              variant={activeChip === chip.label ? 'default' : 'secondary'}
              className={cn("rounded-full h-7 px-3 shrink-0", 
                activeChip === chip.label && chip.id === 'adult-toggle' && "bg-gradient-to-r from-[#cf2929] to-[#e80000] text-white border-transparent",
                activeChip === chip.label && chip.id === 'minescope' && "bg-[#ff0000] hover:bg-[#ff0000]/90 text-white",
                activeChip === chip.label && chip.id === 'four-ent' && "bg-gradient-to-r from-[#000000] to-[#121212] text-white border-transparent",
                activeChip === chip.label && chip.id === 'docstory' && "bg-black text-white hover:bg-black/90",
                activeChip === chip.label && chip.id === 'pepin' && "bg-[linear-gradient(to_right,#001e4a,#000000,#630000,#e30000)] text-white border-transparent",
                activeChip === chip.label && chip.id === 'family' && "bg-gradient-to-r from-[#ffaa00] to-[#ff0000] text-white border-transparent",
                activeChip === chip.label && chip.id === 'romantic' && "bg-[#ff3da1] hover:bg-[#ff3da1]/90 text-white",
                activeChip === chip.label && chip.id === 'action' && "bg-yellow-400 text-black hover:bg-yellow-400/90",
                activeChip === chip.label && chip.id === 'egyptian' && "bg-gradient-to-r from-[#ff1100] via-[#ffffff] to-[#000000] text-[#a37000] border-transparent",
                activeChip === chip.label && chip.id === 'russian' && "bg-gradient-to-r from-red-600 to-blue-600 text-white border-transparent",
                activeChip === chip.label && chip.id === 'horror' && "bg-gradient-to-r from-[#780000] to-[#4d0000] text-white border-transparent",
                activeChip === chip.label && chip.id === 'drama' && "bg-gradient-to-r from-[#9003fc] to-[#6200ad] text-white border-transparent",
                activeChip === chip.label && chip.id === 'comedy' && "bg-[linear-gradient(to_right,#ffa200,#ff8400)] text-white border-transparent",
                activeChip === chip.label && chip.id === 'fantasy' && "bg-gradient-to-r from-[#007d73] to-[#00c99a] text-white border-transparent"
              )}
              onClick={() => handleChipClick(chip.label)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
        <Separator />
      </div>
      <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 18 }).map((_, index) => (
              <ContentCardSkeleton key={index} type="movie" />
            ))
          : displayedMovies.map((movie) => {
              const isFuture = movie.premiereDate && new Date(movie.premiereDate) > new Date();
              const subtitleText = isFuture 
                ? t('startingIn').replace('{{date}}', formatPremiereDate(movie.premiereDate!))
                : t(String(movie.year));

              return (
                <ContentCard
                  key={movie.id}
                  id={movie.id}
                  title={t(movie.title)}
                  subtitle={subtitleText}
                  imageUrl={movie.posterUrl}
                  type="movie"
                  ageRating={movie.ageRating}
                  isFavorite={favorites.has(movie.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            })}
      </div>
      { !loading && displayedMovies.length === 0 && chips.find(c => c.label === activeChip)?.id === 'favorites' && (
        <div className="text-center text-muted-foreground pt-16">
          <p>{t('noFavoriteMovies')}</p>
          <p>{t('addFavoriteMovies')}</p>
        </div>
      )}
    </div>
  );
}
