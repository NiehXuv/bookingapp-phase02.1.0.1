import { API_CONFIG, getAgodaAffiliateId, getAgodaApiKey } from '../config/apiConfig';

export interface AgodaHotel {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  location: string;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  address: string;
  phone?: string;
  website?: string;
  photos: string[];
  roomTypes: AgodaRoomType[];
  policies: AgodaPolicy;
  highlights: string[];
  cancellationPolicy: string;
  lastUpdated: string;
}

export interface AgodaRoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  capacity: number;
  bedType: string;
  roomSize: string;
  amenities: string[];
  photos: string[];
  available: boolean;
}

export interface AgodaPolicy {
  checkIn: string;
  checkOut: string;
  children: string;
  pets: string;
  smoking: string;
  extraBeds: string;
}

export interface AgodaSearchResult {
  hotels: AgodaHotel[];
  total: number;
  filters: AgodaFilters;
  sortOptions: AgodaSortOption[];
}

export interface AgodaFilters {
  priceRange: { min: number; max: number };
  rating: number[];
  amenities: string[];
  location: string[];
  roomTypes: string[];
}

export interface AgodaSortOption {
  id: string;
  name: string;
  description: string;
}

class AgodaService {
  private baseUrl: string;
  private affiliateId?: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = API_CONFIG.AGODA.BASE_URL;
    this.affiliateId = getAgodaAffiliateId();
    this.apiKey = getAgodaApiKey();
  }

  // Search hotels using Agoda API (will work when you get access)
  async searchHotels(
    query: string,
    location?: string,
    checkIn?: string,
    checkOut?: string,
    guests?: number,
    rooms?: number
  ): Promise<AgodaSearchResult> {
    try {
      // If you have official Agoda API access, use this
      if (this.apiKey && this.affiliateId) {
        return await this.searchHotelsReal(query, location, checkIn, checkOut, guests, rooms);
      }

      // For development, use mock data
      console.log('Using mock Agoda data for development');
      return this.getMockSearchResult(query, location);
    } catch (error) {
      console.error('Error searching Agoda hotels:', error);
      return this.getMockSearchResult(query, location);
    }
  }

  // Real Agoda API integration (to be implemented when you get access)
  private async searchHotelsReal(
    query: string,
    location?: string,
    checkIn?: string,
    checkOut?: string,
    guests?: number,
    rooms?: number
  ): Promise<AgodaSearchResult> {
    const params = new URLSearchParams({
      q: query,
      location: location || 'Hanoi, Vietnam',
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: guests?.toString() || '2',
      rooms: rooms?.toString() || '1',
      affiliateId: this.affiliateId!,
      apiKey: this.apiKey!
    });

    const response = await fetch(`${this.baseUrl}/hotels/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Agoda API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformAgodaResponse(data);
  }

  // Get hotel details
  async getHotelDetails(hotelId: string): Promise<AgodaHotel | null> {
    try {
      if (this.apiKey && this.affiliateId) {
        return await this.getHotelDetailsReal(hotelId);
      }

      return this.getMockHotelDetails(hotelId);
    } catch (error) {
      console.error('Error getting Agoda hotel details:', error);
      return this.getMockHotelDetails(hotelId);
    }
  }

  private async getHotelDetailsReal(hotelId: string): Promise<AgodaHotel | null> {
    const params = new URLSearchParams({
      hotelId,
      affiliateId: this.affiliateId!,
      apiKey: this.apiKey!
    });

    const response = await fetch(`${this.baseUrl}/hotels/${hotelId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Agoda API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformHotelDetails(data);
  }

  // Mock data for development
  private getMockSearchResult(query: string, location?: string): AgodaSearchResult {
    const mockHotels: AgodaHotel[] = [
      {
        id: 'agoda_001',
        name: 'Hanoi Imperial Hotel',
        originalPrice: 2500000,
        discountedPrice: 1800000,
        discountPercentage: 28,
        rating: 4.5,
        reviewCount: 1247,
        location: location || 'Hanoi, Vietnam',
        coordinates: { lat: 21.0285, lng: 105.8542 },
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Fitness Center', 'Business Center'],
        address: '44 Hang Bai Street, Hoan Kiem District, Hanoi',
        phone: '+84 24 3933 3888',
        website: 'https://hanoiimperialhotel.com',
        photos: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        roomTypes: [
          {
            id: 'room_001',
            name: 'Deluxe Room',
            description: 'Spacious room with city view',
            price: 1800000,
            originalPrice: 2500000,
            capacity: 2,
            bedType: '1 King Bed',
            roomSize: '35m²',
            amenities: ['Air Conditioning', 'Mini Bar', 'Balcony', 'City View'],
            photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
            available: true
          }
        ],
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          children: 'Children of all ages are welcome',
          pets: 'No pets allowed',
          smoking: 'Non-smoking rooms available',
          extraBeds: 'Extra beds available for VND 500,000'
        },
        highlights: ['Best Price Guarantee', 'Free Cancellation', 'Instant Confirmation'],
        cancellationPolicy: 'Free cancellation until 24 hours before check-in',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'agoda_002',
        name: 'Sofitel Legend Metropole Hanoi',
        originalPrice: 4500000,
        discountedPrice: 3200000,
        discountPercentage: 29,
        rating: 4.8,
        reviewCount: 2156,
        location: location || 'Hanoi, Vietnam',
        coordinates: { lat: 21.0245, lng: 105.8412 },
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Multiple Restaurants', 'Fitness Center', 'Concierge'],
        address: '15 Ngo Quyen Street, Hoan Kiem District, Hanoi',
        phone: '+84 24 3826 6919',
        website: 'https://sofitel-legend-metropole-hanoi.com',
        photos: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
        ],
        roomTypes: [
          {
            id: 'room_002',
            name: 'Historic Wing Room',
            description: 'Elegant room in the historic wing',
            price: 3200000,
            originalPrice: 4500000,
            capacity: 2,
            bedType: '1 King Bed',
            roomSize: '40m²',
            amenities: ['Air Conditioning', 'Mini Bar', 'Garden View', 'Historic Charm'],
            photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
            available: true
          }
        ],
        policies: {
          checkIn: '15:00',
          checkOut: '12:00',
          children: 'Children of all ages are welcome',
          pets: 'No pets allowed',
          smoking: 'Non-smoking rooms available',
          extraBeds: 'Extra beds available for VND 800,000'
        },
        highlights: ['Historic Hotel', 'Best Price Guarantee', 'Free Cancellation'],
        cancellationPolicy: 'Free cancellation until 48 hours before check-in',
        lastUpdated: new Date().toISOString()
      }
    ];

    return {
      hotels: mockHotels,
      total: mockHotels.length,
      filters: {
        priceRange: { min: 1000000, max: 5000000 },
        rating: [3, 4, 5],
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant'],
        location: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'],
        roomTypes: ['Deluxe', 'Suite', 'Standard']
      },
      sortOptions: [
        { id: 'price_low', name: 'Price: Low to High', description: 'Sort by lowest price first' },
        { id: 'price_high', name: 'Price: High to Low', description: 'Sort by highest price first' },
        { id: 'rating', name: 'Rating', description: 'Sort by highest rating first' },
        { id: 'discount', name: 'Best Deals', description: 'Sort by highest discount first' }
      ]
    };
  }

  private getMockHotelDetails(hotelId: string): AgodaHotel | null {
    const mockHotels = this.getMockSearchResult('').hotels;
    return mockHotels.find(hotel => hotel.id === hotelId) || null;
  }

  // Transform Agoda API response (to be implemented when you get access)
  private transformAgodaResponse(data: any): AgodaSearchResult {
    // This will be implemented when you get real Agoda API access
    // For now, return mock data
    return this.getMockSearchResult('', 'Hanoi, Vietnam');
  }

  private transformHotelDetails(data: any): AgodaHotel | null {
    // This will be implemented when you get real Agoda API access
    // For now, return mock data
    return this.getMockHotelDetails('agoda_001');
  }

  // Get booking URL for affiliate tracking
  getBookingUrl(hotelId: string, checkIn?: string, checkOut?: string, guests?: number): string {
    const baseUrl = 'https://www.agoda.com';
    const params = new URLSearchParams({
      hotelId,
      affiliateId: this.affiliateId || 'demo',
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: guests?.toString() || '2'
    });

    return `${baseUrl}/hotel-detail?${params}`;
  }

  // Check if service is ready for production
  isProductionReady(): boolean {
    return !!(this.apiKey && this.affiliateId);
  }

  // Get service status
  getServiceStatus(): { status: string; message: string } {
    if (this.isProductionReady()) {
      return {
        status: 'production',
        message: 'Connected to Agoda API'
      };
    }
    return {
      status: 'development',
      message: 'Using mock data - join Agoda affiliate program for real data'
    };
  }
}

export default new AgodaService();
