export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string }>;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  release_date: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  preview_url: string | null;
  popularity: number;
}

export interface PlaylistTrack {
  track: SpotifyTrack;
  added_at: string;
  position: number;
}

export interface PlaylistResponse {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    items: PlaylistTrack[];
    next: string | null;
    total: number;
  };
  owner: {
    id: string;
    display_name: string;
  };
}

export interface UserPlaylistItem {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  collaborative: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}
