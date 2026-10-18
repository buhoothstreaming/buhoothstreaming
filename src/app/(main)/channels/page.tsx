'use client';

import AdvertBanner from '@/components/advert-banner';
import ContentCard from '@/components/content-card';
import { Button } from '@/components/ui/button';
import { channels } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

const FAVORITES_KEY = 'favorite_channels';
const CONTEXT_KEY = 'browsing_category_context';

export default function ChannelsPage() {
  const { t } = useLanguage();
  
  const categories = useMemo(() => [
    { label: t('ourChannels'), id: 'our-channels' },
    { label: `01. ${t('favorites')}`, id: 'favorites' },
    { label: `02. ${t('all')}`, id: 'all' },
    { label: `03. ${t('other')}`, id: 'other' },
    { label: '04. C10SAT', id: 'c10sat' }
  ], [t]);

  const [activeCategoryId, setActiveCategoryId] = useState('all'); 
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    
    try {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
          setFavorites(new Set(JSON.parse(storedFavorites)));
        }

        // Recover last browsing context if available
        const lastContext = sessionStorage.getItem(CONTEXT_KEY);
        if (lastContext && categories.some(c => c.id === lastContext)) {
            setActiveCategoryId(lastContext);
        }
    } catch(e) {}

    return () => clearTimeout(timer);
  }, [categories]);

  const handleFavoriteToggle = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
    } catch(e) {}
  };

  const displayedChannels = useMemo(() => {
    if (activeCategoryId === 'our-channels') {
      return channels.filter(channel => channel.category === 'OUR_CHANNELS');
    }
    if (activeCategoryId === 'favorites') {
      return channels.filter(channel => favorites.has(channel.id));
    }
    if (activeCategoryId === 'other') {
        return channels.filter(channel => channel.category === 'OTHER');
    }
    if (activeCategoryId === 'c10sat') {
        return channels.filter(channel => channel.category === 'C10SAT');
    }
    return channels.filter(channel => channel.category !== 'OUR_CHANNELS');
  }, [activeCategoryId, favorites]);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId !== activeCategoryId) {
      setShowBanner(false);
      setLoading(true);
      setActiveCategoryId(categoryId);
      try {
        sessionStorage.setItem(CONTEXT_KEY, categoryId);
      } catch(e) {}
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getChannelSubtitle = (channel: any) => {
    if (activeCategoryId === 'other' && channel.category === 'OTHER') {
        const globalNum = parseInt(channel.number, 10);
        // Sequential numbering for "Other" category.
        // Total channels before "Other" is now 74 (including 11 exclusive + 63 regular/new C10SAT).
        // Wait, C10SAT goes up to 0074 now (Siyan Classic).
        const localNum = globalNum - 74;
        return localNum.toString().padStart(4, '0');
    }
    if (activeCategoryId === 'all') {
        const allNonExclusive = channels.filter(c => c.category !== 'OUR_CHANNELS');
        const index = allNonExclusive.findIndex(c => c.id === channel.id);
        if (index !== -1) return (index + 1).toString().padStart(4, '0');
    }
    return channel.number;
  };

  return (
    <div className="space-y-2">
      {!loading && showBanner && <AdvertBanner />}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm z-30 pt-2 space-y-1">
        <div className="px-4 md:px-8 flex gap-2 overflow-x-auto flex-nowrap pb-1 no-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={activeCategoryId === cat.id ? 'default' : 'secondary'}
              className={cn("rounded-full h-7 px-3 shrink-0 transition-colors", 
                activeCategoryId === cat.id && cat.id === 'other' && "bg-red-600 text-white hover:bg-red-700 border-transparent",
                activeCategoryId === cat.id && cat.id === 'c10sat' && "bg-black text-white hover:bg-black/90"
              )}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <Separator />
      </div>
      <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, index) => (
              <ContentCardSkeleton key={index} type="channel" />
            ))
          : displayedChannels.map((channel) => (
              <ContentCard
                key={channel.id}
                id={channel.id}
                title={channel.name}
                subtitle={getChannelSubtitle(channel)}
                imageUrl={channel.logo}
                type="channel"
                isFavorite={favorites.has(channel.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
      </div>
       { !loading && displayedChannels.length === 0 && (
        <div className="text-center text-muted-foreground pt-16">
          {activeCategoryId === 'favorites' ? (
            <>
              <p>{t('noFavoriteChannels')}</p>
              <p>{t('addFavoriteChannels')}</p>
            </>
          ) : (
            <p>No channels in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
