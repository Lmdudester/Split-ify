# Split-ify

A client-side React web app that lets users filter Spotify playlists by artist genres and audio features, then create new playlists with the filtered tracks.

## Features

- 🎵 **Genre Filtering**: Select specific genres to filter your playlist
- 🎚️ **Audio Features**: Fine-tune by danceability, energy, tempo, valence, and more
- 💾 **Create Playlists**: Save your filtered results as new Spotify playlists
- ⚡ **Fast & Responsive**: Virtualized track lists for smooth performance with large playlists
- 🔒 **Secure**: Client-side only with OAuth PKCE flow (no backend required)

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Auth**: Spotify OAuth 2.0 with PKCE
- **State**: Zustand
- **UI**: Radix UI primitives + rc-slider
- **Virtualization**: @tanstack/react-virtual

## Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Spotify Developer Account**

### Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in the app details
4. Once created, go to "Settings"
5. Add the following Redirect URI:
   - **Local development**: `https://localhost:5173/callback`
   - **Production**: `https://yourdomain.com/callback`
6. Copy your **Client ID**

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd split-ify
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=https://localhost:5173/callback
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `https://localhost:5173`

**Note**: You'll see a browser warning about the self-signed certificate. This is expected for local development. Click "Advanced" and proceed to the site.

## Usage

1. Click "Login with Spotify" on the home page
2. Authorize the app in the Spotify OAuth flow
3. Enter a Spotify playlist URL or ID
4. Wait for the app to load tracks, genres, and audio features
5. Use the filters on the right sidebar:
   - **Genres**: Select specific genres to include
   - **Audio Features**: Adjust sliders for different audio characteristics
6. Click "Create Playlist" to save filtered tracks as a new Spotify playlist

## Audio Features

The app lets you filter by the following Spotify audio features:

- **Danceability** (0-1): How suitable for dancing
- **Energy** (0-1): Intensity and activity
- **Valence** (0-1): Musical positiveness (mood)
- **Acousticness** (0-1): Acoustic vs electronic
- **Instrumentalness** (0-1): Vocal content likelihood
- **Speechiness** (0-1): Spoken word presence
- **Liveness** (0-1): Live performance probability
- **Tempo** (40-220 BPM): Speed of the track
- **Loudness** (-60 to 0 dB): Overall loudness

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## How It Works

### Authentication Flow

The app uses Spotify's OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure, client-side authentication:

1. Generate a code verifier and challenge
2. Redirect user to Spotify authorization page
3. User grants permissions
4. Exchange authorization code for access token
5. Store tokens in localStorage
6. Auto-refresh tokens before expiry

### Data Fetching

When loading a playlist, the app:

1. Fetches playlist tracks (with pagination)
2. Extracts unique artist IDs and fetches genres in batches
3. Fetches audio features for all tracks in batches
4. Enriches track objects with genres and audio features
5. Applies filters using React's `useMemo` for efficient updates

### Filtering

Filters are applied in real-time using:
- **Genre filter**: Tracks that have at least one matching genre
- **Audio feature ranges**: Tracks whose features fall within all specified ranges

## Project Structure

```
src/
├── config/          # Spotify configuration
├── types/           # TypeScript type definitions
├── services/        # API services (auth, playlist, artists, audio features)
├── hooks/           # Custom React hooks
├── stores/          # Zustand state management
├── components/      # React components
│   ├── auth/        # Login components
│   ├── playlist/    # Track list and input
│   ├── filters/     # Genre and audio feature filters
│   └── create/      # Playlist creation modal
└── pages/           # Page components
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
