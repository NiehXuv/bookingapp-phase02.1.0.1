import { GoogleHotel } from '../services/googlePlacesService';

// Mock hotel data - Ready for Mockaroo generation
// Structure matches GoogleHotel interface for easy replacement
export const mockHotels: GoogleHotel[] = [
  {
    id: 'hotel_1',
    name: 'Hanoi Emerald Waters Hotel & Spa',
    price: 1200000,
    rating: 4.5,
    location: 'Hoan Kiem District, Hanoi, Vietnam',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    amenities: ['WiFi', 'Parking', 'Room Service', 'Pool', 'Restaurant', 'Spa', 'Gym'],
    address: '15 Hang Gai Street, Hoan Kiem District, Hanoi, Vietnam',
    phone: '+84 24 3825 1234',
    website: 'https://example.com/hotel1',
    openingHours: ['Open 24 hours'],
    priceLevel: 3,
    userRatingsTotal: 1250,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    reviews: [
      {
        author_name: 'Sarah M.',
        rating: 5,
        text: 'Excellent hotel with great service and location!',
        time: 1640995200,
        relative_time_description: '2 months ago'
      },
      {
        author_name: 'Michael T.',
        rating: 4,
        text: 'Nice place, clean rooms and friendly staff.',
        time: 1640908800,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Luxury hotel in the heart of Hanoi with modern amenities and excellent service.'
  },
  {
    id: 'hotel_2',
    name: 'Hanoi Legend Hotel',
    price: 800000,
    rating: 4.2,
    location: 'Ba Dinh District, Hanoi, Vietnam',
    coordinates: { lat: 21.0300, lng: 105.8500 },
    amenities: ['WiFi', 'Parking', 'Room Service', 'Gym', 'Bar', 'Restaurant'],
    address: '22 Ly Thuong Kiet Street, Ba Dinh District, Hanoi, Vietnam',
    phone: '+84 24 3825 5678',
    website: 'https://example.com/hotel2',
    openingHours: ['Open 24 hours'],
    priceLevel: 2,
    userRatingsTotal: 890,
    photos: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    ],
    reviews: [
      {
        author_name: 'David L.',
        rating: 4,
        text: 'Good value for money, central location.',
        time: 1640822400,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Comfortable mid-range hotel with convenient location near major attractions.'
  },
  {
    id: 'hotel_3',
    name: 'Hanoi Grand Resort',
    price: 2500000,
    rating: 4.8,
    location: 'Tay Ho District, Hanoi, Vietnam',
    coordinates: { lat: 21.0275, lng: 105.8525 },
    amenities: ['WiFi', 'Parking', 'Room Service', 'Spa', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
    address: '45 West Lake Road, Tay Ho District, Hanoi, Vietnam',
    phone: '+84 24 3825 9999',
    website: 'https://example.com/hotel3',
    openingHours: ['Open 24 hours'],
    priceLevel: 4,
    userRatingsTotal: 2100,
    photos: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    ],
    reviews: [
      {
        author_name: 'Emma W.',
        rating: 5,
        text: 'Absolutely stunning resort with amazing views!',
        time: 1640736000,
        relative_time_description: '2 months ago'
      },
      {
        author_name: 'James K.',
        rating: 5,
        text: 'Best hotel experience in Hanoi. Highly recommended!',
        time: 1640649600,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Premium luxury resort offering world-class amenities and breathtaking views of West Lake.'
  },
  {
    id: 'hotel_4',
    name: 'Hanoi Boutique Hotel',
    price: 600000,
    rating: 4.0,
    location: 'Dong Da District, Hanoi, Vietnam',
    coordinates: { lat: 21.0265, lng: 105.8515 },
    amenities: ['WiFi', 'Parking', 'Restaurant', 'AC'],
    address: '88 Le Duan Street, Dong Da District, Hanoi, Vietnam',
    phone: '+84 24 3825 3333',
    website: 'https://example.com/hotel4',
    openingHours: ['Open 24 hours'],
    priceLevel: 2,
    userRatingsTotal: 450,
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    reviews: [
      {
        author_name: 'Lisa P.',
        rating: 4,
        text: 'Cozy hotel with friendly staff.',
        time: 1640563200,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Charming boutique hotel offering comfortable accommodations at affordable prices.'
  },
  {
    id: 'hotel_5',
    name: 'Hanoi Business Center Hotel',
    price: 1800000,
    rating: 4.3,
    location: 'Cau Giay District, Hanoi, Vietnam',
    coordinates: { lat: 21.0295, lng: 105.8535 },
    amenities: ['WiFi', 'Parking', 'Business Center', 'Conference Rooms', 'Restaurant', 'Gym'],
    address: '120 Xuan Thuy Street, Cau Giay District, Hanoi, Vietnam',
    phone: '+84 24 3825 7777',
    website: 'https://example.com/hotel5',
    openingHours: ['Open 24 hours'],
    priceLevel: 3,
    userRatingsTotal: 780,
    photos: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    reviews: [
      {
        author_name: 'Robert H.',
        rating: 4,
        text: 'Perfect for business travelers, great facilities.',
        time: 1640476800,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Modern business hotel with comprehensive facilities for corporate travelers.'
  },
  {
    id: 'hotel_6',
    name: 'Hanoi Riverside Hotel',
    price: 1500000,
    rating: 4.6,
    location: 'Long Bien District, Hanoi, Vietnam',
    coordinates: { lat: 21.0310, lng: 105.8550 },
    amenities: ['WiFi', 'Parking', 'Pool', 'Restaurant', 'Bar', 'Spa'],
    address: '200 Red River Road, Long Bien District, Hanoi, Vietnam',
    phone: '+84 24 3825 4444',
    website: 'https://example.com/hotel6',
    openingHours: ['Open 24 hours'],
    priceLevel: 3,
    userRatingsTotal: 1100,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    reviews: [
      {
        author_name: 'Anna B.',
        rating: 5,
        text: 'Beautiful riverside location, excellent service!',
        time: 1640390400,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Elegant hotel with stunning river views and premium amenities.'
  }
];

// Helper function to get hotels by search query
export const getMockHotels = (query?: string): GoogleHotel[] => {
  if (!query || query.trim() === '') {
    return mockHotels;
  }
  
  const lowerQuery = query.toLowerCase();
  return mockHotels.filter(hotel => 
    hotel.name.toLowerCase().includes(lowerQuery) ||
    hotel.location.toLowerCase().includes(lowerQuery) ||
    hotel.address.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get hotel by ID
export const getMockHotelById = (id: string): GoogleHotel | undefined => {
  return mockHotels.find(hotel => hotel.id === id);
};

