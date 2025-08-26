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
import { EnhancedHotel } from '../types/explore';
import { EnhancedHotelService } from '../services/enhancedHotelService';
import ChatbotWrapper from '../components/ChatbotWrapper';

const { width: sw, height: sh } = Dimensions.get('window');

interface HotelDetailScreenProps {
  route: {
    params: {
      hotelId: string;
      hotelData: any;
      coordinates: { lat: number; lng: number };
      price?: number; // Add price parameter
    };
  };
  navigation: any;
}

const HotelDetailScreen: React.FC<HotelDetailScreenProps> = ({ route, navigation }) => {
  const { hotelId, hotelData, coordinates, price } = route.params;
  const [enhancedHotel, setEnhancedHotel] = useState<EnhancedHotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    loadHotelDetails();
  }, [hotelId]);

  const loadHotelDetails = async () => {
    try {
      setIsLoading(true);
      const hotelService = new EnhancedHotelService();

      // Try to get enhanced details, fallback to mock data if API fails
      let details: EnhancedHotel;
      try {
        details = await hotelService.getHotelDetailsByPlaceId(hotelId, coordinates);
      } catch (error) {
        console.log('Falling back to mock data:', error);
        details = await hotelService.getMockHotelDetails(hotelId);
      }

      setEnhancedHotel(details);
    } catch (error) {
      console.error('Error loading hotel details:', error);
      Alert.alert('Error', 'Failed to load hotel details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelection = (roomId: string) => {
    setSelectedRoom(roomId === selectedRoom ? null : roomId);
  };

  const contactHotel = () => {
    if (enhancedHotel?.phone) {
      Linking.openURL(`tel:${enhancedHotel.phone}`);
    } else {
      Alert.alert('Contact Info', 'Phone number not available for this hotel');
    }
  };

  const openWebsite = () => {
    if (enhancedHotel?.website) {
      Linking.openURL(enhancedHotel.website);
    } else {
      Alert.alert('Website', 'Website not available for this hotel');
    }
  };

  const getDirections = () => {
    const { lat, lng } = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const renderPhotoCarousel = () => {
    if (!enhancedHotel?.photos || enhancedHotel.photos.length === 0) {
      return (
        <View style={styles.heroImageContainer}>
          <View style={styles.placeholderPhoto}>
            <MaterialIcons name="hotel" size={sw * 0.2} color="#9CA3AF" />
            <Text style={styles.placeholderText}>No Photos Available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.heroImageContainer}>
        <FlatList
          data={enhancedHotel.photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / sw);
            setCurrentPhotoIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
          )}
          keyExtractor={(item, index) => `photo_${index}`}
        />

        {/* Photo Indicators - White dots like in the design */}
        <View style={styles.photoIndicators}>
          {enhancedHotel.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoIndicator,
                index === currentPhotoIndex && styles.photoIndicatorActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderRoomCard = (room: any, index: number) => (
    <TouchableOpacity
      key={room.id}
      style={[
        styles.roomCard,
        selectedRoom === room.id && styles.selectedRoomCard
      ]}
      onPress={() => handleRoomSelection(room.id)}
    >
      <View style={styles.roomImageContainer}>
        <Image
          source={{ uri: enhancedHotel?.photos?.[index] || 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Room+Photo' }}
          style={styles.roomImage}
          resizeMode="cover"
        />
        <View style={styles.roomBadge}>
          <Text style={styles.roomBadgeText}>Summer Discount</Text>
        </View>
      </View>

      <View style={styles.roomInfo}>
        <Text style={styles.roomType}>{room.type}</Text>
        <View style={styles.roomPricing}>
          <Text style={styles.roomPrice}>VND {room.price.toLocaleString()}/night</Text>
          <Text style={styles.roomOriginalPrice}>VND {Math.round(room.price * 1.3).toLocaleString()}/night</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-15%</Text>
          </View>
        </View>

        <View style={styles.roomTags}>
          <View style={styles.roomTag}>
            <MaterialIcons name="local-fire-department" size={sw * 0.03} color="#EC4899" />
            <Text style={styles.roomTagText}>12 left</Text>
          </View>
          <View style={styles.roomTag}>
            <MaterialIcons name="bed" size={sw * 0.03} color="#10B981" />
            <Text style={styles.roomTagText}>Single</Text>
          </View>
          <View style={styles.roomTag}>
            <MaterialIcons name="person" size={sw * 0.03} color="#10B981" />
            <Text style={styles.roomTagText}>1</Text>
          </View>
        </View>

        <Text style={styles.roomDescription}>{room.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading hotel details...</Text>
      </View>
    );
  }

  if (!enhancedHotel) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={sw * 0.12} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load hotel details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHotelDetails}>
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
        {/* Hotel Header */}
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName}>{enhancedHotel.name}</Text>
          <View style={styles.hotelLocation}>
            <Text style={styles.hotelAddress}>{enhancedHotel.address}</Text>
            <TouchableOpacity onPress={getDirections} >
              <View style={styles.viewMapIcon}><Text style={styles.viewMapText}>View Map</Text></View>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingSection}>
            <MaterialIcons name="star" size={sw * 0.05} color="#EC4899" />
            <Text style={styles.ratingText}>{enhancedHotel.rating}</Text>
          </View>

            {/* Main price display - prioritize price from ExploreScreen, then fallback to room price */}
            <Text style={styles.priceText}>from VND {price ? price.toLocaleString() : (enhancedHotel.roomTypes?.[0]?.price ? enhancedHotel.roomTypes[0].price.toLocaleString() : '1,500,000')}/night</Text>
        </View>

        {/* Amenities - Only show if available */}
        {enhancedHotel.amenities && enhancedHotel.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {enhancedHotel.amenities.slice(0, 8).map((amenity, index) => {
                // Map amenity names to appropriate icons
                const getAmenityIcon = (amenityName: string) => {
                  const name = amenityName.toLowerCase();
                  if (name.includes('wifi') || name.includes('internet')) return 'wifi';
                  if (name.includes('pool') || name.includes('swimming')) return 'pool';
                  if (name.includes('spa') || name.includes('wellness')) return 'spa';
                  if (name.includes('parking') || name.includes('car')) return 'local-parking';
                  if (name.includes('restaurant') || name.includes('dining')) return 'restaurant';
                  if (name.includes('gym') || name.includes('fitness')) return 'fitness-center';
                  if (name.includes('beach') || name.includes('ocean')) return 'beach-access';
                  if (name.includes('room service') || name.includes('service')) return 'room-service';
                  if (name.includes('bar') || name.includes('lounge')) return 'local-bar';
                  if (name.includes('concierge') || name.includes('reception')) return 'concierge';
                  if (name.includes('shuttle') || name.includes('transport')) return 'directions-car';
                  if (name.includes('business') || name.includes('meeting')) return 'business-center';
                  if (name.includes('laundry') || name.includes('dry')) return 'local-laundry-service';
                  if (name.includes('child') || name.includes('kids')) return 'child-care';
                  if (name.includes('pet') || name.includes('dog')) return 'pets';
                  if (name.includes('prayer') || name.includes('worship')) return 'place-of-worship';
                  if (name.includes('garden') || name.includes('nature')) return 'park';
                  if (name.includes('exhibit') || name.includes('museum')) return 'museum';
                  if (name.includes('tour') || name.includes('guide')) return 'person';
                  if (name.includes('cultural') || name.includes('heritage')) return 'celebration';
                  if (name.includes('historical') || name.includes('site')) return 'history-edu';
                  if (name.includes('scenic') || name.includes('view')) return 'landscape';
                  if (name.includes('recreation') || name.includes('activity')) return 'sports-soccer';
                  if (name.includes('outdoor') || name.includes('walking')) return 'directions-walk';
                  if (name.includes('information') || name.includes('info')) return 'info';
                  if (name.includes('accessibility') || name.includes('wheelchair')) return 'accessibility';
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

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {enhancedHotel.description || 'Experience luxury at its finest in the heart of Vietnam. Our hotel offers stunning views, world-class amenities, and exceptional services for an unforgettable stay.'}
          </Text>
        </View>

        {/* Available Rooms */}
        {enhancedHotel.roomTypes && enhancedHotel.roomTypes.length > 0 && (
          <View style={styles.roomsSection}>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            <View style={styles.roomsGrid}>
              {enhancedHotel.roomTypes.map((room, index) => renderRoomCard(room, index))}
            </View>
          </View>
        )}

        {/* Guest Reviews - Only show if there are reviews */}
        {enhancedHotel.reviews && enhancedHotel.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingDisplay}>
              <Text style={styles.largeRating}>{enhancedHotel.rating}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialIcons
                    key={star}
                    name="star"
                    size={sw * 0.06}
                    color={star <= enhancedHotel.rating ? "#EC4899" : "#E5E7EB"}
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>
                {enhancedHotel.reviews.length > 0
                  ? 'Guest Reviews'
                  : 'No reviews yet'
                }
              </Text>
            </View>

            {enhancedHotel.reviews.map((review, index) => (
              <View key={review.id} style={styles.reviewItem}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
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
            console.log('🏨 Book Now button pressed');
            console.log('🏨 Navigation object:', navigation);
            console.log('🏨 Available routes:', navigation.getState()?.routes?.map((r: any) => r.name));
            
            if (enhancedHotel?.roomTypes && enhancedHotel.roomTypes.length > 0) {
              // Navigate to booking screen with room data
              console.log('🏨 Navigating to BookingScreen with room data');
              navigation.navigate('BookingScreen', {
                type: 'hotel',
                itemId: enhancedHotel.id,
                itemName: enhancedHotel.name,
                itemImage: enhancedHotel.photos?.[0],
                price: enhancedHotel.roomTypes[0].price,
                currency: enhancedHotel.roomTypes[0].currency || 'VND',
                additionalData: {
                  hotelId: enhancedHotel.id,
                  roomType: enhancedHotel.roomTypes[0].type,
                  amenities: enhancedHotel.roomTypes[0].amenities,
                  address: enhancedHotel.address,
                }
              });
            } else {
              // Navigate to booking screen with hotel data
              console.log('🏨 Navigating to BookingScreen with hotel data');
              navigation.navigate('BookingScreen', {
                type: 'hotel',
                itemId: enhancedHotel.id,
                itemName: enhancedHotel.name,
                itemImage: enhancedHotel.photos?.[0],
                price: price || 1500000, // Use price from route params or default
                currency: 'VND',
                additionalData: {
                  address: enhancedHotel.address,
                  rating: enhancedHotel.rating,
                }
              });
            }
          }}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowGradient}
          >
            <MaterialIcons name="hotel" size={24} color="white" />
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
    marginTop: -sh * 0.02, // Overlap with hero image
    borderRadius: sw * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  hotelHeader: {
    padding: sw * 0.05,
  },
  hotelName: {
    fontSize: sw * 0.07,
    fontWeight: '800',
    color: '#111827',
    marginBottom: sh * 0.01,
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh * 0.01,
  },
  hotelAddress: {
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
    fontWeight: '800',
    color: '#10B981',
    marginTop: sh * 0.01,
  },
  amenitiesSection: {
    paddingHorizontal: sw * 0.05,
    paddingBottom: sh * 0.025,
  },
  sectionTitle: {
    fontSize: sw * 0.05,
    fontWeight: '700',
    color: '#111827',
    marginBottom: sh * 0.02,
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
  aboutSection: {
    paddingHorizontal: sw * 0.05,
    paddingBottom: sh * 0.025,
  },
  aboutText: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    lineHeight: sh * 0.03,
  },
  roomsSection: {
    paddingHorizontal: sw * 0.05,
    paddingBottom: sh * 0.025,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    width: '48%', // Two columns
    backgroundColor: '#F9FAFB',
    borderRadius: sw * 0.04,
    overflow: 'hidden',
    marginBottom: sh * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRoomCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  roomImageContainer: {
    width: '100%',
    height: sh * 0.18,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomBadge: {
    position: 'absolute',
    top: sh * 0.015,
    left: sw * 0.025,
    backgroundColor: '#10B981',
    paddingHorizontal: sw * 0.02,
    paddingVertical: sh * 0.006,
    borderRadius: sw * 0.01,
  },
  roomBadgeText: {
    color: 'white',
    fontSize: sw * 0.03,
    fontWeight: '600',
  },
  roomInfo: {
    padding: sw * 0.04,
  },
  roomType: {
    fontSize: sw * 0.04,
    fontWeight: '700',
    color: '#111827',
    marginBottom: sh * 0.01,
  },
  roomPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sh * 0.01,
    flexWrap: 'wrap',
  },
  roomPrice: {
    fontSize: sw * 0.04,
    fontWeight: '700',
    color: '#10B981',
    flexShrink: 1,
  },
  roomOriginalPrice: {
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
  roomTags: {
    flexDirection: 'row',
    marginBottom: sh * 0.015,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: sw * 0.02,
    paddingVertical: sh * 0.006,
    borderRadius: sw * 0.025,
    marginRight: sw * 0.02,
  },
  roomTagText: {
    fontSize: sw * 0.03,
    color: '#374151',
    fontWeight: '500',
    marginLeft: sw * 0.01,
  },
  roomDescription: {
    fontSize: sw * 0.035,
    color: '#6B7280',
    lineHeight: sh * 0.025,
  },
  reviewsSection: {
    paddingHorizontal: sw * 0.05,
    paddingBottom: sh * 0.025,
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
    fontWeight: '600',
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
  reviewDate: {
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
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sh * 0.02,
    borderRadius: sw * 0.03,
    gap: sw * 0.02,
  },
});

export default HotelDetailScreen;