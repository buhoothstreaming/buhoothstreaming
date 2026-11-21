'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const RELOAD_KEY = 'chunk_error_reload_ts';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError');

  useEffect(() => {
    if (!isChunkError) return;
    try {
      const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || '0');
      const now = Date.now();
      if (now - lastReload > 15000) {
        sessionStorage.setItem(RELOAD_KEY, String(now));
        window.location.reload();
      }
    } catch {
      // Ignore storage errors and let the user retry manually
    }
  }, [isChunkError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground space-y-4">
      <h2 className="text-xl font-bold">
        {isChunkError ? 'Updating application...' : 'Something went wrong'}
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {isChunkError
          ? 'A page module took too long to load. Please retry to fetch the latest version.'
          : error?.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
