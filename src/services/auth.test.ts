import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  login,
  handleCallback,
  refreshAccessToken,
  getAccessToken,
  isAuthenticated,
  logout,
} from './auth'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import * as testingConfig from '@/config/testing'

describe('auth service', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear()
    sessionStorage.clear()
    // Mock TESTING_MODE to false by default
    vi.spyOn(testingConfig, 'TESTING_MODE', 'get').mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should redirect to Spotify authorization URL in normal mode', async () => {
      const mockAssign = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { href: '', assign: mockAssign },
        writable: true,
      })

      await login()

      // Should set code verifier in session storage
      expect(sessionStorage.getItem('spotify_code_verifier')).toBeTruthy()

      // Should redirect to Spotify
      expect(window.location.href).toContain('https://accounts.spotify.com/authorize')
      expect(window.location.href).toContain('client_id=')
      expect(window.location.href).toContain('code_challenge=')
      expect(window.location.href).toContain('code_challenge_method=S256')
    })

    it('should set mock tokens in testing mode', async () => {
      vi.spyOn(testingConfig, 'TESTING_MODE', 'get').mockReturnValue(true)

      await login()

      // Should set mock tokens in localStorage
      expect(localStorage.getItem('spotify_token')).toBe('mock_access_token_12345')
      expect(localStorage.getItem('spotify_refresh_token')).toBe('mock_refresh_token_67890')
      expect(localStorage.getItem('spotify_token_expiry')).toBeTruthy()
    })
  })

  describe('handleCallback', () => {
    it('should exchange code for tokens', async () => {
      sessionStorage.setItem('spotify_code_verifier', 'test_verifier')

      await handleCallback('test_code')

      expect(localStorage.getItem('spotify_token')).toBe('mock_access_token')
      expect(localStorage.getItem('spotify_refresh_token')).toBe('mock_refresh_token')
      expect(sessionStorage.getItem('spotify_code_verifier')).toBeNull()
    })

    it('should throw error if no code verifier found', async () => {
      await expect(handleCallback('test_code')).rejects.toThrow('No code verifier found')
    })

    it('should handle failed token exchange', async () => {
      sessionStorage.setItem('spotify_code_verifier', 'test_verifier')

      server.use(
        http.post('https://accounts.spotify.com/api/token', () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'Invalid authorization code' },
            { status: 400 }
          )
        })
      )

      await expect(handleCallback('invalid_code')).rejects.toThrow('Failed to exchange code for token')
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh access token using refresh token', async () => {
      localStorage.setItem('spotify_refresh_token', 'mock_refresh_token')

      await refreshAccessToken()

      expect(localStorage.getItem('spotify_token')).toBe('mock_access_token')
    })

    it('should throw error if no refresh token available', async () => {
      await expect(refreshAccessToken()).rejects.toThrow('No refresh token available')
    })

    it('should logout if refresh fails', async () => {
      localStorage.setItem('spotify_refresh_token', 'invalid_refresh_token')

      server.use(
        http.post('https://accounts.spotify.com/api/token', () => {
          return HttpResponse.json({ error: 'invalid_grant' }, { status: 400 })
        })
      )

      await expect(refreshAccessToken()).rejects.toThrow('Failed to refresh token')
      expect(localStorage.getItem('spotify_token')).toBeNull()
    })
  })

  describe('getAccessToken', () => {
    it('should return mock token in testing mode', async () => {
      vi.spyOn(testingConfig, 'TESTING_MODE', 'get').mockReturnValue(true)

      const token = await getAccessToken()
      expect(token).toBe('mock_access_token_12345')
    })

    it('should return null if no token stored', async () => {
      const token = await getAccessToken()
      expect(token).toBeNull()
    })

    it('should return valid token if not expired', async () => {
      const futureExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes from now
      localStorage.setItem('spotify_token', 'valid_token')
      localStorage.setItem('spotify_token_expiry', futureExpiry.toString())

      const token = await getAccessToken()
      expect(token).toBe('valid_token')
    })

    it('should refresh token if expiring soon', async () => {
      const soonExpiry = Date.now() + 2 * 60 * 1000 // 2 minutes from now (within 5 min buffer)
      localStorage.setItem('spotify_token', 'old_token')
      localStorage.setItem('spotify_token_expiry', soonExpiry.toString())
      localStorage.setItem('spotify_refresh_token', 'refresh_token')

      const token = await getAccessToken()
      expect(token).toBe('mock_access_token') // Should be new token from refresh
    })

    it('should return null if refresh fails', async () => {
      const soonExpiry = Date.now() + 2 * 60 * 1000
      localStorage.setItem('spotify_token', 'old_token')
      localStorage.setItem('spotify_token_expiry', soonExpiry.toString())
      localStorage.setItem('spotify_refresh_token', 'invalid_refresh')

      server.use(
        http.post('https://accounts.spotify.com/api/token', () => {
          return HttpResponse.json({ error: 'invalid_grant' }, { status: 400 })
        })
      )

      const token = await getAccessToken()
      expect(token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true in testing mode', () => {
      vi.spyOn(testingConfig, 'TESTING_MODE', 'get').mockReturnValue(true)
      expect(isAuthenticated()).toBe(true)
    })

    it('should return false if no token stored', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('should return true if token exists', () => {
      localStorage.setItem('spotify_token', 'some_token')
      expect(isAuthenticated()).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear all auth data', () => {
      localStorage.setItem('spotify_token', 'token')
      localStorage.setItem('spotify_refresh_token', 'refresh')
      localStorage.setItem('spotify_token_expiry', '12345')
      sessionStorage.setItem('spotify_code_verifier', 'verifier')

      logout()

      expect(localStorage.getItem('spotify_token')).toBeNull()
      expect(localStorage.getItem('spotify_refresh_token')).toBeNull()
      expect(localStorage.getItem('spotify_token_expiry')).toBeNull()
      expect(sessionStorage.getItem('spotify_code_verifier')).toBeNull()
    })
  })
})
