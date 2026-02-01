# Changelog

All notable changes to Split-ify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Editable Popularity Filter Values**
  - Click on min/max popularity numbers to type values manually
  - Input validation ensures values stay within 0-100 range
  - Prevents invalid ranges (min > max)
  - Keyboard support: Enter to confirm, Escape to cancel
  - Hover effects and visual feedback for better UX

- **Collapsible Filter Sections**
  - Display Options section now collapsible (collapsed by default)
  - Filters section now collapsible (expanded by default)
  - Animated collapse icons indicate section state
  - Click section headers to expand/collapse

- **Active Filter Summaries**
  - Display Options shows active settings when collapsed (e.g., "Track numbers, Popularity")
  - Filters section shows active filters when collapsed:
    - Popularity range when modified (e.g., "Popularity: 30-80")
    - Selected genres (e.g., "Genres: rock, pop, jazz" or "Genres: rock, pop, jazz +2 more")
    - Combined summaries when multiple filters active
  - De-emphasized, non-interactive text for quick at-a-glance status

### Technical
- Added comprehensive component tests for PopularityFilter (12 tests)
- Added comprehensive component tests for FilterPanel (19 tests)
- Added ResizeObserver mock to test setup for Radix UI compatibility
- All tests passing with 95.44% overall coverage
- Fixed `selectedGenres` property access in FilterPanel

## [1.4.0] - 2026-01-31

### Added
- **Advanced Settings for Genre Enrichment**
  - Collapsible "Advanced Settings" section in playlist selector
  - Toggle for Last.fm track tags (disabled by default for faster loading)
  - Toggle for Last.fm artist tags (disabled by default for faster loading)
  - Warning message about Last.fm API slowness
  - Settings persist across playlist selections
  - Progress bars now conditionally display based on enabled sources

- **Logo Integration**
  - Added Split-ify logo to homepage (centered above title)
  - Added logo to dashboard header (next to title)
  - Transparent PNG format for clean integration with dark theme

### Changed
- Last.fm genre enrichment now disabled by default for faster initial load times
- Users can opt-in to Last.fm enrichment via Advanced Settings
- Loading progress only shows progress bars for enabled enrichment sources
- Default loading now only uses Spotify artist genres (fastest option)

### Technical
- Added `EnrichmentSettings` type with `useLastfmTrackTags` and `useLastfmArtistTags` flags
- Added `AdvancedSettings` component with collapsible UI
- Extended app store with enrichment settings state and actions
- Modified `GenreEnrichmentQueue` to accept `EnrichmentOptions` for conditional enrichment
- Updated `LoadingProgress` to conditionally render Last.fm progress bars
- Added logo asset to `public/` directory

## [1.3.0] - 2026-01-31

### Added
- **Display Customization Options**
  - Toggle track numbers column visibility (shows original playlist position)
  - Toggle popularity column visibility
  - "Clear All" button to reset display settings to defaults
  - Separate "Display Options" section in filter panel
  - Display settings persist in state independently from filters

### Changed
- Track list now conditionally renders columns based on user preferences
- Track numbers now show original position from playlist (1-indexed)
- Filter panel reorganized with distinct Display Options and Filters sections

### Technical
- Added `UISettings` type with `showTrackNumbers` and `showPopularity` flags
- Added `DisplaySettings` component with checkbox controls
- Extended app store with UI settings state and actions
- Added `originalPosition` tracking to enriched tracks
- Added `position` field to playlist track type
- Enhanced playlist service to track original track positions

## [1.2.0] - 2026-01-31

### Added
- **Interactive Playlist Selector**
  - Browse all user playlists with thumbnails, track counts, and owner names
  - Search functionality for filtering by playlist or owner name
  - Alphabetical sorting for easy discovery
  - Collapsible UI shows selected playlist during loading
  - "Select New Playlist" button for easy playlist switching
  - Tab-based interface: choose between selector and URL input

- **Cancel Loading Functionality**
  - Cancel button appears during playlist loading
  - Graceful cancellation of enrichment queue
  - Automatic cleanup prevents orphaned track data
  - Prevents race conditions with ref-based cancellation flags

- **Advanced Loading Progress UI**
  - 4 independent progress bars for concurrent data sources:
    - Spotify Tracks
    - Last.fm Track Tags
    - Last.fm Artist Tags
    - Spotify Artist Genres
  - Color transitions: Red (0%) → Yellow (50%) → Green (100%)
  - Hover-to-reveal detailed statistics per progress bar
  - Throughput-based ETA calculation with 25% buffer
  - ETA appears when either Last.fm queue reaches 15% completion
  - Smart formatting: rounds up to nearest minute, shows "Less than a minute" for quick loads

- **Popularity Filter**
  - Dual-handle slider for filtering by Spotify popularity (0-100)
  - Visual popularity meter on each track row
  - Color-coded popularity levels: high (70+), medium (40-69), low (0-39)
  - Real-time filtering updates

- **Concurrent Genre Enrichment**
  - Fetches from 3 sources simultaneously instead of sequential fallback
  - Accumulates ALL genres from all sources (3-4x more per track)
  - Streaming track display: tracks appear immediately, enrich progressively
  - Rate-limited queue with token bucket algorithm
  - Smart retry logic with exponential backoff for API errors

### Changed
- **Performance Improvements**
  - 5x faster loading: ~48s for 100 tracks (vs ~310s with old sequential approach)
  - Loading time for 1000 tracks: ~8 minutes with concurrent enrichment
  - Reduced rate limit to 3 req/sec (from 4) with 5-minute sliding window
  - Better compliance with Last.fm's "averaged over 5 minutes" policy

- **Genre Quality Improvements**
  - Filter out artist names from genre tags
  - Filter out specific years (e.g., 2014, 2015) but keep decades (70s, 2010s)
  - Remove mood descriptors and non-genre tags
  - Better genre normalization across all sources

- **UI/UX Enhancements**
  - Thicker progress bars (16px) with better visibility
  - Hover-to-discover stats on progress bars
  - Lock playlist input tabs when playlist is loaded or loading
  - Auto-clear filters when selecting new playlist
  - Improved error messaging for rate limits vs server errors

### Technical
- Added `RateLimitedQueue` utility with token bucket algorithm
- Added `GenreEnrichmentQueue` orchestrator for concurrent enrichment
- Added `LoadingProgress` component with multi-bar progress UI
- Added `PlaylistSelector` component with search and sorting
- Improved cancellation support throughout the enrichment pipeline
- Better request timing tracking for accurate ETA calculation
- Removed custom User-Agent header to avoid CORS preflight issues

## [1.1.0] - 2026-01-30

### Removed
- Completely removed audio features functionality (Spotify discontinued API access for personal use)
- Removed `src/services/audio-features.ts`
- Removed `src/components/filters/AudioFeatureSlider.tsx`
- Removed `src/types/filters.ts`
- Removed `rc-slider` dependency
- Removed `@radix-ui/react-separator` dependency
- Cleaned up all audio features references from documentation

### Changed
- Simplified filter panel to genre-only filtering
- Updated all documentation to reflect genre-only filtering
- Reduced bundle size from ~270 KB to ~236 KB

## [1.0.0] - 2026-01-30

### Added
- OAuth 2.0 authentication with PKCE flow
- Spotify playlist loading with pagination
- Artist genre fetching and display
- Genre-based filtering with search
- Virtualized track list for performance
- Create new playlists from filtered results
- Spotify-themed dark mode UI

### Technical
- React 18 + TypeScript + Vite
- Zustand state management
- Radix UI components
- TanStack Virtual for list virtualization
- Client-side only (no backend)

### Security
- Comprehensive .gitignore for sensitive data
- Environment variables for configuration
- PKCE flow for secure OAuth without client secret

### Fixed
- OAuth redirect URI issues (switched from localhost to 127.0.0.1)
- Double callback execution in React StrictMode
- Token refresh logic

### Removed
- Audio features filtering removed from codebase (Spotify no longer provides this API for personal use)
