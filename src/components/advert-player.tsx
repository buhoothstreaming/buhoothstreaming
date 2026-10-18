'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { adVideos } from '@/lib/data';

interface AdvertPlayerProps {
  onAdComplete: () => void;
}

export default function AdvertPlayer({ onAdComplete }: AdvertPlayerProps) {
  const [adVideoUrl, setAdVideoUrl] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Select a random ad video
    const randomAd = adVideos[Math.floor(Math.random() * adVideos.length)];
    setAdVideoUrl(randomAd);

    // Show skip button after 5 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 5000);

    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoEnd = () => {
    onAdComplete();
  };

  const handleSkipAd = () => {
    onAdComplete();
  };

  if (!adVideoUrl) {
    return null; // or a loader
  }

  const isEmbed = adVideoUrl.includes('go.screenpal.com') || adVideoUrl.includes('youtube.com/embed');

  return (
    <div className="relative w-screen h-screen bg-black">
      {isEmbed ? (
        <iframe
          src={adVideoUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setIsBuffering(false)}
        ></iframe>
      ) : (
        <video
          ref={videoRef}
          src={adVideoUrl}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          onEnded={handleVideoEnd}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
        />
      )}

      {isBuffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between">
        {!isEmbed && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        )}
        
        {showSkipButton && (
          <Button
            className="bg-black/50 text-white hover:bg-black/70 ltr:ml-auto rtl:mr-auto"
            onClick={handleSkipAd}
          >
            <SkipForward />
            {t('skipAd')}
          </Button>
        )}
      </div>
    </div>
  );
}