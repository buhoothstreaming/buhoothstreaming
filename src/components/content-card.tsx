'use client';
import Image from 'next/image';
import { Heart, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AgeRatingBadge from './age-rating-badge';
import { useLanguage } from '@/contexts/language-context';

import { useState, useEffect } from 'react';

type ContentCardProps = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: 'channel' | 'movie' | 'series';
  ageRating?: number;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
};

export default function ContentCard({ id, title, subtitle, imageUrl, type, ageRating, isFavorite, onFavoriteToggle }: ContentCardProps) {
  const { direction, t } = useLanguage();
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(imageUrl);
    setHasError(false);
  }, [imageUrl]);

  const href = type === 'series' ? `/series/${id}` : `/${type}s/${id}`;
  const aspectRatio = type === 'movie' ? 'aspect-[9/16]' : 'aspect-video';

  return (
    <Link href={href} className="block group">
      <div className="space-y-2">
        <div className={cn('relative overflow-hidden rounded-lg shadow-lg bg-card border border-white/5', aspectRatio)}>
          {hasError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 text-center">
              <Clapperboard className="w-8 h-8 text-primary/70 mb-2" />
              <span className="text-xs font-semibold text-white/90 line-clamp-2 px-1">{title}</span>
            </div>
          ) : (
            <Image
              src={imgSrc || '/images/placeholder-poster.png'}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={() => {
                if (imgSrc !== '/images/placeholder-poster.png') {
                  setImgSrc('/images/placeholder-poster.png');
                } else {
                  setHasError(true);
                }
              }}
              data-ai-hint="movie poster"
            />
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle(id);
            }}
            aria-label="Toggle Favorite"
            className={cn(
              'absolute top-2 z-20 p-1.5 bg-black/60 rounded-full transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100',
              direction === 'rtl' ? 'right-2' : 'left-2',
              isFavorite && 'opacity-100'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5 text-white', isFavorite && 'fill-red-500 text-red-500')} />
          </button>

          {ageRating !== undefined && type !== 'channel' && <AgeRatingBadge rating={ageRating} className={cn("absolute top-2 z-10", direction === 'rtl' ? 'left-2' : 'right-2')} />}
        </div>
        <div className={cn("space-y-1", direction === 'rtl' ? 'text-right' : 'text-left')}>
            <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
            <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
