/**
 * Mock error responses for testing error handling
 */

export const spotifyError401Unauthorized = {
  error: {
    status: 401,
    message: 'The access token expired',
  },
}

export const spotifyError403Forbidden = {
  error: {
    status: 403,
    message: 'Forbidden',
  },
}

export const spotifyError404NotFound = {
  error: {
    status: 404,
    message: 'Not found',
  },
}

export const spotifyError429RateLimit = {
  error: {
    status: 429,
    message: 'Rate limit exceeded',
  },
}

export const spotifyError500ServerError = {
  error: {
    status: 500,
    message: 'Internal server error',
  },
}

export const spotifyError503ServiceUnavailable = {
  error: {
    status: 503,
    message: 'Service temporarily unavailable',
  },
}

export const lastfmErrorInvalidApiKey = {
  error: 10,
  message: 'Invalid API key',
}

export const lastfmErrorServiceOffline = {
  error: 11,
  message: 'Service Offline - This service is temporarily offline. Try again later.',
}

export const lastfmErrorRateLimit = {
  error: 29,
  message: 'Rate limit exceeded',
}

export const lastfmErrorNotFound = {
  error: 6,
  message: 'Track not found',
}

export const oauthErrorInvalidGrant = {
  error: 'invalid_grant',
  error_description: 'Invalid authorization code',
}

export const oauthErrorInvalidClient = {
  error: 'invalid_client',
  error_description: 'Invalid client credentials',
}

/**
 * HTTP Response helpers for testing
 */
export const httpResponses = {
  unauthorized: { status: 401, body: spotifyError401Unauthorized },
  forbidden: { status: 403, body: spotifyError403Forbidden },
  notFound: { status: 404, body: spotifyError404NotFound },
  rateLimited: { status: 429, body: spotifyError429RateLimit },
  serverError: { status: 500, body: spotifyError500ServerError },
  serviceUnavailable: { status: 503, body: spotifyError503ServiceUnavailable },
}
