'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { Search as SearchIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { channels, movies, series } from '@/lib/data';
import ContentCard from '@/components/content-card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import type { Channel, Movie, Series as SeriesType } from '@/lib/types';
import { useDebounce } from 'use-debounce';
import { cn } from "@/lib/utils";
import AdvertBanner from "@/components/advert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const ADULT_CONTENT_KEY = 'hide_adult_content';
const FAVORITE_CHANNELS_KEY = 'favorite_channels';
const FAVORITE_MOVIES_KEY = 'favorite_movies';
const FAVORITE_SERIES_KEY = 'favorite_series';

type SearchResult = (Channel & { type: 'channel' }) | (Movie & { type: 'movie' }) | (SeriesType & { type: 'series' });

export default function SearchPage() {
  const { t, direction, language } = useLanguage();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const [activeChip, setActiveChip] = useState('');
  const [hideAdult, setHideAdult] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);

  const [favoriteChannels, setFavoriteChannels] = useState<Set<string>>(new Set());
  const [favoriteMovies, setFavoriteMovies] = useState<Set<string>>(new Set());
  const [favoriteSeries, setFavoriteSeries] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedHideAdult = localStorage.getItem(ADULT_CONTENT_KEY);
    if (storedHideAdult !== null) {
      setHideAdult(JSON.parse(storedHideAdult));
    }

    const storedFavChannels = localStorage.getItem(FAVORITE_CHANNELS_KEY);
    if (storedFavChannels) setFavoriteChannels(new Set(JSON.parse(storedFavChannels)));
    
    const storedFavMovies = localStorage.getItem(FAVORITE_MOVIES_KEY);
    if (storedFavMovies) setFavoriteMovies(new Set(JSON.parse(storedFavMovies)));

    const storedFavSeries = localStorage.getItem(FAVORITE_SERIES_KEY);
    if (storedFavSeries) setFavoriteSeries(new Set(JSON.parse(storedFavSeries)));

    setActiveChip(t('all'));
    setLoading(false);
  }, [t]);

  const virginsOneChip = 'VirginsOne';
  const joyt1Chip = 'Joyt1';
  const docStoryChip = t('docStory');
  const familyContentChip = t('familyContent');
  const adultContentChip = t('adultContent');
  const allChannelsChip = t('allChannels');

  const chips = useMemo(() => {
    const base = [t('all'), allChannelsChip, t('allMovies'), t('allSeries'), virginsOneChip, joyt1Chip, docStoryChip, familyContentChip];
    return hideAdult ? base : [...base, adultContentChip];
  }, [t, hideAdult, allChannelsChip, docStoryChip, familyContentChip, virginsOneChip, joyt1Chip]);
  
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleFavoriteToggle = useCallback((id: string, type: 'channel' | 'movie' | 'series') => {
    let key: string;
    let favorites: Set<string>;
    let setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;

    if (type === 'channel') {
      key = FAVORITE_CHANNELS_KEY;
      favorites = favoriteChannels;
      setFavorites = setFavoriteChannels;
    } else if (type === 'movie') {
      key = FAVORITE_MOVIES_KEY;
      favorites = favoriteMovies;
      setFavorites = setFavoriteMovies;
    } else {
      key = FAVORITE_SERIES_KEY;
      favorites = favoriteSeries;
      setFavorites = setFavoriteSeries;
    }

    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem(key, JSON.stringify(Array.from(newFavorites)));
  }, [favoriteChannels, favoriteMovies, favoriteSeries]);

  const getIsFavorite = (id: string, type: 'channel' | 'movie' | 'series') => {
    if (type === 'channel') return favoriteChannels.has(id);
    if (type === 'movie') return favoriteMovies.has(id);
    if (type === 'series') return favoriteSeries.has(id);
    return false;
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

  useEffect(() => {
    if (loading) return;

    setSearching(true);
    
    const processContent = () => {
        const lowerCaseQuery = debouncedQuery.toLowerCase();
        let allContent: SearchResult[] = [];

        // Deduplication helper to prevent duplicate key errors
        const getUnique = <T extends { id: string }>(items: T[]): T[] => {
            const seen = new Set();
            return items.filter(item => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
            });
        };

        const allChannelsPool = getUnique(channels);
        const allMoviesPool = getUnique(hideAdult ? movies.filter(m => m.ageRating < 18) : movies);
        const allSeriesPool = getUnique(hideAdult ? series.filter(s => s.ageRating < 18) : series);
        
        const getFiltered = <T extends (Channel | Movie | SeriesType)>(items: T[]): T[] => {
            if (!debouncedQuery) return items;
            return items.filter(item => {
                const title = 'name' in item ? item.name : t(item.title);
                return title.toLowerCase().includes(lowerCaseQuery);
            });
        };

        if (activeChip === t('all')) {
            allContent.push(...getFiltered(allChannelsPool).map(c => ({...c, type: 'channel' as const})));
            const filteredMovies = getFiltered(allMoviesPool).map(m => ({...m, type: 'movie' as const}));
            const filteredSeries = getFiltered(allSeriesPool).map(s => ({...s, type: 'series' as const}));
            allContent.push(...filteredMovies.sort(() => Math.random() - 0.5));
            allContent.push(...filteredSeries.sort(() => Math.random() - 0.5));
        } else if (activeChip === allChannelsChip) {
            allContent.push(...getFiltered(allChannelsPool).map(c => ({...c, type: 'channel' as const})));
        } else if (activeChip === t('allMovies')) {
            allContent.push(...getFiltered(allMoviesPool).map(m => ({...m, type: 'movie' as const})));
        } else if (activeChip === t('allSeries')) {
            allContent.push(...getFiltered(allSeriesPool).map(s => ({...s, type: 'series' as const})));
        } else if (activeChip === virginsOneChip) {
            const virginsOneChannelIds = [
              'd-television', 'al-thania-iraq', 'r-plus-massia', 'kidztoonz-channel', 
              'story-tv', 'rewind-tv', 'hits', 'ain-tv-hd', 'kineko-tv-ms', 
              'viva-channel', 'mora-tv', 'star-rouge-tv', 'gizmo', 'cinema-al-shabab', 
              '1-passion', 'tiava-hd', 'eva', 
              'bravo', 'bravo-duo', 'bravo-trio', 
              'serial-plus', 'kino-plus', 'humor-plus', 'veralt-plus', 'iris-tv',
              'youth-classics-channel'
            ];
            const virginsOneChannels = virginsOneChannelIds
              .map(id => allChannelsPool.find(c => c.id === id))
              .filter((c): c is Channel => !!c);
            
            allContent.push(...getFiltered(virginsOneChannels).map(c => ({...c, type: 'channel' as const})));

            const mineScopeMovies = allMoviesPool.filter(m => 
              m.category === '4Entertainment' || 
              m.category === 'MineScope Original' || 
              m.category === '4Entertainment Original' ||
              m.category === 'VIVA' ||
              m.category === 'VirginsOne' ||
              ['the-final-revenge', 'creepypasta', 'obaydfox-imitating-middle-eastern-clips', 'minescope-red-wedding'].includes(m.id)
            );
            allContent.push(...getFiltered(mineScopeMovies).map(m => ({...m, type: 'movie' as const})));
            const mineScopeSeries = allSeriesPool.filter(s => 
              s.category === '4Entertainment' || 
              s.category === 'MineScope' || 
              s.category === 'VIVA' ||
              s.category === 'VirginsOne' ||
              ['yomyat-daaboul-wa-alishko', 'yomyat-hamody-saif', 'kaido-moon-craft', 'sharara-show', 'deviantart-arabic', 'dont-mess-with-the-angel', 'love-island-minescope', 'mystery-lies', 'bobby-world', 'the-purge', 'kvgd69', 'blades-magic', 'mystreet'].includes(s.id)
            );
            allContent.push(...getFiltered(mineScopeSeries).map(s => ({...s, type: 'series' as const})));
        } else if (activeChip === joyt1Chip) {
            const joyt1Series = allSeriesPool.filter(s => ['love-island-minescope', 'mystery-lies', 'bobby-world', 'the-purge', 'blades-magic', 'mystreet'].includes(s.id));
            allContent.push(...getFiltered(joyt1Series).map(s => ({...s, type: 'series' as const})));
            
            const joyt1ChannelIds = ['joyt1', 'joyt9', 'filmo', 'youth-classics-channel'];
            const joyt1Channels = joyt1ChannelIds
              .map(id => allChannelsPool.find(c => c.id === id))
              .filter((c): c is Channel => !!c);
            
            allContent.push(...getFiltered(joyt1Channels).map(c => ({...c, type: 'channel' as const})));
        } else if (activeChip === docStoryChip) {
            const docMovies = allMoviesPool.filter(m => m.category === 'DocStory');
            allContent.push(...getFiltered(docMovies).map(m => ({...m, type: 'movie' as const})));
            const docChannels = allChannelsPool.filter(c => c.name === 'DocStory');
            allContent.push(...getFiltered(docChannels).map(c => ({...c, type: 'channel' as const})));
        } else if (activeChip === familyContentChip) {
            const familyChannelIds = ['kidztoonz-channel', 'story-tv', 'icefox-tv', 'mbc3', 'kartoon-channel'];
            const familyChannelsPool = familyChannelIds
                .map((id, idx) => {
                    const ch = allChannelsPool.find(c => c.id === id);
                    if (ch) return { ...ch, number: (idx + 1).toString().padStart(4, '0'), type: 'channel' as const };
                    return null;
                })
                .filter((c): c is (Channel & { type: 'channel' }) => !!c);

            allContent.push(...getFiltered(familyChannelsPool));

            const familyMovieIds = [
                'miraculous-world-shanghai', 'ladybug-cat-noir-the-movie', 'ralph-breaks-the-internet',
                'wreck-it-ralph', 'miraculous-world-ny', 'miraculous-world-paris', 'miraculous-world-tokyo', 'miraculous-world-london',
                'toy-story', 'toy-story-2', 'toy-story-3', 'toy-story-4', 'the-emoji-movie', 'toy-story-5', 
                'captain-underpants-the-first-epic-movie', 'the-boss-baby', 'the-boss-baby-family-business', 
                'the-incredibles', 'incredibles-2', 'soul', 'meet-the-robinsons', 'lego-ninjago-movie', 
                'trolls', 'inside-out', 'inside-out-2', 'spongebob-movie-1', 'spongebob-movie-2', 'spongebob-movie-3', 'spongebob-movie-4',
                'turning-red'
            ];
            const familySeriesIds = [
                'lola-mila', 'miraculous', 'yomyat-daaboul-wa-alishko', 'poor-snake-troll',
                'poor-snake-find-home', 'troll-pencil', 'leo-and-merae', 'troll-robber',
                'ahmad-hero', 'd4'
            ];
            const familyMovies = allMoviesPool.filter(m => familyMovieIds.includes(m.id));
            allContent.push(...getFiltered(familyMovies).map(m => ({...m, type: 'movie' as const})));
            const familySeries = allSeriesPool.filter(s => familySeriesIds.includes(s.id));
            allContent.push(...getFiltered(familySeries).map(s => ({...s, type: 'series' as const})));
        } else if (activeChip === t('adultContent')) {
            const adultMoviesPool = allMoviesPool.filter(m => m.ageRating >= 18);
            const adultSeriesPool = allSeriesPool.filter(s => s.ageRating >= 18);
            allContent.push(...getFiltered(adultMoviesPool).map(m => ({...m, type: 'movie' as const})));
            allContent.push(...getFiltered(adultSeriesPool).map(s => ({...s, type: 'series' as const})));
        }

        const randomizedChips = [virginsOneChip, joyt1Chip, docStoryChip, t('allMovies'), t('allSeries'), t('adultContent')];
        if (randomizedChips.includes(activeChip)) {
            if (activeChip === virginsOneChip) {
                const channelsPart = allContent.filter(r => r.type === 'channel');
                const othersPart = allContent.filter(r => r.type !== 'channel');
                allContent = [...channelsPart, ...([...othersPart].sort(() => Math.random() - 0.5))];
            } else if (activeChip === joyt1Chip) {
                const channelsPart = allContent.filter(r => r.type === 'channel');
                const othersPart = allContent.filter(r => r.type !== 'channel');
                allContent = [...channelsPart, ...([...othersPart].sort(() => Math.random() - 0.5))];
            } else {
                allContent = [...allContent].sort(() => Math.random() - 0.5);
            }
        }

        setResults(allContent);
        setSearching(false);
    }
    
    const searchTimer = setTimeout(processContent, 500);
    return () => clearTimeout(searchTimer);

  }, [debouncedQuery, activeChip, t, hideAdult, loading, virginsOneChip, joyt1Chip, docStoryChip, familyContentChip, allChannelsChip]);

  const renderResults = () => {
    if (searching) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 18 }).map((_, index) => (
                    <ContentCardSkeleton key={index} type="movie" />
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center text-muted-foreground pt-16">
                <p>{t('noResultsFound')}</p>
            </div>
        );
    }

    const isAdult = activeChip === t('adultContent');
    
    const pepinOriginalResults = isAdult 
      ? results.filter((r): r is ((Movie & { type: 'movie' }) | (SeriesType & { type: 'series' })) => r.type !== 'channel' && r.category === 'Pepin Original')
      : [];

    const channelsResults = results.filter(r => r.type === 'channel');
    const moviesResults = results.filter(r => r.type === 'movie');
    const seriesResults = results.filter(r => r.type === 'series');

    const youthCinemaIds = ['the-final-revenge', 'creepypasta', 'obaydfox-imitating-middle-eastern-clips', 'minescope-red-wedding'];
    const is4Ent = activeChip === virginsOneChip;
    const isJoyt1 = activeChip === joyt1Chip;
    const isDoc = activeChip === docStoryChip;
    const isFamily = activeChip === familyContentChip;
    const isAll = activeChip === t('all');
    const isScrollable = is4Ent || isJoyt1 || isAll || isDoc || isFamily || isAdult;
    
    const youthCinemaResults = is4Ent 
      ? moviesResults.filter(m => youthCinemaIds.includes(m.id)) 
      : [];
    
    const regularMoviesResults = moviesResults;

    const vivaOriginalResults = is4Ent
      ? results.filter(r => r.category === 'VIVA' && r.id !== 'love-island-minescope')
      : [];

    const showExclusive = (activeChip === t('all') || activeChip === allChannelsChip);
    const exclusiveChannels = showExclusive ? channelsResults.filter(c => c.category === 'OUR_CHANNELS') : [];
    
    const regularChannels = (activeChip === t('all') || activeChip === allChannelsChip || activeChip === familyContentChip || activeChip === joyt1Chip || activeChip === virginsOneChip)
      ? (activeChip === familyContentChip || activeChip === joyt1Chip || activeChip === virginsOneChip ? channelsResults : channelsResults.filter(c => c.category !== 'OUR_CHANNELS'))
      : [];
    
    const moviesHeader = isDoc ? t('documentaryFilms') : (is4Ent ? t('originalMovies') : t('allMovies'));
    const seriesHeader = (is4Ent || isDoc || isJoyt1) ? t('originalSeriesAndShows') : t('allSeries');

    const containerClass = isScrollable 
        ? "flex flex-nowrap overflow-x-auto gap-4 pb-4 no-scrollbar" 
        : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4";

    const itemClass = isScrollable 
        ? "w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] md:w-[calc(20%-13px)] xl:w-[calc(16.66%-14px)] shrink-0" 
        : "";

    const allNonExclusive = channels.filter(c => c.category !== 'OUR_CHANNELS');

    const channelsBlock = regularChannels.length > 0 && (
      <div>
        <h2 className="text-base font-black text-white mb-4">{(activeChip === virginsOneChip || activeChip === joyt1Chip) ? t('channels') : t('allChannels')}</h2>
        <div className={containerClass}>
          {regularChannels.map((item) => {
            let displayNum = item.number;
            if (activeChip === t('all') || activeChip === allChannelsChip) {
                const globalIndex = allNonExclusive.findIndex(c => c.id === item.id);
                displayNum = globalIndex !== -1 ? (globalIndex + 1).toString().padStart(4, '0') : item.number;
            } else if (activeChip === joyt1Chip) {
                const joyt1ChannelIds = ['joyt1', 'joyt9', 'filmo', 'youth-classics-channel'];
                const idx = joyt1ChannelIds.indexOf(item.id);
                if (idx !== -1) displayNum = (idx + 1).toString().padStart(4, '0');
            } else if (activeChip === virginsOneChip) {
                const v1Ids = [
                  'd-television', 'al-thania-iraq', 'r-plus-massia', 'kidztoonz-channel', 
                  'story-tv', 'rewind-tv', 'hits', 'ain-tv-hd', 'kineko-tv-ms', 
                  'viva-channel', 'mora-tv', 'star-rouge-tv', 'gizmo', 'cinema-al-shabab', 
                  '1-passion', 'tiava-hd', 'eva', 
                  'bravo', 'bravo-duo', 'bravo-trio', 
                  'serial-plus', 'kino-plus', 'humor-plus', 'veralt-plus', 'iris-tv',
                  'youth-classics-channel'
                ];
                const idx = v1Ids.indexOf(item.id);
                if (idx !== -1) displayNum = (idx + 1).toString().padStart(4, '0');
            }
            
            return (
                <div key={`${item.type}-${item.id}`} className={itemClass}>
                  <ContentCard
                    id={item.id}
                    title={item.name}
                    subtitle={displayNum}
                    imageUrl={item.logo}
                    type="channel"
                    isFavorite={getIsFavorite(item.id, 'channel')}
                    onFavoriteToggle={(id) => handleFavoriteToggle(id, 'channel')}
                  />
                </div>
            );
          })}
        </div>
      </div>
    );

    const moviesBlock = regularMoviesResults.length > 0 && (
      <div>
        <h2 className="text-base font-black text-white mb-4">{moviesHeader}</h2>
        <div className={containerClass}>
          {regularMoviesResults.map((item) => {
            const isFuture = item.premiereDate && new Date(item.premiereDate) > new Date();
            const subtitleText = isFuture 
                ? t('startingIn').replace('{{date}}', formatPremiereDate(item.premiereDate!))
                : t(String(item.year));

            return (
                <div key={`${item.type}-${item.id}`} className={itemClass}>
                  <ContentCard
                    id={item.id}
                    title={t(item.title)}
                    subtitle={subtitleText}
                    imageUrl={item.posterUrl}
                    type="movie"
                    ageRating={item.ageRating}
                    isFavorite={getIsFavorite(item.id, 'movie')}
                    onFavoriteToggle={(id) => handleFavoriteToggle(id, 'movie')}
                  />
                </div>
            );
          })}
        </div>
      </div>
    );

    const pepinOriginalBlock = isAdult && pepinOriginalResults.length > 0 && (
      <div>
        <h2 className="text-base font-black text-white mb-4">Pepin Original</h2>
        <div className={containerClass}>
          {pepinOriginalResults.map((item) => {
            const subtitleText = 'year' in item ? t(String(item.year)) : '';
            return (
                <div key={`${item.type}-${item.id}-pepin`} className={itemClass}>
                  <ContentCard
                    id={item.id}
                    title={t(item.title)}
                    subtitle={subtitleText}
                    imageUrl={item.posterUrl}
                    type="movie"
                    ageRating={item.ageRating}
                    isFavorite={getIsFavorite(item.id, 'movie')}
                    onFavoriteToggle={(id) => handleFavoriteToggle(id, 'movie')}
                  />
                </div>
            );
          })}
        </div>
      </div>
    );

    const seriesBlock = seriesResults.length > 0 && (
      <div>
        <h2 className="text-base font-black text-white mb-4">{seriesHeader}</h2>
        <div className={containerClass}>
          {seriesResults.map((item) => {
            const isFuture = item.premiereDate && new Date(item.premiereDate) > new Date();
            const subtitleText = isFuture 
                ? t('startingIn').replace('{{date}}', formatPremiereDate(item.premiereDate!))
                : t(String(item.year));

            return (
                <div key={`${item.type}-${item.id}`} className={itemClass}>
                  <ContentCard
                    id={item.id}
                    title={t(item.title)}
                    subtitle={subtitleText}
                    imageUrl={item.posterUrl}
                    type="series"
                    ageRating={item.ageRating}
                    isFavorite={getIsFavorite(item.id, 'series')}
                    onFavoriteToggle={(id) => handleFavoriteToggle(id, 'series')}
                  />
                </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="space-y-8 mt-[-5px]">
        {exclusiveChannels.length > 0 && (
          <div>
            <h2 className="text-base font-black text-white mb-4">{t('ourExclusiveChannels')}</h2>
            <div className={containerClass}>
              {exclusiveChannels.map((item) => (
                <div key={`${item.type}-${item.id}`} className={itemClass}>
                  <ContentCard
                    id={item.id}
                    title={item.name}
                    subtitle={item.number}
                    imageUrl={item.logo}
                    type="channel"
                    isFavorite={getIsFavorite(item.id, 'channel')}
                    onFavoriteToggle={(id) => handleFavoriteToggle(id, 'channel')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {isAll ? (
          <>
            {channelsBlock}
            {moviesBlock}
            {seriesBlock}
          </>
        ) : isAdult ? (
          <>
            {channelsBlock}
            {moviesBlock}
            {seriesBlock}
            {pepinOriginalBlock}
          </>
        ) : (
          <>
            {is4Ent ? (
               <>
                {channelsBlock}
                {moviesBlock}
                {seriesBlock}
               </>
            ) : isJoyt1 ? (
                <>
                {channelsBlock}
                {moviesBlock}
                {seriesBlock}
                </>
            ) : (
                <>
                {channelsBlock}
                {seriesBlock}
                {moviesBlock}
                </>
            )}
          </>
        )}
  
        {youthCinemaResults.length > 0 && (
          <div>
            <h2 className="text-base font-black text-white mb-4">{"سينما الشباب"}</h2>
            <div className={containerClass}>
              {youthCinemaResults.map((item) => {
                const isFuture = item.premiereDate && new Date(item.premiereDate) > new Date();
                const subtitleText = isFuture 
                    ? t('startingIn').replace('{{date}}', formatPremiereDate(item.premiereDate!))
                    : t(String(item.year));

                return (
                    <div key={`${item.type}-${item.id}-youth`} className={itemClass}>
                      <ContentCard
                        id={item.id}
                        title={t(item.title)}
                        subtitle={subtitleText}
                        imageUrl={item.posterUrl}
                        type="movie"
                        ageRating={item.ageRating}
                        isFavorite={getIsFavorite(item.id, 'movie')}
                        onFavoriteToggle={(id) => handleFavoriteToggle(id, 'movie')}
                      />
                    </div>
                );
              })}
            </div>
          </div>
        )}

        {vivaOriginalResults.length > 0 && (
          <div>
            <h2 className="text-base font-black text-white mb-4">{t('vivaOriginal')}</h2>
            <div className={containerClass}>
              {vivaOriginalResults.map((item) => {
                let subtitleText = '';
                if ('year' in item) {
                  const isFuture = item.premiereDate && new Date(item.premiereDate) > new Date();
                  subtitleText = isFuture 
                      ? t('startingIn').replace('{{date}}', formatPremiereDate(item.premiereDate!))
                      : t(String(item.year));
                } else if ('number' in item) {
                  subtitleText = item.number;
                }

                return (
                    <div key={`${item.type}-${item.id}-viva`} className={itemClass}>
                      <ContentCard
                        id={item.id}
                        title={'name' in item ? item.name : t(item.title)}
                        subtitle={subtitleText}
                        imageUrl={'logo' in item ? item.logo : item.posterUrl}
                        type={item.type}
                        ageRating={'ageRating' in item ? item.ageRating : undefined}
                        isFavorite={getIsFavorite(item.id, item.type)}
                        onFavoriteToggle={(id) => handleFavoriteToggle(id, item.type)}
                      />
                    </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleChipClick = (chip: string) => {
    if (chip !== activeChip) {
      setSearching(true);
      setActiveChip(chip);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-md border-b border-white/5 pb-2">
            <div className="p-4 pb-1">
                <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 rounded-full hover:bg-black/50">
                    <BackIcon className="h-6 w-6" />
                </Button>
                <div className="relative w-full">
                    <SearchIcon className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <SearchIcon className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    className="ltr:pr-10 rtl:pl-10 h-11 bg-white/5 border-white/10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                </div>
            </div>

            <div className="px-4 pt-2 space-y-1">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-7 w-20 rounded-full" />
                    ))
                    ) : (
                    chips.map((chip) => (
                        <Button 
                        key={chip} 
                        size="sm" 
                        variant={activeChip === chip ? "default": "secondary"} 
                        className={cn(
                            "rounded-full whitespace-nowrap h-7 px-3 shrink-0 text-[13px] transition-all font-medium border-transparent",
                            activeChip === chip 
                                ? (chip === joyt1Chip ? "bg-[#ff4529] text-white hover:bg-[#ff4529]/90" :
                                   chip === docStoryChip ? "bg-black text-white hover:bg-black/90" : 
                                   chip === familyContentChip ? "bg-[linear-gradient(to_right,#0477EE,#D40006,#FF8B00)] text-white hover:opacity-90" :
                                   "bg-[#008cff] text-white hover:bg-[#008cff]/90")
                                : "bg-[#182343] text-white hover:bg-[#25305a]",
                            activeChip === chip && chip === virginsOneChip && "bg-[#e30000] text-white hover:bg-[#e30000]/90",
                            activeChip === chip && chip === t('adultContent') && "bg-gradient-to-r from-[#cf2929] to-[#e80000] text-white"
                        )}
                        onClick={() => handleChipClick(chip)}
                        >
                        {chip}
                        </Button>
                    ))
                    )}
                </div>
            </div>
        </div>

        <AdvertBanner />

        <div className="p-4 flex-grow">
            {renderResults()}
        </div>
    </div>
  );
}
