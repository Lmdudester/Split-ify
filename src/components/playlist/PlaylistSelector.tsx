import { useState, useEffect } from 'react';
import { getAllUserPlaylists } from '../../services/playlist';
import { UserPlaylistItem } from '../../types/spotify';

interface PlaylistSelectorProps {
  onSelect: (playlistId: string) => void;
  isLoading: boolean;
  onReset?: () => void;
}

export function PlaylistSelector({ onSelect, isLoading, onReset }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<UserPlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const userPlaylists = await getAllUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaylists = playlists
    .filter((playlist) => {
      const query = searchQuery.toLowerCase();
      return (
        playlist.name.toLowerCase().includes(query) ||
        playlist.owner.display_name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (playlistId: string) => {
    setSelectedId(playlistId);
  };

  const handleLoadPlaylist = () => {
    if (selectedId) {
      setHasSubmitted(true);
      onSelect(selectedId);
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setSearchQuery('');
    setHasSubmitted(false);
    if (onReset) {
      onReset();
    }
  };

  // Show collapsed view only after playlist has been submitted for loading
  if (selectedId && hasSubmitted) {
    const selectedPlaylist = playlists.find((p) => p.id === selectedId);
    if (selectedPlaylist) {
      return (
        <div className="playlist-selector collapsed">
          <div className="playlist-item selected">
            <div
              className="playlist-thumbnail"
              style={{
                backgroundImage: selectedPlaylist.images[0]
                  ? `url(${selectedPlaylist.images[0].url})`
                  : 'none',
                backgroundColor: selectedPlaylist.images[0] ? 'transparent' : 'var(--spotify-gray)',
              }}
            />
            <div className="playlist-info">
              <div className="playlist-name">{selectedPlaylist.name}</div>
              <div className="playlist-meta">
                {selectedPlaylist.tracks.total} tracks · {selectedPlaylist.owner.display_name}
              </div>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={handleReset}
              className="playlist-reset-button"
            >
              Select New Playlist
            </button>
          )}
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="playlist-selector">
        <div className="playlist-loading-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="playlist-item-skeleton">
              <div className="skeleton-thumbnail" />
              <div className="skeleton-info">
                <div className="skeleton-text skeleton-name" />
                <div className="skeleton-text skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-selector">
        <div className="playlist-error-state">
          <p>{error}</p>
          <button onClick={loadPlaylists} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="playlist-selector">
        <div className="playlist-empty-state">
          <p>No playlists found in your library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-selector">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search playlists..."
        className="playlist-search"
      />

      <div className="playlist-list">
        {filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => handleSelect(playlist.id)}
            className={`playlist-item ${selectedId === playlist.id ? 'selected' : ''}`}
          >
            <div
              className="playlist-thumbnail"
              style={{
                backgroundImage: playlist.images[0]
                  ? `url(${playlist.images[0].url})`
                  : 'none',
                backgroundColor: playlist.images[0] ? 'transparent' : 'var(--spotify-gray)',
              }}
            />
            <div className="playlist-info">
              <div className="playlist-name">{playlist.name}</div>
              <div className="playlist-meta">
                {playlist.tracks.total} tracks · {playlist.owner.display_name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaylists.length === 0 && searchQuery && (
        <div className="playlist-empty-state">
          <p>No playlists match your search.</p>
        </div>
      )}

      <button
        onClick={handleLoadPlaylist}
        disabled={!selectedId || isLoading}
        className="playlist-load-button"
      >
        {isLoading ? 'Loading...' : 'Load Playlist'}
      </button>
    </div>
  );
}
