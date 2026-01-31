import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { useEnrichedTracks } from '../hooks/useEnrichedTracks';
import { useFilters } from '../hooks/useFilters';
import { useAuth } from '../hooks/useAuth';
import { PlaylistInput } from '../components/playlist/PlaylistInput';
import { TrackList } from '../components/playlist/TrackList';
import { FilterPanel } from '../components/filters/FilterPanel';
import { CreatePlaylistModal } from '../components/create/CreatePlaylistModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { tracks, loading, playlistName, clearTracks } = useAppStore();
  const { loadPlaylist, error } = useEnrichedTracks();
  const { allGenres, filteredTracks } = useFilters();

  const handleLogout = () => {
    logout();
    clearTracks();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="logo">Split-ify</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="main-section">
          <PlaylistInput
            onSubmit={loadPlaylist}
            isLoading={loading.isLoading}
          />

          {loading.isLoading && (
            <div className="loading-state">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${loading.progress}%` }}
                />
              </div>
              <p>{loading.message}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading.isLoading && tracks.length > 0 && (
            <>
              <div className="playlist-header">
                <div>
                  <h2>{playlistName}</h2>
                  <p>
                    Showing {filteredTracks.length} of {tracks.length} tracks
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={filteredTracks.length === 0}
                  className="create-playlist-button"
                >
                  Create Playlist ({filteredTracks.length})
                </button>
              </div>

              <TrackList tracks={filteredTracks} />
            </>
          )}
        </div>

        {tracks.length > 0 && (
          <aside className="sidebar">
            <FilterPanel allGenres={allGenres} />
          </aside>
        )}
      </div>

      <CreatePlaylistModal
        tracks={filteredTracks}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
