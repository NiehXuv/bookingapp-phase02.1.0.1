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
        console.warn('⚠️ Google Places API key not set, using mock data');
        return this.getMockPlaces(query);
      }

      console.log('🎯 GooglePlacesService: Searching places for query:', query);
      console.log('🎯 GooglePlacesService: Location:', location);
      console.log('🎯 GooglePlacesService: Radius:', radius);

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

      const url = `${this.baseUrl}/textsearch/json?${params}`;
      console.log('🎯 GooglePlacesService: Search URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎯 GooglePlacesService: Search response:', {
        status: data.status,
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0] ? {
          name: data.results[0].name,
          place_id: data.results[0].place_id,
          photosCount: data.results[0].photos?.length || 0
        } : 'No results'
      });
      
      return this.transformPlacesResponse(data);
    } catch (error) {
      console.error('❌ Error searching places:', error);
      return this.getMockPlaces(query);
    }
  }

// Enhanced hotel search with multiple strategies
  async searchHotels(query: string, location?: string, radius?: number): Promise<GoogleHotel[]> {
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        console.warn('Google Places API key not set, using mock data');
        return this.getMockHotels(query);
      }

      console.log(`🏨 Starting comprehensive hotel search for: ${query}`);
      let allHotels: GoogleHotel[] = [];

      // Strategy 1: Direct city search (most specific)
      const directResults = await this.searchHotelsDirect(query);
      console.log(`🏨 Strategy 1 (Direct): Found ${directResults.length} hotels`);
      allHotels.push(...directResults);

      // Strategy 2: Nearby search if we have coordinates
      const coordinates = await this.getCityCoordinates(query);
      if (coordinates) {
        const nearbyResults = await this.searchHotelsNearby(coordinates, radius || 20000);
        console.log(`🏨 Strategy 2 (Nearby): Found ${nearbyResults.length} hotels`);
        allHotels.push(...nearbyResults);
      }

      // Strategy 3: Alternative search terms
      const alternativeResults = await this.searchHotelsAlternative(query);
      console.log(`🏨 Strategy 3 (Alternative): Found ${alternativeResults.length} hotels`);
      allHotels.push(...alternativeResults);

      // Remove duplicates
      const uniqueHotels = this.removeDuplicateHotels(allHotels);
      console.log(`🏨 Total unique hotels found: ${uniqueHotels.length}`);

      return uniqueHotels.length > 0 ? uniqueHotels : this.getMockHotels(query);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return this.getMockHotels(query);
    }
  }

  // Strategy 1: Direct text search
  private async searchHotelsDirect(query: string): Promise<GoogleHotel[]> {
    try {
      const params = new URLSearchParams({
        query: `hotel in ${query} Vietnam`,
        key: this.apiKey,
        type: 'lodging',
        language: 'vi',
        region: 'vn'
      });

      const response = await fetch(`${this.baseUrl}/textsearch/json?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      return this.transformHotelsResponse(data);
    } catch (error) {
      console.error('Direct hotel search error:', error);
      return [];
    }
  }

  // Strategy 2: Nearby search using coordinates
  private async searchHotelsNearby(coordinates: {lat: number, lng: number}, radius: number): Promise<GoogleHotel[]> {
    try {
      const params = new URLSearchParams({
        location: `${coordinates.lat},${coordinates.lng}`,
        radius: radius.toString(),
        type: 'lodging',
        key: this.apiKey,
        language: 'vi'
      });

      const response = await fetch(`${this.baseUrl}/nearbysearch/json?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      return this.transformHotelsResponse(data);
    } catch (error) {
      console.error('Nearby hotel search error:', error);
      return [];
    }
  }

  // Strategy 3: Alternative search terms
  private async searchHotelsAlternative(query: string): Promise<GoogleHotel[]> {
    try {
      const alternativeTerms = [
        `accommodation ${query}`,
        `resort ${query}`,
        `lodge ${query} Vietnam`,
        `${query} Bay hotel` // For places like Ha Long Bay
      ];

      let results: GoogleHotel[] = [];
      
      for (const term of alternativeTerms) {
        const params = new URLSearchParams({
          query: term,
          key: this.apiKey,
          type: 'lodging',
          language: 'vi',
          region: 'vn'
        });

        try {
          const response = await fetch(`${this.baseUrl}/textsearch/json?${params}`);
          if (response.ok) {
            const data = await response.json();
            const termResults = this.transformHotelsResponse(data);
            results.push(...termResults);
          }
        } catch (termError) {
          console.log(`Alternative search failed for term: ${term}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Alternative hotel search error:', error);
      return [];
    }
  }

  // Get coordinates for a city
  private async getCityCoordinates(city: string): Promise<{lat: number, lng: number} | null> {
    try {
      const params = new URLSearchParams({
        query: `${city} Vietnam`,
        key: this.apiKey,
        language: 'vi'
      });

      const response = await fetch(`${this.baseUrl}/textsearch/json?${params}`);
      if (!response.ok) return null;

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry?.location;
        if (location) {
          console.log(`📍 Found coordinates for ${city}: ${location.lat}, ${location.lng}`);
          return { lat: location.lat, lng: location.lng };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      return null;
    }
  }

  // Remove duplicate hotels
  private removeDuplicateHotels(hotels: GoogleHotel[]): GoogleHotel[] {
    const seen = new Set();
    return hotels.filter(hotel => {
      const key = `${hotel.name.toLowerCase()}_${hotel.coordinates.lat.toFixed(4)}_${hotel.coordinates.lng.toFixed(4)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
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
        console.warn('⚠️ Google Places API key not set, using mock data');
        return null;
      }

      console.log('🎯 GooglePlacesService: Getting place details for:', placeId);
      console.log('🎯 GooglePlacesService: Using API key:', this.apiKey ? 'Set' : 'Not set');

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: 'vi',
        fields: 'name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,price_level,user_ratings_total,types,photos,reviews,editorial_summary',
        reviews_no_translations: 'true',
        reviews_sort: 'newest'
      });

      const url = `${this.baseUrl}/details/json?${params}`;
      console.log('🎯 GooglePlacesService: Requesting URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎯 GooglePlacesService: Raw API response:', {
        status: data.status,
        result: data.result ? {
          name: data.result.name,
          photosCount: data.result.photos?.length || 0,
          reviewsCount: data.result.reviews?.length || 0,
          editorialSummary: data.result.editorial_summary?.overview ? 'Present' : 'Missing',
          types: data.result.types?.length || 0
        } : 'No result'
      });
      
      // Debug logging to see review count
      if (data.result && data.result.reviews) {
        console.log(`Google Places API returned ${data.result.reviews.length} reviews for ${data.result.name} (API limit: 5 reviews max)`);
      }
      
      return this.transformPlaceDetails(data.result);
    } catch (error) {
      console.error('❌ Error getting place details:', error);
      return null;
    }
  }

  // Transform Google Places response
  private transformPlacesResponse(data: any): GooglePlace[] {
    try {
      console.log('🎯 GooglePlacesService: Transforming search results:', {
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0] ? {
          place_id: data.results[0].place_id,
          name: data.results[0].name,
          photosCount: data.results[0].photos?.length || 0
        } : 'No results'
      });
      
      const transformed = data.results?.map((result: any, index: number) => {
        const place = {
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
        };
        
        console.log(`🎯 GooglePlacesService: Transformed place ${index}:`, {
          id: place.id,
          name: place.name,
          photosCount: place.photos?.length || 0
        });
        
        return place;
      }) || [];
      
      console.log('🎯 GooglePlacesService: Final transformed places:', transformed.length);
      return transformed;
    } catch (error) {
      console.error('❌ Error transforming places response:', error);
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
      console.log('🎯 GooglePlacesService: Raw API result:', {
        name: result.name,
        photosCount: result.photos?.length || 0,
        reviewsCount: result.reviews?.length || 0,
        editorialSummary: result.editorial_summary?.overview
      });
      
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

      const transformedPlace = {
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
      
      console.log('🎯 GooglePlacesService: Transformed place:', {
        photosCount: transformedPlace.photos?.length || 0,
        reviewsCount: transformedPlace.reviews?.length || 0,
        editorialSummary: transformedPlace.editorialSummary
      });
      
      return transformedPlace;
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
    const priceRanges = [100000, 300000, 500000, 700000, 900000];
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
    // Generate city-specific mock hotels
    const cityName = query || 'Vietnam';
    const cityHotels = [
      {
        id: '1',
        name: `${cityName} Emerald Waters Hotel & Spa`,
        price: 1200000,
        rating: 4.5,
        location: `${cityName}, Vietnam`,
        coordinates: { lat: 21.0285, lng: 105.8542 },
        amenities: ['WiFi', 'Parking', 'Room Service', 'Pool', 'Restaurant'],
        address: `${cityName}, Vietnam`,
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
        priceLevel: 3,
        userRatingsTotal: 1250
      },
      {
        id: '2',
        name: `${cityName} Legend Hotel`,
        price: 800000,
        rating: 4.2,
        location: `${cityName}, Vietnam`,
        coordinates: { lat: 21.0300, lng: 105.8500 },
        amenities: ['WiFi', 'Parking', 'Room Service', 'Gym', 'Bar'],
        address: `${cityName}, Vietnam`,
        photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'],
        priceLevel: 2,
        userRatingsTotal: 890
      },
      {
        id: '3',
        name: `${cityName} Grand Resort`,
        price: 2500000,
        rating: 4.8,
        location: `${cityName}, Vietnam`,
        coordinates: { lat: 21.0275, lng: 105.8525 },
        amenities: ['WiFi', 'Parking', 'Room Service', 'Spa', 'Beach Access'],
        address: `${cityName}, Vietnam`,
        photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'],
        priceLevel: 4,
        userRatingsTotal: 2100
      },
      {
        id: '4',
        name: `${cityName} Boutique Hotel`,
        price: 600000,
        rating: 4.0,
        location: `${cityName}, Vietnam`,
        coordinates: { lat: 21.0265, lng: 105.8515 },
        amenities: ['WiFi', 'Parking', 'Restaurant'],
        address: `${cityName}, Vietnam`,
        photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'],
        priceLevel: 2,
        userRatingsTotal: 450
      },
      {
        id: '5',
        name: `${cityName} Business Center Hotel`,
        price: 1800000,
        rating: 4.3,
        location: `${cityName}, Vietnam`,
        coordinates: { lat: 21.0295, lng: 105.8535 },
        amenities: ['WiFi', 'Parking', 'Business Center', 'Conference Rooms'],
        address: `${cityName}, Vietnam`,
        photos: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
        priceLevel: 3,
        userRatingsTotal: 780
      }
    ];

    return cityHotels;
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
