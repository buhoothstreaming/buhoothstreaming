'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/images/placeholder-poster.png';

export default function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  referrerPolicy = 'no-referrer',
  className,
  onError,
  alt,
  ...rest
}: SafeImageProps) {
  const initial = src && src.trim() !== '' ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initial);

  useEffect(() => {
    setImgSrc(src && src.trim() !== '' ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc}
      className={cn('text-transparent', className)}
      referrerPolicy={referrerPolicy}
      onError={(e) => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
          return;
        }
        if (imgSrc !== DEFAULT_FALLBACK) {
          setImgSrc(DEFAULT_FALLBACK);
          return;
        }
        onError?.(e);
      }}
    />
  );
}
