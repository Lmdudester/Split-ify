import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { createPlaylist, addTracksToPlaylist, getCurrentUser } from '../../services/playlist';
import { EnrichedTrack } from '../../types/app';

interface CreatePlaylistModalProps {
  tracks: EnrichedTrack[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlaylistModal({ tracks, open, onOpenChange }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      setIsCreating(true);
      setError(null);

      const user = await getCurrentUser();
      const playlist = await createPlaylist(user.id, name, description, isPublic);

      const trackUris = tracks.map(t => t.track.uri);
      await addTracksToPlaylist(playlist.id, trackUris);

      setCreatedUrl(playlist.external_urls.spotify);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setCreatedUrl(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          {createdUrl ? (
            <div className="success-content">
              <Dialog.Title className="dialog-title">Playlist Created!</Dialog.Title>
              <p>Your playlist has been created successfully.</p>
              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-link"
              >
                Open in Spotify
              </a>
              <button onClick={handleClose} className="close-button">
                Close
              </button>
            </div>
          ) : (
            <div>
              <Dialog.Title className="dialog-title">
                Create Playlist
              </Dialog.Title>
              <Dialog.Description className="dialog-description">
                Create a new Spotify playlist with {tracks.length} filtered tracks
              </Dialog.Description>

              <div className="form-content">
                <div className="form-field">
                  <label htmlFor="name">Playlist Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Filtered Playlist"
                    disabled={isCreating}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="description">Description (optional)</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Created with Split-ify"
                    disabled={isCreating}
                    rows={3}
                  />
                </div>

                <div className="form-field checkbox-field">
                  <input
                    id="public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={isCreating}
                  />
                  <label htmlFor="public">Make playlist public</label>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="dialog-actions">
                  <button
                    onClick={handleClose}
                    disabled={isCreating}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating || !name.trim()}
                    className="create-button"
                  >
                    {isCreating ? 'Creating...' : 'Create Playlist'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
