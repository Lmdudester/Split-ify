import { SpotifyTrack } from './spotify';

export interface EnrichedTrack {
  track: SpotifyTrack;
  allGenres: string[];
  addedAt: string;
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: 'idle' | 'tracks' | 'artists' | 'complete';
  message: string;
}
