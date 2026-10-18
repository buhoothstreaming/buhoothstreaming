"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleWatch = () => {
    if (playlist) {
      localStorage.setItem('playlist', playlist);
      router.push('/channels');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('enterPlaylist')}</CardTitle>
          <CardDescription>
            {t('playlistDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select value={playlist} onValueChange={setPlaylist}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectPlaylist')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="610">610</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleWatch} disabled={!playlist} className="w-full bg-primary hover:bg-primary/90">
            {t('letsWatch')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
