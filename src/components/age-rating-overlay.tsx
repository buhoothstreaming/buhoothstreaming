'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import AgeRatingBadge from './age-rating-badge';

interface AgeRatingOverlayProps {
  rating: number;
}

export default function AgeRatingOverlay({ rating }: AgeRatingOverlayProps) {
  const { t, direction } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // 5s delay + 5s duration

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);


  const getRatingMessage = (rating: number) => {
    if (rating >= 18) return t('age18');
    if (rating >= 16) return t('age16');
    if (rating >= 14) return t('age14');
    if (rating >= 12) return t('age12');
    if (rating >= 7) return t('age7');
    return t('ageG');
  };

  return (
    <div
      className={cn(
        'absolute top-4 z-30 p-3 rounded-lg bg-black/60 text-white text-sm transition-opacity duration-500',
        'flex items-center gap-3',
        direction === 'rtl' ? 'right-4' : 'left-4',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <AgeRatingBadge rating={rating} className="text-sm px-2 py-1" />
      <div className={cn('text-xs', direction === 'rtl' ? 'text-right' : 'text-left')}>
        <p className="font-semibold">{`${t('ratingLabel')}: ${rating}+`}</p>
        <p className="text-white/70">{getRatingMessage(rating)}</p>
      </div>
    </div>
  );
}
