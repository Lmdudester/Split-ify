import { EnrichedTrack } from '../../types/app';

interface TrackRowProps {
  track: EnrichedTrack;
}

export function TrackRow({ track }: TrackRowProps) {
  const { track: spotifyTrack, allGenres } = track;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="track-row">
      <div className="track-info">
        {spotifyTrack.album.images[0] && (
          <img
            src={spotifyTrack.album.images[spotifyTrack.album.images.length - 1].url}
            alt={spotifyTrack.album.name}
            className="track-image"
          />
        )}
        <div className="track-details">
          <div className="track-name">{spotifyTrack.name}</div>
          <div className="track-artist">
            {spotifyTrack.artists.map(a => a.name).join(', ')}
          </div>
        </div>
      </div>

      <div className="track-metadata">
        <div className="track-duration">{formatDuration(spotifyTrack.duration_ms)}</div>

        {allGenres.length > 0 && (
          <div className="track-genres">
            {allGenres.slice(0, 3).map((genre, i) => (
              <span key={i} className="genre-tag">{genre}</span>
            ))}
            {allGenres.length > 3 && (
              <span className="genre-tag">+{allGenres.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
