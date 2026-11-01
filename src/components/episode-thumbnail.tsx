'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpisodeThumbnailProps {
  src?: string;
  fallbackSrc?: string;
  streamUrl?: string;
  alt: string;
  className?: string;
  episodeNumber?: number;
}

function extractYouTubeThumbnail(streamUrl?: string): string | null {
  if (!streamUrl) return null;
  const ytMatch = streamUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export default function EpisodeThumbnail({
  src,
  fallbackSrc = '/images/placeholder-poster.png',
  streamUrl,
  alt,
  className,
  episodeNumber,
}: EpisodeThumbnailProps) {
  const initialSrc =
    (src && src.trim() !== '' ? src : null) ||
    extractYouTubeThumbnail(streamUrl) ||
    fallbackSrc ||
    '/images/placeholder-poster.png';

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const computed =
      (src && src.trim() !== '' ? src : null) ||
      extractYouTubeThumbnail(streamUrl) ||
      fallbackSrc ||
      '/images/placeholder-poster.png';
    setImgSrc(computed);
    setHasError(false);
  }, [src, streamUrl, fallbackSrc]);

  if (hasError) {
    return (
      <div
        className={cn(
          'w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 text-center text-white/80 select-none',
          className
        )}
      >
        <Clapperboard className="w-8 h-8 text-primary/70 mb-1" />
        {episodeNumber !== undefined && (
          <span className="text-xs font-semibold text-white/90">
            {alt || `Episode ${episodeNumber}`}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      referrerPolicy="no-referrer"
      onError={() => {
        const ytThumb = extractYouTubeThumbnail(streamUrl);
        if (ytThumb && imgSrc !== ytThumb) {
          setImgSrc(ytThumb);
        } else if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else if (imgSrc !== '/images/placeholder-poster.png') {
          setImgSrc('/images/placeholder-poster.png');
        } else {
          setHasError(true);
        }
      }}
      data-ai-hint="episode thumbnail"
    />
  );
}
