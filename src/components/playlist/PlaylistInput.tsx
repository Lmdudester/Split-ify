import { useState } from 'react';
import { PlaylistSelector } from './PlaylistSelector';

interface PlaylistInputProps {
  onSubmit: (playlistInput: string) => void;
  isLoading: boolean;
  onReset?: () => void;
  hasLoadedPlaylist?: boolean;
}

export function PlaylistInput({ onSubmit, isLoading, onReset, hasLoadedPlaylist }: PlaylistInputProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'url'>('select');
  const [urlInput, setUrlInput] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onSubmit(urlInput.trim());
    }
  };

  const isLocked = isLoading || hasLoadedPlaylist;

  return (
    <div className="playlist-input-container">
      {/* Tab Navigation */}
      <div className="playlist-input-tabs">
        <button
          onClick={() => setActiveTab('select')}
          disabled={isLocked}
          className={`tab-button ${activeTab === 'select' ? 'active' : ''}`}
        >
          Select Playlist
        </button>
        <button
          onClick={() => setActiveTab('url')}
          disabled={isLocked}
          className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
        >
          Enter URL
        </button>
      </div>

      {/* Tab Content */}
      <div className="playlist-input-content">
        {activeTab === 'select' ? (
          <PlaylistSelector
            onSelect={onSubmit}
            isLoading={isLoading}
            onReset={onReset}
          />
        ) : (
          <form onSubmit={handleUrlSubmit} className="playlist-url-form">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter Spotify playlist URL or ID"
              disabled={isLoading}
              className="playlist-input-field"
            />
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="playlist-submit-button"
            >
              {isLoading ? 'Loading...' : 'Load Playlist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
