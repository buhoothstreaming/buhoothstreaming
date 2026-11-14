'use client'

import { channels, C10SAT_REMOVED_CHANNEL_IDS } from '@/lib/data';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import ChannelsSidebar from '@/components/channels-sidebar';
import CustomVideoPlayer from '@/components/custom-video-player';

const CONTEXT_KEY = 'browsing_category_context';
const C10_REMOVED_SET = new Set(C10SAT_REMOVED_CHANNEL_IDS);

export default function ChannelPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { direction } = useLanguage();
  const [isOverlayVisible, setOverlayVisible] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [streamIndex, setStreamIndex] = useState<number>(0);
  
  const currentChannel = channels.find(c => c.id === params.id);

  useEffect(() => {
    if (currentChannel && Array.isArray(currentChannel.streamUrl)) {
      const randomIndex = Math.floor(Math.random() * currentChannel.streamUrl.length);
      setStreamIndex(randomIndex);
    } else {
      setStreamIndex(0);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (currentChannel) {
      let rawUrl: string = '';
      const now = new Date();
      
      // Special logic for Buhooth 1 launch date: 4 May 2026 at 11:00am
      if (currentChannel.id === 'buhooth-1') {
        const launchDate = new Date('2026-05-04T11:00:00');
        if (now >= launchDate) {
          rawUrl = 'https://canva.link/h9m5kscggi5ztwn';
        } else {
          rawUrl = Array.isArray(currentChannel.streamUrl) ? (currentChannel.streamUrl[streamIndex] || currentChannel.streamUrl[0]) : currentChannel.streamUrl;
        }
      } else if (currentChannel.id === 'buhooth-showcase') {
        // Special logic for Buhooth Showcase launch date: 4 May 2026 at 11:15am
        const launchDate = new Date('2026-05-04T11:15:00');
        if (now >= launchDate) {
          // Updated post-launch URL
          rawUrl = 'https://canva.link/k028xok68icdgos';
        } else {
          rawUrl = Array.isArray(currentChannel.streamUrl) ? (currentChannel.streamUrl[streamIndex] || currentChannel.streamUrl[0]) : currentChannel.streamUrl;
        }
      } else if (Array.isArray(currentChannel.streamUrl)) {
        rawUrl = currentChannel.streamUrl[streamIndex] || currentChannel.streamUrl[0];
      } else {
        rawUrl = currentChannel.streamUrl;
      }
      
      let finalUrl = rawUrl;
      if (rawUrl.includes('drive.google.com')) {
        finalUrl = rawUrl.replace('/view?usp=drive_link', '/preview');
      } else if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        if (id) {
          finalUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
      } else if (rawUrl.includes('youtube.com/watch?v=')) {
        const id = rawUrl.split('watch?v=')[1]?.split('&')[0];
        if (id) {
          finalUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
      }

      setStreamUrl(finalUrl);
    }
  }, [currentChannel, streamIndex]);

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
                  streamUrl.toLowerCase().includes('.m3u8');
                  
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
        const otherChannels = channels.filter(c => c.category === 'OTHER');
        const index = otherChannels.findIndex(c => c.id === channel.id);
        if (index !== -1) return (index + 1).toString().padStart(4, '0');
    }

    // 3. If browsing context was Yiv, use Yiv localized numbering
    if (context === 'yiv' && (channel.category === 'C10SAT' || channel.category === 'Yiv')) {
        const yivChannels = channels.filter(c => c.category === 'C10SAT' || c.category === 'Yiv');
        const index = yivChannels.findIndex(c => c.id === channel.id);
        if (index !== -1) return (index + 1).toString().padStart(4, '0');
    }

    // 4. If browsing context was C10SAT, use C10SAT localized renumbering
    if (context === 'c10sat' && channel.category === 'C10SAT' && !C10_REMOVED_SET.has(channel.id)) {
        const c10Channels = channels.filter(c => c.category === 'C10SAT' && !C10_REMOVED_SET.has(c.id));
        const index = c10Channels.findIndex(c => c.id === channel.id);
        if (index !== -1) return (index + 1).toString().padStart(4, '0');
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
