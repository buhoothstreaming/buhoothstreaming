'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Check,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import Hls from 'hls.js';

interface CustomVideoPlayerProps {
  src: string;
  onEnded?: () => void;
  loop?: boolean;
  hideControls?: boolean;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
  const date = new Date(0);
  date.setSeconds(timeInSeconds);
  const timeString = date.toISOString().substring(11, 19);
  if (timeInSeconds < 3600) {
    return timeString.substring(3);
  }
  return timeString;
};

export default function CustomVideoPlayer({ src, onEnded, loop = false, hideControls = false }: CustomVideoPlayerProps) {
  const { direction, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [logo, setLogo] = useState("https://k.top4top.io/p_36885vv362.png");
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = new Date();
    
    // Original promo period
    const startDate1 = new Date('2026-06-30T00:00:00');
    const endDate1 = new Date('2026-07-16T00:00:00');
    
    // Anniversary period
    const startDate2 = new Date('2026-07-23T00:00:00');
    const endDate2 = new Date('2026-07-24T05:00:00');

    // Mourning Day
    const startDate3 = new Date('2026-09-22T00:00:00');
    const endDate3 = new Date('2026-09-23T06:30:00');

    // Iraqi Independence Day 2026 - Extended to covers full day + early morning of next day
    const startDate4 = new Date('2026-10-03T00:00:00');
    const endDate4 = new Date('2026-10-04T02:30:00');

    if (now >= startDate1 && now < endDate1) {
      setLogo("https://g.top4top.io/p_38330txup1.png");
    } else if (now >= startDate2 && now < endDate2) {
      setLogo("https://a.top4top.io/p_3856ltiqu1.png");
    } else if (now >= startDate3 && now < endDate3) {
      setLogo("https://c.top4top.io/p_3917mkdmh1.png");
    } else if (now >= startDate4 && now < endDate4) {
      setLogo("https://d.top4top.io/p_3928xkymg1.png");
    } else {
      setLogo("https://k.top4top.io/p_36885vv362.png");
    }
  }, []);

  const isLive = src.toLowerCase().endsWith('.m3u8');

  const handleMouseEnter = () => {
    if (hideControls) return;
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setIsControlsVisible(true);
  };
  
  const handleMouseLeave = () => {
    if (hideControls) return;
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2000);
    }
  };
  
  const togglePlayPause = () => {
    if (videoRef.current) {
        if (videoRef.current.paused) {
            videoRef.current.play().catch(console.error);
        } else {
            videoRef.current.pause();
        }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // Reset player state when source changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    if (src.toLowerCase().endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          autoStartLoad: true,
          startPosition: 0,
          debug: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      // Only update src if it's different to prevent reset on re-render
      if (video.src !== src) {
        video.src = src;
      }
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (!isNaN(video.duration)) {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
        setDuration(video.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    }

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);
  
  useEffect(() => {
    if (hideControls) {
      setIsControlsVisible(false);
      return;
    }

    if (!isPlaying) {
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
        controlsTimeoutRef.current = setTimeout(() => {
            if (playerRef.current && !playerRef.current.matches(':hover')) {
                setIsControlsVisible(false);
            }
        }, 3000);
    }
     return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if(video) {
        video.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if(video && !isMuted) {
      video.volume = volume;
    }
  }, [volume, isMuted])

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (video && !isNaN(video.duration)) {
      const newTime = (value[0] / 100) * video.duration;
      video.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if(newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if(isMuted && volume === 0){
      setVolume(1);
    }
    setIsMuted(prev => !prev);
  };
  
  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(videoRef.current) videoRef.current.currentTime -= 10;
  }

  const handleFastForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(videoRef.current) videoRef.current.currentTime += 10;
  }
  
  const handlePlayerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hideControls) {
      togglePlayPause();
    }
  };

  const handleControlsInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const RewindIcon = direction === 'rtl' ? FastForward : Rewind;
  const FastForwardIcon = direction === 'rtl' ? Rewind : FastForward;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const playbackRates = [0.5, 1, 1.5, 2];


  return (
    <div
      ref={playerRef}
      className={cn("relative w-full h-full bg-black overflow-hidden", !hideControls && "cursor-pointer")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlayerClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        autoPlay={true}
        loop={loop}
      />

      {!hideControls && (
        <div
            className={cn(
            'absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4 transition-all duration-300',
            isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            !isControlsVisible && "pointer-events-none"
            )}
            onClick={handleControlsInteraction}
        >
            <div className="flex flex-col gap-2">
                {!isLive && (
                <div className="flex items-center gap-2 text-white text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <Slider
                        value={[isNaN(progress) ? 0 : progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="w-full"
                    />
                    <span>{formatTime(duration)}</span>
                </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 md:gap-2">
                        {!isLive && (
                        <>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handleRewind}>
                                <RewindIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={togglePlayPause}>
                                {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8" /> : <Play className="w-6 h-6 md:w-8 md:h-8" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handleFastForward}>
                                <FastForwardIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>
                        </>
                        )}
                        {isLive && (
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Live</span>
                        </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2 w-24 md:w-32">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleMute}>
                                <VolumeIcon />
                            </Button>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={1}
                                step={0.05}
                                onValueChange={handleVolumeChange}
                                className="w-full"
                            />
                        </div>
                        
                        <Popover onOpenChange={(open) => { if(open) handleMouseEnter(); else handleMouseLeave() }}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                    <Settings />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 bg-black/80 border-gray-700 text-white p-2" side="top" align="end">
                            <div className="space-y-2">
                                    <p className="text-sm font-medium px-2">{t('speed')}</p>
                                    {playbackRates.map(rate => (
                                        <Button key={rate} variant="ghost" className={cn("w-full justify-start gap-2 text-white hover:bg-white/10", playbackRate === rate && "bg-white/20")} onClick={() => setPlaybackRate(rate)}>
                                            {playbackRate === rate && <Check className="w-4 h-4"/>}
                                            <span className={cn(playbackRate !== rate && "ml-6")}>{rate === 1 ? t('normal') : `${rate}x`}</span>
                                        </Button>
                                    ))}
                                    <p className="text-sm font-medium px-2 text-gray-400 cursor-not-allowed">{t('quality')}</p>
                                    <p className="text-sm font-medium px-2 text-gray-400 cursor-not-allowed">{t('captions')}</p>
                            </div>
                            </PopoverContent>
                        </Popover>
                        
                        <Image src={logo} alt="Logo" width={80} height={32} className="object-contain hidden sm:block" data-ai-hint="app logo"/>
                    </div>
                </div>
            </div>
        </div>
      )}

       {!isPlaying && !hideControls && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
            <div className="bg-black/50 rounded-full p-4">
                <Play className="h-12 w-12 md:h-16 md:h-16 text-white" />
            </div>
         </div>
       )}
    </div>
  );
}