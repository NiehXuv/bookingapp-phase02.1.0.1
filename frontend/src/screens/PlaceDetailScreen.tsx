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
// API service commented out due to billing issues - using mock data instead
// import { EnhancedPlaceService } from '../services/enhancedPlaceService';
import { getMockEnhancedPlace } from '../mockdata/mockEnhancedPlaces';
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
      
      // Using mock data instead of API calls (API billing issues)
      // TODO: Re-enable API calls when billing is resolved
      // const placeService = new EnhancedPlaceService();
      // let details: EnhancedPlace;
      // if (placeData) {
      //   details = await placeService.getTourDetails(placeData, coordinates);
      // } else {
      //   details = await placeService.getPlaceDetails(placeId, coordinates);
      // }

      // Use mock data directly
      // If placeData is provided (from tour), merge it with mock data
      let details: EnhancedPlace;
      if (placeData && placeData.photos && placeData.photos.length > 0) {
        // Use provided data but enhance with mock data structure
        const mockBase = getMockEnhancedPlace(placeId, coordinates);
        details = {
          ...mockBase,
          photos: placeData.photos, // Use provided photos
          name: placeData.name || mockBase.name,
          description: placeData.editorialSummary || placeData.description || mockBase.description,
          rating: placeData.rating || mockBase.rating
        };
      } else {
        details = getMockEnhancedPlace(placeId, coordinates);
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
    const defaultImage = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800';
    
    if (!enhancedPlace?.photos || enhancedPlace.photos.length === 0) {
      return (
        <View style={styles.heroImageContainer}>
          <Image 
            source={{ uri: defaultImage }} 
            style={styles.heroImage} 
            resizeMode="cover"
            onError={() => console.log('Failed to load default image')}
          />
        </View>
      );
    }

    return (
      <View style={styles.heroImageContainer}>
        <FlatList
          data={enhancedPlace?.photos || []}
          renderItem={({ item, index }) => {
            const imageUri = item || defaultImage;
            return (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.heroImage} 
                resizeMode="cover"
                onError={(error) => {
                  console.log('Failed to load image:', imageUri, error);
                }}
              />
            );
          }}
          keyExtractor={(item, index) => `photo_${index}_${item}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / sw);
            setCurrentPhotoIndex(index);
          }}
        />
        
        {/* Photo Indicators */}
        {enhancedPlace?.photos && enhancedPlace.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {enhancedPlace.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === currentPhotoIndex && styles.photoIndicatorActive
                ]}
              />
            ))}
          </View>
        )}
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
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Hero Image Section */}
      {renderPhotoCarousel()}
      
      {/* Main Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {/* Place Header */}
        <View style={styles.placeHeader}>
          <Text style={styles.placeName}>{enhancedPlace?.name || 'Unknown Place'}</Text>
          
          {/* Address with View Map Button */}
          <View style={styles.placeLocationRow}>
            <Text style={styles.placeAddress} numberOfLines={2}>{enhancedPlace?.address || 'Address not available'}</Text>
            <TouchableOpacity onPress={getDirections} activeOpacity={0.7}>
              <View style={styles.viewMapButton}>
                <Text style={styles.viewMapText}>View Map</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Rating */}
          <View style={styles.ratingSection}>
            <MaterialIcons name="star" size={20} color="#EC4899" />
            <Text style={styles.ratingText}>{enhancedPlace?.rating || 0}</Text>
          </View>
          
          {/* Price */}
          <Text style={styles.priceText}>
            from VND {enhancedPlace?.tourOptions?.[0]?.price ? enhancedPlace.tourOptions[0].price.toLocaleString() : '500,000'}/person
          </Text>
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
                      size={18} 
                      color="#3B82F6" 
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowGradient}
          >
            <MaterialIcons name="event" size={22} color="white" />
            <Text style={styles.bookNowButtonText}>Book Now</Text>
          </LinearGradient>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    height: sh * 0.4,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    width: sw,
    height: sh * 0.4,
  },
  photoIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
    width: 8,
    height: 8,
    borderRadius: 4,
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
    marginTop: -sh * 0.03,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  placeHeader: {
    padding: 20,
    paddingTop: 24,
  },
  placeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 34,
  },
  placeLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  placeAddress: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  viewMapButton: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
  },
  viewMapText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 4,
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  amenitiesSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  amenityPillText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  hoursSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hourText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 22,
  },
  toursSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  toursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tourCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTourCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  tourImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tourBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tourInfo: {
    padding: 16,
  },
  tourType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tourPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  tourOriginalPrice: {
    fontSize: 13,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tourTags: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  tourTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  tourTagText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  tourDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeMoreText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  largeRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EC4899',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  reviewCount: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookNowButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
});

export default PlaceDetailScreen;
