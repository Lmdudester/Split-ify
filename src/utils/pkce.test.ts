import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateCodeVerifier, generateCodeChallenge } from './pkce'

describe('PKCE utilities', () => {
  describe('generateCodeVerifier', () => {
    it('should generate a code verifier', () => {
      const verifier = generateCodeVerifier()
      expect(verifier).toBeDefined()
      expect(typeof verifier).toBe('string')
      expect(verifier.length).toBeGreaterThan(0)
    })

    it('should generate different verifiers on each call', () => {
      const verifier1 = generateCodeVerifier()
      const verifier2 = generateCodeVerifier()
      expect(verifier1).not.toBe(verifier2)
    })

    it('should generate URL-safe base64 strings', () => {
      const verifier = generateCodeVerifier()
      // Should not contain +, /, or =
      expect(verifier).not.toMatch(/[+/=]/)
      // Should only contain URL-safe characters
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate strings of expected length', () => {
      const verifier = generateCodeVerifier()
      // 32 bytes encoded in base64 without padding should be 43 characters
      expect(verifier.length).toBe(43)
    })
  })

  describe('generateCodeChallenge', () => {
    it('should generate a code challenge from a verifier', async () => {
      const verifier = 'test-verifier'
      const challenge = await generateCodeChallenge(verifier)
      expect(challenge).toBeDefined()
      expect(typeof challenge).toBe('string')
      expect(challenge.length).toBeGreaterThan(0)
    })

    it('should generate consistent challenges for the same verifier', async () => {
      const verifier = 'test-verifier'
      const challenge1 = await generateCodeChallenge(verifier)
      const challenge2 = await generateCodeChallenge(verifier)
      expect(challenge1).toBe(challenge2)
    })

    it('should generate different challenges for different verifiers', async () => {
      const verifier1 = 'test-verifier-1'
      const verifier2 = 'test-verifier-2'
      const challenge1 = await generateCodeChallenge(verifier1)
      const challenge2 = await generateCodeChallenge(verifier2)
      expect(challenge1).not.toBe(challenge2)
    })

    it('should generate URL-safe base64 strings', async () => {
      const verifier = 'test-verifier'
      const challenge = await generateCodeChallenge(verifier)
      // Should not contain +, /, or =
      expect(challenge).not.toMatch(/[+/=]/)
      // Should only contain URL-safe characters
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate SHA-256 hash of expected length', async () => {
      const verifier = 'test-verifier'
      const challenge = await generateCodeChallenge(verifier)
      // SHA-256 produces 32 bytes, which in base64 without padding is 43 characters
      expect(challenge.length).toBe(43)
    })
  })

  describe('PKCE flow integration', () => {
    it('should generate valid verifier and challenge pair', async () => {
      const verifier = generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)

      expect(verifier).toBeDefined()
      expect(challenge).toBeDefined()
      expect(verifier).not.toBe(challenge)
      expect(verifier.length).toBe(43)
      expect(challenge.length).toBe(43)
    })
  })
})
