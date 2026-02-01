# Testing Guide for Split-ify

This document describes the automated testing setup for Split-ify, including how to run tests, write new tests, and use the testing mode for development.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Testing Architecture](#testing-architecture)
- [Writing Tests](#writing-tests)
- [Testing Mode](#testing-mode)
- [CI/CD Integration](#cicd-integration)
- [Coverage Goals](#coverage-goals)

## Overview

Split-ify uses a comprehensive testing strategy with multiple layers:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how components work together
3. **End-to-End Tests** - Test full user flows in a real browser

### Testing Stack

- **Vitest** - Fast unit and integration testing (Vite-native)
- **React Testing Library** - Component testing with user-centric queries
- **Playwright** - Cross-browser end-to-end testing
- **MSW (Mock Service Worker)** - API mocking for both tests and development
- **Faker.js** - Generate realistic test data

## Running Tests

### Unit & Integration Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (for CI/CD)
npm test -- --run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- --grep "authentication"
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npm run test:e2e:install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode (debug)
npm run test:e2e:ui

# Run E2E tests in specific browser
npm run test:e2e -- --project=chromium
```

### Run All Tests

```bash
npm run test:all
```

## Testing Architecture

### Directory Structure

```
/home/user/Split-ify/
├── src/
│   ├── test/                    # Test infrastructure
│   │   ├── fixtures/            # Mock data
│   │   │   ├── spotify-auth.ts
│   │   │   ├── spotify-playlists.ts
│   │   │   ├── spotify-tracks.ts
│   │   │   ├── lastfm-tags.ts
│   │   │   ├── enriched-tracks.ts
│   │   │   └── error-responses.ts
│   │   ├── mocks/               # MSW handlers
│   │   │   ├── handlers.ts      # API mock handlers
│   │   │   ├── server.ts        # Node server (Vitest)
│   │   │   └── browser.ts       # Browser worker (dev mode)
│   │   ├── setup.ts             # Global test setup
│   │   ├── test-utils.tsx       # Custom render function
│   │   └── README.md
│   ├── **/*.test.ts(x)          # Unit/integration tests
│   └── ...
├── e2e/                         # End-to-end tests
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── vitest.config.ts
├── playwright.config.ts
└── TESTING.md                   # This file
```

### Test Coverage

Current test coverage:

- **4 test files** with **58 passing tests** (1 skipped)
- **pkce.test.ts** - 10 tests for PKCE OAuth utilities
- **auth.test.ts** - 17 tests for authentication service
- **RateLimitedQueue.test.ts** - 13 tests for rate limiting
- **app-store.test.ts** - 19 tests for Zustand state management

## Writing Tests

### Unit Tests

Unit tests should be co-located with the code they test:

```typescript
// src/services/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { login, getAccessToken } from './auth'

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should get access token', async () => {
    localStorage.setItem('spotify_token', 'test_token')
    const token = await getAccessToken()
    expect(token).toBe('test_token')
  })
})
```

### Component Tests

Use the custom render function with providers:

```typescript
// src/components/LoginButton.test.tsx
import { render, screen } from '@/test/test-utils'
import { LoginButton } from './LoginButton'

test('renders login button', () => {
  render(<LoginButton />)
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
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

MSW is configured globally. Override handlers for specific tests:

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

### End-to-End Tests

E2E tests use Playwright to simulate real user interactions:

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should display login page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
})

test('should mock API responses', async ({ page }) => {
  await page.route('**/v1/me/playlists', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    })
  })

  await page.goto('/dashboard')
  // Test with mocked API
})
```

## Testing Mode

Split-ify includes a **Testing Mode** that allows you to develop and test the app without hitting real Spotify/Last.fm APIs.

### Enabling Testing Mode

1. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Set the testing mode flag:
   ```env
   VITE_TESTING_MODE=true
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

### What Testing Mode Does

When enabled, testing mode:

- **Bypasses OAuth** - Uses mock authentication tokens
- **Mocks all API calls** - Spotify and Last.fm endpoints return fake data
- **Enables faster development** - No rate limits or network delays
- **Logs to console** - Shows "[Testing Mode]" messages

### How It Works

```typescript
// src/config/testing.ts
export const TESTING_MODE = import.meta.env.VITE_TESTING_MODE === 'true'

// src/services/auth.ts
export async function getAccessToken(): Promise<string | null> {
  if (TESTING_MODE) {
    return mockAuthState.token // Return mock token
  }
  // Normal OAuth flow...
}

// src/main.tsx
if (import.meta.env.DEV && TESTING_MODE) {
  const { worker } = await import('./test/mocks/browser')
  await worker.start() // Start MSW in browser
}
```

### Testing Mode Limitations

- Only works in development (`npm run dev`)
- Mock data may not reflect real API responses exactly
- Some features may behave differently (e.g., pagination)

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks

Use Husky to run tests before commits:

```bash
npm install -D husky lint-staged
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test -- --run"
```

## Coverage Goals

Target coverage thresholds (configured in `vitest.config.ts`):

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Priority Areas

1. **Critical Paths** (100% target):
   - OAuth flow (`src/services/auth.ts`)
   - Playlist loading (`src/services/playlist.ts`)
   - Rate limiting (`src/utils/RateLimitedQueue.ts`)

2. **Business Logic** (90% target):
   - Genre enrichment (`src/services/genreEnrichment.ts`)
   - Filtering (`src/hooks/useFilters.ts`)
   - State management (`src/stores/app-store.ts`)

3. **UI Components** (70% target):
   - Core user interactions
   - Error states
   - Loading states

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

## Best Practices

### Do's

✅ Write tests before fixing bugs (TDD)
✅ Test user behavior, not implementation details
✅ Use descriptive test names (`should load playlist when URL is entered`)
✅ Keep tests focused and independent
✅ Use fixtures for consistent test data
✅ Mock external dependencies (APIs, timers)
✅ Test error cases and edge cases

### Don'ts

❌ Don't test framework code (React, Zustand)
❌ Don't rely on test execution order
❌ Don't use real API calls in tests
❌ Don't test private implementation details
❌ Don't write flaky tests with hardcoded timeouts
❌ Don't duplicate test logic (use helpers)

## Debugging Tests

### Vitest Debugging

```bash
# Run in watch mode to re-run on changes
npm test

# Use .only to focus on one test
it.only('should do something', () => { ... })

# Use .skip to skip tests
it.skip('not ready yet', () => { ... })

# Add console.log or debugger statements
test('debug this', () => {
  console.log('Debug info:', someVariable)
  debugger // Pauses in browser devtools
})
```

### Playwright Debugging

```bash
# Run with UI mode for step-by-step debugging
npm run test:e2e:ui

# Run headed (show browser)
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e -- --debug auth.spec.ts

# Generate trace files
npm run test:e2e -- --trace on
```

## Further Reading

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)
- [MSW Documentation](https://mswjs.io)

## Questions?

For questions or issues with tests, please:

1. Check this documentation
2. Review existing test files for examples
3. Open an issue on GitHub
4. Ask in team chat

---

**Happy Testing! 🧪**
