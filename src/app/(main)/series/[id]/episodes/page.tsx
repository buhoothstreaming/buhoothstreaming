
'use client';

import { series } from "@/lib/data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Season } from '@/lib/types';
import AgeRatingBadge from "@/components/age-rating-badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SeriesEpisodesPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const s = series.find(s => s.id === params.id);
    
    const { t, direction } = useLanguage();
    const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

    const initialSeasonNum = parseInt(searchParams.get('season') || '1');
    const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
      s?.seasons.find(season => season.seasonNumber === initialSeasonNum) || s?.seasons[0]
    );

    useEffect(() => {
        if (s) {
          const seasonNum = parseInt(searchParams.get('season') || '1');
          const season = s.seasons.find(season => season.seasonNumber === seasonNum) || s.seasons[0];
          setSelectedSeason(season);
        }
    }, [s, searchParams]);

    const handleSeasonChange = (seasonNumber: string) => {
      const season = s?.seasons.find(s => s.seasonNumber === parseInt(seasonNumber));
      if (season) {
        router.push(`/series/${params.id}/episodes?season=${seasonNumber}`);
      }
    };

  if (!s) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 left-0 right-0 z-50 p-2 bg-background/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/series/${params.id}`)} className="rounded-full text-white hover:bg-black/50">
                    <BackIcon className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-bold">{t('listOfEpisodes')}</h1>
            </div>
            {s.seasons.length > 1 && (
                <Select value={selectedSeason ? String(selectedSeason.seasonNumber) : ""} onValueChange={handleSeasonChange}>
                <SelectTrigger className="w-[140px] h-9">
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
        </header>

        <ScrollArea className="flex-1">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-black mb-2">{t(s.title)}</h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">
                        {t('season')} {selectedSeason?.seasonNumber} &bull; {selectedSeason?.episodes.length} {t('episodes')}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedSeason?.episodes.map((episode, idx) => (
                        <Link 
                            key={`${episode.episodeNumber}-${idx}`} 
                            href={`/series/${s.id}/play?season=${selectedSeason.seasonNumber}&episode=${episode.episodeNumber}`}
                            className="group flex flex-col gap-3 p-3 rounded-xl bg-card/40 border border-white/5 hover:bg-white/5 transition-all shadow-sm"
                        >
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                <Image src={episode.thumbnailUrl || s.posterUrl} alt={t(episode.title || 'episode')} fill className="object-cover transition-transform duration-500 group-hover:scale-105" data-ai-hint="episode thumbnail" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                {episode.ageRating && <AgeRatingBadge rating={episode.ageRating} className={cn("absolute top-2 z-10", direction === 'rtl' ? 'left-2' : 'right-2')} />}
                                <div className="absolute bottom-2 ltr:right-2 rtl:left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white">
                                    {t('episode')} {episode.episodeNumber}
                                </div>
                            </div>
                            <div className={cn("flex-1 space-y-1", direction === 'rtl' ? 'text-right' : 'text-left')}>
                                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                    {t('episode')} {episode.episodeNumber}
                                </h3>
                                <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed h-8">
                                    {episode.title && t(episode.title) !== episode.title ? t(episode.title) : (episode.description ? t(episode.description) : "")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </ScrollArea>
    </div>
  );
}
