import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = 'https://api.pexels.com/v1';

export interface PexelsImage {
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
  source: 'Pexels Image' | 'Pexels Video';
  tags?: string[];
  views?: number;
  downloads?: number;
  width?: number;
  height?: number;
  avgColor?: string;
}

class PexelsService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_CONFIG.PEXELS?.API_KEY || '';
  }

  // Fetch Vietnam travel images from Pexels
  async fetchVietnamTravelImages(maxResults: number = 20): Promise<PexelsImage[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
        console.warn('Pexels API key not configured, using mock data');
        return this.generateMockPexelsData(maxResults);
      }

      const allContent: PexelsImage[] = [];
      
      // Vietnam travel search queries optimized for Pexels
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
        'vietnam street food',
        'vietnam landscape',
        'vietnam architecture'
      ];

      // Get images from multiple queries - use more queries for better results
      for (const query of searchQueries.slice(0, Math.min(6, searchQueries.length))) {
        try {
          // Fetch more per query to ensure we have enough after filtering
          const queryAmount = Math.ceil(maxResults * 1.5 / 6);
          const queryContent = await this.searchImages(query, queryAmount);
          allContent.push(...queryContent);
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
        }
      }

      if (allContent.length > 0) {
        console.log(`✅ Pexels API returned ${allContent.length} items`);
        const shuffled = this.shuffleArray(allContent);
        // Return all available content (no artificial limit)
        return shuffled;
      }

      // Fallback to mock data
      console.warn('⚠️ Pexels API returned no results, using mock data');
      return this.generateMockPexelsData(maxResults);

    } catch (error) {
      console.error('Error fetching Pexels content:', error);
      return this.generateMockPexelsData(maxResults);
    }
  }

  // Search for images with a specific query
  private async searchImages(query: string, maxResults: number): Promise<PexelsImage[]> {
    try {
      // Pexels API parameters
      const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${Math.min(maxResults, 80)}&orientation=portrait&size=medium`;
      console.log('🔍 Pexels API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pexels API error ${response.status}:`, errorText);
        throw new Error(`Pexels API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.photos || data.photos.length === 0) {
        return [];
      }

      // Transform and filter images
      const images = data.photos
        .filter((photo: any) => {
          // Check for valid image URL
          const hasValidUrl = photo.src?.medium || photo.src?.large || photo.src?.original;
          
          if (!hasValidUrl) {
            console.warn(`⚠️ Pexels: Skipping photo ${photo.id} - no valid image URL`);
          }
          
          return hasValidUrl;
        })
        .slice(0, maxResults)
        .map((photo: any) => this.transformPexelsData(photo));

      return images;

    } catch (error) {
      console.error(`Error searching Pexels for "${query}":`, error);
      return [];
    }
  }

  // Transform Pexels API response to our format
  private transformPexelsData(photo: any): PexelsImage {
    // Ensure we have a valid image URL
    const imageUrl = photo.src?.medium || photo.src?.large || photo.src?.original;
    
    if (!imageUrl) {
      console.error('❌ Pexels: No valid image URL found for photo:', photo);
      // Fallback to a placeholder image
      return {
        id: `pexels_fallback_${photo.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.extractTitle(photo.alt || 'Vietnam Travel'),
        description: `Beautiful ${photo.alt || 'Vietnam'} in Vietnam! Experience the stunning landscapes, rich culture, and amazing adventures this destination offers.`,
        imageUrl: this.getRandomVietnamImage(),
        authorName: photo.photographer || 'Photographer',
        publishedAt: new Date().toISOString(),
        likeCount: '0',
        commentCount: '0',
        shareCount: '0',
        mediaType: 'IMAGE',
        mediaUrl: this.getRandomVietnamImage(),
        permalink: photo.url || `https://www.pexels.com/photo/${photo.id}`,
        isShort: false,
        source: 'Pexels Image',
        tags: photo.alt ? [photo.alt, 'vietnam', 'travel'] : ['vietnam', 'travel'],
        views: 0,
        downloads: 0,
        width: photo.width,
        height: photo.height,
        avgColor: photo.avg_color
      };
    }

    return {
      id: `pexels_${photo.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.extractTitle(photo.alt || 'Vietnam Travel'),
        description: `Beautiful ${photo.alt || 'Vietnam'} in Vietnam! Experience the stunning landscapes, rich culture, and amazing adventures this destination offers.`,
        imageUrl: imageUrl,
        authorName: photo.photographer || 'Photographer',
        publishedAt: new Date().toISOString(),
        likeCount: '0',
        commentCount: '0',
        shareCount: '0',
        mediaType: 'IMAGE',
        mediaUrl: imageUrl,
        permalink: photo.url || `https://www.pexels.com/photo/${photo.id}`,
        isShort: false,
        source: 'Pexels Image',
        tags: photo.alt ? [photo.alt, 'vietnam', 'travel'] : ['vietnam', 'travel'],
        views: 0,
        downloads: 0,
        width: photo.width,
        height: photo.height,
        avgColor: photo.avg_color
    };
  }

  // Extract title from alt text
  private extractTitle(alt: string): string {
    if (!alt) return 'Vietnam Travel';
    
    if (alt.length > 5 && alt.length < 50) {
      return `${alt.charAt(0).toUpperCase() + alt.slice(1)} in Vietnam 🇻🇳`;
    }
    
    return 'Vietnam Travel Experience 🇻🇳';
  }

  // Generate mock Pexels data for fallback
  private generateMockPexelsData(count: number): PexelsImage[] {
    const mockData: PexelsImage[] = [];
    const locations = ['Hanoi', 'Ho Chi Minh City', 'Hoi An', 'Sapa', 'Nha Trang', 'Hue', 'Phu Quoc', 'Ha Long Bay'];
    const activities = ['Temple Visit', 'Street Food Tour', 'Beach Day', 'Mountain Trek', 'City Tour', 'Cultural Experience', 'Boat Trip', 'Market Visit'];
    const tags = ['vietnam', 'travel', 'culture', 'food', 'temple', 'beach', 'mountain', 'city'];
    
    for (let i = 0; i < count; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 4);
      
      mockData.push({
        id: `pexels_mock_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
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
        permalink: `https://www.pexels.com/photo/${Math.random().toString(36).substr(2, 9)}`,
        isShort: false,
        source: 'Pexels Image',
        tags: randomTags,
        views: Math.floor(Math.random() * 10000) + 100,
        downloads: Math.floor(Math.random() * 1000) + 10,
        width: 800,
        height: 1200,
        avgColor: '#4A90E2'
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

  // Test Pexels API connectivity
  async testApiKey(): Promise<boolean> {
    try {
      console.log('🧪 Testing Pexels API connectivity...');
      
      if (!this.apiKey || this.apiKey === 'YOUR_PEXELS_API_KEY_HERE') {
        console.error('❌ Pexels API key not configured');
        return false;
      }
      
      console.log('✅ Pexels API key is configured');
      
      // Test with a simple search
      const response = await fetch(
        `${BASE_URL}/search?query=vietnam&per_page=1`,
        {
          headers: {
            'Authorization': this.apiKey
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pexels API is working:', data.total_results || 0, 'total photos found');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Pexels API test failed:', response.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Pexels API test error:', error);
      return false;
    }
  }

  // Shuffle array for variety
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[j], shuffled[i]] = [shuffled[i], shuffled[j]];
    }
    return shuffled;
  }
}

export const pexelsService = new PexelsService();
export default PexelsService;
