export interface AudioFeatureRange {
  min: number;
  max: number;
}

export interface AudioFeatureFilters {
  danceability: AudioFeatureRange;
  energy: AudioFeatureRange;
  valence: AudioFeatureRange;
  acousticness: AudioFeatureRange;
  instrumentalness: AudioFeatureRange;
  speechiness: AudioFeatureRange;
  liveness: AudioFeatureRange;
  tempo: AudioFeatureRange;
  loudness: AudioFeatureRange;
}

export interface FilterState {
  selectedGenres: string[];
  audioFeatures: AudioFeatureFilters;
}

export const DEFAULT_AUDIO_FEATURES: AudioFeatureFilters = {
  danceability: { min: 0, max: 1 },
  energy: { min: 0, max: 1 },
  valence: { min: 0, max: 1 },
  acousticness: { min: 0, max: 1 },
  instrumentalness: { min: 0, max: 1 },
  speechiness: { min: 0, max: 1 },
  liveness: { min: 0, max: 1 },
  tempo: { min: 40, max: 220 },
  loudness: { min: -60, max: 0 }
};

export interface AudioFeatureConfig {
  key: keyof AudioFeatureFilters;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
}

export const AUDIO_FEATURE_CONFIGS: AudioFeatureConfig[] = [
  {
    key: 'danceability',
    label: 'Danceability',
    description: 'How suitable for dancing',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'energy',
    label: 'Energy',
    description: 'Intensity and activity',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'valence',
    label: 'Valence',
    description: 'Musical positiveness (mood)',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'acousticness',
    label: 'Acousticness',
    description: 'Acoustic vs electronic',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'instrumentalness',
    label: 'Instrumentalness',
    description: 'Vocal content likelihood',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'speechiness',
    label: 'Speechiness',
    description: 'Spoken word presence',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'liveness',
    label: 'Liveness',
    description: 'Live performance probability',
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    key: 'tempo',
    label: 'Tempo',
    description: 'BPM',
    min: 40,
    max: 220,
    step: 1,
    format: (value) => `${Math.round(value)} BPM`
  },
  {
    key: 'loudness',
    label: 'Loudness',
    description: 'Decibels',
    min: -60,
    max: 0,
    step: 1,
    format: (value) => `${Math.round(value)} dB`
  }
];
