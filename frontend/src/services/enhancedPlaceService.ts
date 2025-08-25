import { googlePlacesService, GooglePlace } from './googlePlacesService';
import { tripAdvisorService } from './tripadvisorService';
import { EnhancedPlace, Review, TourOption } from '../types/explore';

export class EnhancedPlaceService {
  async getPlaceDetails(placeId: string, coordinates: any): Promise<EnhancedPlace> {
    try {
      // 1. Get Google Places details
      const googleData = await googlePlacesService.getPlaceDetails(placeId);
      
      // 2. Try to get TripAdvisor data
      let tripAdvisorData = null;
      try {
        // TODO: Implement TripAdvisor API integration
        // tripAdvisorData = await tripAdvisorService.searchPlaces({
        //   query: googleData.name,
        //   location: googleData.address
        // });
        console.log('TripAdvisor API integration pending');
      } catch (error) {
        console.log('TripAdvisor data not available for this place');
      }
      
      // 3. Merge all data
      return this.mergePlaceData(googleData, tripAdvisorData);
    } catch (error) {
      throw new Error('Failed to get place details');
    }
  }

  // New method for handling tour data directly
  async getTourDetails(tourData: any, coordinates: any): Promise<EnhancedPlace> {
    try {
      console.log('🎯 EnhancedPlaceService: Processing tour data directly');
      console.log('🎯 Tour data received:', tourData);
      
      // Ensure openingHours is always an array
      const safeOpeningHours = Array.isArray(tourData.openingHours) 
        ? tourData.openingHours 
        : (tourData.openingHours ? [tourData.openingHours] : ['Open daily']);
      
      console.log('🎯 Safe opening hours:', safeOpeningHours);
      
      // Transform tour data to EnhancedPlace format, preserving ALL Google Places API data
      const enhancedPlace: EnhancedPlace = {
        id: tourData.id || `tour_${Date.now()}`,
        name: tourData.name || 'Tour Experience',
        type: tourData.type || 'Tour',
        address: tourData.address || 'Vietnam',
        coordinates: coordinates,
        rating: tourData.rating || 4.0,
        // Preserve ALL photos from Google Places API
        photos: tourData.photos && Array.isArray(tourData.photos) && tourData.photos.length > 0 
          ? tourData.photos 
          : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
        // Preserve ALL reviews from Google Places API
        reviews: tourData.reviews && Array.isArray(tourData.reviews) && tourData.reviews.length > 0
          ? tourData.reviews.map((review: any, index: number) => ({
              id: review.id || `review_${index}`,
              author: review.author_name || review.author || 'Google User',
              date: review.date || review.relative_time_description || 'Recent',
              text: review.text || 'Great experience!',
              rating: review.rating || 5,
              helpful: Math.floor(Math.random() * 20) + 1
            }))
          : [{
              id: '1',
              author: 'Local Guide',
              date: 'Recent',
              text: 'Highly recommended experience!',
              rating: 5,
              helpful: 12
            }],
        // Preserve description from Google Places API
        description: tourData.editorialSummary || tourData.description || 'No description available.',
        // Preserve amenities or generate based on type
        amenities: tourData.amenities && Array.isArray(tourData.amenities) && tourData.amenities.length > 0
          ? tourData.amenities
          : ['Tour', 'Experience', 'Local Guide'],
        openingHours: safeOpeningHours,
        // Preserve tour options or create default
        tourOptions: tourData.tourOptions && Array.isArray(tourData.tourOptions) && tourData.tourOptions.length > 0
          ? tourData.tourOptions
          : [{
              id: tourData.id || `tour_${Date.now()}`,
              name: tourData.name || 'Tour Experience',
              price: tourData.price || 500000,
              currency: 'VND',
              duration: '2-3 hours',
              description: tourData.editorialSummary || tourData.description || 'Experience this amazing tour.',
              provider: 'Local Tours'
            }],
        ticketsAvailable: true
      };
      
      console.log('🎯 Enhanced place created with preserved data:', {
        photosCount: enhancedPlace.photos.length,
        reviewsCount: enhancedPlace.reviews?.length || 0,
        description: enhancedPlace.description,
        openingHours: enhancedPlace.openingHours
      });
      
      return enhancedPlace;
    } catch (error) {
      console.error('❌ Error processing tour data:', error);
      throw new Error('Failed to process tour data');
    }
  }
  
  private mergePlaceData(google: any, tripAdvisor: any): EnhancedPlace {
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

    // Use real Google data or fallback to mock data
    const reviews = google.reviews && google.reviews.length > 0 
      ? transformGoogleReviews(google.reviews)
      : [];

    const mockTourOptions: TourOption[] = [
      {
        id: 'tour1',
        name: 'Guided Walking Tour',
        price: 500000,
        currency: 'VND',
        duration: '2 hours',
        description: 'Explore the area with a professional guide',
        provider: 'Local Tours'
      },
      {
        id: 'tour2',
        name: 'Private VIP Tour',
        price: 1500000,
        currency: 'VND',
        duration: '3 hours',
        description: 'Exclusive private tour with premium access',
        provider: 'Premium Tours'
      }
    ];

    // Use real Google opening hours or fallback to mock data
    const openingHours = google.openingHours && Array.isArray(google.openingHours) && google.openingHours.length > 0
      ? google.openingHours // Google provides detailed opening hours array
      : [
          'Monday: 9:00 AM - 6:00 PM',
          'Tuesday: 9:00 AM - 6:00 PM',
          'Wednesday: 9:00 AM - 6:00 PM',
          'Thursday: 9:00 AM - 6:00 PM',
          'Friday: 9:00 AM - 6:00 PM',
          'Saturday: 9:00 AM - 6:00 PM',
          'Sunday: 9:00 AM - 6:00 PM'
        ];
    
    console.log('🎯 EnhancedPlaceService: Opening hours processed:', openingHours);

    // Generate dynamic amenities based on place type and available data
    const generateAmenities = (placeType: string, types: string[]): string[] => {
      const baseAmenities: string[] = [];
      
      // Add amenities based on place type
      if (placeType.toLowerCase().includes('temple') || placeType.toLowerCase().includes('pagoda')) {
        baseAmenities.push('Prayer Hall', 'Garden', 'Cultural Experience', 'Historical Site');
      } else if (placeType.toLowerCase().includes('museum')) {
        baseAmenities.push('Exhibits', 'Guided Tours', 'Educational Programs', 'Gift Shop');
      } else if (placeType.toLowerCase().includes('park') || placeType.toLowerCase().includes('lake')) {
        baseAmenities.push('Walking Paths', 'Scenic Views', 'Recreation Area', 'Nature');
      } else if (placeType.toLowerCase().includes('restaurant') || placeType.toLowerCase().includes('cafe')) {
        baseAmenities.push('Dining', 'Local Cuisine', 'Outdoor Seating', 'Takeaway');
      } else if (placeType.toLowerCase().includes('shopping')) {
        baseAmenities.push('Retail Stores', 'Local Products', 'Souvenirs', 'Markets');
      }
      
      // Add common amenities based on Google place types
      if (types) {
        types.forEach(type => {
          if (type === 'tourist_attraction') baseAmenities.push('Tourist Information', 'Photo Opportunities');
          if (type === 'place_of_worship') baseAmenities.push('Spiritual Experience', 'Cultural Heritage');
          if (type === 'natural_feature') baseAmenities.push('Natural Beauty', 'Outdoor Activities');
          if (type === 'establishment') baseAmenities.push('Local Business', 'Community Service');
        });
      }
      
      // Add universal amenities
      baseAmenities.push('Accessibility', 'Information Center');
      
      // Remove duplicates and limit to 8
      return [...new Set(baseAmenities)].slice(0, 8);
    };

    return {
      // Google data (always available)
      id: google.id,
      name: google.name,
      type: google.type,
      address: google.address,
      coordinates: google.coordinates,
      rating: google.rating,
      photos: google.photos || [],
      
      // Use real Google data or fallback to mock data
      tripAdvisorId: tripAdvisor?.id || 'google_places',
      reviews: reviews,
      description: google.editorialSummary || tripAdvisor?.description || 'A fascinating destination with rich cultural heritage and stunning architecture. Perfect for history buffs and culture enthusiasts.',
      openingHours: openingHours,
      amenities: tripAdvisor?.amenities || generateAmenities(google.type, google.types),
      
      // Booking status
      ticketsAvailable: !!(tripAdvisor?.tourOptions || true), // Mock as available
      tourOptions: tripAdvisor?.tourOptions || mockTourOptions
    };
  }

  // Mock method for getting place details
  async getMockPlaceDetails(placeId: string): Promise<EnhancedPlace> {
    // Return mock data for testing
    return {
      id: placeId,
      name: 'Sample Tourist Attraction',
      type: 'Tourist Attraction',
      address: '456 Sample Street, Hanoi, Vietnam',
      coordinates: { lat: 21.0285, lng: 105.8542 },
      rating: 4.3,
      photos: ['https://via.placeholder.com/400x300/10B981/FFFFFF?text=Place+Photo'],
      tripAdvisorId: 'mock_tripadvisor_id',
      reviews: [],
      description: 'A fascinating destination with rich cultural heritage and stunning architecture. Perfect for history buffs and culture enthusiasts.',
      openingHours: [
        'Monday: 9:00 AM - 6:00 PM',
        'Tuesday: 9:00 AM - 6:00 PM'
      ],
      amenities: ['Tourist Information', 'Photo Opportunities', 'Cultural Heritage', 'Historical Site', 'Accessibility', 'Information Center'],
      ticketsAvailable: true,
      tourOptions: [
        {
          id: 'tour1',
          name: 'Guided Walking Tour',
          price: 500000,
          currency: 'VND',
          duration: '2 hours',
          description: 'Explore the area with a professional guide',
          provider: 'Local Tours'
        }
      ]
    };
  }
}
