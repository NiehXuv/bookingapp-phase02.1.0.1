import { API_CONFIG, getGooglePlacesApiKey } from '../config/apiConfig';

export interface GooglePlace {
  id: string;
  name: string;
  type: string;
  types?: string[]; // Array of all place types for amenity generation
  coordinates: { lat: number; lng: number };
  rating: number;
  address: string;
  phone?: string;
  website?: string;
  photos?: string[];
  openingHours?: string[];
  priceLevel?: number;
  userRatingsTotal?: number;
  reviews?: GooglePlaceReview[];
  editorialSummary?: string;
}

export interface GooglePlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  language?: string;
  profile_photo_url?: string;
  translated?: boolean;
}

export interface GoogleHotel {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: string;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  priceLevel?: number;
  userRatingsTotal?: number;
  photos?: string[];
  reviews?: GooglePlaceReview[];
  editorialSummary?: string;
}

export interface GoogleSearchResult {
  places: GooglePlace[];
  hotels: GoogleHotel[];
  total: number;
}

class GooglePlacesService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = getGooglePlacesApiKey();
    this.baseUrl = API_CONFIG.GOOGLE_PLACES.BASE_URL;
  }

  // Search places using Google Places API
  async searchPlaces(query: string, location?: string, radius?: number): Promise<GooglePlace[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        console.warn('Google Places API key not set, using mock data');
        return this.getMockPlaces(query);
      }

      const params = new URLSearchParams({
        query: `${query} ${location || 'Hanoi, Vietnam'}`,
        key: this.apiKey,
        type: 'establishment',
        language: 'vi', // Vietnamese language
        region: 'vn' // Vietnam region bias
      });

      if (radius) {
        params.append('radius', radius.toString());
      }

      const response = await fetch(`${this.baseUrl}/textsearch/json?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformPlacesResponse(data);
    } catch (error) {
      console.error('Error searching places:', error);
      return this.getMockPlaces(query);
    }
  }

  // Search hotels using Google Places API
  async searchHotels(query: string, location?: string, radius?: number): Promise<GoogleHotel[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        console.warn('Google Places API key not set, using mock data');
        return this.getMockHotels(query);
      }

      const params = new URLSearchParams({
        query: `${query} hotel ${location || 'Hanoi, Vietnam'}`,
        key: this.apiKey,
        type: 'lodging',
        language: 'vi',
        region: 'vn'
      });

      if (radius) {
        params.append('radius', radius.toString());
      }

      const response = await fetch(`${this.baseUrl}/textsearch/json?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformHotelsResponse(data);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return this.getMockHotels(query);
    }
  }

  // Get hotel details with full information
  async getHotelDetails(placeId: string): Promise<GoogleHotel | null> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        return null;
      }

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: 'vi',
        fields: 'name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,price_level,user_ratings_total,types,photos,reviews,editorial_summary',
        reviews_no_translations: 'true',
        reviews_sort: 'newest'
      });

      const response = await fetch(`${this.baseUrl}/details/json?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug logging to see review count
      if (data.result && data.result.reviews) {
        console.log(`Google Places API returned ${data.result.reviews.length} reviews for ${data.result.name} (API limit: 5 reviews max)`);
      }
      
      return this.transformHotelDetails(data.result);
    } catch (error) {
      console.error('Error getting hotel details:', error);
      return null;
    }
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        return null;
      }

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: 'vi',
        fields: 'name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,price_level,user_ratings_total,types,photos,reviews,editorial_summary',
        reviews_no_translations: 'true',
        reviews_sort: 'newest'
      });

      const response = await fetch(`${this.baseUrl}/details/json?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug logging to see review count
      if (data.result && data.result.reviews) {
        console.log(`Google Places API returned ${data.result.reviews.length} reviews for ${data.result.name} (API limit: 5 reviews max)`);
      }
      
      return this.transformPlaceDetails(data.result);
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Transform Google Places response
  private transformPlacesResponse(data: any): GooglePlace[] {
    try {
      return data.results?.map((result: any, index: number) => ({
        id: result.place_id || `place_${index}`,
        name: result.name || 'Unknown place',
        type: result.types?.[0] || 'Point of Interest',
        types: result.types || [], // Include all types for amenity generation
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0
        },
        rating: result.rating || 0,
        address: result.formatted_address || 'Unknown address',
        phone: result.formatted_phone_number,
        website: result.website,
        photos: result.photos?.map((photo: any) => 
          `${this.baseUrl}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        openingHours: result.opening_hours?.open_now ? 'Open now' : 'Closed',
        priceLevel: result.price_level,
        userRatingsTotal: result.user_ratings_total,
        reviews: result.reviews,
        editorialSummary: result.editorial_summary?.overview
      })) || [];
    } catch (error) {
      console.error('Error transforming places response:', error);
      return [];
    }
  }

  // Transform Google Hotels response
  private transformHotelsResponse(data: any): GoogleHotel[] {
    try {
      return data.results?.map((result: any, index: number) => ({
        id: result.place_id || `hotel_${index}`,
        name: result.name || 'Unknown hotel',
        price: this.getPriceFromLevel(result.price_level),
        rating: result.rating || 0,
        location: result.formatted_address || 'Hanoi, Vietnam',
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0
        },
        amenities: this.getAmenitiesFromTypes(result.types),
        address: result.formatted_address || 'Unknown address',
        phone: result.formatted_phone_number,
        website: result.website,
        openingHours: result.opening_hours?.open_now ? ['Open now'] : ['Closed'],
        priceLevel: result.price_level,
        userRatingsTotal: result.user_ratings_total,
        photos: result.photos?.map((photo: any) => 
          `${this.baseUrl}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        reviews: result.reviews,
        editorialSummary: result.editorial_summary?.overview
      })) || [];
    } catch (error) {
      console.error('Error transforming hotels response:', error);
      return [];
    }
  }

  // Transform place details
  private transformPlaceDetails(result: any): GooglePlace | null {
    try {
      // Transform opening hours to readable format
      const transformOpeningHours = (openingHours: any): string[] => {
        if (!openingHours || !openingHours.periods) return [];
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return openingHours.periods.map((period: any) => {
          const day = days[period.open.day];
          const openTime = this.formatTime(period.open.time);
          const closeTime = period.close ? this.formatTime(period.close.time) : 'Open 24h';
          return `${day}: ${openTime} - ${closeTime}`;
        });
      };

      return {
        id: result.place_id || 'unknown',
        name: result.name || 'Unknown place',
        type: result.types?.[0] || 'Point of Interest',
        types: result.types || [], // Include all types for amenity generation
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0
        },
        rating: result.rating || 0,
        address: result.formatted_address || 'Unknown address',
        phone: result.formatted_phone_number,
        website: result.website,
        openingHours: transformOpeningHours(result.opening_hours),
        priceLevel: result.price_level,
        userRatingsTotal: result.user_ratings_total,
        photos: result.photos?.map((photo: any) => 
          `${this.baseUrl}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        reviews: result.reviews,
        editorialSummary: result.editorial_summary?.overview
      };
    } catch (error) {
      console.error('Error transforming place details:', error);
      return null;
    }
  }

  // Transform hotel details
  private transformHotelDetails(result: any): GoogleHotel | null {
    try {
      // Transform opening hours to readable format
      const transformOpeningHours = (openingHours: any): string[] => {
        if (!openingHours || !openingHours.periods) return [];
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return openingHours.periods.map((period: any) => {
          const day = days[period.open.day];
          const openTime = this.formatTime(period.open.time);
          const closeTime = period.close ? this.formatTime(period.close.time) : 'Open 24h';
          return `${day}: ${openTime} - ${closeTime}`;
        });
      };

      return {
        id: result.place_id || 'unknown',
        name: result.name || 'Unknown hotel',
        price: this.getPriceFromLevel(result.price_level),
        rating: result.rating || 0,
        location: result.formatted_address || 'Hanoi, Vietnam',
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0
        },
        amenities: this.getAmenitiesFromTypes(result.types),
        address: result.formatted_address || 'Unknown address',
        phone: result.formatted_phone_number,
        website: result.website,
        openingHours: transformOpeningHours(result.opening_hours),
        priceLevel: result.price_level,
        userRatingsTotal: result.user_ratings_total,
        photos: result.photos?.map((photo: any) => 
          `${this.baseUrl}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
        ),
        reviews: result.reviews,
        editorialSummary: result.editorial_summary?.overview
      };
    } catch (error) {
      console.error('Error transforming hotel details:', error);
      return null;
    }
  }

  // Helper method to format time from Google's format (e.g., "0900" to "9:00 AM")
  private formatTime(time: string): string {
    if (!time) return 'Unknown';
    
    const hour = parseInt(time.substring(0, 2));
    const minute = time.substring(2, 4);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    
    return `${displayHour}:${minute} ${period}`;
  }

  // Get price from Google's price level (0-4)
  private getPriceFromLevel(priceLevel?: number): number {
    if (!priceLevel) return Math.floor(Math.random() * 1500000) + 500000;
    
    // Price levels in VND: 0=Budget, 1=Economy, 2=Mid-range, 3=Upscale, 4=Luxury
    const priceRanges = [500000, 800000, 1500000, 3000000, 5000000];
    return priceRanges[priceLevel] || 1000000;
  }

  // Get amenities from Google place types
  private getAmenitiesFromTypes(types?: string[]): string[] {
    if (!types) return ['WiFi', 'Parking'];
    
    const amenityMap: { [key: string]: string[] } = {
      'lodging': ['WiFi', 'Parking', 'Room Service'],
      'restaurant': ['Restaurant', 'Bar', 'Room Service'],
      'gym': ['Gym', 'Fitness Center', 'Pool'],
      'spa': ['Spa', 'Wellness Center', 'Massage'],
      'parking': ['Parking', 'Free Parking', 'Valet']
    };

    const amenities: string[] = [];
    types.forEach(type => {
      if (amenityMap[type]) {
        amenities.push(...amenityMap[type]);
      }
    });

    return amenities.length > 0 ? amenities : ['WiFi', 'Parking'];
  }

  // Mock data for development
  private getMockPlaces(query: string): GooglePlace[] {
    const mockPlaces: GooglePlace[] = [
      { 
        id: '1', 
        name: 'Hoan Kiem Lake', 
        type: 'Lake', 
        types: ['natural_feature', 'tourist_attraction', 'establishment'],
        coordinates: { lat: 21.0285, lng: 105.8542 }, 
        rating: 4.7,
        address: 'Hoan Kiem District, Hanoi, Vietnam',
        photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400']
      },
      { 
        id: '2', 
        name: 'Temple of Literature', 
        type: 'Historical Site', 
        types: ['place_of_worship', 'tourist_attraction', 'establishment'],
        coordinates: { lat: 21.0245, lng: 105.8412 }, 
        rating: 4.6,
        address: 'Dong Da District, Hanoi, Vietnam',
        photos: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400']
      },
      { 
        id: '3', 
        name: 'West Lake', 
        type: 'Lake', 
        types: ['natural_feature', 'tourist_attraction'],
        coordinates: { lat: 21.0455, lng: 105.8122 }, 
        rating: 4.5,
        address: 'Tay Ho District, Hanoi, Vietnam',
        photos: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400']
      },
      { 
        id: '4', 
        name: 'Old Quarter', 
        type: 'Cultural Area', 
        types: ['establishment', 'tourist_attraction'],
        coordinates: { lat: 21.0325, lng: 105.8582 }, 
        rating: 4.8,
        address: 'Hoan Kiem District, Hanoi, Vietnam',
        photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400']
      },
      { 
        id: '5', 
        name: 'Ho Chi Minh Mausoleum', 
        type: 'Monument', 
        types: ['establishment', 'tourist_attraction'],
        coordinates: { lat: 21.0365, lng: 105.8342 }, 
        rating: 4.4,
        address: 'Ba Dinh District, Hanoi, Vietnam',
        photos: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400']
      }
    ];

    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.type.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Mock hotel data for testing
  private getMockHotels(query: string): GoogleHotel[] {
    return [
      {
        id: '1',
        name: 'Hanoi Emerald Waters Hotel & Spa',
        price: 1200000,
        rating: 4.5,
        location: 'D8 P. Giảng Võ, Giảng Võ, Ba Đình, Hà Nội 10000',
        coordinates: { lat: 21.0285, lng: 105.8542 },
        amenities: ['WiFi', 'Parking', 'Room Service'],
        address: 'D8 P. Giảng Võ, Giảng Võ, Ba Đình, Hà Nội 10000',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
        priceLevel: 3,
        userRatingsTotal: 1250
      },
      {
        id: '2',
        name: 'Hanoi Legend Hotel',
        price: 800000,
        rating: 4.2,
        location: '96 P. Sơn Tây, Kim Mã, Ba Đình, Hà Nội 100000',
        coordinates: { lat: 21.0300, lng: 105.8500 },
        amenities: ['WiFi', 'Parking', 'Room Service'],
        address: '96 P. Sơn Tây, Kim Mã, Ba Đình, Hà Nội 100000',
        photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'],
        priceLevel: 2,
        userRatingsTotal: 890
      },
      {
        id: '3',
        name: 'Fraser Suites Hanoi',
        price: 2500000,
        rating: 4.8,
        location: '25 P. Hàng Cà, Phố cổ, Hà Nội 10000',
        coordinates: { lat: 21.0275, lng: 105.8525 },
        amenities: ['WiFi', 'Parking', 'Room Service'],
        address: '25 P. Hàng Cà, Phố cổ, Hà Nội 10000',
        photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'],
        priceLevel: 4,
        userRatingsTotal: 2100
      }
    ];
  }

  private getRandomHotelImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
}

export const googlePlacesService = new GooglePlacesService();
export default GooglePlacesService;
