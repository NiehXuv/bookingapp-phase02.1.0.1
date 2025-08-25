import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EnhancedPlace } from '../types/explore';
import { EnhancedPlaceService } from '../services/enhancedPlaceService';
import ChatbotWrapper from '../components/ChatbotWrapper';

const { width: sw, height: sh } = Dimensions.get('window');

interface PlaceDetailScreenProps {
  route: {
    params: {
      placeId: string;
      placeData: any;
      coordinates: { lat: number; lng: number };
    };
  };
  navigation: any;
}

const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({ route, navigation }) => {
  const { placeId, placeData, coordinates } = route.params;
  const [enhancedPlace, setEnhancedPlace] = useState<EnhancedPlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Debug logging
  console.log('🎯 PlaceDetailScreen: Received params:', { placeId, placeData, coordinates });
  
  useEffect(() => {
    loadPlaceDetails();
  }, [placeId]);
  
  const loadPlaceDetails = async () => {
    try {
      setIsLoading(true);
      const placeService = new EnhancedPlaceService();
      
      // Debug: Log what we received
      console.log('🎯 PlaceDetailScreen: Received route params:', { placeId, placeData, coordinates });
      
      let details: EnhancedPlace;
      
      // Check if we have placeData (tour data) or need to fetch from API
      if (placeData) {
        console.log('🎯 PlaceDetailScreen: Using provided place data with photos:', placeData.photos?.length || 0);
        console.log('🎯 PlaceDetailScreen: Using provided place data with reviews:', placeData.reviews?.length || 0);
        console.log('🎯 PlaceDetailScreen: Using provided place data with description:', placeData.editorialSummary || placeData.description);
        try {
          details = await placeService.getTourDetails(placeData, coordinates);
        } catch (error) {
          console.log('Falling back to mock data for tour:', error);
          details = await placeService.getMockPlaceDetails(placeId);
        }
      } else {
        console.log('🎯 PlaceDetailScreen: Fetching place details from API');
        try {
          details = await placeService.getPlaceDetails(placeId, coordinates);
        } catch (error) {
          console.log('Falling back to mock data for place:', error);
          details = await placeService.getMockPlaceDetails(placeId);
        }
      }
      
      console.log('🎯 PlaceDetailScreen: Final enhanced place data:', {
        photosCount: details.photos?.length || 0,
        reviewsCount: details.reviews?.length || 0,
        description: details.description,
        openingHours: details.openingHours
      });
      
      setEnhancedPlace(details);
    } catch (error) {
      console.error('Error loading place details:', error);
      Alert.alert('Error', 'Failed to load place details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTourSelection = (tourId: string) => {
    setSelectedTour(tourId === selectedTour ? null : tourId);
  };

  const contactOperator = () => {
    Alert.alert('Contact Info', 'Contact information will be available when booking is implemented');
  };
  
  const openWebsite = () => {
    Alert.alert('Website', 'Website information will be available when booking is implemented');
  };
  
  const getDirections = () => {
    const { lat, lng } = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const renderPhotoCarousel = () => {
    if (!enhancedPlace?.photos || enhancedPlace.photos.length === 0) {
      return (
        <View style={styles.heroImageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=No+Photos+Available' }} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={styles.heroImageContainer}>
        <FlatList
          data={enhancedPlace?.photos || []}
          renderItem={({ item, index }) => (
            <Image 
              source={{ uri: item }} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / sw);
            setCurrentPhotoIndex(index);
          }}
        />
        
        {/* Photo Counter */}
        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {enhancedPlace?.photos?.map((_, index) => (
              <Text key={index} style={styles.photoDot}>•</Text>
            )) || null}
          </Text>
        </View>
      </View>
    );
  };

  const renderTourCard = (tour: any, index: number) => (
    <TouchableOpacity 
      key={tour.id} 
      style={[
        styles.tourCard,
        selectedTour === tour.id && styles.selectedTourCard
      ]}
      onPress={() => handleTourSelection(tour.id)}
    >
      <View style={styles.tourImageContainer}>
        <Image 
          source={{ uri: enhancedPlace?.photos?.[index] || 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Tour+Photo' }} 
          style={styles.tourImage}
          resizeMode="cover"
        />
        <View style={styles.tourBadge}>
          <Text style={styles.tourBadgeText}>Popular</Text>
        </View>
      </View>
      
      <View style={styles.tourInfo}>
        <Text style={styles.tourType}>{tour.name}</Text>
        <View style={styles.tourPricing}>
          <Text style={styles.tourPrice}>VND {tour.price.toLocaleString()}/person</Text>
          <Text style={styles.tourOriginalPrice}>VND {Math.round(tour.price * 1.2).toLocaleString()}/person</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-20%</Text>
          </View>
        </View>
        
        <View style={styles.tourTags}>
          <View style={styles.tourTag}>
            <MaterialIcons name="local-fire-department" size={sw * 0.03} color="#EC4899" />
            <Text style={styles.tourTagText}>8 left</Text>
          </View>
          <View style={styles.tourTag}>
            <MaterialIcons name="schedule" size={sw * 0.03} color="#10B981" />
            <Text style={styles.tourTagText}>3h</Text>
          </View>
          <View style={styles.tourTag}>
            <MaterialIcons name="group" size={sw * 0.03} color="#10B981" />
            <Text style={styles.tourTagText}>Max 15</Text>
          </View>
        </View>
        
        <Text style={styles.tourDescription}>{tour.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </View>
    );
  }
  
  if (!enhancedPlace) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={sw * 0.12} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load place details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPlaceDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      {renderPhotoCarousel()}
      
      {/* Main Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {/* Place Header */}
        <View style={styles.placeHeader}>
          <Text style={styles.placeName}>{enhancedPlace?.name || 'Unknown Place'}</Text>
          <Text style={styles.placeType}>{enhancedPlace?.type || 'Place'}</Text>
          <View style={styles.placeLocation}>
            <Text style={styles.placeAddress}>{enhancedPlace?.address || 'Address not available'}</Text>
            <TouchableOpacity onPress={getDirections}>
              <View style={styles.viewMapIcon}><Text style={styles.viewMapText}>View Map</Text></View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ratingSection}>
            <MaterialIcons name="star" size={sw * 0.05} color="#EC4899" />
            <Text style={styles.ratingText}>{enhancedPlace?.rating || 0}</Text>
          </View>
          
          <Text style={styles.priceText}>from VND {enhancedPlace?.tourOptions?.[0]?.price ? enhancedPlace.tourOptions[0].price.toLocaleString() : '500,000'}/person</Text>
        </View>
        
        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {enhancedPlace?.description || 
              'Discover this amazing destination in Vietnam. Experience the rich culture, stunning landscapes, and unforgettable memories that await you.'}
          </Text>
        </View>
        
        {/* Amenities Section - Only show if available */}
        {enhancedPlace?.amenities && enhancedPlace.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {(enhancedPlace?.amenities || []).slice(0, 8).map((amenity: string, index: number) => {
                // Map amenity names to appropriate icons
                const getAmenityIcon = (amenityName: string) => {
                  const name = amenityName.toLowerCase();
                  if (name.includes('wifi') || name.includes('internet')) return 'wifi';
                  if (name.includes('parking') || name.includes('car')) return 'local-parking';
                  if (name.includes('restaurant') || name.includes('dining')) return 'restaurant';
                  if (name.includes('guide') || name.includes('tour')) return 'person';
                  if (name.includes('accessibility') || name.includes('wheelchair')) return 'accessibility';
                  if (name.includes('museum') || name.includes('exhibit')) return 'museum';
                  if (name.includes('garden') || name.includes('park')) return 'park';
                  if (name.includes('shopping') || name.includes('store')) return 'shopping-bag';
                  if (name.includes('transport') || name.includes('bus')) return 'directions-bus';
                  if (name.includes('information') || name.includes('info')) return 'info';
                  if (name.includes('security') || name.includes('safety')) return 'security';
                  if (name.includes('first aid') || name.includes('medical')) return 'local-hospital';
                  if (name.includes('bathroom') || name.includes('toilet')) return 'wc';
                  if (name.includes('drinking') || name.includes('water')) return 'local-drink';
                  if (name.includes('smoking') || name.includes('smoke')) return 'smoking-rooms';
                  if (name.includes('prayer') || name.includes('worship')) return 'place-of-worship';
                  if (name.includes('nature') || name.includes('natural')) return 'landscape';
                  if (name.includes('cultural') || name.includes('heritage')) return 'celebration';
                  if (name.includes('historical') || name.includes('site')) return 'history-edu';
                  if (name.includes('scenic') || name.includes('view')) return 'landscape';
                  if (name.includes('recreation') || name.includes('activity')) return 'sports-soccer';
                  if (name.includes('outdoor') || name.includes('walking')) return 'directions-walk';
                  if (name.includes('photo') || name.includes('opportunity')) return 'camera-alt';
                  if (name.includes('spiritual') || name.includes('experience')) return 'self-improvement';
                  if (name.includes('local') || name.includes('business')) return 'store';
                  if (name.includes('community') || name.includes('service')) return 'people';
                  return 'check-circle'; // Default icon
                };

                return (
                  <View key={index} style={styles.amenityPill}>
                    <MaterialIcons 
                      name={getAmenityIcon(amenity) as any} 
                      size={sw * 0.04} 
                      color="#10B981" 
                    />
                    <Text style={styles.amenityPillText}>{amenity}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        {/* Opening Hours */}
        {enhancedPlace?.openingHours && enhancedPlace.openingHours.length > 0 && (
          <View style={styles.hoursSection}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            {(enhancedPlace?.openingHours || []).map((hour, index) => (
              <Text key={index} style={styles.hourText}>{hour}</Text>
            ))}
          </View>
        )}
        
        {/* Available Tours */}
        {enhancedPlace?.tourOptions && enhancedPlace.tourOptions.length > 0 && (
          <View style={styles.toursSection}>
            <Text style={styles.sectionTitle}>Available Tours</Text>
            <View style={styles.toursGrid}>
              {(enhancedPlace?.tourOptions || []).map((tour, index) => renderTourCard(tour, index))}
            </View>
          </View>
        )}
        
        {/* Guest Reviews - Only show if there are reviews */}
        {enhancedPlace?.reviews && enhancedPlace.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.ratingDisplay}>
              <Text style={styles.largeRating}>{enhancedPlace?.rating || 0}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialIcons 
                    key={star} 
                    name="star" 
                    size={sw * 0.06} 
                    color={star <= (enhancedPlace?.rating || 0) ? "#EC4899" : "#E5E7EB"} 
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>
                {(enhancedPlace?.reviews || []).length > 0 
                  ? 'Guest Reviews'
                  : 'No reviews yet'
                }
              </Text>
            </View>
            
            {(enhancedPlace?.reviews || []).map((review, index) => (
              <View key={review.id} style={styles.reviewItem}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <Text style={styles.date}>{review.date}</Text>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookNowSection}>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={() => {
            console.log('🎯 Book Now button pressed');
            console.log('🎯 Navigation object:', navigation);
            console.log('🎯 Available routes:', navigation.getState()?.routes?.map((r: any) => r.name));
            
            if (enhancedPlace?.tourOptions && enhancedPlace.tourOptions.length > 0) {
              // Navigate to booking screen with tour data
              console.log('🎯 Navigating to BookingScreen with tour data');
              navigation.navigate('BookingScreen', {
                type: 'tour',
                itemId: enhancedPlace.id,
                itemName: enhancedPlace.name,
                itemImage: enhancedPlace.photos?.[0],
                price: enhancedPlace.tourOptions[0].price,
                currency: enhancedPlace.tourOptions[0].currency || 'VND',
                additionalData: {
                  tourId: enhancedPlace.tourOptions[0].id,
                  duration: enhancedPlace.tourOptions[0].duration,
                  provider: enhancedPlace.tourOptions[0].provider,
                }
              });
            } else {
              // Navigate to booking screen with place data
              console.log('🎯 Navigating to BookingScreen with place data');
              navigation.navigate('BookingScreen', {
                type: 'tour',
                itemId: enhancedPlace.id,
                itemName: enhancedPlace.name,
                itemImage: enhancedPlace.photos?.[0],
                price: 500000, // Default price if no tour options
                currency: 'VND',
                additionalData: {
                  placeType: enhancedPlace.type,
                  address: enhancedPlace.address,
                }
              });
            }
          }}
        >
            <Text style={styles.bookNowButtonText}>Book Now</Text>      
        </TouchableOpacity>
      </View>

      {/* Chatbot */}
      <ChatbotWrapper />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: sh * 0.02,
    fontSize: sw * 0.04,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: sw * 0.08,
  },
  errorText: {
    fontSize: sw * 0.04,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: sh * 0.02,
    marginBottom: sh * 0.03,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: sw * 0.06,
    paddingVertical: sh * 0.015,
    borderRadius: sw * 0.02,
  },
  retryButtonText: {
    color: 'white',
    fontSize: sw * 0.04,
    fontWeight: '600',
  },
  heroImageContainer: {
    width: '100%',
    height: sh * 0.35, // 40% of screen height
    position: 'relative',
  },
  heroImage: {
    width: sw, // Full screen width
    height: sh * 0.35,
  },
  photoIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: sh * 0.03,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicator: {
    width: sw * 0.02,
    height: sw * 0.02,
    borderRadius: sw * 0.01,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: sw * 0.01,
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
    width: sw * 0.03,
    height: sw * 0.03,
    borderRadius: sw * 0.015,
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: sh * 0.01,
    fontSize: sw * 0.035,
    color: '#9CA3AF',
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: sw * 0.06,
    borderTopRightRadius: sw * 0.06,
    marginTop: -sh * 0.02, // Overlap with hero image
    paddingHorizontal: sw * 0.05,
    paddingTop: sh * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  placeHeader: {
    marginBottom: sh * 0.025,
  },
  placeName: {
    fontSize: sw * 0.08,
    fontWeight: '800',
    color: '#111827',
    marginBottom: sh * 0.006,
  },
  placeType: {
    fontSize: sw * 0.045,
    color: '#6B7280',
    marginBottom: sh * 0.01,
    textTransform: 'capitalize',
  },
  placeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh * 0.01,
  },
  placeAddress: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    marginRight: sw * 0.025,
    flex: 1,
  },
  viewMapText: {
    fontSize: sw * 0.035,
    color: '#3B82F6',
    fontWeight: '600',
  },
  viewMapIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: sw * 0.025,
    paddingVertical: sh * 0.008,
    borderRadius: sw * 0.04,
    marginBottom: sh * 0.015,
    marginRight: sw * 0.015,
    minWidth: sw * 0.2,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh * 0.01,
  },
  ratingText: {
    fontSize: sw * 0.04,
    color: '#6B7280',
    marginLeft: sw * 0.01,
  },
  priceText: {
    fontSize: sw * 0.06,
    fontWeight: '700',
    color: '#10B981',
    marginTop: sh * 0.01,
  },
  aboutSection: {
    marginBottom: sh * 0.025,
  },
  sectionTitle: {
    fontSize: sw * 0.05,
    fontWeight: '700',
    color: '#111827',
    marginBottom: sh * 0.02,
  },
  aboutText: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    lineHeight: sh * 0.03,
  },
  amenitiesSection: {
    marginBottom: sh * 0.025,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: sh * 0.01,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: sw * 0.025,
    paddingVertical: sh * 0.008,
    borderRadius: sw * 0.04,
    marginBottom: sh * 0.015,
    marginRight: sw * 0.015,
    minWidth: sw * 0.2,
  },
  amenityPillText: {
    fontSize: sw * 0.03,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: sw * 0.01,
  },
  hoursSection: {
    marginBottom: sh * 0.025,
  },
  hourText: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    marginBottom: sh * 0.01,
  },
  toursSection: {
    marginBottom: sh * 0.025,
  },
  toursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tourCard: {
    width: '48%', // Two columns
    backgroundColor: '#F9FAFB',
    borderRadius: sw * 0.03,
    overflow: 'hidden',
    marginBottom: sh * 0.015,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTourCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  tourImageContainer: {
    width: '100%',
    height: sh * 0.18,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourBadge: {
    position: 'absolute',
    top: sh * 0.015,
    left: sw * 0.025,
    backgroundColor: '#10B981',
    paddingHorizontal: sw * 0.02,
    paddingVertical: sh * 0.006,
    borderRadius: sw * 0.01,
  },
  tourBadgeText: {
    color: 'white',
    fontSize: sw * 0.03,
    fontWeight: '600',
  },
  tourInfo: {
    padding: sw * 0.03,
  },
  tourType: {
    fontSize: sw * 0.04,
    fontWeight: '700',
    color: '#111827',
    marginBottom: sh * 0.01,
  },
  tourPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sh * 0.01,
    flexWrap: 'wrap',
  },
  tourPrice: {
    fontSize: sw * 0.04,
    fontWeight: '700',
    color: '#10B981',
    flexShrink: 1,
  },
  tourOriginalPrice: {
    fontSize: sw * 0.03,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    marginLeft: sw * 0.015,
    flexShrink: 1,
  },
  discountBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: sw * 0.015,
    paddingVertical: sh * 0.003,
    borderRadius: sw * 0.01,
    marginLeft: sw * 0.02,
  },
  discountText: {
    color: 'white',
    fontSize: sw * 0.03,
    fontWeight: '600',
  },
  tourTags: {
    flexDirection: 'row',
    marginBottom: sh * 0.015,
  },
  tourTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: sw * 0.02,
    paddingHorizontal: sw * 0.02,
    paddingVertical: sh * 0.006,
    marginRight: sw * 0.02,
  },
  tourTagText: {
    fontSize: sw * 0.03,
    color: '#10B981',
    marginLeft: sw * 0.01,
  },
  tourDescription: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    lineHeight: sh * 0.025,
  },
  reviewsSection: {
    marginBottom: sh * 0.025,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sh * 0.02,
  },
  seeMoreText: {
    fontSize: sw * 0.035,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: sh * 0.02,
  },
  largeRating: {
    fontSize: sw * 0.12,
    fontWeight: '700',
    color: '#EC4899',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: sh * 0.01,
  },
  reviewCount: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    marginTop: sh * 0.006,
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: sw * 0.03,
    padding: sw * 0.04,
    marginBottom: sh * 0.015,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewAuthor: {
    fontSize: sw * 0.04,
    fontWeight: '600',
    color: '#111827',
    marginBottom: sh * 0.006,
  },
  date: {
    fontSize: sw * 0.03,
    color: '#9CA3AF',
    marginBottom: sh * 0.01,
  },
  reviewText: {
    fontSize: sw * 0.035,
    color: '#374151',
    lineHeight: sh * 0.025,
  },
  bottomSpacing: {
    height: sh * 0.15, // Increased from 0.12 to 0.15 for better chatbot positioning
  },
  carouselDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  carouselInactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  carouselActiveDot: {
    backgroundColor: 'white',
  },
  photoCounter: {
    position: 'absolute',
    bottom: sh * 0.02,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  photoCounterText: {
    flexDirection: 'row',
  },
  photoDot: {
    fontSize: sw * 0.04,
    color: 'white',
    marginHorizontal: sw * 0.005,
  },
  bookNowSection: {
    backgroundColor: 'white',
    paddingHorizontal: sw * 0.05,
    paddingVertical: sh * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookNowButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sh * 0.02,
    borderRadius: sw * 0.03,
    gap: sw * 0.02,
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: sw * 0.05,
    fontWeight: '600',
  },
});

export default PlaceDetailScreen;
