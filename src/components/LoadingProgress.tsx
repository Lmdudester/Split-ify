/**
 * Multi-bar Loading Progress Component
 *
 * Displays 4 independent progress bars for concurrent enrichment:
 * - Spotify Tracks
 * - Last.fm Track Tags
 * - Last.fm Artist Tags
 * - Spotify Artist Genres
 *
 * Features:
 * - Thicker bars (16px) with hover-to-discover stats
 * - ETA display based on rolling average of request times
 */

import { LoadingState } from '../types/app';

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  averageTimeMs?: number;
}

/**
 * Calculate progress bar color: Red (0%) → Yellow (50%) → Green (100%)
 */
function getProgressColor(percentage: number): string {
  if (percentage <= 50) {
    // Red to Yellow (0-50%)
    const ratio = percentage / 50;
    const red = 213; // #d51007 red component
    const green = Math.round(16 + (237 * ratio)); // 16 → 253 (yellow)
    const blue = 7;
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Yellow to Green (50-100%)
    const ratio = (percentage - 50) / 50;
    const red = Math.round(213 - (184 * ratio)); // 213 → 29 (green)
    const green = Math.round(253 - (68 * ratio)); // 253 → 185 (green)
    const blue = Math.round(7 + (77 * ratio)); // 7 → 84 (green)
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

/**
 * Calculate ETA in seconds for a single queue
 * Returns null if not enough data
 */
function calculateETA(
  completed: number,
  total: number,
  averageTimeMs?: number
): number | null {
  if (!averageTimeMs || total === 0 || completed >= total) {
    return null;
  }

  const remaining = total - completed;
  const etaSeconds = (remaining * averageTimeMs) / 1000;
  return etaSeconds;
}

/**
 * Format ETA for display
 */
function formatETA(etaSeconds: number | null): string {
  if (etaSeconds === null) {
    return 'Calculating time remaining...';
  }

  if (etaSeconds < 60) {
    return 'Less than a minute remaining';
  }

  // Add 25% buffer and always round up to nearest minute
  const minutes = Math.ceil((etaSeconds * 1.25) / 60);
  return `~${minutes} minute${minutes === 1 ? '' : 's'} remaining`;
}

function ProgressBar({ label, current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const color = getProgressColor(percentage);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        <div className="progress-bar-stats-overlay">
          {current}/{total} ({percentage}%)
        </div>
      </div>
    </div>
  );
}

interface LoadingProgressProps {
  loading: LoadingState;
}

export function LoadingProgress({ loading }: LoadingProgressProps) {
  if (!loading.isLoading) {
    return null;
  }

  // Calculate ETAs for each queue (only for queues with timing data)
  const lastfmTrackETA = calculateETA(
    loading.lastfmTrackTags.completed,
    loading.lastfmTrackTags.total,
    loading.lastfmTrackTags.averageTimeMs
  );

  const lastfmArtistETA = calculateETA(
    loading.lastfmArtistTags.completed,
    loading.lastfmArtistTags.total,
    loading.lastfmArtistTags.averageTimeMs
  );

  const spotifyArtistETA = calculateETA(
    loading.spotifyArtistGenres.completed,
    loading.spotifyArtistGenres.total,
    loading.spotifyArtistGenres.averageTimeMs
  );

  // Aggregate ETA: take max (slowest queue determines completion)
  // Filter out null values and queues that are complete
  const etas = [lastfmTrackETA, lastfmArtistETA, spotifyArtistETA].filter(
    (eta): eta is number => eta !== null
  );

  const aggregatedETA = etas.length > 0 ? Math.max(...etas) : null;

  // Determine if we should show ETA
  const allQueuesComplete =
    loading.lastfmTrackTags.completed >= loading.lastfmTrackTags.total &&
    loading.lastfmArtistTags.completed >= loading.lastfmArtistTags.total &&
    loading.spotifyArtistGenres.completed >= loading.spotifyArtistGenres.total;

  // Check if either Last.fm queue has at least 15% completion
  const lastfmTrackProgress = loading.lastfmTrackTags.total > 0
    ? loading.lastfmTrackTags.completed / loading.lastfmTrackTags.total
    : 0;
  const lastfmArtistProgress = loading.lastfmArtistTags.total > 0
    ? loading.lastfmArtistTags.completed / loading.lastfmArtistTags.total
    : 0;

  const lastfmQueuesReady = lastfmTrackProgress >= 0.15 || lastfmArtistProgress >= 0.15;

  const showETA = !allQueuesComplete && loading.stage === 'loading' && lastfmQueuesReady;

  return (
    <div className="loading-progress">
      <div className="loading-progress-message">{loading.message}</div>

      <div className="progress-bars">
        <ProgressBar
          label="Spotify Tracks"
          current={loading.spotifyTracks.loaded}
          total={loading.spotifyTracks.total}
        />

        <ProgressBar
          label="Last.fm Track Tags"
          current={loading.lastfmTrackTags.completed}
          total={loading.lastfmTrackTags.total}
          averageTimeMs={loading.lastfmTrackTags.averageTimeMs}
        />

        <ProgressBar
          label="Last.fm Artist Tags"
          current={loading.lastfmArtistTags.completed}
          total={loading.lastfmArtistTags.total}
          averageTimeMs={loading.lastfmArtistTags.averageTimeMs}
        />

        <ProgressBar
          label="Spotify Artist Genres"
          current={loading.spotifyArtistGenres.completed}
          total={loading.spotifyArtistGenres.total}
          averageTimeMs={loading.spotifyArtistGenres.averageTimeMs}
        />
      </div>

      {showETA && (
        <div
          className={`loading-eta ${aggregatedETA === null ? 'calculating' : ''}`}
        >
          {formatETA(aggregatedETA)}
        </div>
      )}
    </div>
  );
}
