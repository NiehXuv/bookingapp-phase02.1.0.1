import { GooglePlace } from '../services/googlePlacesService';

// Mock places/attractions data - Ready for Mockaroo generation
// Structure matches GooglePlace interface for easy replacement
export const mockPlaces: GooglePlace[] = [
  {
    id: 'place_1',
    name: 'Hoan Kiem Lake',
    type: 'Lake',
    types: ['natural_feature', 'tourist_attraction', 'establishment'],
    coordinates: { lat: 21.0285, lng: 105.8542 },
    rating: 4.7,
    address: 'Hoan Kiem District, Hanoi, Vietnam',
    phone: '+84 24 3825 1234',
    website: 'https://example.com/hoankiem',
    openingHours: ['Open 24 hours'],
    priceLevel: 0,
    userRatingsTotal: 15200,
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    reviews: [
      {
        author_name: 'Maria S.',
        rating: 5,
        text: 'Beautiful lake in the heart of Hanoi, perfect for a morning walk!',
        time: 1640995200,
        relative_time_description: '2 months ago'
      },
      {
        author_name: 'Tom R.',
        rating: 4,
        text: 'Great place to relax and enjoy the scenery.',
        time: 1640908800,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Historic lake in the center of Hanoi, surrounded by beautiful temples and gardens.'
  },
  {
    id: 'place_2',
    name: 'Temple of Literature',
    type: 'Historical Site',
    types: ['place_of_worship', 'tourist_attraction', 'establishment'],
    coordinates: { lat: 21.0245, lng: 105.8412 },
    rating: 4.6,
    address: '58 Quoc Tu Giam Street, Dong Da District, Hanoi, Vietnam',
    phone: '+84 24 3845 2917',
    website: 'https://example.com/temple',
    openingHours: ['Monday: 8:00 AM - 5:00 PM', 'Tuesday: 8:00 AM - 5:00 PM', 'Wednesday: 8:00 AM - 5:00 PM'],
    priceLevel: 1,
    userRatingsTotal: 8900,
    photos: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    reviews: [
      {
        author_name: 'John D.',
        rating: 5,
        text: 'Amazing historical site, well preserved and informative.',
        time: 1640822400,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Vietnam\'s first university, built in 1070, featuring traditional Vietnamese architecture.'
  },
  {
    id: 'place_3',
    name: 'West Lake',
    type: 'Lake',
    types: ['natural_feature', 'tourist_attraction'],
    coordinates: { lat: 21.0455, lng: 105.8122 },
    rating: 4.5,
    address: 'Tay Ho District, Hanoi, Vietnam',
    phone: undefined,
    website: undefined,
    openingHours: ['Open 24 hours'],
    priceLevel: 0,
    userRatingsTotal: 6700,
    photos: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    reviews: [
      {
        author_name: 'Sarah L.',
        rating: 4,
        text: 'Largest lake in Hanoi, great for cycling and walking.',
        time: 1640736000,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'The largest freshwater lake in Hanoi, popular for recreation and scenic views.'
  },
  {
    id: 'place_4',
    name: 'Old Quarter',
    type: 'Cultural Area',
    types: ['establishment', 'tourist_attraction'],
    coordinates: { lat: 21.0325, lng: 105.8582 },
    rating: 4.8,
    address: 'Hoan Kiem District, Hanoi, Vietnam',
    phone: undefined,
    website: undefined,
    openingHours: ['Open 24 hours'],
    priceLevel: 1,
    userRatingsTotal: 18900,
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'
    ],
    reviews: [
      {
        author_name: 'Michael T.',
        rating: 5,
        text: 'Must visit! Full of history, great food, and vibrant atmosphere.',
        time: 1640649600,
        relative_time_description: '2 months ago'
      },
      {
        author_name: 'Emma W.',
        rating: 5,
        text: 'The heart of Hanoi, so much to see and do here!',
        time: 1640563200,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Historic 36-street quarter with narrow alleys, traditional architecture, and bustling markets.'
  },
  {
    id: 'place_5',
    name: 'Ho Chi Minh Mausoleum',
    type: 'Monument',
    types: ['establishment', 'tourist_attraction'],
    coordinates: { lat: 21.0365, lng: 105.8342 },
    rating: 4.4,
    address: 'Hung Vuong Street, Ba Dinh District, Hanoi, Vietnam',
    phone: '+84 24 3845 5128',
    website: 'https://example.com/mausoleum',
    openingHours: ['Tuesday: 8:00 AM - 11:00 AM', 'Wednesday: 8:00 AM - 11:00 AM', 'Thursday: 8:00 AM - 11:00 AM'],
    priceLevel: 0,
    userRatingsTotal: 11200,
    photos: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    reviews: [
      {
        author_name: 'David K.',
        rating: 4,
        text: 'Important historical site, respectful atmosphere.',
        time: 1640476800,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Final resting place of Ho Chi Minh, Vietnam\'s revolutionary leader and first president.'
  },
  {
    id: 'place_6',
    name: 'One Pillar Pagoda',
    type: 'Place of Worship',
    types: ['place_of_worship', 'tourist_attraction', 'establishment'],
    coordinates: { lat: 21.0355, lng: 105.8332 },
    rating: 4.3,
    address: 'Chua Mot Cot Street, Ba Dinh District, Hanoi, Vietnam',
    phone: undefined,
    website: undefined,
    openingHours: ['Monday: 7:00 AM - 6:00 PM', 'Tuesday: 7:00 AM - 6:00 PM'],
    priceLevel: 0,
    userRatingsTotal: 5600,
    photos: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'
    ],
    reviews: [
      {
        author_name: 'Lisa P.',
        rating: 4,
        text: 'Unique architecture, beautiful and peaceful.',
        time: 1640390400,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Historic Buddhist temple built in 1049, known for its unique one-pillar design.'
  },
  {
    id: 'place_7',
    name: 'Hanoi Opera House',
    type: 'Theater',
    types: ['establishment', 'tourist_attraction'],
    coordinates: { lat: 21.0225, lng: 105.8562 },
    rating: 4.5,
    address: '1 Trang Tien Street, Hoan Kiem District, Hanoi, Vietnam',
    phone: '+84 24 3933 0113',
    website: 'https://example.com/opera',
    openingHours: ['Monday: 9:00 AM - 5:00 PM', 'Tuesday: 9:00 AM - 5:00 PM'],
    priceLevel: 2,
    userRatingsTotal: 3400,
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    reviews: [
      {
        author_name: 'Robert H.',
        rating: 5,
        text: 'Beautiful French colonial architecture, great performances!',
        time: 1640304000,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Stunning French colonial opera house built in 1911, hosting cultural performances.'
  },
  {
    id: 'place_8',
    name: 'Thang Long Water Puppet Theatre',
    type: 'Theater',
    types: ['establishment', 'tourist_attraction'],
    coordinates: { lat: 21.0295, lng: 105.8572 },
    rating: 4.6,
    address: '57B Dinh Tien Hoang Street, Hoan Kiem District, Hanoi, Vietnam',
    phone: '+84 24 3824 9494',
    website: 'https://example.com/puppet',
    openingHours: ['Monday: 3:00 PM - 9:00 PM', 'Tuesday: 3:00 PM - 9:00 PM'],
    priceLevel: 1,
    userRatingsTotal: 7800,
    photos: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'
    ],
    reviews: [
      {
        author_name: 'Anna B.',
        rating: 5,
        text: 'Unique Vietnamese cultural experience, highly recommended!',
        time: 1640217600,
        relative_time_description: '2 months ago'
      }
    ],
    editorialSummary: 'Traditional Vietnamese water puppet show, a must-see cultural experience in Hanoi.'
  }
];

// Helper function to get places by search query
export const getMockPlaces = (query?: string): GooglePlace[] => {
  if (!query || query.trim() === '') {
    return mockPlaces;
  }
  
  const lowerQuery = query.toLowerCase();
  return mockPlaces.filter(place => 
    place.name.toLowerCase().includes(lowerQuery) ||
    place.type.toLowerCase().includes(lowerQuery) ||
    place.address.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get place by ID
export const getMockPlaceById = (id: string): GooglePlace | undefined => {
  return mockPlaces.find(place => place.id === id);
};

