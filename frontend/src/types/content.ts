// Content types for the masonry layout
export interface ContentItem {
  id: string;
  imageUrl: string;
  title: string;
  source: 'YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels' | 'Mock';
  originalUrl?: string;
  engagement: {
    likes: number;
    comments: number;
    views?: number;
    shares?: number;
  };
  isShort: boolean;
  duration?: string;
  channelTitle?: string;
  publishedAt?: string;
  description?: string;
  playButton?: boolean;
  // Pinterest-style options
  optionsBtn?: boolean;
  metaTitle?: string;
}

// YouTube specific types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  duration?: string;
  isShort: boolean;
}

// Content source types
export type ContentSource = 'YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels' | 'Mock';

// Content filter options
export interface ContentFilters {
  source?: ContentSource[];
  duration?: 'short' | 'medium' | 'long';
  location?: string[];
  category?: string[];
}

// Content fetch options
export interface FetchOptions {
  maxResults: number;
  filters?: ContentFilters;
  pageToken?: string;
  refresh?: boolean;
}
