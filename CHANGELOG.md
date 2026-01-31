# Changelog

All notable changes to Split-ify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Known Issues
- Audio features filtering disabled (requires Spotify Extended Quota Mode approval)

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
- Audio features filtering (Spotify API restriction in development mode)
