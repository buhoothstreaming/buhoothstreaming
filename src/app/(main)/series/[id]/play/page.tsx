'use client';
import { series } from '@/lib/data';
import { notFound, useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, AudioLines, Captions, ListVideo } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import AgeRatingBadge from '@/components/age-rating-badge';
import PlayerSettingsSheet from '@/components/player-settings-sheet';
import EpisodesSheet from '@/components/episodes-sheet';
import AdvertPlayer from '@/components/advert-player';
import ContentWarning from '@/components/content-warning';
import type { Episode, Season } from '@/lib/types';
import CustomVideoPlayer from '@/components/custom-video-player';
import AgeRatingOverlay from '@/components/age-rating-overlay';
import EndCard from '@/components/end-card';
import { useContinueWatching } from '@/hooks/use-continue-watching';

export default function SeriesPlayerPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const s = series.find(s => s.id === params.id);
  const router = useRouter();
  const { t, direction } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const { setContinueWatchingEpisode } = useContinueWatching();

  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [settingsSheetType, setSettingsSheetType] = useState<'audio' | 'subtitles' | null>(null);
  
  const [episodesSheetOpen, setEpisodesSheetOpen] = useState(false);

  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);

  const [showAd, setShowAd] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [episodeEnded, setEpisodeEnded] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const season = searchParams.get('season');
    const episode = searchParams.get('episode');
    if (season) setCurrentSeason(parseInt(season, 10));
    if (episode) setCurrentEpisode(parseInt(episode, 10));
  }, [searchParams]);

  useEffect(() => {
    if (params.id && currentSeason && currentEpisode) {
        setContinueWatchingEpisode(params.id as string, currentSeason, currentEpisode);
    }
  }, [params.id, currentSeason, currentEpisode, setContinueWatchingEpisode]);

  useEffect(() => {
    if (s) {
      const seasonData = s.seasons.find(season => season.seasonNumber === currentSeason);
      const episodeData = seasonData?.episodes.find(ep => ep.episodeNumber === currentEpisode);
      if (episodeData) {
        setCurrentEpisodeData(episodeData);
      } else {
        // Fallback to first episode of first season if current not found
        const firstSeason = s.seasons[0];
        const firstEpisode = firstSeason?.episodes[0];
        if (firstSeason && firstEpisode) {
          setCurrentSeason(firstSeason.seasonNumber);
          setCurrentEpisode(firstEpisode.episodeNumber);
          setCurrentEpisodeData(firstEpisode);
        } else {
            setCurrentEpisodeData(null);
        }
      }
    }
  }, [s, currentSeason, currentEpisode]);

  const { nextEpisode, nextSeason } = useMemo(() => {
    if (!s) return { nextEpisode: null, nextSeason: null };

    const currentSeasonIndex = s.seasons.findIndex(season => season.seasonNumber === currentSeason);
    if (currentSeasonIndex === -1) return { nextEpisode: null, nextSeason: null };

    const currentSeasonData = s.seasons[currentSeasonIndex];
    const currentEpisodeIndex = currentSeasonData.episodes.findIndex(ep => ep.episodeNumber === currentEpisode);
    if (currentEpisodeIndex === -1) return { nextEpisode: null, nextSeason: null };

    // Check for next episode in the same season
    if (currentEpisodeIndex < currentSeasonData.episodes.length - 1) {
        return { nextEpisode: currentSeasonData.episodes[currentEpisodeIndex + 1], nextSeason: currentSeasonData };
    }

    // Check for next season
    if (currentSeasonIndex < s.seasons.length - 1) {
        const nextSeasonData = s.seasons[currentSeasonIndex + 1];
        if (nextSeasonData && nextSeasonData.episodes.length > 0) {
            return { nextEpisode: nextSeasonData.episodes[0], nextSeason: nextSeasonData };
        }
    }

    return { nextEpisode: null, nextSeason: null };
  }, [s, currentSeason, currentEpisode]);

  const handleEpisodeEnd = () => {
    if (nextEpisode) {
        setEpisodeEnded(true);
    }
  };

  const handlePlayNext = () => {
    if (!nextEpisode || !nextSeason) return;

    // Reset player state
    setEpisodeEnded(false);
    setShowAd(true);
    setShowWarning(false);
    
    // Navigate to next episode
    router.push(`/series/${params.id}/play?season=${nextSeason.seasonNumber}&episode=${nextEpisode.episodeNumber}`);
  };

  const handleExit = () => {
      router.push(`/series/${params.id}`);
  };

  const handleAdComplete = () => {
    setShowAd(false);
    if (currentEpisodeData && (currentEpisodeData.ageRating ?? s?.ageRating ?? 0) >= 18 && s?.subCategories && s.subCategories.length > 0) {
        setShowWarning(true);
    }
  };

  const handleWarningComplete = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    if (showAd || showWarning) return;
    
    const isAnySheetOpen = settingsSheetOpen || episodesSheetOpen;

    if (isAnySheetOpen) {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
      setOverlayVisible(true);
      return;
    }

    overlayTimerRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, 5000);

    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }
    };
  }, [showAd, showWarning, settingsSheetOpen, episodesSheetOpen]);

  const handleMouseEnter = () => {
    if (showAd || showWarning) return;
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    setOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    if (showAd || showWarning) return;
    const isAnySheetOpen = settingsSheetOpen || episodesSheetOpen;
    if (!isAnySheetOpen) {
      setOverlayVisible(false);
    }
  };

  const handleAudioClick = () => {
    setSettingsSheetType('audio');
    setSettingsSheetOpen(true);
  };

  const handleSubtitlesClick = () => {
    setSettingsSheetType('subtitles');
    setSettingsSheetOpen(true);
  };

  const handlePlaylistClick = () => {
    setEpisodesSheetOpen(true);
  };
  
  const handleEpisodeSelect = (season: number, episode: number) => {
    router.push(`/series/${params.id}/play?season=${season}&episode=${episode}`, { scroll: false });
  };

  if (!s) {
    notFound();
  }
  
  const isAudioDisabled = !s?.audioTracks?.length;
  const areSubtitlesDisabled = !s?.subtitleTracks?.length;

  const overlayTitle = useMemo(() => {
    if (!s) return '';
    if (currentEpisodeData) {
        const seriesTitle = t(s.title);
        const seasonEpisodeInfo = `${t('seasonLetter')}${currentSeason} ${t('episodeLetter')}${currentEpisode}`;
        const episodeTitle = currentEpisodeData.title ? t(currentEpisodeData.title) : '';
        
        if (episodeTitle && episodeTitle !== currentEpisodeData.title) {
            return `${seriesTitle} ${seasonEpisodeInfo} - ${episodeTitle}`;
        } else {
            return `${seriesTitle} - ${seasonEpisodeInfo}`;
        }
    }
    return t(s.title);
  }, [s, currentEpisodeData, t, currentSeason, currentEpisode]);

  let streamUrl = currentEpisodeData?.streamUrl || "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1";
  if (streamUrl.includes('youtube.com/embed') && origin) {
    const url = new URL(streamUrl);
    url.searchParams.set('origin', origin);
    streamUrl = url.toString();
  }
  
  // Robust check for video files that might include query parameters
  const isVideo = streamUrl.toLowerCase().includes('.mp4') || 
                  streamUrl.toLowerCase().includes('.mov') || 
                  streamUrl.toLowerCase().includes('.m3u8');

  if (episodeEnded && nextEpisode && s) {
    return (
        <EndCard 
            series={s}
            nextEpisode={nextEpisode}
            onPlayNext={handlePlayNext}
            onExit={handleExit}
        />
    );
  }

  if (showAd) {
    return <AdvertPlayer onAdComplete={handleAdComplete} />;
  }

  if (showWarning) {
      return <ContentWarning onWarningComplete={handleWarningComplete} subCategories={s?.subCategories || []} />;
  }

  return (
    <>
      <div 
        className="relative w-screen h-screen bg-black"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full h-full">
          {isVideo ? (
            <CustomVideoPlayer src={streamUrl} onEnded={handleEpisodeEnd} />
          ) : (
            <iframe
              src={streamUrl}
              key={`${currentSeason}-${currentEpisode}`}
              title={t(s.title)}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          )}
        </div>
        
        <div className={cn(
          "absolute inset-x-0 top-0 z-20 p-4 transition-opacity duration-300 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between",
          isOverlayVisible ? "opacity-100" : "opacity-0",
          !isOverlayVisible && "pointer-events-none"
        )}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/series/${params.id}`)} className="rounded-full text-white hover:bg-black/50 hover:shadow-lg">
                <BackIcon className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-black/50 hover:shadow-lg" onClick={handleAudioClick} disabled={isAudioDisabled}>
                <AudioLines className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-black/50 hover:shadow-lg" onClick={handleSubtitlesClick} disabled={areSubtitlesDisabled}>
                <Captions className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-black/50 hover:shadow-lg" onClick={handlePlaylistClick}>
                <ListVideo className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-white">
              <h1 className="text-lg font-semibold truncate xl:whitespace-normal xl:overflow-visible">{overlayTitle}</h1>
              <AgeRatingBadge rating={currentEpisodeData?.ageRating ?? s.ageRating} />
          </div>
        </div>
        {!showAd && !showWarning && <AgeRatingOverlay rating={currentEpisodeData?.ageRating ?? s.ageRating} />}
      </div>
      <EpisodesSheet
        series={s}
        currentSeasonNumber={currentSeason}
        currentEpisodeNumber={currentEpisode}
        isOpen={episodesSheetOpen}
        onOpenChange={setEpisodesSheetOpen}
        onEpisodeSelect={handleEpisodeSelect}
      />
      <PlayerSettingsSheet
        type={settingsSheetType}
        isOpen={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
      />
    </>
  );
}
