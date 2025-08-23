import { googlePlacesService, GoogleHotel } from './googlePlacesService';
import { tripAdvisorService } from './tripadvisorService';
import { AmadeusService, AmadeusHotel } from './amadeusService';
import { EnhancedHotel, RoomType, AvailabilityInfo, RateInfo, Review, BookingOption } from '../types/explore';

export class EnhancedHotelService {
  private amadeusService: AmadeusService;

  constructor() {
    this.amadeusService = new AmadeusService();
  }

  async getHotelDetails(hotelId: string, coordinates: any): Promise<EnhancedHotel> {
    try {
      // 1. Get Google Places hotel details
      const googleData = await googlePlacesService.getHotelDetails(hotelId);
      
      if (!googleData) {
        throw new Error('Failed to get Google Places data');
      }
      
      // 2. Try to get Amadeus data
      let amadeusData = null;
      try {
        // TODO: Uncomment when Amadeus service is ready
        // const amadeusHotels = await this.amadeusService.searchHotels({
        //   latitude: coordinates.lat,
        //   longitude: coordinates.lng,
        //   radius: 2, // 2km radius
        //   hotelName: googleData.name
        // });

        // if (amadeusHotels.length > 0) {
        //   // Get the best match (first result)
        //   const bestMatch = amadeusHotels[0];
          
        //   // Get hotel offers for availability and pricing
        //   const offers = await this.amadeusService.getHotelOffers(
        //     [bestMatch.hotelId],
        //     this.getDefaultCheckInDate(),
        //     this.getDefaultCheckInDate(),
        //     2, // adults
        //     0, // children
        //     1  // room quantity
        //   );

        //   amadeusData = {
        //     hotel: bestMatch,
        //     offers: offers
        //   };
        // }
        
        console.log('Amadeus service temporarily disabled - will implement later');
      } catch (error) {
        // Only log to console, don't show error in interface
        console.log('Amadeus data not available for this hotel:', error);
        // Continue with mock data fallback
      }
      
      // 3. Try to get TripAdvisor data
      let tripAdvisorData = null;
      try {
        // TODO: Implement TripAdvisor API integration
        // tripAdvisorData = await tripAdvisorService.searchHotels({
        //   query: googleData.name,
        //   location: googleData.address
        // });
        console.log('TripAdvisor API integration pending');
      } catch (error) {
        console.log('TripAdvisor data not available for this hotel');
      }
      
      // 4. Merge all data
      return this.mergeHotelData(googleData, amadeusData, tripAdvisorData);
    } catch (error) {
      throw new Error('Failed to get hotel details');
    }
  }
  
  // Get hotel details by place ID (for ExploreScreen)
  async getHotelDetailsByPlaceId(placeId: string, coordinates: any): Promise<EnhancedHotel> {
    try {
      console.log(`🔍 EnhancedHotelService: Getting details for place_id: ${placeId}`);
      
      // 1. Get Google Places hotel details
      const googleData = await googlePlacesService.getHotelDetails(placeId);
      
      if (!googleData) {
        console.log(`❌ EnhancedHotelService: No Google Places data returned for ${placeId}`);
        throw new Error('Failed to get Google Places data');
      }
      
      console.log(`✅ EnhancedHotelService: Google Places data received:`, {
        id: googleData.id,
        name: googleData.name,
        photos: googleData.photos?.length || 0
      });
      
      // 2. Try to get Amadeus data
      let amadeusData = null;
      try {
        // TODO: Uncomment when Amadeus service is ready
        // const amadeusHotels = await this.amadeusService.searchHotels({
        //   latitude: coordinates.lat,
        //   longitude: coordinates.lng,
        //   radius: 2, // 2km radius
        //   hotelName: googleData.name
        // });

        // if (amadeusHotels.length > 0) {
        //   // Get the best match (first result)
        //   const bestMatch = amadeusHotels[0];
          
        //   // Get hotel offers for availability and pricing
        //   const offers = await this.amadeusService.getHotelOffers(
        //     [bestMatch.hotelId],
        //     this.getDefaultCheckInDate(),
        //     this.getDefaultCheckInDate(),
        //     2, // adults
        //     0, // children
        //     1  // room quantity
        //   );

        //   amadeusData = {
        //     hotel: bestMatch,
        //     offers: offers
        //   };
        // }
        
        console.log('Amadeus service temporarily disabled - will implement later');
      } catch (error) {
        // Only log to console, don't show error in interface
        console.log('Amadeus data not available for this hotel:', error);
        // Continue with mock data fallback
      }
      
      // 3. Try to get TripAdvisor data
      let tripAdvisorData = null;
      try {
        // TODO: Implement TripAdvisor API integration
        // tripAdvisorData = await tripAdvisorService.searchHotels({
        //   query: googleData.name,
        //   location: googleData.address
        // });
        console.log('TripAdvisor API integration pending');
      } catch (error) {
        console.log('TripAdvisor data not available for this hotel');
      }
      
      // 4. Merge all data
      return this.mergeHotelData(googleData, amadeusData, tripAdvisorData);
    } catch (error) {
      console.log(`❌ EnhancedHotelService: Error getting hotel details:`, error);
      throw new Error('Failed to get hotel details');
    }
  }

  private mergeHotelData(google: any, amadeus: any, tripAdvisor: any): EnhancedHotel {
    // Transform Google reviews to our format if available
    const transformGoogleReviews = (googleReviews: any[]): Review[] => {
      if (!googleReviews || googleReviews.length === 0) return [];
      
      return googleReviews.map((review, index) => ({
        id: `google_rev_${index}`,
        author: review.author_name || 'Google User',
        rating: review.rating || 0,
        text: review.text || '',
        date: new Date(review.time * 1000).toISOString().split('T')[0], // Convert timestamp to date
        helpful: Math.floor(Math.random() * 20) + 1 // Mock helpful count since Google doesn't provide this
      }));
    };

    // Use Amadeus data if available, otherwise fall back to mock data
    let roomTypes: RoomType[] = [];
    let availability: AvailabilityInfo | null = null;
    let rates: RateInfo[] = [];
    let amadeusId: string | undefined;

    if (amadeus?.offers && amadeus.offers.length > 0) {
      // Transform Amadeus offers to our format
      roomTypes = this.amadeusService.transformOffersToRoomTypes(amadeus.offers);
      availability = this.amadeusService.transformOffersToAvailability(amadeus.offers);
      rates = this.amadeusService.transformOffersToRates(amadeus.offers);
      amadeusId = amadeus.hotel?.hotelId;
    } else {
      // Fallback to mock data
      roomTypes = this.getMockRoomTypes();
      availability = this.getMockAvailability();
      rates = [];
    }

    // Use real Google data or fallback to mock data
    const reviews = google.reviews && google.reviews.length > 0 
      ? transformGoogleReviews(google.reviews)
      : [];

    let amenities: string[] = [];
    let bookingOptions: BookingOption[] = [];

    if (tripAdvisor?.amenities) {
      amenities = tripAdvisor.amenities;
    } else if (amadeus?.hotel?.amenities) {
      // Use Amadeus amenities if available
      amenities = amadeus.hotel.amenities;
    } else if (google.amenities && google.amenities.length > 0) {
      // Use Google amenities if available
      amenities = google.amenities;
    } else {
      amenities = [];
    }

    // Determine booking availability and source
    const hasAmadeusData = amadeus?.offers && amadeus.offers.length > 0;
    const hasTripAdvisorData = tripAdvisor?.bookingOptions && tripAdvisor.bookingOptions.length > 0;
    
    let bookingAvailable = hasAmadeusData || hasTripAdvisorData;
    let bookingSource: 'amadeus' | 'tripadvisor' | 'direct' | 'none' = 'none';

    if (hasAmadeusData) {
      bookingSource = 'amadeus';
    } else if (hasTripAdvisorData) {
      bookingSource = 'tripadvisor';
    } else {
      // If no API data, assume direct booking might be available
      bookingAvailable = true;
      bookingSource = 'direct';
    }

    return {
      // Google data (always available)
      id: google.id,
      name: google.name,
      address: google.address,
      coordinates: google.coordinates,
      rating: google.rating,
      photos: google.photos || [],
      priceLevel: google.priceLevel || 0,
      types: google.types || [],
      phone: google.phone,
      website: google.website,
      description: google.editorialSummary || 'Experience luxury at its finest in the heart of Vietnam. Our hotel offers stunning views, world-class amenities, and exceptional services for an unforgettable stay.',
      
      // Amadeus data
      amadeusId: amadeusId,
      roomTypes: roomTypes,
      availability: availability,
      rates: rates,
      
      // TripAdvisor data
      tripAdvisorId: tripAdvisor?.id || 'google_places',
      reviews: reviews,
      amenities: amenities,
      bookingOptions: bookingOptions,
      
      // Booking status
      bookingAvailable: bookingAvailable,
      bookingSource: bookingSource
    };
  }

  // Helper methods for mock data
  private getMockRoomTypes(): RoomType[] {
    return [
      {
        id: 'room1',
        type: 'Standard Room',
        description: 'Comfortable room with city view',
        price: 1500000,
        currency: 'VND',
        amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom'],
        available: true
      },
      {
        id: 'room2',
        type: 'Deluxe Room',
        description: 'Spacious room with premium amenities',
        price: 2500000,
        currency: 'VND',
        amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom', 'Mini Bar', 'Balcony'],
        available: true
      }
    ];
  }

  private getMockAvailability(): AvailabilityInfo {
    return {
      checkIn: '2024-08-16',
      checkOut: '2024-08-17',
      roomsAvailable: 5,
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockReviews(): Review[] {
    return [
      {
        id: 'rev1',
        author: 'John D.',
        rating: 5,
        text: 'Excellent hotel with great service and clean rooms! The staff was very friendly and helpful. Perfect location in the heart of Hanoi.',
        date: '2024-08-10',
        helpful: 12
      },
      {
        id: 'rev2',
        author: 'Sarah M.',
        rating: 4,
        text: 'Very good location and comfortable stay. The rooms are spacious and well-maintained. Would definitely recommend for business travelers.',
        date: '2024-08-08',
        helpful: 8
      },
      {
        id: 'rev3',
        author: 'Google User',
        rating: 5,
        text: 'Amazing experience! The hotel exceeded all expectations. Great amenities and the restaurant serves delicious local Vietnamese cuisine.',
        date: '2024-08-05',
        helpful: 15
      },
      {
        id: 'rev4',
        author: 'Michael T.',
        rating: 4,
        text: 'Great value for money. The hotel is clean, modern, and the staff speaks good English. Perfect for tourists visiting Hanoi.',
        date: '2024-08-03',
        helpful: 11
      },
      {
        id: 'rev5',
        author: 'Lisa K.',
        rating: 5,
        text: 'Beautiful hotel with stunning city views. The breakfast buffet is amazing and the spa services are top-notch. Highly recommend!',
        date: '2024-08-01',
        helpful: 19
      },
      {
        id: 'rev6',
        author: 'David L.',
        rating: 4,
        text: 'Comfortable stay with excellent location. Easy access to major attractions and shopping areas. Room service was prompt and delicious.',
        date: '2024-07-29',
        helpful: 7
      }
    ];
  }

  private getMockAmenities(): string[] {
    return ['WiFi', 'Parking', 'Room Service', 'Swimming Pool', 'Restaurant', 'Gym'];
  }

  // Helper methods for date handling
  private getDefaultCheckInDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private getDefaultCheckOutDate(): string {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split('T')[0];
  }

  // Mock method for getting hotel details from Google Places
  async getMockHotelDetails(hotelId: string): Promise<EnhancedHotel> {
    // Return mock data for testing
    return {
      id: hotelId,
      name: 'Sample Hotel',
      address: '123 Sample Street, Hanoi, Vietnam',
      coordinates: { lat: 21.0285, lng: 105.8542 },
      rating: 4.5,
      photos: ['https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Hotel+Photo'],
      priceLevel: 3,
      types: ['lodging', 'establishment'],
      phone: '+84 24 1234 5678',
      website: 'https://samplehotel.com',
      description: 'Experience luxury at its finest in the heart of Vietnam. Our hotel offers stunning views, world-class amenities, and exceptional services for an unforgettable stay.',
      amadeusId: 'mock_amadeus_id',
      roomTypes: this.getMockRoomTypes(),
      availability: this.getMockAvailability(),
      rates: [],
      tripAdvisorId: 'mock_tripadvisor_id',
      reviews: [],
      amenities: [],
      bookingOptions: [],
      bookingAvailable: true,
      bookingSource: 'direct'
    };
  }

  // Method to search hotels using Amadeus
  async searchHotelsByLocation(
    latitude: number, 
    longitude: number, 
    radius: number = 5
  ): Promise<AmadeusHotel[]> {
    try {
      return await this.amadeusService.searchHotels({
        latitude,
        longitude,
        radius,
        radiusUnit: 'KM'
      });
    } catch (error) {
      console.log('Falling back to mock Amadeus search:', error);
      return await this.amadeusService.getMockHotelSearch();
    }
  }

  // Method to get hotel offers for specific dates
  async getHotelOffersForDates(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 2,
    children: number = 0,
    roomQuantity: number = 1
  ) {
    try {
      return await this.amadeusService.getHotelOffers(
        hotelIds,
        checkInDate,
        checkOutDate,
        adults,
        children,
        roomQuantity
      );
    } catch (error) {
      console.log('Falling back to mock offers:', error);
      return await this.amadeusService.getMockHotelOffers(hotelIds[0]);
    }
  }
}
