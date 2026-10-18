'use client';
import { movies } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, AudioLines, Captions } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import CustomVideoPlayer from '@/components/custom-video-player';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import AgeRatingBadge from '@/components/age-rating-badge';
import PlayerSettingsSheet from '@/components/player-settings-sheet';
import AdvertPlayer from '@/components/advert-player';
import ContentWarning from '@/components/content-warning';
import AgeRatingOverlay from '@/components/age-rating-overlay';

export default function MoviePlayerPage() {
  const params = useParams<{ id: string }>();
  const movie = movies.find(m => m.id === params.id);
  const router = useRouter();
  const { t, direction } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<'audio' | 'subtitles' | null>(null);

  const [showAd, setShowAd] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleAdComplete = () => {
    setShowAd(false);
    if (movie && movie.ageRating >= 18 && movie.subCategories && movie.subCategories.length > 0) {
        setShowWarning(true);
    }
  };

  const handleWarningComplete = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    if (showAd || showWarning) return;

    if (sheetOpen) {
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
  }, [showAd, showWarning, sheetOpen]);

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
    if (!sheetOpen) {
      setOverlayVisible(false);
    }
  };

  const handleAudioClick = () => {
    setSheetType('audio');
    setSheetOpen(true);
  };

  const handleSubtitlesClick = () => {
    setSheetType('subtitles');
    setSheetOpen(true);
  };

  if (!movie) {
    notFound();
  }

  const isAudioDisabled = !movie?.audioTracks?.length;
  const areSubtitlesDisabled = !movie?.subtitleTracks?.length;

  let streamUrl = movie.streamUrl || "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1";
  if (streamUrl.includes('youtube.com/embed') && origin) {
    const url = new URL(streamUrl);
    url.searchParams.set('origin', origin);
    streamUrl = url.toString();
  }
  
  // Robust check for video files that might include query parameters
  const isVideo = streamUrl.toLowerCase().includes('.mp4') || 
                  streamUrl.toLowerCase().includes('.mov') || 
                  streamUrl.toLowerCase().includes('.m3u8');

  if (showAd) {
    return <AdvertPlayer onAdComplete={handleAdComplete} />;
  }
  
  if (showWarning) {
      return <ContentWarning onWarningComplete={handleWarningComplete} subCategories={movie?.subCategories || []} />;
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
            <CustomVideoPlayer src={streamUrl} />
          ) : (
            <iframe
              src={streamUrl}
              title={t(movie.title)}
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
              <Button variant="ghost" size="icon" onClick={() => router.push(`/movies/${params.id}`)} className="rounded-full text-white hover:bg-black/50 hover:shadow-lg">
                  <BackIcon className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-black/50 hover:shadow-lg" onClick={handleAudioClick} disabled={isAudioDisabled}>
                  <AudioLines className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-black/50 hover:shadow-lg" onClick={handleSubtitlesClick} disabled={areSubtitlesDisabled}>
                  <Captions className="h-6 w-6" />
              </Button>
          </div>

          <div className="flex items-center gap-2 text-white">
              <h1 className="text-lg font-semibold">{t(movie.title)}</h1>
              <AgeRatingBadge rating={movie.ageRating} />
          </div>
        </div>
        {!showAd && !showWarning && <AgeRatingOverlay rating={movie.ageRating} />}
      </div>
      <PlayerSettingsSheet 
        type={sheetType}
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
