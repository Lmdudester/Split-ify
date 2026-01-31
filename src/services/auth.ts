import { SPOTIFY_CONFIG } from '../config/spotify';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { TokenResponse } from '../types/spotify';

const TOKEN_KEY = 'spotify_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
const CODE_VERIFIER_KEY = 'spotify_code_verifier';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Initiate the PKCE OAuth flow by redirecting to Spotify
 */
export async function login(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SPOTIFY_CONFIG.scopes.join(' ')
  });

  window.location.href = `${SPOTIFY_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleCallback(code: string): Promise<void> {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error('No code verifier found');
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    code_verifier: verifier
  });

  const response = await fetch(SPOTIFY_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to exchange code for token: ${errorData.error_description || response.statusText}`);
  }

  const data: TokenResponse = await response.json();
  saveTokens(data);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch(SPOTIFY_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    logout();
    throw new Error('Failed to refresh token');
  }

  const data: TokenResponse = await response.json();
  saveTokens(data);
}

/**
 * Save tokens to localStorage
 */
function saveTokens(tokenResponse: TokenResponse): void {
  const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

  localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());

  if (tokenResponse.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  }
}

/**
 * Get the current access token, refreshing if necessary
 */
export async function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiryStr) {
    return null;
  }

  const expiry = parseInt(expiryStr, 10);
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (Date.now() >= expiry - bufferTime) {
    try {
      await refreshAccessToken();
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  return token;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem(TOKEN_KEY) !== null;
}

/**
 * Log out the user
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
}
