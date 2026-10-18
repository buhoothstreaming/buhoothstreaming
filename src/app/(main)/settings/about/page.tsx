'use client';

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { ArrowLeft, ArrowRight, Info, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { channels, movies, series, adVideos } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  const { t, direction } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const [logo, setLogo] = useState("https://k.top4top.io/p_36885vv362.png");

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

  const { stats, totalValue } = useMemo(() => {
    const channelsCount = channels.length;
    const moviesCount = movies.length;
    const seriesCount = series.length;
    
    // Defensive counting to prevent crashes if data is malformed
    const episodesCount = series.reduce((acc, s) => {
      if (!s || !s.seasons) return acc;
      return acc + s.seasons.reduce((acc2, season) => {
        if (!season || !season.episodes) return acc2;
        return acc2 + season.episodes.length;
      }, 0);
    }, 0);
    
    // 1. Extract unique categories defined in data.ts
    const dataCategories = new Set([
      ...channels.map(c => c.category),
      ...movies.map(m => m.category),
      ...series.map(s => s.category)
    ].filter(Boolean));

    // 2. Count specific UI Navigation Chips / Functional Categories
    const uiNavigationCategories = new Set([
      'favorites-nav', 'all-nav', 'other-nav', 'c10sat-nav', // Channels page
      'minescope-movies', '4ent-movies', 'docstory-movies', 'family-movies', 'romantic-movies', 'action-movies', 'egyptian-movies', 'russian-movies', 'horror-movies', 'drama-movies', 'comedy-movies', 'adult-movies', // Movies page chips
      'favorites-series', 'all-series', '4ent-series', 'viva-series', 'virginsone-series', 'netflix-series', 'animation-series', 'ramadan-series', // Series page chips
      'search-all', 'search-channels', 'search-movies', 'search-series', 'search-virginsone', 'search-joyt1', 'search-docstory', 'search-family', 'search-adult' // Search page chips
    ]);

    // 3. Thematic Categories from translations.ts
    const thematicCategories = [
      'thematicGeneral', 'thematicEntertainment', 'thematicMovie', 'thematicSeries',
      'thematicChildren', 'thematicMusic', 'thematicKnowledge', 'thematicSports',
      'thematicNews', 'thematicShopping', 'thematicReligious', 'thematicAdult',
      'thematicYouth', 'thematicHumour', 'thematicFantasy', 'thematicAnime',
      'thematicPatriotic', 'thematicCooking', 'thematicWomen', 'thematicMen',
      'thematicInternational', 'thematicHD', 'thematicUHD'
    ];

    const categoriesCount = dataCategories.size + uiNavigationCategories.size + thematicCategories.length;
    
    // Count Adverts: Images from Banner + Videos from Player
    const adImagesCount = PlaceHolderImages.filter(img => img.id.startsWith('ad_')).length;
    const adVideosCount = adVideos.length;
    const advertsCount = adImagesCount + adVideosCount;

    const items = [
      { id: 'channels', label: t('countOfChannelsLabel'), value: channelsCount, type: t('channels') },
      { id: 'movies', label: t('countOfMoviesLabel'), value: moviesCount, type: t('movies') },
      { id: 'series', label: t('countOfSeriesLabel'), value: seriesCount, type: t('series') },
      { id: 'episodes', label: t('countOfEpisodesLabel'), value: episodesCount, type: t('episodes') },
      { id: 'adverts', label: t('countOfAdvertsLabel'), value: advertsCount, type: t('adverts') },
      { id: 'categories', label: t('countOfCategoriesLabel'), value: categoriesCount, type: t('categories') },
    ];

    const sum = channelsCount + moviesCount + seriesCount + episodesCount + categoriesCount + advertsCount;

    return { stats: items, totalValue: sum };
  }, [t]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-black/50">
          <Link href="/settings">
            <BackIcon className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-xl font-bold ltr:ml-2 rtl:mr-2">{t('aboutUs')}</h1>
      </header>
      <ScrollArea className="flex-grow">
        <main className="flex flex-col items-center p-4 md:p-8 space-y-6 text-center max-w-2xl mx-auto">
          
          <div className="w-full bg-card/40 backdrop-blur-sm border border-white/5 rounded-[24px] p-5 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex justify-center">
              <div className="relative w-40 h-12 shrink-0">
                <Image 
                  src={logo} 
                  alt="Logo" 
                  fill 
                  className="object-contain" 
                  priority
                  data-ai-hint="app logo"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">{t('aboutUsTitle')}</h2>
                <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto font-medium">
                  {t('aboutUsDescription')}
                </p>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                <p>{t('aboutDesc1')}</p>
                <div className="p-1">
                  <p className="text-lg font-black text-foreground bg-primary/5 inline-block px-4 py-2 rounded-lg border border-primary/10">
                    {t('aboutDesc2')}
                  </p>
                </div>
                <p>{t('aboutDesc3')}</p>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 italic text-foreground text-xs shadow-inner">
                  {t('aboutDesc4')}
                </div>
              </div>
            </div>

            <Separator className="opacity-10" />

            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                  <Info className="w-4 h-4" />
                  <h3>{t('countOfContentsTitle')}</h3>
               </div>
               
               <div className="flex flex-col items-center">
                  <p className="text-4xl md:text-5xl font-black text-primary drop-shadow-[0_0_15px_rgba(0,140,255,0.3)] leading-none">
                    {totalValue}
                  </p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-60">
                    {direction === 'rtl' ? 'إجمالي المحتويات' : 'TOTAL PLATFORM CONTENT'}
                  </p>
               </div>

               <div className="w-full pt-4 border-t border-white/5 overflow-x-auto no-scrollbar">
                  <div className="flex flex-row flex-nowrap items-center justify-center gap-x-4 md:gap-x-8 min-w-max px-2">
                     {stats.map((stat) => (
                       <div key={stat.id} className="flex flex-col items-center justify-center space-y-0.5 px-2">
                         <p className="text-[6px] md:text-[7px] uppercase tracking-[0.1em] font-bold text-muted-foreground text-center line-clamp-1 opacity-60">
                           {stat.label}
                         </p>
                         <p className="text-lg md:text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(0,140,255,0.3)]">
                           {stat.value}
                         </p>
                         <p className="text-[8px] font-black text-foreground uppercase tracking-tight">
                           {stat.type}
                         </p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-card/60 p-4 rounded-lg border border-white/5 w-full flex items-start gap-3 shadow-lg backdrop-blur-sm max-w-lg">
             <div className="p-2 bg-primary/20 rounded-full shrink-0">
                <Info className="w-4 h-4 text-primary" />
             </div>
             <div className={cn('text-xs', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h3 className="text-sm font-bold">{t('appInfo')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('appVersion')}</p>
                <p className="text-[10px] text-primary font-bold mt-0.5 uppercase tracking-tighter">{t('ownedBy')}</p>
             </div>
          </div>

          <footer className="w-full space-y-1 py-4 opacity-40 border-t border-white/5">
            <p className="text-[9px] text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} {t('ownedBy')}. All rights reserved.
            </p>
            <p className="text-[7px] font-black tracking-widest uppercase">Platform Version 1.0.0 Stable Build</p>
          </footer>
        </main>
      </ScrollArea>
    </div>
  );
}
