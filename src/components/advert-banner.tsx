"use client";

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adImages = PlaceHolderImages.filter(img => img.id.startsWith('ad_'));
const ADULT_CONTENT_KEY = 'hide_adult_content';

export default function AdvertBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [hideAdult, setHideAdult] = useState(true);
  const [shuffledImages, setShuffledImages] = useState<ImagePlaceholder[]>([]);

  useEffect(() => {
    const shuffled = [...adImages].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);

    const storedHideAdult = localStorage.getItem(ADULT_CONTENT_KEY);
    if (storedHideAdult !== null) {
      setHideAdult(JSON.parse(storedHideAdult));
    }
  }, []);

  const displayedImages = useMemo(() => {
    if (hideAdult) {
      return shuffledImages.filter(img => !img.isAdult);
    }
    return shuffledImages;
  }, [hideAdult, shuffledImages]);


  if (!displayedImages.length || !isVisible) return null;
  
  return (
    <div className="px-4 md:px-8 pt-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 md:right-10 z-10 bg-black/50 hover:bg-black/70 text-white hover:text-white rounded-full h-6 w-6"
        onClick={() => setIsVisible(false)}
        aria-label="Close advertisement"
      >
        <X className="h-4 w-4" />
      </Button>
      <Carousel
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
        opts={{ loop: true, direction: "rtl" }}
        className="w-full"
      >
        <CarouselContent>
          {displayedImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="aspect-[4/1] relative overflow-hidden rounded-lg">
                <Image src={image.imageUrl} alt={image.description || "Advertisement"} fill className="object-cover" data-ai-hint={image.imageHint} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
