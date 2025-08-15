// Enhanced types for hotels and places combining multiple APIs
export interface EnhancedHotel {
  // Google Places data
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  photos: string[];
  priceLevel: number;
  types: string[];
  phone?: string;
  website?: string;
  description?: string;
  
  // Amadeus data
  amadeusId?: string;
  roomTypes: RoomType[];
  availability: AvailabilityInfo | null;
  rates: RateInfo[];
  
  // TripAdvisor data
  tripAdvisorId: string;
  reviews: Review[];
  amenities: string[];
  bookingOptions: BookingOption[];
  
  // Booking status
  bookingAvailable: boolean;
  bookingSource: 'amadeus' | 'tripadvisor' | 'direct' | 'none';
}

export interface EnhancedPlace {
  // Google Places data
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  photos: string[];
  
  // TripAdvisor data (when available)
  tripAdvisorId?: string;
  reviews?: Review[];
  description?: string;
  openingHours?: string[];
  amenities?: string[];
  
  // Booking status
  ticketsAvailable: boolean;
  tourOptions?: TourOption[];
}

// Supporting types
export interface RoomType {
  id: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  amenities: string[];
  available: boolean;
}

export interface AvailabilityInfo {
  checkIn: string;
  checkOut: string;
  roomsAvailable: number;
  lastUpdated: string;
}

export interface RateInfo {
  id: string;
  roomType: string;
  rate: number;
  currency: string;
  cancellationPolicy: string;
  breakfast: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

export interface BookingOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  provider: string;
}

export interface TourOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  description: string;
  provider: string;
}
