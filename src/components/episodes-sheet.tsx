
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/language-context';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Season, Episode, Series } from '@/lib/types';
import { cn } from '@/lib/utils';
import AgeRatingBadge from '@/components/age-rating-badge';

interface EpisodesSheetProps {
  series: Series;
  currentSeasonNumber: number;
  currentEpisodeNumber: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEpisodeSelect: (season: number, episode: number) => void;
}

export default function EpisodesSheet({ 
  series,
  currentSeasonNumber,
  currentEpisodeNumber,
  isOpen, 
  onOpenChange,
  onEpisodeSelect,
}: EpisodesSheetProps) {
  const { t, direction } = useLanguage();
  
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
    series.seasons.find(s => s.seasonNumber === currentSeasonNumber) || series.seasons[0]
  );
  
  useEffect(() => {
    if(isOpen) {
      const currentSeason = series.seasons.find(s => s.seasonNumber === currentSeasonNumber);
      setSelectedSeason(currentSeason);
    }
  }, [isOpen, currentSeasonNumber, series.seasons]);

  const handleSeasonChange = (seasonNumber: string) => {
    const season = series.seasons.find(s => s.seasonNumber === parseInt(seasonNumber));
    if (season) {
      setSelectedSeason(season);
    }
  };

  const handleEpisodeClick = (episode: Episode) => {
    if (selectedSeason) {
      onEpisodeSelect(selectedSeason.seasonNumber, episode.episodeNumber);
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={direction === 'rtl' ? 'left' : 'right'} className="bg-background/95 backdrop-blur-sm w-full sm:max-w-xs p-0 flex flex-col">
        <div className="p-4 flex-shrink-0">
            <SheetHeader className={cn("text-left pb-4", direction === 'rtl' && "text-right")}>
                <SheetTitle>{t(series.title)}</SheetTitle>
            </SheetHeader>
            
            <Select value={selectedSeason ? String(selectedSeason.seasonNumber) : ""} onValueChange={handleSeasonChange}>
                <SelectTrigger>
                <SelectValue placeholder={t('season')} />
                </SelectTrigger>
                <SelectContent>
                {series.seasons.map(season => (
                    <SelectItem key={season.seasonNumber} value={String(season.seasonNumber)}>
                    {t('season')} {season.seasonNumber}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        
        <Separator className="my-0 flex-shrink-0" />
        
        <ScrollArea className="flex-grow">
          <div className="space-y-2 p-4">
            {selectedSeason?.episodes.map((episode, idx) => (
              <button key={`${episode.episodeNumber}-${idx}`} onClick={() => handleEpisodeClick(episode)} className={cn(
                "w-full flex items-start gap-4 p-2 rounded-md",
                direction === 'rtl' && "flex-row-reverse",
                currentSeasonNumber === selectedSeason.seasonNumber && currentEpisodeNumber === episode.episodeNumber ? "bg-muted" : "hover:bg-muted/50"
              )}>
                <div className="relative w-16 aspect-video flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={episode.thumbnailUrl || series.posterUrl} alt={t(episode.title)} fill className="object-cover" data-ai-hint="episode thumbnail" />
                    <AgeRatingBadge rating={episode.ageRating ?? series.ageRating} className={cn("absolute top-1 z-10 px-1 py-0 text-[8px]", direction === 'rtl' ? 'left-1' : 'right-1')} />
                </div>
                <div className={cn("flex-1 text-sm", direction === 'rtl' ? 'text-right' : 'text-left')}>
                    <p className="font-semibold">{t('episode')} {episode.episodeNumber}</p>
                    <p className="text-muted-foreground">{episode.description ? t(episode.description) : (episode.title && t(episode.title) !== episode.title ? t(episode.title) : `${t('episode')} ${episode.episodeNumber}`)}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

      </SheetContent>
    </Sheet>
  );
}
