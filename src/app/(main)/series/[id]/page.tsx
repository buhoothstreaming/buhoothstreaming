
'use client';

import AgeRatingBadge from "@/components/age-rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { series } from "@/lib/data";
import { Heart, Play, Star, ArrowLeft, ArrowRight, Clapperboard, ChevronRight, ChevronLeft, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Season } from '@/lib/types';
import { useContinueWatching } from "@/hooks/use-continue-watching";

const FAVORITES_KEY = 'favorite_series';

export default function SeriesInfoPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const s = series.find(s => s.id === params.id);
    
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(s?.seasons[0]);
    const { getContinueWatchingEpisode } = useContinueWatching();
    const [continueWatching, setContinueWatching] = useState<{season: number, episode: number} | null>(null);

    const [isPremiered, setIsPremiere] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);


    const { t, direction, language } = useLanguage();
    const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
    const MoreIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        if (s) {
          const continueWatchingData = getContinueWatchingEpisode(s.id);
          
          // Determine initial season to display: progress season or first season
          const initialSeason = continueWatchingData 
            ? (s.seasons.find(season => season.seasonNumber === continueWatchingData.season) || s.seasons[0])
            : s.seasons[0];
          
          setSelectedSeason(initialSeason);

          if (continueWatchingData) {
            setContinueWatching(continueWatchingData);
          }

          const storedFavorites = localStorage.getItem(FAVORITES_KEY);
          if (storedFavorites) {
              const favorites: string[] = JSON.parse(storedFavorites);
              setIsFavorite(favorites.includes(s.id));
          }

          // Premiere logic
          if (s.premiereDate) {
              const premiereTime = new Date(s.premiereDate).getTime();
              
              const updateTimer = () => {
                  const now = new Date().getTime();
                  const difference = premiereTime - now;

                  if (difference <= 0) {
                      setIsPremiere(true);
                      setTimeLeft(null);
                  } else {
                      setIsPremiere(false);
                      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                      setTimeLeft({ days, hours, minutes, seconds });
                  }
              };

              updateTimer();
              const interval = setInterval(updateTimer, 1000);
              return () => clearInterval(interval);
          }
        }
        return () => clearTimeout(timer);
    }, [s, getContinueWatchingEpisode]);

    const handleFavoriteToggle = () => {
      if (!s) return;
  
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      let favorites: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];
  
      if (isFavorite) {
        favorites = favorites.filter(id => id !== s.id);
      } else {
        if (!favorites.includes(s.id)) {
          favorites.push(s.id);
        }
      }
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    };

    const handleSeasonChange = (seasonNumber: string) => {
      const season = s?.seasons.find(s => s.seasonNumber === parseInt(seasonNumber));
      if (season) {
        setSelectedSeason(season);
      }
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

  if (!s) {
    notFound();
  }

  const continueWatchingEpisodeData = continueWatching 
    ? s.seasons.find(season => season.seasonNumber === continueWatching.season)?.episodes.find(ep => ep.episodeNumber === continueWatching.episode) 
    : null;

  const firstEpisode = s.seasons?.[0]?.episodes?.[0];
  
  const playHref = continueWatching
    ? `/series/${s.id}/play?season=${continueWatching.season}&episode=${continueWatching.episode}`
    : (firstEpisode ? `/series/${s.id}/play?season=${s.seasons[0].seasonNumber}&episode=${firstEpisode.episodeNumber}` : `/series/${s.id}/play`);

  const playButtonText = continueWatching ? t('continueWatching') : t('watchNow');

  const displayedEpisodes = selectedSeason?.episodes.slice(0, 5) || [];
  const hasMoreEpisodes = (selectedSeason?.episodes.length || 0) > 5;

  if (loading) {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-1">
            <div className="space-y-4">
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <Skeleton className="rounded-lg w-full aspect-video object-cover" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Skeleton className="h-11 w-full sm:w-40" />
                      <Skeleton className="h-11 w-full sm:w-44" />
                      <Skeleton className="h-11 w-11 rounded-full" />
                    </div>
                  </div>
              </div>
    
              <div className="pt-8">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-8 w-32" />
                  {s && s.seasons.length > 1 && <Skeleton className="h-10 w-44" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-2">
                        <Skeleton className="w-1/3 aspect-video rounded-md flex-shrink-0" />
                        <div className="flex-1 space-y-2 w-full">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }

  const totalSeasons = s.seasons.length;
  const totalEpisodes = s.seasons.reduce((acc, season) => acc + season.episodes.length, 0);

  const isFuture = s.premiereDate && new Date(s.premiereDate) > new Date();
  const yearDisplay = isFuture 
    ? t('startingIn').replace('{{date}}', formatPremiereDate(s.premiereDate!))
    : t(String(s.year));

  return (
    <div>
        <header className="sticky top-0 left-0 right-0 z-50 p-2 bg-background/80 backdrop-blur-sm border-b border-white/5">
            <Button variant="ghost" size="icon" onClick={() => router.push('/series')} className="rounded-full text-white bg-black/20 hover:bg-black/50 hover:shadow-lg">
                <BackIcon className="h-6 w-6" />
            </Button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-1">
            <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <Image src={s.posterUrl} alt={t(s.title)} width={400} height={225} className="rounded-lg w-full object-cover" data-ai-hint="series poster"/>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h1 className="text-4xl font-bold">{t(s.title)}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                            <span>{yearDisplay}</span>
                            <span>&#8226;</span>
                            {s.id === 'demo-series' ? (
                                <div className="flex items-center gap-1">
                                    <AgeRatingBadge rating={16} />
                                    <AgeRatingBadge rating={18} />
                                </div>
                            ) : s.id === 'chloe-the-butterfly-girl' ? (
                                <div className="flex items-center gap-1">
                                    <AgeRatingBadge rating={12} />
                                    <AgeRatingBadge rating={16} />
                                </div>
                            ) : (
                                <AgeRatingBadge rating={s.ageRating} />
                            )}
                            <span>&#8226;</span>
                            <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{s.rating}</span>
                            </div>
                            <span>&#8226;</span>
                            <span>{`${totalSeasons} ${t('seasons')}`}</span>
                            <span>&#8226;</span>
                            <span>{`${totalEpisodes} ${t('episodes')}`}</span>
                        </div>
                        <p className="text-lg leading-relaxed">
                            {t(s.description || 'seriesDescription')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {s.genres.map(genre => <Badge key={genre} variant="secondary">{t(genre.toLowerCase())}</Badge>)}
                        </div>

                        {s.ageRating >= 18 && s.subCategories && (
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                            {s.subCategories.map(subCategory => (
                                <Badge key={subCategory} variant="outline" className="border-destructive/50 text-destructive">
                                {t(subCategory.toLowerCase().replace('-', ''))}
                                </Badge>
                            ))}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {s.ageRating >= 18 ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button className="bg-watch-red hover:bg-watch-red/90 text-white w-full sm:w-auto" disabled={!isPremiered}>
                                    <Play className="rtl:ml-2 ltr:mr-2" /> {playButtonText}
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('adultContentTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    {t('adultContentMessage')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-watch-red text-white hover:bg-watch-red/90 hover:text-white">{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction 
                                    onClick={() => router.push(playHref)}
                                    className="bg-white text-watch-red border border-watch-red hover:bg-gray-100"
                                    >
                                    {t('yes')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            ) : (
                            <Button className="bg-watch-red hover:bg-watch-red/90 text-white w-full sm:w-auto" asChild disabled={!isPremiered}>
                                <Link href={playHref}><Play className="rtl:ml-2 ltr:mr-2" /> {playButtonText}</Link>
                            </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              className="text-watch-red border-watch-red hover:bg-watch-red/10 hover:text-watch-red w-full sm:w-auto"
                              asChild
                              disabled={!s.trailerUrl}
                            >
                              <Link href={`/series/${s.id}/trailer`}>
                                <Clapperboard className="rtl:ml-2 ltr:mr-2" /> {t('watchTrailer')}
                              </Link>
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleFavoriteToggle}>
                              <Heart className={cn("h-6 w-6", isFavorite && "fill-red-500 text-red-500")} />
                            </Button>
                        </div>

                        {!isPremiered && timeLeft && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <Timer className="w-5 h-5" />
                                    <span>{t('premiereIn')}</span>
                                </div>
                                <div className="flex gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-black">{timeLeft.days}</div>
                                        <div className="text-[10px] uppercase opacity-60">{t('days')}</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black">{timeLeft.hours}</div>
                                        <div className="text-[10px] uppercase opacity-60">{t('hours')}</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black">{timeLeft.minutes}</div>
                                        <div className="text-[10px] uppercase opacity-60">{t('minutes')}</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black">{timeLeft.seconds}</div>
                                        <div className="text-[10px] uppercase opacity-60">{t('seconds')}</div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{t('startsAt')} {new Date(s.premiereDate!).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : 'en-US')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {continueWatchingEpisodeData && continueWatching && isPremiered && (
                    <div className="pt-8">
                        <h2 className="text-2xl font-bold mb-4">{t('continueWatching')}</h2>
                        <Link href={playHref} className="block">
                            <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                                <div className="relative w-32 aspect-video flex-shrink-0 overflow-hidden rounded-md">
                                    <Image src={continueWatchingEpisodeData.thumbnailUrl || s.posterUrl} alt={t(continueWatchingEpisodeData.title)} fill className="object-cover" data-ai-hint="episode thumbnail" />
                                    <AgeRatingBadge rating={continueWatchingEpisodeData.ageRating ?? s.ageRating} className={cn("absolute top-1 z-10", direction === 'rtl' ? 'left-1' : 'right-1')} />
                                </div>
                                <div className={cn("flex-1 text-sm", direction === 'rtl' ? 'text-right' : 'text-left')}>
                                    <p className="font-semibold">{`${t('season')} ${continueWatching.season} - ${t('episode')} ${continueWatching.episode}`}</p>
                                    <p className="text-muted-foreground">{continueWatchingEpisodeData.title ? t(continueWatchingEpisodeData.title) : (continueWatchingEpisodeData.description ? t(continueWatchingEpisodeData.description) : `${t('episode')} ${continueWatching.episode}`)}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

              <div className="pt-8">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{t('episodes')}</h2>
                    {s.seasons.length > 1 && (
                         <Select value={selectedSeason ? String(selectedSeason.seasonNumber) : ""} onValueChange={handleSeasonChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('season')} />
                            </SelectTrigger>
                            <SelectContent>
                                {s.seasons.map(season => (
                                    <SelectItem key={season.seasonNumber} value={String(season.seasonNumber)}>
                                    {t('season')} {season.seasonNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {displayedEpisodes.map((episode, idx) => (
                        <Link 
                          key={`${episode.episodeNumber}-${idx}`} 
                          href={isPremiered ? `/series/${s.id}/play?season=${selectedSeason.seasonNumber}&episode=${episode.episodeNumber}` : '#'}
                          className={cn(
                            "w-full flex items-center gap-4 p-2 rounded-md hover:bg-muted/50",
                            !isPremiered && "opacity-50 cursor-not-allowed"
                          )}>
                             <div className="relative w-1/3 aspect-video flex-shrink-0 overflow-hidden rounded-md">
                                <Image src={episode.thumbnailUrl || s.posterUrl} alt={t(episode.title)} fill className="object-cover" data-ai-hint="episode thumbnail" />
                                {episode.ageRating && <AgeRatingBadge rating={episode.ageRating} className={cn("absolute top-1 z-10", direction === 'rtl' ? 'left-1' : 'right-1')} />}
                            </div>
                            <div className={cn("flex-1 text-sm", direction === 'rtl' ? 'text-right' : 'text-left')}>
                                <p className="font-semibold">{t('episode')} {episode.episodeNumber}</p>
                                <p className="text-muted-foreground truncate max-w-xs">{episode.title ? t(episode.title) : (episode.description ? t(episode.description) : `${t('episode')} ${episode.episodeNumber}`)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                {hasMoreEpisodes && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-blue-900/40 font-bold group" asChild disabled={!isPremiered}>
                      <Link href={isPremiered ? `/series/${s.id}/episodes?season=${selectedSeason?.seasonNumber || 1}` : '#'}>
                        {t('watchMore')} <MoreIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
