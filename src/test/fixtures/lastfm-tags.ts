/**
 * Mock data for Last.fm API responses
 */

export const mockTrackTags = {
  toptags: {
    tag: [
      { name: 'rock', count: 100 },
      { name: 'indie', count: 85 },
      { name: 'alternative', count: 70 },
      { name: 'indie rock', count: 65 },
      { name: 'alternative rock', count: 60 },
    ],
  },
}

export const mockArtistTags = {
  toptags: {
    tag: [
      { name: 'electronic', count: 100 },
      { name: 'dance', count: 95 },
      { name: 'house', count: 80 },
      { name: 'techno', count: 75 },
      { name: 'edm', count: 70 },
    ],
  },
}

export const mockEmptyTags = {
  toptags: {
    tag: [],
  },
}

export const mockFilteredTags = {
  toptags: {
    tag: [
      { name: 'rock', count: 100 },
      { name: '2015', count: 50 }, // Should be filtered out
      { name: 'seen live', count: 45 }, // Should be filtered out
      { name: 'indie', count: 85 },
      { name: 'favorite', count: 40 }, // Should be filtered out
    ],
  },
}

export const mockJazzTags = {
  toptags: {
    tag: [
      { name: 'jazz', count: 100 },
      { name: 'bebop', count: 80 },
      { name: 'swing', count: 75 },
      { name: 'smooth jazz', count: 70 },
      { name: 'vocal jazz', count: 65 },
    ],
  },
}

export const mockPopTags = {
  toptags: {
    tag: [
      { name: 'pop', count: 100 },
      { name: 'dance pop', count: 85 },
      { name: 'synthpop', count: 70 },
      { name: 'electropop', count: 65 },
    ],
  },
}
