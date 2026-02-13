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
import { MobileFilterDrawer } from '../components/filters/MobileFilterDrawer';
import { LoadingProgress } from '../components/LoadingProgress';

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const { tracks, loading, playlistName, clearTracks } = useAppStore();
  const { loadPlaylist, cancelLoading, error } = useEnrichedTracks();
  const { allGenres, filteredTracks } = useFilters();

  const handleLogout = () => {
    logout();
    clearTracks();
    navigate('/');
  };

  const handleReset = () => {
    clearTracks(); // This also clears filters
    setResetKey(prev => prev + 1); // Force PlaylistInput to reset
  };

  const handleCancel = () => {
    cancelLoading();
    handleReset(); // Clear everything and return to base selection
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="Split-ify Logo" className="logo-image" />
          <h1 className="logo">Split-ify</h1>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="main-section">
          <PlaylistInput
            key={resetKey}
            onSubmit={loadPlaylist}
            isLoading={loading.isLoading}
            onReset={handleReset}
            hasLoadedPlaylist={tracks.length > 0}
          />

          <LoadingProgress
            loading={loading}
            onCancel={loading.isLoading ? handleCancel : undefined}
          />

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

      {tracks.length > 0 && (
        <>
          <button
            className="mobile-filter-button"
            onClick={() => setMobileFilterOpen(true)}
          >
            Filters
          </button>
          <MobileFilterDrawer
            allGenres={allGenres}
            open={mobileFilterOpen}
            onOpenChange={setMobileFilterOpen}
          />
        </>
      )}

      <CreatePlaylistModal
        tracks={filteredTracks}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
