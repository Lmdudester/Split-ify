# Test Directory Structure

This directory contains all testing infrastructure for Split-ify.

## Directory Structure

```
src/test/
├── fixtures/           # Mock data for tests
│   ├── spotify-auth.ts      # OAuth tokens and user profiles
│   ├── spotify-playlists.ts # Playlist metadata
│   ├── spotify-tracks.ts    # Track and artist data
│   └── lastfm-tags.ts       # Last.fm genre tags
├── mocks/              # API mocking with MSW
│   ├── handlers.ts          # Request handlers for all APIs
│   ├── server.ts            # MSW server for Node (Vitest)
│   └── browser.ts           # MSW worker for browser (dev mode)
├── utils/              # Test utilities (empty for now)
├── setup.ts            # Global test setup
├── test-utils.tsx      # Custom render with providers
└── README.md           # This file
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npm run test:e2e:install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Run All Tests

```bash
npm run test:all
```

## Writing Tests

### Unit Tests

Use the custom render function from `test-utils.tsx` for component tests:

```typescript
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

test('renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Using Mock Data

Import fixtures for consistent test data:

```typescript
import { mockPlaylistTracks } from '@/test/fixtures/spotify-tracks'
import { mockAuthTokenResponse } from '@/test/fixtures/spotify-auth'

test('processes playlist tracks', () => {
  const result = processPlaylist(mockPlaylistTracks)
  expect(result).toHaveLength(5)
})
```

### Mocking API Calls

MSW is configured globally. To override handlers for specific tests:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

test('handles API errors', async () => {
  server.use(
    http.get('https://api.spotify.com/v1/playlists/:id', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    })
  )

  // Your test code here
})
```

## Development Testing Mode

Enable API mocking in development by setting `VITE_TESTING_MODE=true` in your `.env` file. This will intercept all API calls and return mock data, allowing you to develop without hitting real Spotify/Last.fm APIs.

## Coverage Goals

- **Critical Paths**: 100% (auth, playlist loading, rate limiting)
- **Business Logic**: 90% (enrichment, filtering, state management)
- **UI Components**: 70% (interactions, error/loading states)
