'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';
import type { Series, Episode } from '@/lib/types';
import { cn } from '@/lib/utils';
import AgeRatingBadge from './age-rating-badge';

interface EndCardProps {
  series: Series;
  nextEpisode: Episode;
  onPlayNext: () => void;
  onExit: () => void;
}

const COUNTDOWN_SECONDS = 5;

export default function EndCard({ series, nextEpisode, onPlayNext, onExit }: EndCardProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          onPlayNext();
          return 100;
        }
        return prev + (100 / (COUNTDOWN_SECONDS * 10)); // update every 100ms
      });
    }, 100);

    return () => {
      if(intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    };
  }, [onPlayNext]);

  const handlePlay = () => {
    if(intervalRef.current) clearInterval(intervalRef.current);
    onPlayNext();
  };

  const handleExit = () => {
    if(intervalRef.current) clearInterval(intervalRef.current);
    onExit();
  };

  const episodeTitle = `${t('episode')} ${nextEpisode.episodeNumber}: ${t(nextEpisode.title)}`;

  return (
    <div className="relative w-screen h-screen bg-black">
      <Image
        src={series.posterUrl}
        alt={t(series.title)}
        fill
        className="object-cover opacity-30 blur-sm"
        referrerPolicy="no-referrer"
        data-ai-hint="series poster"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">{t('nextEpisode')}</h2>
          <div className="relative aspect-video w-full max-w-lg mx-auto rounded-lg overflow-hidden shadow-2xl mb-4">
              <Image src={nextEpisode.thumbnailUrl || series.posterUrl} alt={t(nextEpisode.title)} fill className="object-cover" referrerPolicy="no-referrer" data-ai-hint="episode thumbnail" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                       {(nextEpisode.ageRating || series.ageRating) && <AgeRatingBadge rating={nextEpisode.ageRating ?? series.ageRating} />}
                       <h3 className="text-2xl font-bold truncate">{episodeTitle}</h3>
                  </div>
              </div>
          </div>
          
          <div className="w-full max-w-lg mx-auto space-y-4">
            <Progress value={progress} className="h-1 [&>div]:bg-white" />
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" onClick={handleExit} className="px-8">{t('exit')}</Button>
              <Button onClick={handlePlay} className="px-8 bg-white text-black hover:bg-white/90">{t('watch')}</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
