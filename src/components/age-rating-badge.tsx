'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/language-context';

type AgeRatingBadgeProps = {
  rating: number;
  className?: string;
};

const getRatingStyle = (rating: number) => {
    if (rating >= 18) return 'bg-red-500/70';
    if (rating >= 16) return 'bg-orange-500/70';
    if (rating >= 14) return 'bg-purple-500/70';
    if (rating >= 12) return 'bg-yellow-500/70';
    if (rating >= 7) return 'bg-blue-500/70';
    return 'bg-green-500/70';
};

export default function AgeRatingBadge({ rating, className }: AgeRatingBadgeProps) {
  const { t } = useLanguage();

  const getRatingMessage = (rating: number) => {
    if (rating >= 18) return t('age18');
    if (rating >= 16) return t('age16');
    if (rating >= 14) return t('age14');
    if (rating >= 12) return t('age12');
    if (rating >= 7) return t('age7');
    return t('ageG');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'px-1.5 py-0.5 text-[10px] font-bold text-white rounded',
            getRatingStyle(rating),
            className
          )}>
            {`${rating}+`}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getRatingMessage(rating)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
