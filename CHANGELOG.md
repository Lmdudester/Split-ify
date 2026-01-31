# Changelog

All notable changes to Split-ify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
