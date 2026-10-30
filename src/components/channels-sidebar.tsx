'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { channels } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { ScrollArea } from './ui/scroll-area';
import { Heart, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppLogo } from '@/lib/app-logo';

interface ChannelsSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentChannelId: string;
}

const FAVORITES_KEY = 'favorite_channels';
const CONTEXT_KEY = 'browsing_category_context';

const ChannelItemSkeleton = () => (
    <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-16 rounded-md flex-shrink-0" />
        <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

export default function ChannelsSidebar({ isOpen, onOpenChange, currentChannelId }: ChannelsSidebarProps) {
  const router = useRouter();
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const categories = useMemo(() => [
      { name: t('ourChannels'), id: 'our-channels', icon: LayoutGrid, type: 'icon' as const },
      { name: `01. ${t('favorites')}`, id: 'favorites', icon: Heart, type: 'icon' as const },
      { name: `02. ${t('all')}`, id: 'all', icon: getAppLogo(), type: 'image' as const },
      { name: `03. ${t('other')}`, id: 'other', icon: 'https://a.top4top.io/p_37640qpys1.png', type: 'image' as const },
      { name: '04. C10SAT', id: 'c10sat', icon: 'https://f.top4top.io/p_3690gy8zy1.png', type: 'image' as const }
  ], [t]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 1. Initial Category Detection using Context
  useEffect(() => {
    if (isOpen) {
      let favs = new Set<string>();
      let context = 'all';
      try {
          const storedFavorites = localStorage.getItem(FAVORITES_KEY);
          favs = storedFavorites ? new Set<string>(JSON.parse(storedFavorites)) : new Set<string>();
          context = sessionStorage.getItem(CONTEXT_KEY) || 'all';
      } catch(e) {}
      
      setFavorites(favs);

      const currentChannel = channels.find(c => c.id === currentChannelId);
      
      let initialCat = 'all';

      if (context === 'favorites' && favs.has(currentChannelId)) {
        initialCat = 'favorites';
      } else if (context === 'our-channels' && currentChannel?.category === 'OUR_CHANNELS') {
        initialCat = 'our-channels';
      } else if (context === 'other' && currentChannel?.category === 'OTHER') {
        initialCat = 'other';
      } else if (context === 'c10sat' && currentChannel?.category === 'C10SAT') {
        initialCat = 'c10sat';
      } else if (context === 'all') {
        initialCat = 'all';
      } else {
        // Global Fallback priority
        if (favs.has(currentChannelId)) initialCat = 'favorites';
        else if (currentChannel?.category === 'OUR_CHANNELS') initialCat = 'our-channels';
        else if (currentChannel?.category === 'OTHER') initialCat = 'other';
        else if (currentChannel?.category === 'C10SAT') initialCat = 'c10sat';
        else initialCat = 'all';
      }

      setSelectedCategory(initialCat);
    } else {
        // Reset when closed so it re-detects on next open
        setSelectedCategory(null);
    }
  }, [isOpen, currentChannelId]);

  // 2. Effect to scroll Category Panel to current selected category
  useEffect(() => {
    if (isOpen && selectedCategory) {
      const timer = setTimeout(() => {
        const activeCategoryElement = document.getElementById(`sidebar-category-${selectedCategory}`);
        if (activeCategoryElement) {
          activeCategoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedCategory]);

  // 3. Effect to scroll Channels Panel to current channel
  useEffect(() => {
    if (isOpen && !loadingCategory && selectedCategory) {
      const timer = setTimeout(() => {
        const activeElement = document.getElementById(`sidebar-channel-${currentChannelId}`);
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350); // Slightly more delay to ensure content is settled
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentChannelId, loadingCategory, selectedCategory]);

  const filteredChannels = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === 'our-channels') {
      return channels.filter(channel => channel.category === 'OUR_CHANNELS');
    }
    if (selectedCategory === 'favorites') {
      return channels.filter(channel => favorites.has(channel.id));
    }
    if (selectedCategory === 'other') {
        return channels.filter(channel => channel.category === 'OTHER');
    }
    if (selectedCategory === 'c10sat') {
        return channels.filter(channel => channel.category === 'C10SAT');
    }
    // "All" excludes specific internal categories if they shouldn't mix
    return channels.filter(channel => channel.category !== 'OUR_CHANNELS');
  }, [selectedCategory, favorites]);

  const handleChannelClick = (channelId: string) => {
    onOpenChange(false);
    router.push(`/channels/${channelId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId !== selectedCategory) {
        setLoadingCategory(true);
        setSelectedCategory(categoryId);
        try {
            sessionStorage.setItem(CONTEXT_KEY, categoryId);
        } catch(e) {}
        setTimeout(() => {
            setLoadingCategory(false);
        }, 300);
    }
  };

  const getChannelSubtitle = (channel: any) => {
    if (selectedCategory === 'other' && channel.category === 'OTHER') {
        const otherChannels = channels.filter(c => c.category === 'OTHER');
        const index = otherChannels.findIndex(c => c.id === channel.id);
        if (index !== -1) return (index + 1).toString().padStart(4, '0');
    }
    return channel.number;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? 'right' : 'left'} 
        className="p-0 w-[498px] sm:max-w-none border-none shadow-2xl overflow-hidden bg-[#10162A]/60 backdrop-blur-xl"
      >
        <SheetTitle className="sr-only">{t('categories')}</SheetTitle>
        
        <div className="flex w-full h-full" dir={direction}>
            
            {/* Split 1: Categories Panel */}
            <div className="w-[190px] flex-shrink-0 flex flex-col bg-black/60 border-x border-white/5">
               <ScrollArea className="flex-1">
                <div className="flex flex-col py-2">
                    {categories.map(category => (
                        <button 
                            id={`sidebar-category-${category.id}`}
                            key={category.id}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 text-sm transition-all hover:bg-white/5 group",
                                selectedCategory === category.id && "bg-white/10 shadow-inner"
                            )}
                            onClick={() => handleCategoryClick(category.id)}
                            dir={direction}
                        >
                            <div className="w-16 h-10 flex items-center justify-center bg-black/40 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-white/20">
                                {category.type === 'icon' ? (
                                    category.id === 'favorites' ? 
                                        <Heart className="h-5 w-5 text-red-500 fill-current" /> :
                                        <category.icon className="h-5 w-5 text-primary" />
                                ) : (
                                    <div className="relative w-full h-full p-1">
                                        <Image src={category.icon as string} alt={category.name} fill className="object-contain" />
                                    </div>
                                )}
                            </div>
                            <div className={cn(
                              "flex-1 whitespace-normal font-bold text-xs leading-tight text-white",
                              isRTL ? "text-right" : "text-left"
                            )}>
                                {category.name}
                            </div>
                        </button>
                    ))}
                </div>
               </ScrollArea>
            </div>

            {/* Split 2: Channels Panel */}
            <div className="w-[308px] flex-shrink-0 flex flex-col bg-white/5">
                <ScrollArea className="flex-1">
                    {loadingCategory ? (
                        <div className="py-2">
                            {Array.from({ length: 8 }).map((_, index) => <ChannelItemSkeleton key={index} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col py-2">
                            {filteredChannels.map(channel => (
                                <button
                                    id={`sidebar-channel-${channel.id}`}
                                    key={channel.id}
                                    onClick={() => handleChannelClick(channel.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 text-sm transition-all hover:bg-white/5 group",
                                        channel.id === currentChannelId && "bg-white/10 shadow-inner ring-1 ring-inset ring-white/10"
                                    )}
                                    dir={direction}
                                >
                                    <div className="relative h-10 w-16 overflow-hidden rounded-md flex-shrink-0 bg-black/40 ring-1 ring-white/10 group-hover:ring-white/20">
                                        <Image src={channel.logo} alt={channel.name} fill className="object-cover" />
                                    </div>
                                    <div className={cn(
                                      "flex-1",
                                      isRTL ? "text-right" : "text-left"
                                    )}>
                                        <p className="font-bold text-xs leading-tight whitespace-normal text-white">{channel.name}</p>
                                        <p className="text-[10px] text-white/50 mt-0.5 font-medium">
                                            {getChannelSubtitle(channel)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            { !loadingCategory && filteredChannels.length === 0 && (
                                <div className="text-center text-white/40 pt-12 px-4">
                                    {selectedCategory === 'favorites' ? (
                                        <>
                                        <p className="text-[10px] font-bold">{t('noFavoriteChannels')}</p>
                                        <p className="text-[9px] mt-1">{t('addFavoriteChannels')}</p>
                                        </>
                                    ) : (
                                        <p className="text-[10px] font-bold">{t('noResultsFound')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
