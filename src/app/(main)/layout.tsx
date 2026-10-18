"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppHeader from '@/components/app-header';
import NavBar from '@/components/nav-bar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, loading, router, isClient]);

  if (!isClient || loading || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const isChannelPlayer = /^\/channels\/.+/.test(pathname);
  const isMoviePlayer = /^\/movies\/.+\/play$/.test(pathname);
  const isSeriesPlayer = /^\/series\/.+\/play$/.test(pathname);
  const isMovieTrailer = /^\/movies\/.+\/trailer$/.test(pathname);
  const isSeriesTrailer = /^\/series\/.+\/trailer$/.test(pathname);
  const isMovieInfo = /^\/movies\/[^/]+$/.test(pathname);
  const isSeriesInfo = /^\/series\/[^/]+$/.test(pathname);
  const isSeriesEpisodes = /^\/series\/.+\/episodes$/.test(pathname);

  const noHeaderFooter = 
    pathname === '/settings/profile' || 
    pathname === '/settings/playlist' || 
    pathname === '/settings/about' || 
    pathname === '/search' ||
    isChannelPlayer ||
    isMoviePlayer ||
    isSeriesPlayer ||
    isMovieTrailer ||
    isSeriesTrailer ||
    isMovieInfo ||
    isSeriesInfo ||
    isSeriesEpisodes;

  if (noHeaderFooter) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {children}
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow pt-16 pb-20">
        {children}
      </main>
      <NavBar />
    </div>
  );
}
