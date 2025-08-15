import { API_CONFIG, getYouTubeApiKey } from '../config/apiConfig';

const BASE_URL = API_CONFIG.YOUTUBE.BASE_URL;

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

export interface YouTubeSearchResponse {
  items: any[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

class YouTubeService {
  private apiKey: string;

  constructor() {
    this.apiKey = getYouTubeApiKey();
  }

  // Set API key (useful for testing different keys)
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Fetch Vietnam travel shorts
  async fetchVietnamTravelShorts(maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      console.log(`🎬 YouTube Service: Starting fetch with maxResults=${maxResults}`);
      
      const queries = [
        'Vietnam travel shorts',
        'Hanoi food shorts',
        'Ho Chi Minh city shorts',
        'Hoi An lantern shorts',
        'Sapa mountain shorts',
        'Nha Trang beach shorts',
        'Vietnam culture shorts',
        'Vietnamese street food shorts'
      ];

      // Fetch from single query to save quota (303 → 101 units)
      const allVideos: YouTubeVideo[] = [];
      
      // Use only 1 query to save quota (was 3 queries = 303 units, now 1 query = 101 units)
      console.log(`🔍 YouTube Service: Using query "${queries[0]}" to save quota`);
      const videos = await this.searchVideos(queries[0], maxResults);
      allVideos.push(...videos);

      // Shuffle and limit results
      const shuffled = this.shuffleArray(allVideos);
      const finalResult = shuffled.slice(0, maxResults);
      
      console.log(`✅ YouTube Service: Returning ${finalResult.length} videos (quota used: ~101 units)`);
      return finalResult;

    } catch (error) {
      console.error('❌ YouTube Service: Error fetching Vietnam travel shorts:', error);
      return [];
    }
  }

  // Search videos with Shorts filtering
  private async searchVideos(query: string, maxResults: number): Promise<YouTubeVideo[]> {
    try {
      console.log(`🔍 YouTube API: Searching for "${query}" with maxResults=${maxResults}`);
      
      // First, search for videos
      const searchUrl = `${BASE_URL}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `videoDuration=short&` + // Filter for short videos
        `maxResults=${maxResults * 2}&` + // Get more to filter from
        `key=${this.apiKey}`;
      
      console.log(`🔍 YouTube Search URL: ${searchUrl.replace(this.apiKey, '***API_KEY***')}`);
      
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        console.error(`❌ YouTube Search API error: ${searchResponse.status}`);
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      console.log(`✅ YouTube Search API: Found ${searchData.items?.length || 0} videos`);
      
      if (!searchData.items || searchData.items.length === 0) {
        console.warn(`⚠️ YouTube Search API: No videos found for "${query}"`);
        return [];
      }

      // Get video IDs for detailed info
      const videoIds = searchData.items.map(item => item.id.videoId);
      console.log(`🔍 YouTube API: Fetching details for ${videoIds.length} videos`);
      
      // Fetch detailed video information
      const videosUrl = `${BASE_URL}/videos?` +
        `part=snippet,statistics,contentDetails&` +
        `id=${videoIds.join(',')}&` +
        `key=${this.apiKey}`;
      
      console.log(`🔍 YouTube Videos URL: ${videosUrl.replace(this.apiKey, '***API_KEY***')}`);
      
      const videosResponse = await fetch(videosUrl);

      if (!videosResponse.ok) {
        console.error(`❌ YouTube Videos API error: ${videosResponse.status}`);
        throw new Error(`YouTube API error: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();
      console.log(`✅ YouTube Videos API: Retrieved ${videosData.items?.length || 0} video details`);
      
      // Transform and filter for actual Shorts
      const videos = videosData.items
        .map((item: any) => this.transformVideoData(item))
        .filter((video: YouTubeVideo) => video.isShort);

      console.log(`✅ YouTube API: Final result - ${videos.length} shorts after filtering`);
      return videos;

    } catch (error) {
      console.error(`Error searching videos for "${query}":`, error);
      return [];
    }
  }

  // Transform YouTube API response to our format
  private transformVideoData(item: any): YouTubeVideo {
    const snippet = item.snippet;
    const statistics = item.statistics || {};
    const contentDetails = item.contentDetails || {};

    // Check if it's likely a Short (duration under 60 seconds and 9:16 aspect ratio)
    const duration = this.parseDuration(contentDetails.duration);
    const isShort = duration <= 60;

    return {
      id: item.id,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      viewCount: statistics.viewCount,
      likeCount: statistics.likeCount,
      commentCount: statistics.commentCount,
      duration: this.formatDuration(duration),
      isShort
    };
  }

  // Parse YouTube duration format (PT15S, PT1M30S, etc.)
  private parseDuration(duration: string): number {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Format duration for display
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Shuffle array for variety
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&q=test&maxResults=1&key=${this.apiKey}`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const youtubeService = new YouTubeService();
export default YouTubeService;
