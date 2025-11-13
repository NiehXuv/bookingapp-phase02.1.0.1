// Mock tours data - Ready for Mockaroo generation
export interface MockTour {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  location: string;
  coordinates: { lat: number; lng: number };
  photos: string[];
  category: string;
  includes: string[];
  excludes: string[];
  highlights: string[];
  provider: string;
  available: boolean;
}

export const mockTours: MockTour[] = [
  {
    id: 'tour_1',
    name: 'Hanoi City Full Day Tour',
    description: 'Explore the best of Hanoi in one day with our comprehensive city tour covering major attractions.',
    duration: '8 hours',
    price: 1500000,
    currency: 'VND',
    rating: 4.7,
    location: 'Hanoi, Vietnam',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'
    ],
    category: 'City Tour',
    includes: ['Professional guide', 'Transportation', 'Lunch', 'Entrance fees'],
    excludes: ['Personal expenses', 'Tips'],
    highlights: ['Hoan Kiem Lake', 'Temple of Literature', 'Old Quarter', 'Ho Chi Minh Mausoleum'],
    provider: 'Hanoi Tours',
    available: true
  },
  {
    id: 'tour_2',
    name: 'Ha Long Bay Day Cruise',
    description: 'Experience the stunning beauty of Ha Long Bay with a full-day cruise.',
    duration: '12 hours',
    price: 2500000,
    currency: 'VND',
    rating: 4.9,
    location: 'Ha Long Bay, Vietnam',
    coordinates: { lat: 20.9101, lng: 107.1839 },
    photos: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    category: 'Cruise',
    includes: ['Cruise ticket', 'Lunch', 'Guide', 'Kayaking'],
    excludes: ['Transportation to Ha Long', 'Personal expenses'],
    highlights: ['Limestone karsts', 'Cave exploration', 'Kayaking', 'Sunset views'],
    provider: 'Ha Long Cruises',
    available: true
  },
  {
    id: 'tour_3',
    name: 'Street Food Walking Tour',
    description: 'Discover Hanoi\'s culinary scene with a guided street food tour through the Old Quarter.',
    duration: '3 hours',
    price: 800000,
    currency: 'VND',
    rating: 4.8,
    location: 'Hanoi Old Quarter, Vietnam',
    coordinates: { lat: 21.0325, lng: 105.8582 },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    category: 'Food Tour',
    includes: ['Food samples', 'Guide', 'Water'],
    excludes: ['Additional food', 'Drinks'],
    highlights: ['Pho', 'Banh Mi', 'Egg Coffee', 'Local markets'],
    provider: 'Hanoi Food Tours',
    available: true
  },
  {
    id: 'tour_4',
    name: 'Sapa Trekking Adventure',
    description: '2-day trekking adventure through Sapa\'s stunning rice terraces and ethnic villages.',
    duration: '2 days',
    price: 3500000,
    currency: 'VND',
    rating: 4.6,
    location: 'Sapa, Vietnam',
    coordinates: { lat: 22.3364, lng: 103.8443 },
    photos: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    category: 'Adventure',
    includes: ['Accommodation', 'Meals', 'Guide', 'Transportation'],
    excludes: ['Personal expenses', 'Tips'],
    highlights: ['Rice terraces', 'Ethnic villages', 'Mountain views', 'Local culture'],
    provider: 'Sapa Adventures',
    available: true
  },
  {
    id: 'tour_5',
    name: 'Hoa Lu - Tam Coc Day Trip',
    description: 'Visit the ancient capital Hoa Lu and enjoy a boat ride through Tam Coc\'s limestone caves.',
    duration: '10 hours',
    price: 1800000,
    currency: 'VND',
    rating: 4.5,
    location: 'Ninh Binh, Vietnam',
    coordinates: { lat: 20.2581, lng: 105.9750 },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    category: 'Day Trip',
    includes: ['Transportation', 'Lunch', 'Boat ride', 'Guide', 'Entrance fees'],
    excludes: ['Personal expenses', 'Tips'],
    highlights: ['Ancient temples', 'Boat ride', 'Limestone caves', 'Countryside views'],
    provider: 'Ninh Binh Tours',
    available: true
  }
];

// Helper function to get tours by search query
export const getMockTours = (query?: string): MockTour[] => {
  if (!query || query.trim() === '') {
    return mockTours;
  }
  
  const lowerQuery = query.toLowerCase();
  return mockTours.filter(tour => 
    tour.name.toLowerCase().includes(lowerQuery) ||
    tour.location.toLowerCase().includes(lowerQuery) ||
    tour.category.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get tour by ID
export const getMockTourById = (id: string): MockTour | undefined => {
  return mockTours.find(tour => tour.id === id);
};

