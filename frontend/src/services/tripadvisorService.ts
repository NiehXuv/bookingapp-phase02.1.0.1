import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = 'https://api.content.tripadvisor.com/api/v1';

export interface TripAdvisorLocation {
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
  source: 'TripAdvisor Location' | 'TripAdvisor Photo' | 'TripAdvisor Review';
  locationString?: string;
  rating?: number;
  reviewCount?: number;
}

class TripAdvisorService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_CONFIG.TRIPADVISOR?.API_KEY || '';
  }

  // Fetch Vietnam travel locations and photos
  async fetchVietnamTravelContent(maxResults: number = 20): Promise<TripAdvisorLocation[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_TRIPADVISOR_API_KEY_HERE') {
        console.warn('TripAdvisor API key not configured, using mock data');
        return this.generateMockTripAdvisorData(maxResults);
      }

      const allContent: TripAdvisorLocation[] = [];
      
      // Vietnam travel destinations to search
      const vietnamDestinations = [
        'Hanoi',
        'Ho Chi Minh City',
        'Hoi An',
        'Sapa',
        'Nha Trang',
        'Hue',
        'Phu Quoc',
        'Ha Long Bay',
        'Mai Chau',
        'Da Nang'
      ];

      // Get content from multiple destinations - use more destinations for better results
      for (const destination of vietnamDestinations.slice(0, Math.min(8, vietnamDestinations.length))) {
        try {
          // Fetch more per destination to ensure we have enough after filtering
          const destinationAmount = Math.ceil(maxResults * 1.5 / 8);
          const locationContent = await this.getLocationContent(destination, destinationAmount);
          allContent.push(...locationContent);
        } catch (error) {
          console.error(`Error fetching content for ${destination}:`, error);
        }
      }

      if (allContent.length > 0) {
        console.log(`✅ TripAdvisor API returned ${allContent.length} items`);
        const shuffled = this.shuffleArray(allContent);
        // Return all available content (no artificial limit)
        return shuffled;
      }

      // Fallback to mock data
      console.warn('⚠️ TripAdvisor API returned no results, using mock data');
      return this.generateMockTripAdvisorData(maxResults);

    } catch (error) {
      console.error('Error fetching TripAdvisor content:', error);
      return this.generateMockTripAdvisorData(maxResults);
    }
  }

  // Get content for a specific location
  private async getLocationContent(locationName: string, maxResults: number): Promise<TripAdvisorLocation[]> {
    try {
      // Step 1: Search for location
      const locationResponse = await fetch(
        `${BASE_URL}/location/search?` +
        `key=${this.apiKey}&` +
        `searchQuery=${encodeURIComponent(locationName + ' Vietnam')}&` +
        `language=en`
      );

      if (!locationResponse.ok) {
        throw new Error(`Location search failed: ${locationResponse.status}`);
      }

      const locationData = await locationResponse.json();
      
      if (!locationData.data || locationData.data.length === 0) {
        return [];
      }

      const location = locationData.data[0];
      const locationId = location.location_id;

      // Step 2: Get photos for this location
      const photosResponse = await fetch(
        `${BASE_URL}/location/${locationId}/photos?` +
        `key=${this.apiKey}&` +
        `language=en`
      );

      if (!photosResponse.ok) {
        return [this.transformLocationToContent(location)];
      }

      const photosData = await photosResponse.json();
      
      if (!photosData.data || photosData.data.length === 0) {
        return [this.transformLocationToContent(location)];
      }

      // Transform photos to content
      const photoContent = photosData.data
        .slice(0, maxResults)
        .map((photo: any) => this.transformPhotoToContent(photo, location));

      return photoContent;

    } catch (error) {
      console.error(`Error getting content for ${locationName}:`, error);
      return [];
    }
  }

  // Transform location data to content format
  private transformLocationToContent(location: any): TripAdvisorLocation {
    // Create unique ID for location content
    const uniqueId = `tripadvisor_location_${location.location_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: uniqueId,
      title: location.name || 'Vietnam Travel Destination',
      description: `Amazing ${location.name} experience in Vietnam! Discover the beauty, culture, and adventure this incredible destination has to offer.`,
      imageUrl: this.getRandomVietnamImage(),
      authorName: 'TripAdvisor',
      publishedAt: new Date().toISOString(),
      likeCount: '0',
      commentCount: '0',
      shareCount: '0',
      mediaType: 'IMAGE',
      mediaUrl: this.getRandomVietnamImage(),
      permalink: `https://www.tripadvisor.com/Attraction_Review-${location.location_id}`,
      isShort: false,
      source: 'TripAdvisor Location',
      locationString: location.location_string,
      rating: location.rating || 4.5,
      reviewCount: location.num_reviews || 100
    };
  }

  // Transform photo data to content format
  private transformPhotoToContent(photo: any, location: any): TripAdvisorLocation {
    const imageUrl = photo.images?.large?.url || photo.images?.medium?.url || this.getRandomVietnamImage();
    
    // Create truly unique ID combining photo ID, location ID, and timestamp
    const uniqueId = photo.photo_id 
      ? `tripadvisor_photo_${photo.photo_id}_${location.location_id}`
      : `tripadvisor_photo_${Date.now()}_${location.location_id}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: uniqueId,
      title: `${location.name} - Vietnam Travel`,
      description: `Beautiful photo of ${location.name}, Vietnam! Experience the stunning landscapes, rich culture, and amazing adventures this destination offers.`,
      imageUrl,
      authorName: photo.user?.name || 'Traveler',
      publishedAt: photo.upload_date || new Date().toISOString(),
      likeCount: photo.likes?.toString() || '0',
      commentCount: photo.comments?.toString() || '0',
      shareCount: '0',
      mediaType: 'IMAGE',
      mediaUrl: imageUrl,
      permalink: `https://www.tripadvisor.com/Attraction_Review-${location.location_id}`,
      isShort: false,
      source: 'TripAdvisor Photo',
      locationString: location.location_string,
      rating: location.rating || 4.5,
      reviewCount: location.num_reviews || 100
    };
  }

  // Generate mock TripAdvisor data for fallback
  private generateMockTripAdvisorData(count: number): TripAdvisorLocation[] {
    const mockData: TripAdvisorLocation[] = [];
    const locations = ['Hanoi', 'Ho Chi Minh City', 'Hoi An', 'Sapa', 'Nha Trang', 'Hue', 'Phu Quoc', 'Ha Long Bay'];
    const activities = ['Temple Visit', 'Street Food Tour', 'Beach Day', 'Mountain Trek', 'City Tour', 'Cultural Experience', 'Boat Trip', 'Market Visit'];
    
    for (let i = 0; i < count; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      mockData.push({
        id: `tripadvisor_mock_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${activity} in ${location}, Vietnam 🇻🇳`,
        description: `Amazing ${activity.toLowerCase()} experience in beautiful ${location}! The culture, history, and people here are incredible. Must visit destination for any traveler. #Vietnam #${location.replace(/\s+/g, '')} #Travel #Culture`,
        imageUrl: this.getRandomVietnamImage(),
        authorName: `Traveler${Math.floor(Math.random() * 1000)}`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: (Math.floor(Math.random() * 500) + 10).toString(),
        commentCount: (Math.floor(Math.random() * 50) + 2).toString(),
        shareCount: (Math.floor(Math.random() * 20) + 1).toString(),
        mediaType: 'IMAGE',
        mediaUrl: this.getRandomVietnamImage(),
        permalink: `https://www.tripadvisor.com/Attraction_Review-${Math.random().toString(36).substr(2, 9)}`,
        isShort: false,
        source: 'TripAdvisor Location',
        locationString: `${location}, Vietnam`,
        rating: (Math.random() * 2 + 3.5).toFixed(1), // 3.5 to 5.5
        reviewCount: Math.floor(Math.random() * 1000) + 50
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

  // Test TripAdvisor API connectivity
  async testApiKey(): Promise<boolean> {
    try {
      console.log('🧪 Testing TripAdvisor API connectivity...');
      
      if (!this.apiKey || this.apiKey === 'YOUR_TRIPADVISOR_API_KEY_HERE') {
        console.error('❌ TripAdvisor API key not configured');
        return false;
      }
      
      console.log('✅ TripAdvisor API key is configured');
      
      // Test with a simple location search
      const response = await fetch(
        `${BASE_URL}/location/search?key=${this.apiKey}&searchQuery=Hanoi&language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ TripAdvisor API is working:', data.data?.length || 0, 'locations found');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ TripAdvisor API test failed:', response.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ TripAdvisor API test error:', error);
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

export const tripAdvisorService = new TripAdvisorService();
export default TripAdvisorService;
