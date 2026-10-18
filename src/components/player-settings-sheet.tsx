'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/language-context';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayerSettingsSheetProps {
  type: 'audio' | 'subtitles' | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlayerSettingsSheet({ type, isOpen, onOpenChange }: PlayerSettingsSheetProps) {
  const { t, direction } = useLanguage();
  
  // Mock State
  const [selectedAudio, setSelectedAudio] = useState('ar');
  const [selectedSubtitle, setSelectedSubtitle] = useState('off');

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };
  
  const title = type === 'audio' ? t('audioTracks') : t('captions');

  const audioTracks = [
    { lang: 'ar', label: t('arabic') },
  ];
  
  const subtitles = [
    { lang: 'ar', label: t('arabic') },
    { lang: 'off', label: t('off') },
  ];


  const renderContent = () => {
    if (type === 'audio') {
      return (
        <div className="flex flex-col gap-2 pt-4">
          {audioTracks.map((track) => (
            <Button
              key={track.lang}
              variant={selectedAudio === track.lang ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedAudio(track.lang)}
            >
              {selectedAudio === track.lang && <Check className="w-4 h-4" />}
              <span className={cn(selectedAudio !== track.lang && (direction === 'rtl' ? 'mr-6' : 'ml-6'))}>{track.label}</span>
            </Button>
          ))}
        </div>
      );
    }

    if (type === 'subtitles') {
      return (
        <div className="flex flex-col gap-2 pt-4">
          {subtitles.map((subtitle) => (
            <Button
              key={subtitle.lang}
              variant={selectedSubtitle === subtitle.lang ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedSubtitle(subtitle.lang)}
            >
              {selectedSubtitle === subtitle.lang && <Check className="w-4 h-4" />}
              <span className={cn(selectedSubtitle !== subtitle.lang && (direction === 'rtl' ? 'mr-6' : 'ml-6'))}>{subtitle.label}</span>
            </Button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg bg-background/95 backdrop-blur-sm max-h-[50vh] w-full max-w-md mx-auto border-none p-4">
        <SheetHeader className={cn("text-left", direction === 'rtl' && "text-right")}>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <Separator className="my-2" />
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}
