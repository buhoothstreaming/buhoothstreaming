'use client';

import { useState, useEffect, useCallback } from 'react';

const CONTINUE_WATCHING_KEY = 'continue_watching_series';

interface ContinueWatchingData {
  [seriesId: string]: {
    season: number;
    episode: number;
  };
}

export const useContinueWatching = () => {
  const [continueWatchingData, setContinueWatchingData] = useState<ContinueWatchingData>({});

  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem(CONTINUE_WATCHING_KEY);
      if (storedData) {
        setContinueWatchingData(JSON.parse(storedData));
      }
    } catch (error) {
      console.warn("Failed to parse continue watching data from localStorage", error);
    }
  }, []);

  const getContinueWatchingEpisode = useCallback((seriesId: string) => {
    return continueWatchingData[seriesId] || null;
  }, [continueWatchingData]);

  const setContinueWatchingEpisode = useCallback((seriesId: string, season: number, episode: number) => {
    setContinueWatchingData(prevData => {
      if (prevData[seriesId]?.season === season && prevData[seriesId]?.episode === episode) {
        return prevData;
      }
      const newData = {
        ...prevData,
        [seriesId]: {
          season,
          episode,
        }
      };
      try {
        window.localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(newData));
      } catch (e) {}
      return newData;
    });
  }, []);

  return { getContinueWatchingEpisode, setContinueWatchingEpisode };
};
