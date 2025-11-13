import { EnhancedHotel, RoomType, Review } from '../types/explore';
import { getMockHotelById } from './mockHotels';

// Mock enhanced hotel data - combines Google Places data with room types, reviews, etc.
// Ready for Mockaroo generation
export const getMockEnhancedHotel = (hotelId: string, coordinates?: { lat: number; lng: number }): EnhancedHotel => {
  // Get base hotel data from mock hotels
  const baseHotel = getMockHotelById(hotelId);
  
  if (!baseHotel) {
    // Return default mock if hotel not found
    return getDefaultMockHotel(hotelId, coordinates);
  }

  // Generate room types based on hotel price
  const roomTypes: RoomType[] = generateRoomTypes(baseHotel.price);
  
  // Generate reviews
  const reviews: Review[] = generateReviews(baseHotel.name);
  
  // Generate amenities
  const amenities = baseHotel.amenities || ['WiFi', 'Parking', 'Room Service'];

  return {
    // Google Places data
    id: baseHotel.id,
    name: baseHotel.name,
    address: baseHotel.address,
    coordinates: baseHotel.coordinates,
    rating: baseHotel.rating,
    photos: baseHotel.photos || [],
    priceLevel: baseHotel.priceLevel || 3,
    types: ['lodging', 'establishment'],
    phone: baseHotel.phone,
    website: baseHotel.website,
    description: baseHotel.editorialSummary || 'Experience luxury at its finest in the heart of Vietnam. Our hotel offers stunning views, world-class amenities, and exceptional services for an unforgettable stay.',
    
    // Amadeus data (mock)
    amadeusId: `mock_amadeus_${baseHotel.id}`,
    roomTypes: roomTypes,
    availability: {
      checkIn: getDefaultCheckInDate(),
      checkOut: getDefaultCheckOutDate(),
      roomsAvailable: Math.floor(Math.random() * 10) + 1,
      lastUpdated: new Date().toISOString()
    },
    rates: [],
    
    // TripAdvisor data (mock)
    tripAdvisorId: `mock_tripadvisor_${baseHotel.id}`,
    reviews: reviews,
    amenities: amenities,
    bookingOptions: [],
    
    // Booking status
    bookingAvailable: true,
    bookingSource: 'direct'
  };
};

// Helper function to generate room types based on hotel price
function generateRoomTypes(basePrice: number): RoomType[] {
  return [
    {
      id: 'room_standard',
      type: 'Standard Room',
      description: 'Comfortable room with city view, perfect for solo travelers or couples.',
      price: Math.round(basePrice * 0.8),
      currency: 'VND',
      amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom', 'Mini Fridge'],
      available: true
    },
    {
      id: 'room_deluxe',
      type: 'Deluxe Room',
      description: 'Spacious room with premium amenities and stunning views.',
      price: basePrice,
      currency: 'VND',
      amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Room Service'],
      available: true
    },
    {
      id: 'room_suite',
      type: 'Suite',
      description: 'Luxurious suite with separate living area and premium amenities.',
      price: Math.round(basePrice * 1.5),
      currency: 'VND',
      amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom', 'Mini Bar', 'Balcony', 'Room Service', 'Jacuzzi', 'Living Room'],
      available: true
    }
  ];
}

// Helper function to generate reviews
function generateReviews(hotelName: string): Review[] {
  const reviewTemplates = [
    {
      author: 'John D.',
      rating: 5,
      text: `Excellent hotel with great service and clean rooms! The staff was very friendly and helpful. Perfect location in the heart of Hanoi. ${hotelName} exceeded all expectations.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 20) + 5
    },
    {
      author: 'Sarah M.',
      rating: 4,
      text: `Very good location and comfortable stay. The rooms are spacious and well-maintained. Would definitely recommend for business travelers.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 15) + 3
    },
    {
      author: 'Michael T.',
      rating: 5,
      text: `Amazing experience! The hotel exceeded all expectations. Great amenities and the restaurant serves delicious local Vietnamese cuisine.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 25) + 10
    },
    {
      author: 'Emma W.',
      rating: 4,
      text: `Beautiful hotel with stunning city views. The breakfast buffet is amazing and the spa services are top-notch. Highly recommend!`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 18) + 5
    },
    {
      author: 'David L.',
      rating: 4,
      text: `Comfortable stay with excellent location. Easy access to major attractions and shopping areas. Room service was prompt and delicious.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 12) + 2
    },
    {
      author: 'Lisa K.',
      rating: 5,
      text: `Perfect stay! The hotel is clean, modern, and the staff speaks good English. Perfect for tourists visiting Hanoi. Will definitely come back!`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 22) + 8
    }
  ];

  return reviewTemplates.map((template, index) => ({
    id: `rev_${index + 1}`,
    ...template
  }));
}

// Helper function to get default mock hotel
function getDefaultMockHotel(hotelId: string, coordinates?: { lat: number; lng: number }): EnhancedHotel {
  return {
    id: hotelId,
    name: 'Sample Hotel',
    address: '123 Sample Street, Hanoi, Vietnam',
    coordinates: coordinates || { lat: 21.0285, lng: 105.8542 },
    rating: 4.5,
    photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    priceLevel: 3,
    types: ['lodging', 'establishment'],
    phone: '+84 24 1234 5678',
    website: 'https://samplehotel.com',
    description: 'Experience luxury at its finest in the heart of Vietnam. Our hotel offers stunning views, world-class amenities, and exceptional services for an unforgettable stay.',
    amadeusId: 'mock_amadeus_id',
    roomTypes: generateRoomTypes(1500000),
    availability: {
      checkIn: getDefaultCheckInDate(),
      checkOut: getDefaultCheckOutDate(),
      roomsAvailable: 5,
      lastUpdated: new Date().toISOString()
    },
    rates: [],
    tripAdvisorId: 'mock_tripadvisor_id',
    reviews: generateReviews('Sample Hotel'),
    amenities: ['WiFi', 'Parking', 'Room Service', 'Swimming Pool', 'Restaurant', 'Gym'],
    bookingOptions: [],
    bookingAvailable: true,
    bookingSource: 'direct'
  };
}

// Helper functions for dates
function getDefaultCheckInDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getDefaultCheckOutDate(): string {
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  return dayAfterTomorrow.toISOString().split('T')[0];
}

function getRandomDate(): string {
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

