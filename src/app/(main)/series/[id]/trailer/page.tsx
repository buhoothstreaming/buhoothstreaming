'use client';

import { series } from '@/lib/data';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import CustomVideoPlayer from '@/components/custom-video-player';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SeriesTrailerPage() {
  const params = useParams<{ id: string }>();
  const s = series.find(s => s.id === params.id);
  const router = useRouter();
  const { t, direction } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    overlayTimerRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, 5000);

    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    setOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    setOverlayVisible(false);
  };

  if (!s) {
    notFound();
  }

  const trailerUrl = s.trailerUrl || "https://g.top4top.io/m_3688yqr3a1.mp4"; // Fallback to an ad video if no trailer

  return (
    <div 
      className="relative w-screen h-screen bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full">
        <CustomVideoPlayer src={trailerUrl} />
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
        </div>

        <div className="flex items-center gap-2 text-white">
            <h1 className="text-lg font-semibold">{t(s.title)} - {t('watchTrailer')}</h1>
        </div>
      </div>
    </div>
  );
}
