import { getAmadeusApiKey, getAmadeusApiSecret } from '../config/apiConfig';
import { 
  RoomType, 
  AvailabilityInfo, 
  RateInfo, 
  EnhancedHotel 
} from '../types/explore';

// Amadeus API interfaces
export interface AmadeusHotel {
  id: string;
  name: string;
  rating: number;
  hotelId: string;
  chainCode: string;
  dupeId: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    countryCode: string;
    postalCode: string;
    cityName: string;
    street: string;
    country: string;
  };
  amenities: string[];
  media: {
    uri: string;
    category: string;
  }[];
}

export interface AmadeusHotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  rateFamilyEstimated: {
    code: string;
    type: string;
  };
  room: {
    type: string;
    typeEstimated: {
      category: string;
      beds: number;
      bedType: string;
    };
    description: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
    children: number;
  };
  price: {
    currency: string;
    total: string;
    base: string;
    variations: {
      average: {
        base: string;
      };
      changes: {
        startDate: string;
        endDate: string;
        total: string;
      }[];
    };
  };
  policies: {
    cancellation: {
      description: string;
      type: string;
    };
    guarantee: {
      acceptedPayments: {
        creditCards: string[];
        methods: string[];
      };
    };
  };
  self: string;
}

export interface AmadeusHotelSearchParams {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  roomQuantity?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  amenities?: string[];
  ratings?: number[];
}

export class AmadeusService {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.apiKey = getAmadeusApiKey();
    this.apiSecret = getAmadeusApiSecret();
  }

  // Get access token for API calls
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.apiSecret}`,
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early

      if (!this.accessToken) {
        throw new Error('No access token received from Amadeus API');
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Amadeus access token:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  // Search for hotels
  async searchHotels(params: AmadeusHotelSearchParams): Promise<AmadeusHotel[]> {
    try {
      const token = await this.getAccessToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params.cityCode) {
        queryParams.append('cityCode', params.cityCode);
      }
      if (params.latitude && params.longitude) {
        queryParams.append('latitude', params.latitude.toString());
        queryParams.append('longitude', params.longitude.toString());
        queryParams.append('radius', (params.radius || 5).toString());
        queryParams.append('radiusUnit', params.radiusUnit || 'KM');
      }
      if (params.hotelName) {
        queryParams.append('keyword', params.hotelName);
      }
      if (params.checkInDate) {
        queryParams.append('checkInDate', params.checkInDate);
      }
      if (params.checkOutDate) {
        queryParams.append('checkOutDate', params.checkOutDate);
      }
      if (params.adults) {
        queryParams.append('adults', params.adults.toString());
      }
      if (params.roomQuantity) {
        queryParams.append('roomQuantity', params.roomQuantity.toString());
      }

      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hotel search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw new Error('Failed to search hotels');
    }
  }

  // Get hotel offers (availability and pricing)
  async getHotelOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 1,
    children: number = 0,
    roomQuantity: number = 1
  ): Promise<AmadeusHotelOffer[]> {
    try {
      const token = await this.getAccessToken();
      
      const queryParams = new URLSearchParams({
        hotelIds: hotelIds.join(','),
        checkInDate,
        checkOutDate,
        adults: adults.toString(),
        children: children.toString(),
        roomQuantity: roomQuantity.toString(),
        currency: 'USD',
        bestRateOnly: 'true',
        view: 'FULL',
      });

      const response = await fetch(
        `https://test.api.amadeus.com/v2/shopping/hotel-offers?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hotel offers failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting hotel offers:', error);
      throw new Error('Failed to get hotel offers');
    }
  }

  // Get hotel details by ID
  async getHotelDetails(hotelId: string): Promise<AmadeusHotel | null> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations/hotels/${hotelId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hotel details failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      return null;
    }
  }

  // Transform Amadeus hotel offers to our internal format
  transformOffersToRoomTypes(offers: AmadeusHotelOffer[]): RoomType[] {
    return offers.map(offer => ({
      id: offer.id,
      type: offer.room.typeEstimated?.category || offer.room.type || 'Standard Room',
      description: offer.room.description?.text || 'Comfortable accommodation',
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      amenities: this.extractAmenities(offer),
      available: true,
    }));
  }

  // Transform Amadeus hotel offers to availability info
  transformOffersToAvailability(offers: AmadeusHotelOffer[]): AvailabilityInfo {
    if (offers.length === 0) {
      return {
        checkIn: '',
        checkOut: '',
        roomsAvailable: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const firstOffer = offers[0];
    return {
      checkIn: firstOffer.checkInDate,
      checkOut: firstOffer.checkOutDate,
      roomsAvailable: offers.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Transform Amadeus hotel offers to rate info
  transformOffersToRates(offers: AmadeusHotelOffer[]): RateInfo[] {
    return offers.map(offer => ({
      id: offer.id,
      roomType: offer.room.typeEstimated?.category || offer.room.type || 'Standard Room',
      rate: parseFloat(offer.price.total),
      currency: offer.price.currency,
      cancellationPolicy: offer.policies.cancellation.description || 'Standard cancellation policy',
      breakfast: this.hasBreakfast(offer),
    }));
  }

  // Extract amenities from hotel offer
  private extractAmenities(offer: AmadeusHotelOffer): string[] {
    const amenities: string[] = [];
    
    // Basic amenities based on room type
    amenities.push('WiFi', 'TV', 'AC', 'Private Bathroom');
    
    // Add amenities based on rate family
    if (offer.rateFamilyEstimated?.type === 'PACKAGE') {
      amenities.push('Breakfast Included');
    }
    
    // Add amenities based on room category
    if (offer.room.typeEstimated?.category === 'SUITE') {
      amenities.push('Living Area', 'Premium Amenities');
    }
    
    return amenities;
  }

  // Check if breakfast is included
  private hasBreakfast(offer: AmadeusHotelOffer): boolean {
    return offer.rateFamilyEstimated?.type === 'PACKAGE' || 
           offer.rateFamilyEstimated?.code?.includes('BREAKFAST');
  }

  // Mock method for testing when API is not available
  async getMockHotelOffers(hotelId: string): Promise<AmadeusHotelOffer[]> {
    return [
      {
        id: 'offer_1',
        checkInDate: '2024-08-16',
        checkOutDate: '2024-08-17',
        rateCode: 'RAC',
        rateFamilyEstimated: {
          code: 'PRO',
          type: 'PACKAGE',
        },
        room: {
          type: 'STANDARD',
          typeEstimated: {
            category: 'STANDARD_ROOM',
            beds: 1,
            bedType: 'KING',
          },
          description: {
            text: 'Comfortable standard room with king bed',
            lang: 'EN',
          },
        },
        guests: {
          adults: 2,
          children: 0,
        },
        price: {
          currency: 'USD',
          total: '150.00',
          base: '120.00',
          variations: {
            average: {
              base: '120.00',
            },
            changes: [],
          },
        },
        policies: {
          cancellation: {
            description: 'Free cancellation until 24 hours before check-in',
            type: 'FREE_CANCELLATION',
          },
          guarantee: {
            acceptedPayments: {
              creditCards: ['VI', 'MC', 'AX'],
              methods: ['CREDIT_CARD'],
            },
          },
        },
        self: 'https://test.api.amadeus.com/v2/shopping/hotel-offers/offer_1',
      },
      {
        id: 'offer_2',
        checkInDate: '2024-08-16',
        checkOutDate: '2024-08-17',
        rateCode: 'RAC',
        rateFamilyEstimated: {
          code: 'PRO',
          type: 'PACKAGE',
        },
        room: {
          type: 'SUITE',
          typeEstimated: {
            category: 'SUITE',
            beds: 1,
            bedType: 'KING',
          },
          description: {
            text: 'Luxurious suite with premium amenities',
            lang: 'EN',
          },
        },
        guests: {
          adults: 2,
          children: 0,
        },
        price: {
          currency: 'USD',
          total: '250.00',
          base: '200.00',
          variations: {
            average: {
              base: '200.00',
            },
            changes: [],
          },
        },
        policies: {
          cancellation: {
            description: 'Free cancellation until 24 hours before check-in',
            type: 'FREE_CANCELLATION',
          },
          guarantee: {
            acceptedPayments: {
              creditCards: ['VI', 'MC', 'AX'],
              methods: ['CREDIT_CARD'],
            },
          },
        },
        self: 'https://test.api.amadeus.com/v2/shopping/hotel-offers/offer_2',
      },
    ];
  }

  // Mock method for testing hotel search
  async getMockHotelSearch(): Promise<AmadeusHotel[]> {
    return [
      {
        id: 'hotel_1',
        name: 'Luxury Hotel Hanoi',
        rating: 5,
        hotelId: 'HTLHAN',
        chainCode: 'LH',
        dupeId: 'HTLHAN',
        geoCode: {
          latitude: 21.0285,
          longitude: 105.8542,
        },
        address: {
          countryCode: 'VN',
          postalCode: '10000',
          cityName: 'Hanoi',
          street: '123 Luxury Street',
          country: 'Vietnam',
        },
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
        media: [
          {
            uri: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Luxury+Hotel',
            category: 'EXTERIOR',
          },
        ],
      },
      {
        id: 'hotel_2',
        name: 'Business Hotel Saigon',
        rating: 4,
        hotelId: 'HTLSAI',
        chainCode: 'BH',
        dupeId: 'HTLSAI',
        geoCode: {
          latitude: 10.8231,
          longitude: 106.6297,
        },
        address: {
          countryCode: 'VN',
          postalCode: '70000',
          cityName: 'Ho Chi Minh City',
          street: '456 Business Avenue',
          country: 'Vietnam',
        },
        amenities: ['WiFi', 'Business Center', 'Restaurant', 'Conference Room'],
        media: [
          {
            uri: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Business+Hotel',
            category: 'EXTERIOR',
          },
        ],
      },
    ];
  }
}

export default AmadeusService;
