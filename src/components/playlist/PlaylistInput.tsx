import { useState } from 'react';

interface PlaylistInputProps {
  onSubmit: (playlistInput: string) => void;
  isLoading: boolean;
}

export function PlaylistInput({ onSubmit, isLoading }: PlaylistInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="playlist-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter Spotify playlist URL or ID"
        disabled={isLoading}
        className="playlist-input-field"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="playlist-submit-button"
      >
        {isLoading ? 'Loading...' : 'Load Playlist'}
      </button>
    </form>
  );
}
