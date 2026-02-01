import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app-store'
import { mockEnrichedTrack, mockEnrichedTracks } from '@/test/fixtures/enriched-tracks'

describe('app-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      tracks: [],
      playlistName: '',
      playlistId: '',
      filters: {
        selectedGenres: [],
        popularityRange: [0, 100],
      },
      uiSettings: {
        showTrackNumbers: false,
        showPopularity: false,
      },
      enrichmentSettings: {
        useLastfmTrackTags: false,
        useLastfmArtistTags: false,
      },
    })
  })

  describe('tracks management', () => {
    it('should set tracks', () => {
      const { setTracks } = useAppStore.getState()
      setTracks(mockEnrichedTracks)

      const { tracks } = useAppStore.getState()
      expect(tracks).toHaveLength(3)
      expect(tracks).toEqual(mockEnrichedTracks)
    })

    it('should add tracks', () => {
      const { setTracks, addTracks } = useAppStore.getState()
      setTracks([mockEnrichedTrack])

      addTracks([mockEnrichedTracks[1]])

      const { tracks } = useAppStore.getState()
      expect(tracks).toHaveLength(2)
      expect(tracks[0]).toEqual(mockEnrichedTrack)
      expect(tracks[1]).toEqual(mockEnrichedTracks[1])
    })

    it('should update track genres', () => {
      const { setTracks, updateTrackGenres } = useAppStore.getState()
      setTracks([mockEnrichedTrack])

      updateTrackGenres('track_1', {
        allGenres: ['new-genre'],
        enrichmentStatus: 'complete',
      })

      const { tracks } = useAppStore.getState()
      expect(tracks[0].allGenres).toEqual(['new-genre'])
      expect(tracks[0].enrichmentStatus).toBe('complete')
    })

    it('should update multiple track genres', () => {
      const { setTracks, updateMultipleTrackGenres } = useAppStore.getState()
      setTracks(mockEnrichedTracks)

      const updates = new Map([
        ['track_1', { allGenres: ['updated-1'] }],
        ['track_2', { allGenres: ['updated-2'] }],
      ])

      updateMultipleTrackGenres(updates)

      const { tracks } = useAppStore.getState()
      expect(tracks[0].allGenres).toEqual(['updated-1'])
      expect(tracks[1].allGenres).toEqual(['updated-2'])
      expect(tracks[2].allGenres).toEqual(['jazz', 'bebop', 'swing']) // Unchanged
    })

    it('should clear tracks', () => {
      const { setTracks, setPlaylistInfo, clearTracks } = useAppStore.getState()
      setTracks(mockEnrichedTracks)
      setPlaylistInfo('playlist-123', 'Test Playlist')

      clearTracks()

      const { tracks, playlistName, playlistId } = useAppStore.getState()
      expect(tracks).toHaveLength(0)
      expect(playlistName).toBe('')
      expect(playlistId).toBe('')
    })
  })

  describe('playlist info', () => {
    it('should set playlist info', () => {
      const { setPlaylistInfo } = useAppStore.getState()
      setPlaylistInfo('playlist-123', 'My Playlist')

      const { playlistId, playlistName } = useAppStore.getState()
      expect(playlistId).toBe('playlist-123')
      expect(playlistName).toBe('My Playlist')
    })
  })

  describe('loading state', () => {
    it('should set loading state', () => {
      const { setLoading } = useAppStore.getState()
      setLoading({
        isLoading: true,
        stage: 'loading',
        message: 'Loading tracks...',
      })

      const { loading } = useAppStore.getState()
      expect(loading.isLoading).toBe(true)
      expect(loading.stage).toBe('loading')
      expect(loading.message).toBe('Loading tracks...')
    })

    it('should reset loading state', () => {
      const { setLoading, resetLoading } = useAppStore.getState()
      setLoading({ isLoading: true, stage: 'loading' })

      resetLoading()

      const { loading } = useAppStore.getState()
      expect(loading.isLoading).toBe(false)
      expect(loading.stage).toBe('idle')
    })
  })

  describe('filters', () => {
    it('should set selected genres', () => {
      const { setSelectedGenres } = useAppStore.getState()
      setSelectedGenres(['rock', 'indie'])

      const { filters } = useAppStore.getState()
      expect(filters.selectedGenres).toEqual(['rock', 'indie'])
    })

    it('should toggle genre on', () => {
      const { toggleGenre } = useAppStore.getState()
      toggleGenre('rock')

      const { filters } = useAppStore.getState()
      expect(filters.selectedGenres).toContain('rock')
    })

    it('should toggle genre off', () => {
      const { setSelectedGenres, toggleGenre } = useAppStore.getState()
      setSelectedGenres(['rock', 'indie'])

      toggleGenre('rock')

      const { filters } = useAppStore.getState()
      expect(filters.selectedGenres).not.toContain('rock')
      expect(filters.selectedGenres).toContain('indie')
    })

    it('should set popularity range', () => {
      const { setPopularityRange } = useAppStore.getState()
      setPopularityRange([20, 80])

      const { filters } = useAppStore.getState()
      expect(filters.popularityRange).toEqual([20, 80])
    })

    it('should reset filters', () => {
      const { setSelectedGenres, setPopularityRange, resetFilters } = useAppStore.getState()
      setSelectedGenres(['rock'])
      setPopularityRange([20, 80])

      resetFilters()

      const { filters } = useAppStore.getState()
      expect(filters.selectedGenres).toEqual([])
      expect(filters.popularityRange).toEqual([0, 100])
    })
  })

  describe('UI settings', () => {
    it('should set show track numbers', () => {
      const { setShowTrackNumbers } = useAppStore.getState()
      setShowTrackNumbers(true)

      const { uiSettings } = useAppStore.getState()
      expect(uiSettings.showTrackNumbers).toBe(true)
    })

    it('should set show popularity', () => {
      const { setShowPopularity } = useAppStore.getState()
      setShowPopularity(true)

      const { uiSettings } = useAppStore.getState()
      expect(uiSettings.showPopularity).toBe(true)
    })

    it('should reset UI settings', () => {
      const { setShowTrackNumbers, setShowPopularity, resetUISettings } = useAppStore.getState()
      setShowTrackNumbers(true)
      setShowPopularity(true)

      resetUISettings()

      const { uiSettings } = useAppStore.getState()
      expect(uiSettings.showTrackNumbers).toBe(false)
      expect(uiSettings.showPopularity).toBe(false)
    })
  })

  describe('enrichment settings', () => {
    it('should set use lastfm track tags', () => {
      const { setUseLastfmTrackTags } = useAppStore.getState()
      setUseLastfmTrackTags(true)

      const { enrichmentSettings } = useAppStore.getState()
      expect(enrichmentSettings.useLastfmTrackTags).toBe(true)
    })

    it('should set use lastfm artist tags', () => {
      const { setUseLastfmArtistTags } = useAppStore.getState()
      setUseLastfmArtistTags(true)

      const { enrichmentSettings } = useAppStore.getState()
      expect(enrichmentSettings.useLastfmArtistTags).toBe(true)
    })

    it('should reset enrichment settings', () => {
      const {
        setUseLastfmTrackTags,
        setUseLastfmArtistTags,
        resetEnrichmentSettings,
      } = useAppStore.getState()
      setUseLastfmTrackTags(true)
      setUseLastfmArtistTags(true)

      resetEnrichmentSettings()

      const { enrichmentSettings } = useAppStore.getState()
      expect(enrichmentSettings.useLastfmTrackTags).toBe(false)
      expect(enrichmentSettings.useLastfmArtistTags).toBe(false)
    })
  })
})
