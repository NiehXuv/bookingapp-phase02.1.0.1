import { EnhancedPlace, Review, TourOption } from '../types/explore';
import { getMockPlaceById } from './mockPlaces';
import { getMockTourById } from './mockTours';

// Mock enhanced place data - combines Google Places data with tour options, reviews, etc.
// Ready for Mockaroo generation
export const getMockEnhancedPlace = (placeId: string, coordinates?: { lat: number; lng: number }): EnhancedPlace => {
  // Check if it's a tour (starts with 'tour_')
  if (placeId.startsWith('tour_')) {
    return getMockEnhancedTour(placeId, coordinates);
  }
  
  // Get base place data from mock places
  const basePlace = getMockPlaceById(placeId);
  
  if (!basePlace) {
    // Return default mock if place not found
    return getDefaultMockPlace(placeId, coordinates);
  }

  // Generate reviews
  const reviews: Review[] = generateReviews(basePlace.name);
  
  // Generate tour options
  const tourOptions: TourOption[] = generateTourOptions(basePlace.name, basePlace.type);
  
  // Generate amenities
  const amenities = generateAmenities(basePlace.type, basePlace.types || []);

  return {
    // Google Places data
    id: basePlace.id,
    name: basePlace.name,
    type: basePlace.type,
    address: basePlace.address,
    coordinates: basePlace.coordinates,
    rating: basePlace.rating,
    photos: basePlace.photos || [],
    tripAdvisorId: `mock_tripadvisor_${basePlace.id}`,
    reviews: reviews,
    description: basePlace.editorialSummary || `Discover ${basePlace.name}, a beautiful ${basePlace.type.toLowerCase()} in the heart of Vietnam. Experience the rich culture, stunning landscapes, and unforgettable memories that await you.`,
    openingHours: basePlace.openingHours || ['Open daily from 8:00 AM to 6:00 PM'],
    amenities: amenities,
    ticketsAvailable: true,
    tourOptions: tourOptions
  };
};

// Get enhanced tour data
function getMockEnhancedTour(tourId: string, coordinates?: { lat: number; lng: number }): EnhancedPlace {
  const tour = getMockTourById(tourId);
  
  if (!tour) {
    return getDefaultMockPlace(tourId, coordinates);
  }

  const reviews: Review[] = generateReviews(tour.name);
  
  return {
    id: tour.id,
    name: tour.name,
    type: 'Tour',
    address: tour.location,
    coordinates: tour.coordinates,
    rating: tour.rating,
    photos: tour.photos || [],
    tripAdvisorId: `mock_tripadvisor_${tour.id}`,
    reviews: reviews,
    description: tour.description,
    openingHours: ['Available daily'],
    amenities: tour.includes || [],
    ticketsAvailable: tour.available,
    tourOptions: [{
      id: tour.id,
      name: tour.name,
      price: tour.price,
      currency: tour.currency,
      duration: tour.duration,
      description: tour.description,
      provider: tour.provider
    }]
  };
}

// Helper function to generate reviews
function generateReviews(name: string): Review[] {
  const reviewTemplates = [
    {
      author: 'John D.',
      rating: 5,
      text: `Amazing experience! ${name} exceeded all expectations. Highly recommended for anyone visiting Vietnam.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 20) + 5
    },
    {
      author: 'Sarah M.',
      rating: 4,
      text: `Great place to visit! Beautiful location with rich history and culture.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 15) + 3
    },
    {
      author: 'Michael T.',
      rating: 5,
      text: `Absolutely stunning! One of the best places I've visited in Vietnam.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 25) + 10
    },
    {
      author: 'Emma W.',
      rating: 4,
      text: `Wonderful experience! The place is well-maintained and the staff is friendly.`,
      date: getRandomDate(),
      helpful: Math.floor(Math.random() * 18) + 5
    }
  ];

  return reviewTemplates.map((template, index) => ({
    id: `rev_${index + 1}`,
    ...template
  }));
}

// Helper function to generate tour options
function generateTourOptions(name: string, type: string): TourOption[] {
  return [
    {
      id: 'tour_standard',
      name: `Standard ${type} Tour`,
      price: 500000,
      currency: 'VND',
      duration: '2-3 hours',
      description: `Explore ${name} with a professional guide. Learn about the history and culture of this amazing destination.`,
      provider: 'Local Tours'
    },
    {
      id: 'tour_premium',
      name: `Premium ${type} Experience`,
      price: 1500000,
      currency: 'VND',
      duration: '4-5 hours',
      description: `Exclusive private tour with premium access and personalized experience at ${name}.`,
      provider: 'Premium Tours'
    }
  ];
}

// Helper function to generate amenities
function generateAmenities(type: string, types: string[]): string[] {
  const baseAmenities: string[] = [];
  
  if (type.toLowerCase().includes('temple') || type.toLowerCase().includes('pagoda')) {
    baseAmenities.push('Prayer Hall', 'Garden', 'Cultural Experience', 'Historical Site');
  } else if (type.toLowerCase().includes('museum')) {
    baseAmenities.push('Exhibits', 'Guided Tours', 'Educational Programs', 'Gift Shop');
  } else if (type.toLowerCase().includes('park') || type.toLowerCase().includes('lake')) {
    baseAmenities.push('Walking Paths', 'Scenic Views', 'Recreation Area', 'Nature');
  } else {
    baseAmenities.push('Tourist Information', 'Photo Opportunities', 'Cultural Heritage');
  }
  
  baseAmenities.push('Accessibility', 'Information Center');
  
  return [...new Set(baseAmenities)].slice(0, 8);
}

// Helper function to get default mock place
function getDefaultMockPlace(placeId: string, coordinates?: { lat: number; lng: number }): EnhancedPlace {
  return {
    id: placeId,
    name: 'Sample Tourist Attraction',
    type: 'Tourist Attraction',
    address: '123 Sample Street, Hanoi, Vietnam',
    coordinates: coordinates || { lat: 21.0285, lng: 105.8542 },
    rating: 4.3,
    photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
    tripAdvisorId: 'mock_tripadvisor_id',
    reviews: generateReviews('Sample Place'),
    description: 'A fascinating destination with rich cultural heritage and stunning architecture.',
    openingHours: ['Monday: 9:00 AM - 6:00 PM', 'Tuesday: 9:00 AM - 6:00 PM'],
    amenities: ['Tourist Information', 'Photo Opportunities', 'Cultural Heritage', 'Accessibility'],
    ticketsAvailable: true,
    tourOptions: generateTourOptions('Sample Place', 'Attraction')
  };
}

// Helper function for dates
function getRandomDate(): string {
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

