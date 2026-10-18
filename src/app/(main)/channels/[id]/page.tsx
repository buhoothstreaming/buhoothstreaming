'use client'

import { channels } from '@/lib/data';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import ChannelsSidebar from '@/components/channels-sidebar';
import CustomVideoPlayer from '@/components/custom-video-player';

const CONTEXT_KEY = 'browsing_category_context';

export default function ChannelPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { direction } = useLanguage();
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [streamUrl, setStreamUrl] = useState('');
  
  const currentChannel = channels.find(c => c.id === params.id);

  useEffect(() => {
    if (currentChannel) {
      let rawUrl;
      const now = new Date();
      
      // Special logic for Buhooth 1 launch date: 4 May 2026 at 11:00am
      if (currentChannel.id === 'buhooth-1') {
        const launchDate = new Date('2026-05-04T11:00:00');
        if (now >= launchDate) {
          rawUrl = 'https://canva.link/h9m5kscggi5ztwn';
        } else {
          rawUrl = Array.isArray(currentChannel.streamUrl) ? currentChannel.streamUrl[0] : currentChannel.streamUrl;
        }
      } else if (currentChannel.id === 'buhooth-showcase') {
        // Special logic for Buhooth Showcase launch date: 4 May 2026 at 11:15am
        const launchDate = new Date('2026-05-04T11:15:00');
        if (now >= launchDate) {
          // Updated post-launch URL
          rawUrl = 'https://canva.link/k028xok68icdgos';
        } else {
          rawUrl = Array.isArray(currentChannel.streamUrl) ? currentChannel.streamUrl[0] : currentChannel.streamUrl;
        }
      } else if (Array.isArray(currentChannel.streamUrl)) {
        const randomIndex = Math.floor(Math.random() * currentChannel.streamUrl.length);
        rawUrl = currentChannel.streamUrl[randomIndex];
      } else {
        rawUrl = currentChannel.streamUrl;
      }
      
      let finalUrl = rawUrl;
      if (rawUrl.includes('drive.google.com')) {
        finalUrl = rawUrl.replace('/view?usp=drive_link', '/preview');
      }

      setStreamUrl(finalUrl);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (isSidebarOpen) {
       if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
      setOverlayVisible(true);
      return;
    }

    overlayTimerRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, 5000);

    return () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }
    };
  }, [isSidebarOpen]);

  const handleMouseEnter = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    setOverlayVisible(true);
  };
  
  const handleMouseLeave = () => {
    if (!isSidebarOpen) {
      setOverlayVisible(false);
    }
  };

  const onSidebarChange = (open: boolean) => {
    setSidebarOpen(open);
  };
  
  if (!currentChannel) {
    notFound();
  }
  
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  // Canva links are interactive pages/embeds, not direct video files.
  // We strictly check for video file extensions to use the CustomVideoPlayer.
  const isVideo = streamUrl.toLowerCase().includes('.mp4') || 
                  streamUrl.toLowerCase().includes('.mov') || 
                  streamUrl.toLowerCase().includes('.m3u8') ||
                  streamUrl.includes('youtube.com/embed');
                  
  const isOurChannel = currentChannel.category === 'OUR_CHANNELS';

  const getLocalizedChannelNumber = (channel: any) => {
    let context = null;
    try {
        context = sessionStorage.getItem(CONTEXT_KEY);
    } catch(e) {}

    // 1. Exclusive channels keep their original number
    if (channel.category === 'OUR_CHANNELS') {
      return channel.number;
    }

    // 2. If browsing context was Other, use Other localized numbering
    if (context === 'other' && channel.category === 'OTHER') {
        const globalNum = parseInt(channel.number, 10);
        // Sequential numbering for "Other" category.
        // Starts globally after C10SAT renumbering.
        // Total channels before "Other" is now 74.
        const localNum = globalNum - 74;
        return localNum.toString().padStart(4, '0');
    }

    // 3. If context is All or if no specific context matches, use All sequence numbering
    const allNonExclusive = channels.filter(c => c.category !== 'OUR_CHANNELS');
    const index = allNonExclusive.findIndex(c => c.id === channel.id);
    if (index !== -1) {
        return (index + 1).toString().padStart(4, '0');
    }
    
    return channel.number;
  };

  return (
    <>
      <div 
        className="relative w-screen h-screen bg-black"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {streamUrl && (
          isVideo ? (
            <CustomVideoPlayer 
                src={streamUrl} 
                loop={isOurChannel} 
                hideControls={isOurChannel} 
            />
          ) : (
            <iframe
              src={streamUrl}
              title={currentChannel.name}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          )
        )}
        
        <div className={cn(
          "absolute inset-x-0 top-0 z-20 p-4 transition-opacity duration-300 bg-gradient-to-b from-black/70 to-transparent flex items-start justify-between",
          isOverlayVisible ? "opacity-100" : "opacity-0",
          !isOverlayVisible && "pointer-events-none"
        )}>
          <button onClick={() => router.push('/channels')} className="rounded-full text-white bg-black/20 hover:bg-black/50 p-2 shadow-lg transition-colors">
              <BackIcon className="h-6 w-6" />
          </button>
          
          <div 
            className="flex items-center gap-4 text-white cursor-pointer"
            onClick={() => onSidebarChange(true)}
          >
              <div className={cn(direction === 'rtl' ? "text-left" : "text-right")}>
                  <h1 className="text-sm font-semibold">{currentChannel.name}</h1>
                  <p className="text-xs text-white/70">{getLocalizedChannelNumber(currentChannel)}</p>
              </div>
              <div className={cn("relative h-[30px] w-12 overflow-hidden rounded-[5px] bg-black/40 ring-1 ring-white/10")}>
                <Image src={currentChannel.logo} alt={currentChannel.name} fill className="object-cover" />
              </div>
          </div>
        </div>
      </div>
      <ChannelsSidebar
        isOpen={isSidebarOpen}
        onOpenChange={onSidebarChange}
        currentChannelId={currentChannel.id}
      />
    </>
  );
}
