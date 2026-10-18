'use client';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";


const ADULT_CONTENT_KEY = 'hide_adult_content';

export default function PlaylistSettingsPage() {
  const { t, direction } = useLanguage();
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [playlist, setPlaylist] = useState('');
  const [hideAdult, setHideAdult] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedPlaylist = localStorage.getItem('playlist');
    if (storedPlaylist) {
      setPlaylist(storedPlaylist);
    }
    const storedHideAdult = localStorage.getItem(ADULT_CONTENT_KEY);
    if (storedHideAdult !== null) {
      setHideAdult(JSON.parse(storedHideAdult));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('playlist', playlist);
    localStorage.setItem(ADULT_CONTENT_KEY, JSON.stringify(hideAdult));
    toast({
        title: t('settingsSaved')
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-black/50">
          <Link href="/settings">
            <BackIcon className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-xl font-bold ltr:ml-2 rtl:mr-2">{t('playlist')}</h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('changePlaylistTitle')}</h2>
              <p className="text-muted-foreground">{t('changePlaylistSubtitle')}</p>
            </div>
            <div className="space-y-6">
                <Select value={playlist} onValueChange={setPlaylist}>
                    <SelectTrigger>
                    <SelectValue placeholder={t('selectPlaylist')} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="610">610</SelectItem>
                    </SelectContent>
                </Select>
                
                <div className="flex items-center justify-between rounded-md border p-4">
                    <Label htmlFor="adult-content-switch">
                        {t('hideAdultContent')}
                    </Label>
                    <Switch
                        id="adult-content-switch"
                        checked={hideAdult}
                        onCheckedChange={setHideAdult}
                    />
                </div>

                <Button onClick={handleSave} className="w-full">
                    {t('saveChanges')}
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
