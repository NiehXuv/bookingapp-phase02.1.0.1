import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = 'https://pixabay.com/api';

export interface PixabayImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  publishedAt: string;
  likeCount?: string;
  commentCount?: string;
  shareCount?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'POST';
  mediaUrl?: string;
  permalink: string;
  isShort: boolean;
  source: 'Pixabay Image' | 'Pixabay Video';
  tags?: string[];
  views?: number;
  downloads?: number;
}

class PixabayService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_CONFIG.PIXABAY?.API_KEY || '';
  }

  // Fetch Vietnam travel images from Pixabay
  async fetchVietnamTravelImages(maxResults: number = 20): Promise<PixabayImage[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_PIXABAY_API_KEY_HERE') {
        console.warn('Pixabay API key not configured, using mock data');
        return this.generateMockPixabayData(maxResults);
      }

      const allContent: PixabayImage[] = [];
      
      // Vietnam travel search queries
      const searchQueries = [
        'vietnam travel',
        'vietnamese food',
        'hanoi vietnam',
        'ho chi minh city',
        'hoi an vietnam',
        'sapa vietnam',
        'ha long bay',
        'vietnam culture',
        'vietnam temple',
        'vietnam street food'
      ];

      // Get images from multiple queries - use more queries for better results
      for (const query of searchQueries.slice(0, Math.min(5, searchQueries.length))) {
        try {
          // Fetch more per query to ensure we have enough after filtering
          const queryAmount = Math.ceil(maxResults * 1.5 / 5);
          const queryContent = await this.searchImages(query, queryAmount);
          allContent.push(...queryContent);
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
        }
      }

      if (allContent.length > 0) {
        console.log(`✅ Pixabay API returned ${allContent.length} items`);
        const shuffled = this.shuffleArray(allContent);
        // Return all available content (no artificial limit)
        return shuffled;
      }

      // Fallback to mock data
      console.warn('⚠️ Pixabay API returned no results, using mock data');
      return this.generateMockPixabayData(maxResults);

    } catch (error) {
      console.error('Error fetching Pixabay content:', error);
      return this.generateMockPixabayData(maxResults);
    }
  }

  // Search for images with a specific query
  private async searchImages(query: string, maxResults: number): Promise<PixabayImage[]> {
    try {
      // Use default per_page (20) as per Pixabay API docs
      const url = `${BASE_URL}/?key=${this.apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&lang=en`;
      console.log('🔍 Pixabay API URL:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pixabay API error ${response.status}:`, errorText);
        throw new Error(`Pixabay API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.hits || data.hits.length === 0) {
        return [];
      }

      // Transform and filter images
      const images = data.hits
        .filter((hit: any) => {
          // Check for valid image URL and tags
          const hasValidUrl = hit.webformatURL || hit.largeImageURL || hit.imageURL;
          const hasValidTags = hit.tags && hit.tags.length > 0;
          
          if (!hasValidUrl) {
            console.warn(`⚠️ Pixabay: Skipping hit ${hit.id} - no valid image URL`);
          }
          if (!hasValidTags) {
            console.warn(`⚠️ Pixabay: Skipping hit ${hit.id} - no valid tags`);
          }
          
          return hasValidUrl && hasValidTags;
        })
        .slice(0, maxResults)
        .map((hit: any) => this.transformPixabayData(hit));

      return images;

    } catch (error) {
      console.error(`Error searching Pixabay for "${query}":`, error);
      return [];
    }
  }

  // Transform Pixabay API response to our format
  private transformPixabayData(hit: any): PixabayImage {
    // Ensure we have a valid image URL
    const imageUrl = hit.webformatURL || hit.largeImageURL || hit.imageURL;
    
    if (!imageUrl) {
      console.error('❌ Pixabay: No valid image URL found for hit:', hit);
      // Fallback to a placeholder image
      return {
        id: `pixabay_fallback_${hit.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.extractTitle(hit.tags),
        description: `Beautiful ${hit.tags.split(',')[0]} in Vietnam! Experience the stunning landscapes, rich culture, and amazing adventures this destination offers.`,
        imageUrl: this.getRandomVietnamImage(), // Use fallback image
        authorName: hit.user || 'Photographer',
        publishedAt: new Date().toISOString(),
        likeCount: hit.likes?.toString() || '0',
        commentCount: '0',
        shareCount: '0',
        mediaType: 'IMAGE',
        mediaUrl: this.getRandomVietnamImage(),
        permalink: hit.pageURL || `https://pixabay.com/photos/${hit.id}`,
        isShort: false,
        source: 'Pixabay Image',
        tags: hit.tags.split(',').map((tag: string) => tag.trim()),
        views: hit.views,
        downloads: hit.downloads
      };
    }

    return {
      id: `pixabay_${hit.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.extractTitle(hit.tags),
        description: `Beautiful ${hit.tags.split(',')[0]} in Vietnam! Experience the stunning landscapes, rich culture, and amazing adventures this destination offers.`,
        imageUrl: imageUrl,
        authorName: hit.user || 'Photographer',
        publishedAt: new Date().toISOString(),
        likeCount: hit.likes?.toString() || '0',
        commentCount: '0',
        shareCount: '0',
        mediaType: 'IMAGE',
        mediaUrl: imageUrl,
        permalink: hit.pageURL || `https://pixabay.com/photos/${hit.id}`,
        isShort: false,
        source: 'Pixabay Image',
        tags: hit.tags.split(',').map((tag: string) => tag.trim()),
        views: hit.views,
        downloads: hit.downloads
    };
  }

  // Extract title from tags
  private extractTitle(tags: string): string {
    if (!tags) return 'Vietnam Travel';
    
    const tagArray = tags.split(',');
    const firstTag = tagArray[0].trim();
    
    if (firstTag.length > 5 && firstTag.length < 50) {
      return `${firstTag.charAt(0).toUpperCase() + firstTag.slice(1)} in Vietnam 🇻🇳`;
    }
    
    return 'Vietnam Travel Experience 🇻🇳';
  }

  // Generate mock Pixabay data for fallback
  private generateMockPixabayData(count: number): PixabayImage[] {
    const mockData: PixabayImage[] = [];
    const locations = ['Hanoi', 'Ho Chi Minh City', 'Hoi An', 'Sapa', 'Nha Trang', 'Hue', 'Phu Quoc', 'Ha Long Bay'];
    const activities = ['Temple Visit', 'Street Food Tour', 'Beach Day', 'Mountain Trek', 'City Tour', 'Cultural Experience', 'Boat Trip', 'Market Visit'];
    const tags = ['vietnam', 'travel', 'culture', 'food', 'temple', 'beach', 'mountain', 'city'];
    
    for (let i = 0; i < count; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 4);
      
      mockData.push({
        id: `pixabay_mock_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${activity} in ${location}, Vietnam 🇻🇳`,
        description: `Amazing ${activity.toLowerCase()} experience in beautiful ${location}! The culture, history, and people here are incredible. Must visit destination for any traveler. #Vietnam #${location.replace(/\s+/g, '')} #Travel #Culture`,
        imageUrl: this.getRandomVietnamImage(),
        authorName: `Photographer${Math.floor(Math.random() * 1000)}`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: (Math.floor(Math.random() * 200) + 5).toString(),
        commentCount: '0',
        shareCount: '0',
        mediaType: 'IMAGE',
        mediaUrl: this.getRandomVietnamImage(),
        permalink: `https://pixabay.com/photos/${Math.random().toString(36).substr(2, 9)}`,
        isShort: false,
        source: 'Pixabay Image',
        tags: randomTags,
        views: Math.floor(Math.random() * 10000) + 100,
        downloads: Math.floor(Math.random() * 1000) + 10
      });
    }
    
    return mockData;
  }

  // Get random Vietnam travel image
  private getRandomVietnamImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop', // Hanoi
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=600&fit=crop', // Street food
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop', // Culture
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=600&fit=crop', // Food
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop'  // Travel
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Test Pixabay API connectivity
  async testApiKey(): Promise<boolean> {
    try {
      console.log('🧪 Testing Pixabay API connectivity...');
      
      if (!this.apiKey || this.apiKey === 'YOUR_PIXABAY_API_KEY_HERE') {
        console.error('❌ Pixabay API key not configured');
        return false;
      }
      
      console.log('✅ Pixabay API key is configured');
      
      // Test with a simple search
      const response = await fetch(
        `${BASE_URL}/?key=${this.apiKey}&q=vietnam&per_page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pixabay API is working:', data.totalHits || 0, 'total images found');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Pixabay API test failed:', response.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Pixabay API test error:', error);
      return false;
    }
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
}

export const pixabayService = new PixabayService();
export default PixabayService;
