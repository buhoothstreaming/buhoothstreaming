"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import SplashScreen from '@/components/splash-screen';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 9000); // Splash screen for 9 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClient && !showSplash && !loading) {
      if (user) {
        // Mock check for playlist with safety
        let hasPlaylist = false;
        try {
          hasPlaylist = window.localStorage.getItem('playlist') === '610';
        } catch (e) {}
        
        if (hasPlaylist) {
          router.replace('/channels');
        } else {
          router.replace('/playlist');
        }
      } else {
        router.replace('/auth/signin');
      }
    }
  }, [showSplash, user, loading, router, isClient]);

  if (showSplash || (isClient && loading)) {
    return <SplashScreen />;
  }
  
  // Render a loader while redirecting to avoid blank screen
  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
