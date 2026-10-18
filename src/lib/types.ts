export interface Channel {
  id: string;
  name: string;
  number: string;
  logo: string;
  streamUrl: string | string[];
  category?: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  ageRating: number;
  rating: number;
  genres: string[];
  description?: string;
  category?: string;
  streamUrl?: string;
  subCategories?: string[];
  audioTracks?: string[];
  subtitleTracks?: string[];
  trailerUrl?: string;
  premiereDate?: string;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  thumbnailUrl?: string;
  streamUrl: string;
  description?: string;
  ageRating?: number;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  year: number | string;
  posterUrl: string;
  ageRating: number;
  rating: number;
  genres: string[];
  subCategories?: string[];
  description?: string;
  seasons: Season[];
  category?: string;
  audioTracks?: string[];
  subtitleTracks?: string[];
  trailerUrl?: string;
  premiereDate?: string;
}
