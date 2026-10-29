
'use client';

import AgeRatingBadge from "@/components/age-rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { movies } from "@/lib/data";
import { Heart, Play, Star, ArrowLeft, ArrowRight, Clapperboard, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
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

const FAVORITES_KEY = 'favorite_movies';

export default function MovieInfoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const movie = movies.find(m => m.id === params.id);
  
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPremiered, setIsPremiere] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  const { t, direction, language } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);

    if (movie) {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            const favorites: string[] = JSON.parse(storedFavorites);
            setIsFavorite(favorites.includes(movie.id));
        }

        // Premiere logic
        if (movie.premiereDate) {
            const premiereTime = new Date(movie.premiereDate).getTime();
            
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
  }, [movie]);

  const handleFavoriteToggle = () => {
    if (!movie) return;

    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    let favorites: string[] = storedFavorites ? JSON.parse(storedFavorites) : [];

    if (isFavorite) {
      favorites = favorites.filter(id => id !== movie.id);
    } else {
      if (!favorites.includes(movie.id)) {
        favorites.push(movie.id);
      }
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const formatPremiereDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Use ar-u-nu-latn to force English numbers in Arabic
    const locale = language === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };


  if (!movie) {
    notFound();
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="rounded-lg w-full aspect-[2/3]" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-6 w-20" />
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
      </div>
    );
  }

  const isFuture = movie.premiereDate && new Date(movie.premiereDate) > new Date();
  const yearDisplay = isFuture 
    ? t('startingIn').replace('{{date}}', formatPremiereDate(movie.premiereDate!))
    : movie.year;

  return (
    <div>
        <header className="sticky top-0 left-0 right-0 z-50 p-2 bg-background/80 backdrop-blur-sm border-b border-white/5">
            <Button variant="ghost" size="icon" onClick={() => router.push('/movies')} className="rounded-full text-white bg-black/20 hover:bg-black/50 hover:shadow-lg">
                <BackIcon className="h-6 w-6" />
            </Button>
        </header>
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Image src={movie.posterUrl} alt={t(movie.title)} width={300} height={450} className="rounded-lg w-full object-cover" referrerPolicy="no-referrer" data-ai-hint="movie poster"/>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold">{t(movie.title)}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{yearDisplay}</span>
                <span>&#8226;</span>
                <AgeRatingBadge rating={movie.ageRating} />
                <span>&#8226;</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{movie.rating}</span>
                </div>
              </div>
              
              {!isPremiered && timeLeft && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
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
                      <p className="text-xs text-muted-foreground mt-2">{t('startsAt')} {new Date(movie.premiereDate!).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : 'en-US')}</p>
                  </div>
              )}

              <p className="text-lg leading-relaxed">
                {t(movie.description || 'movieDescription')}
              </p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => <Badge key={genre} variant="secondary">{t(genre.toLowerCase())}</Badge>)}
              </div>

              {movie.ageRating >= 18 && movie.subCategories && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {movie.subCategories.map(subCategory => (
                    <Badge key={subCategory} variant="outline" className="border-destructive/50 text-destructive">
                      {t(subCategory.toLowerCase().replace('-', ''))}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                {movie.ageRating >= 18 ? (
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-watch-red hover:bg-watch-red/90 text-white w-full sm:w-auto" disabled={!isPremiered}>
                        <Play className="rtl:ml-2 ltr:mr-2" /> {t('watchNow')}
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
                          onClick={() => router.push(`/movies/${movie.id}/play`)}
                          className="bg-white text-watch-red border border-watch-red hover:bg-gray-100"
                        >
                          {t('yes')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button className="bg-watch-red hover:bg-watch-red/90 text-white w-full sm:w-auto" asChild disabled={!isPremiered}>
                    <Link href={`/movies/${movie.id}/play`}><Play className="rtl:ml-2 ltr:mr-2" /> {t('watchNow')}</Link>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="text-watch-red border-watch-red hover:bg-watch-red/10 hover:text-watch-red w-full sm:w-auto"
                  asChild
                  disabled={!movie.trailerUrl}
                >
                  <Link href={`/movies/${movie.id}/trailer`}>
                    <Clapperboard className="rtl:ml-2 ltr:mr-2" /> {t('watchTrailer')}
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" onClick={handleFavoriteToggle}>
                    <Heart className={cn("h-6 w-6", isFavorite && "fill-red-500 text-red-500")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
