# Split-ify

A (Claude Code) vibe-coded, client-side React web app that lets users filter Spotify playlists by genre (& other criteria), then create new playlists with the filtered tracks.

**Note:** This is mostly a pet project for me, but I wanted to do something I'd actually consider using myself. I'm experimenting with practical uses for Claude Code to advance my knowledge in the area.

## Features

- 🎵 **Genre Filtering**: Select specific genres from comprehensive multi-source data
- 🎯 **Popularity Filter**: Filter tracks by Spotify popularity (0-100 dual-handle slider)
- 📋 **Interactive Playlist Selector**: Browse, search, and select from all your playlists
- 🎨 **Display Customization**: Toggle track numbers and popularity column visibility
- 💾 **Create Playlists**: Save your filtered results as new Spotify playlists
- ⚡ **Fast & Responsive**: Virtualized track lists for smooth performance with large playlists
- 📊 **Advanced Loading Progress**: Real-time progress tracking with ETA across multiple data sources
- 🔄 **Cancel Anytime**: Stop playlist loading gracefully at any time
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
3. **Select a playlist:**
   - **Option A**: Browse your playlists in the interactive selector
     - Search by playlist name or owner
     - View playlist thumbnails, track counts, and owners
     - Click to select, then "Load Playlist"
   - **Option B**: Enter a Spotify playlist URL or ID directly
4. Wait for the app to load tracks and enrich genres (or click "Cancel Loading" to stop)
5. **Watch real-time progress:**
   - 4 independent progress bars show concurrent data fetching
   - ETA display appears after 15% completion
   - Tracks appear immediately as they load (streaming)
6. **Customize display options:**
   - Toggle track numbers to show/hide original playlist positions
   - Toggle popularity column to show/hide Spotify popularity metrics
   - Use "Clear All" to reset display settings
7. **Apply filters:**
   - Use the genre filter to select specific genres (search or browse)
   - Adjust the popularity slider to filter by track popularity
8. Click "Create Playlist" to save filtered tracks as a new Spotify playlist

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

### Data Fetching & Genre Enrichment

When loading a playlist, the app uses a sophisticated concurrent enrichment system:

1. **Spotify Tracks**: Fetches playlist tracks with pagination (immediate display)
2. **Concurrent Genre Enrichment** (3 parallel sources):
   - **Last.fm Track Tags**: Track-level genre tags for precise categorization
   - **Last.fm Artist Tags**: Artist-level tags for broader coverage
   - **Spotify Artist Genres**: Official Spotify genres as additional data
3. **Genre Accumulation**: Combines ALL genres from all 3 sources (no fallback logic)
4. **Real-time Updates**: Tracks enrich progressively as API calls complete
5. **Smart Filtering**: Removes non-genre tags (mood descriptors, specific years, artist names)

**Performance:**
- Rate limiting: 3 requests/second for Last.fm (conservative 60% of API limit)
- Concurrent processing: Up to 3 requests in parallel per source
- Token bucket algorithm with 5-minute sliding window prevents bursting
- Loading time: ~48 seconds for 100 tracks, ~8 minutes for 1000 tracks
- ETA calculation: Throughput-based with 25% buffer, updates in real-time
- Cancellation: Graceful cancellation clears queue and prevents orphaned data

**Genre Coverage:**
- Average 3-4x more genres per track vs single-source approach
- 95-100% coverage rate (combining all sources)
- Filtered to exclude mood tags, artist names, and specific years

### Filtering

Filters are applied in real-time using React's `useMemo`:

- **Genre Filter**:
  - Tracks with at least one matching genre are included
  - Search functionality for quick genre discovery
  - Shows genre count and track count per genre

- **Popularity Filter**:
  - Dual-handle slider (0-100 range)
  - Visual popularity meter on each track row
  - Color-coded levels: green (70+), amber (40-69), gray (0-39)
  - Filter by Spotify's popularity metric

- **Display Options**:
  - Toggle track numbers (shows original playlist position 1-N)
  - Toggle popularity column (show/hide popularity metrics)
  - Independent from filters, maintained in separate UI settings
  - "Clear All" resets display preferences to defaults

**UI Features:**
- Virtualized track list handles 1000+ tracks smoothly
- Genre tooltips show all genres on hover (limited to 3 visible tags)
- Real-time filter updates with no lag

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
