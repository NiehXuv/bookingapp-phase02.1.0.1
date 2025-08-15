import { ContentItem } from '../types/content';
import { youtubeService } from './youtubeService';
import { tripAdvisorService } from './tripadvisorService';
import { pixabayService } from './pixabayService';
import { pexelsService } from './pexelsService';

export interface ContentFetchOptions {
  sources: ('YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels')[];
  maxResults: number;
  refresh?: boolean;
}

class ContentService {
  // Fetch content from multiple sources
  async fetchContent(options: ContentFetchOptions): Promise<ContentItem[]> {
    const { sources, maxResults = 20, refresh = false } = options; // Default to 20 for better performance
    const allContent: ContentItem[] = [];

    console.log(`🚀 ContentService: Starting fetch with sources=${sources.join(', ')}, maxResults=${maxResults}, refresh=${refresh}`);

    // Generate a random offset for fresh content when refresh is true
    const randomOffset = refresh ? Math.floor(Math.random() * 1000) : 0;
    if (refresh) {
      console.log(`🔄 Refresh mode: Using random offset ${randomOffset} for fresh content`);
    }

    try {
      // Fetch from YouTube if requested
      if (sources.includes('YouTube Shorts')) {
        try {
          // Fetch more content to ensure we have enough after filtering
          const fetchAmount = Math.ceil(maxResults * 1.5 / sources.length);
          // Add offset when refreshing to get fresh content
          const adjustedAmount = refresh ? fetchAmount + Math.floor(randomOffset / 100) : fetchAmount;
          console.log(`🎬 ContentService: Fetching YouTube content (maxResults=${adjustedAmount}, refresh=${refresh})`);
          const youtubeVideos = await youtubeService.fetchVietnamTravelShorts(adjustedAmount);
          console.log(`✅ ContentService: YouTube returned ${youtubeVideos.length} videos`);
          
          const youtubeContent = youtubeVideos.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            imageUrl: video.thumbnailUrl,
            channelTitle: video.channelTitle,
            publishedAt: video.publishedAt,
            duration: video.duration,
            isShort: video.isShort,
            originalUrl: `https://www.youtube.com/watch?v=${video.id}`,
            source: 'YouTube Shorts' as const,
            engagement: {
              views: parseInt(video.viewCount || '0'),
              likes: parseInt(video.likeCount || '0'),
              comments: parseInt(video.commentCount || '0'),
              shares: 0
            }
          }));
          allContent.push(...youtubeContent);
        } catch (error) {
          console.error('❌ ContentService: Error fetching YouTube content:', error);
        }
      }

      // Fetch from TripAdvisor if requested
      if (sources.includes('TripAdvisor')) {
        try {
          // Fetch more content to ensure we have enough after filtering
          const fetchAmount = Math.ceil(maxResults * 1.5 / sources.length);
          // Add offset when refreshing to get fresh content
          const adjustedAmount = refresh ? fetchAmount + Math.floor(randomOffset / 100) : fetchAmount;
          console.log(`🗺️ ContentService: Fetching TripAdvisor content (maxResults=${adjustedAmount}, refresh=${refresh})`);
          const tripAdvisorLocations = await tripAdvisorService.fetchVietnamTravelContent(adjustedAmount);
          console.log(`✅ ContentService: TripAdvisor returned ${tripAdvisorLocations.length} locations`);
          
          const tripAdvisorContent = tripAdvisorLocations.map(location => ({
            id: location.id,
            title: location.title,
            description: location.description,
            imageUrl: location.imageUrl,
            channelTitle: location.authorName,
            publishedAt: location.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: location.permalink,
            source: 'TripAdvisor' as const,
            engagement: {
              views: 0,
              likes: parseInt(location.likeCount || '0'),
              comments: parseInt(location.commentCount || '0'),
              shares: parseInt(location.shareCount || '0')
            }
          }));
          allContent.push(...tripAdvisorContent);
        } catch (error) {
          console.error('❌ ContentService: Error fetching TripAdvisor content:', error);
        }
      }

      // Fetch from Pixabay if requested
      if (sources.includes('Pixabay')) {
        try {
          // Fetch more content to ensure we have enough after filtering
          const fetchAmount = Math.ceil(maxResults * 1.5 / sources.length);
          // Add offset when refreshing to get fresh content
          const adjustedAmount = refresh ? fetchAmount + Math.floor(randomOffset / 100) : fetchAmount;
          console.log(`🖼️ ContentService: Fetching Pixabay content (maxResults=${adjustedAmount}, refresh=${refresh})`);
          const pixabayImages = await pixabayService.fetchVietnamTravelImages(adjustedAmount);
          console.log(`✅ ContentService: Pixabay returned ${pixabayImages.length} images`);
          
          const pixabayContent = pixabayImages.map(image => ({
            id: image.id,
            title: image.title,
            description: image.description,
            imageUrl: image.imageUrl,
            channelTitle: image.authorName,
            publishedAt: image.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: image.permalink,
            source: 'Pixabay' as const,
            engagement: {
              views: image.views || 0,
              likes: parseInt(image.likeCount || '0'),
              comments: parseInt(image.commentCount || '0'),
              shares: parseInt(image.shareCount || '0')
            }
          }));
          allContent.push(...pixabayContent);
        } catch (error) {
          console.error('❌ ContentService: Error fetching Pixabay content:', error);
        }
      }

      // Fetch from Pexels if requested
      if (sources.includes('Pexels')) {
        try {
          // Fetch more content to ensure we have enough after filtering
          const fetchAmount = Math.ceil(maxResults * 1.5 / sources.length);
          // Add offset when refreshing to get fresh content
          const adjustedAmount = refresh ? fetchAmount + Math.floor(randomOffset / 100) : fetchAmount;
          console.log(`📸 ContentService: Fetching Pexels content (maxResults=${adjustedAmount}, refresh=${refresh})`);
          const pexelsImages = await pexelsService.fetchVietnamTravelImages(adjustedAmount);
          console.log(`✅ ContentService: Pexels returned ${pexelsImages.length} images`);
          
          const pexelsContent = pexelsImages.map(image => ({
            id: image.id,
            title: image.title,
            description: image.description,
            imageUrl: image.imageUrl,
            channelTitle: image.authorName,
            publishedAt: image.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: image.permalink,
            source: 'Pexels' as const,
            engagement: {
              views: image.views || 0,
              likes: parseInt(image.likeCount || '0'),
              comments: parseInt(image.commentCount || '0'),
              shares: parseInt(image.shareCount || '0')
            }
          }));
          allContent.push(...pexelsContent);
        } catch (error) {
          console.error('❌ ContentService: Error fetching Pexels content:', error);
        }
      }

      // Shuffle and return all available content
      // Use enhanced shuffling when refreshing to get different content order
      const shuffled = refresh ? this.shuffleArray(allContent, randomOffset) : this.shuffleArray(allContent);
      
      // Return all content we fetched (no artificial limit)
      const finalResult = shuffled;
      
      // Log detailed breakdown
      console.log(`🎯 ContentService: Final result - ${finalResult.length} items from ${allContent.length} total fetched`);
      console.log(`📊 ContentService: Breakdown - YouTube: ${allContent.filter(c => c.source === 'YouTube Shorts').length}, TripAdvisor: ${allContent.filter(c => c.source === 'TripAdvisor').length}, Pixabay: ${allContent.filter(c => c.source === 'Pixabay').length}, Pexels: ${allContent.filter(c => c.source === 'Pexels').length}`);
      console.log(`📈 ContentService: Efficiency - 100% of fetched content used (no artificial limits)`);
      
      return finalResult;

    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  }

  // Fetch content from a specific source
  async fetchFromSource(source: 'YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels', maxResults: number = 20): Promise<ContentItem[]> {
    try {
      if (source === 'YouTube Shorts') {
        const videos = await youtubeService.fetchVietnamTravelShorts(maxResults);
        return videos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          imageUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          duration: video.duration,
          isShort: video.isShort,
          originalUrl: `https://www.youtube.com/watch?v=${video.id}`,
          source: 'YouTube Shorts' as const,
          engagement: {
            views: parseInt(video.viewCount || '0'),
            likes: parseInt(video.likeCount || '0'),
            comments: parseInt(video.commentCount || '0'),
            shares: 0
          }
        }));
      } else if (source === 'TripAdvisor') {
        const locations = await tripAdvisorService.fetchVietnamTravelContent(maxResults);
        return locations.map(location => ({
          id: location.id,
          title: location.title,
          description: location.description,
          imageUrl: location.imageUrl,
          channelTitle: location.authorName,
          publishedAt: location.publishedAt,
          duration: undefined,
          isShort: false,
          originalUrl: location.permalink,
          source: 'TripAdvisor' as const,
          engagement: {
            views: 0,
            likes: parseInt(location.likeCount || '0'),
            comments: parseInt(location.commentCount || '0'),
            shares: parseInt(location.shareCount || '0')
          }
        }));
      } else if (source === 'Pixabay') {
        const images = await pixabayService.fetchVietnamTravelImages(maxResults);
        return images.map(image => ({
          id: image.id,
          title: image.title,
          description: image.description,
          imageUrl: image.imageUrl,
          channelTitle: image.authorName,
          publishedAt: image.publishedAt,
          duration: undefined,
          isShort: false,
          originalUrl: image.permalink,
          source: 'Pixabay' as const,
          engagement: {
            views: image.views || 0,
            likes: parseInt(image.likeCount || '0'),
            comments: parseInt(image.commentCount || '0'),
            shares: parseInt(image.shareCount || '0')
          }
        }));
      } else if (source === 'Pexels') {
        const images = await pexelsService.fetchVietnamTravelImages(maxResults);
        return images.map(image => ({
          id: image.id,
          title: image.title,
          description: image.description,
          imageUrl: image.imageUrl,
          channelTitle: image.authorName,
          publishedAt: image.publishedAt,
          duration: undefined,
          isShort: false,
          originalUrl: image.permalink,
          source: 'Pexels' as const,
          engagement: {
            views: image.views || 0,
            likes: parseInt(image.likeCount || '0'),
            comments: parseInt(image.commentCount || '0'),
            shares: parseInt(image.shareCount || '0')
          }
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      return [];
    }
  }

  // Search content across all sources
  async searchContent(query: string, sources: ('YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels')[] = ['YouTube Shorts', 'TripAdvisor', 'Pixabay', 'Pexels']): Promise<ContentItem[]> {
    const allResults: ContentItem[] = [];

    try {
      if (sources.includes('YouTube Shorts')) {
        try {
          const youtubeResults = await youtubeService.fetchVietnamTravelShorts(10);
          const youtubeContent = youtubeResults.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            imageUrl: video.thumbnailUrl,
            channelTitle: video.channelTitle,
            publishedAt: video.publishedAt,
            duration: video.duration,
            isShort: video.isShort,
            originalUrl: `https://www.youtube.com/watch?v=${video.id}`,
            source: 'YouTube Shorts' as const,
            engagement: {
              views: parseInt(video.viewCount || '0'),
              likes: parseInt(video.likeCount || '0'),
              comments: parseInt(video.commentCount || '0'),
              shares: 0
            }
          }));
          allResults.push(...youtubeContent);
        } catch (error) {
          console.error('Error searching YouTube:', error);
        }
      }

      if (sources.includes('TripAdvisor')) {
        try {
          const tripAdvisorResults = await tripAdvisorService.fetchVietnamTravelContent(10);
          const tripAdvisorContent = tripAdvisorResults.map(location => ({
            id: location.id,
            title: location.title,
            description: location.description,
            imageUrl: location.imageUrl,
            channelTitle: location.authorName,
            publishedAt: location.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: location.permalink,
            source: 'TripAdvisor' as const,
            engagement: {
              views: 0,
              likes: parseInt(location.likeCount || '0'),
              comments: parseInt(location.commentCount || '0'),
              shares: parseInt(location.shareCount || '0')
            }
          }));
          allResults.push(...tripAdvisorContent);
        } catch (error) {
          console.error('Error searching TripAdvisor:', error);
        }
      }

      if (sources.includes('Pixabay')) {
        try {
          const pixabayResults = await pixabayService.fetchVietnamTravelImages(10);
          const pixabayContent = pixabayResults.map(image => ({
            id: image.id,
            title: image.title,
            description: image.description,
            imageUrl: image.imageUrl,
            channelTitle: image.authorName,
            publishedAt: image.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: image.permalink,
            source: 'Pixabay' as const,
            engagement: {
              views: image.views || 0,
              likes: parseInt(image.likeCount || '0'),
              comments: parseInt(image.commentCount || '0'),
              shares: parseInt(image.shareCount || '0')
            }
          }));
          allResults.push(...pixabayContent);
        } catch (error) {
          console.error('Error searching Pixabay:', error);
        }
      }

      if (sources.includes('Pexels')) {
        try {
          const pexelsResults = await pexelsService.fetchVietnamTravelImages(10);
          const pexelsContent = pexelsResults.map(image => ({
            id: image.id,
            title: image.title,
            description: image.description,
            imageUrl: image.imageUrl,
            channelTitle: image.authorName,
            publishedAt: image.publishedAt,
            duration: undefined,
            isShort: false,
            originalUrl: image.permalink,
            source: 'Pexels' as const,
            engagement: {
              views: image.views || 0,
              likes: parseInt(image.likeCount || '0'),
              comments: parseInt(image.commentCount || '0'),
              shares: parseInt(image.shareCount || '0')
            }
          }));
          allResults.push(...pexelsContent);
        } catch (error) {
          console.error('Error searching Pexels:', error);
        }
      }

      // Sort by relevance (simple implementation)
      return allResults.sort((a, b) => {
        const aRelevance = this.calculateRelevance(a, query);
        const bRelevance = this.calculateRelevance(b, query);
        return bRelevance - aRelevance;
      });

    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  // Calculate relevance score for search results
  private calculateRelevance(item: ContentItem, query: string): number {
    const searchTerm = query.toLowerCase();
    let score = 0;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(searchTerm)) {
      score += 10;
    }

    // Description match
    if (item.description && item.description.toLowerCase().includes(searchTerm)) {
      score += 5;
    }

    // Channel/author match
    if (item.channelTitle && item.channelTitle.toLowerCase().includes(searchTerm)) {
      score += 3;
    }

    // Engagement bonus
    score += Math.min(item.engagement.likes / 1000, 5);
    score += Math.min((item.engagement.views || 0) / 10000, 3);

    return score;
  }

  // Shuffle array for variety
  private shuffleArray<T>(array: T[], seed?: number): T[] {
    const shuffled = [...array];
    
    // Use seed for deterministic shuffling when provided
    if (seed !== undefined) {
      let seedValue = seed; // Create a local copy to avoid modifying the parameter
      const random = (max: number) => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return (seedValue / 233280) * max;
      };
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random(i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } else {
      // Use Math.random for normal shuffling
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    
    return shuffled;
  }

  // Get content statistics
  async getContentStats(): Promise<{ total: number; bySource: Record<string, number> }> {
    try {
      const [youtubeCount, tripAdvisorCount, pixabayCount, pexelsCount] = await Promise.all([
        youtubeService.fetchVietnamTravelShorts(1).then(() => 1).catch(() => 0),
        tripAdvisorService.fetchVietnamTravelContent(1).then(() => 1).catch(() => 0),
        pixabayService.fetchVietnamTravelImages(1).then(() => 1).catch(() => 0),
        pexelsService.fetchVietnamTravelImages(1).then(() => 1).catch(() => 0)
      ]);

      return {
        total: youtubeCount + tripAdvisorCount + pixabayCount + pexelsCount,
        bySource: {
          'YouTube Shorts': youtubeCount,
          'TripAdvisor': tripAdvisorCount,
          'Pixabay': pixabayCount,
          'Pexels': pexelsCount
        }
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      return { total: 0, bySource: {} };
    }
  }

  // Test TripAdvisor API key
  async testTripAdvisorApi(): Promise<boolean> {
    try {
      return await tripAdvisorService.testApiKey();
    } catch (error) {
      console.error('Error testing TripAdvisor API:', error);
      return false;
    }
  }

  // Test Pixabay API key
  async testPixabayApi(): Promise<boolean> {
    try {
      return await pixabayService.testApiKey();
    } catch (error) {
      console.error('Error testing Pixabay API:', error);
      return false;
    }
  }

  // Test Pexels API key
  async testPexelsApi(): Promise<boolean> {
    try {
      return await pexelsService.testApiKey();
    } catch (error) {
      console.error('Error testing Pexels API:', error);
      return false;
    }
  }
}

export const contentService = new ContentService();
export default ContentService;
