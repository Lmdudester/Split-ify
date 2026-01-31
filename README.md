# Split-ify

A (Claude Code) vibe-coded, client-side React web app that lets users filter Spotify playlists by genre (& other criteria), then create new playlists with the filtered tracks.

**Note:** This is mostly a pet project for me, but I wanted to do something I'd actually consider using myself. I'm experimenting with practical uses for Claude Code to advance my knowledge in the area.

## Features

- 🎵 **Genre Filtering**: Select specific genres to filter your playlist
- 💾 **Create Playlists**: Save your filtered results as new Spotify playlists
- ⚡ **Fast & Responsive**: Virtualized track lists for smooth performance with large playlists
- 🔒 **Secure**: Client-side only with OAuth PKCE flow (no backend required)

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Auth**: Spotify OAuth 2.0 with PKCE
- **State**: Zustand
- **UI**: Radix UI primitives
- **Virtualization**: @tanstack/react-virtual

## Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Spotify Developer Account**
3. **Last.fm API Account** (for genre enrichment)

### Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in the app details
4. Once created, go to "Settings"
5. Add the following Redirect URI:
   - **Local development**: `https://127.0.0.1:5173/callback`
   - **Production**: `https://yourdomain.com/callback`
6. Copy your **Client ID**

### Last.fm API Configuration

1. Go to [Last.fm API Account Creation](https://www.last.fm/api/account/create)
2. Fill in the application details (can be non-commercial)
3. Copy your **API Key** (you won't need the secret for this app)

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
VITE_REDIRECT_URI=https://127.0.0.1:5173/callback
VITE_LASTFM_API_KEY=your_lastfm_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `https://127.0.0.1:5173/`

**Note**: You might see a browser warning about the self-signed certificate. This is expected for local development. Click "Advanced" and proceed to the site.

## Usage

1. Click "Login with Spotify" on the home page
2. Authorize the app in the Spotify OAuth flow
3. Enter a Spotify playlist URL or ID
4. Wait for the app to load tracks and genres
5. Use the genre filter in the sidebar to select specific genres
6. Click "Create Playlist" to save filtered tracks as a new Spotify playlist

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
2. Fetches track-level genre data from Last.fm API
3. Enriches track objects with genres
4. Applies filters using React's `useMemo` for efficient updates

**Note:** Genre fetching uses Last.fm's track-level tags for more accurate and comprehensive genre data compared to Spotify's artist-level genres. This process takes approximately 25-30 seconds for a 100-track playlist due to API rate limiting (4 requests/second).

### Filtering

Filters are applied in real-time:
- **Genre filter**: Tracks that have at least one matching genre are included

## Project Structure

```
src/
├── config/          # Spotify configuration
├── types/           # TypeScript type definitions
├── services/        # API services (auth, playlist, artists)
├── hooks/           # Custom React hooks
├── stores/          # Zustand state management
├── components/      # React components
│   ├── auth/        # Login components
│   ├── playlist/    # Track list and input
│   ├── filters/     # Genre filters
│   └── create/      # Playlist creation modal
└── pages/           # Page components
```

## License

MIT

## Contributing

Please don't try to contribute- this is a pet project for me and I'm not maniging it. But you're welcome to fork and do your own thing.
