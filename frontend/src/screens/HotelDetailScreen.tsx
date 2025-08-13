import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Heart, Share, Star, MapPin, Phone, Globe, Map } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const HotelDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { hotel?: any } || {};
  const hotel = params.hotel || {};

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (hotel.photos && hotel.photos.length > 0) {
      setHotelImages(hotel.photos);
    } else if (hotel.image) {
      setHotelImages([hotel.image]);
    } else {
      setHotelImages(['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']);
    }
  }, [hotel]);

  // Amenities as pill buttons, sorted alphabetically
  const amenities = (hotel.amenities || []).map((a: any) =>
    typeof a === 'string' ? a : (a?.name || a?.localized_name || 'Amenity')
  ).sort();

  // Room data (mock for now)
  const rooms = hotel.rooms || [
    {
      id: '1',
      name: 'Deluxe King Room',
      price: hotel.price || '$219/night',
      oldPrice: '$319/night',
      discount: '-15%',
      image: hotelImages[0],
      left: 12,
      type: 'Single',
      guests: 1,
      description: 'Spacious room with king-size bed, city view, and luxury amenities.'
    },
    {
      id: '2',
      name: 'Executive Suite',
      price: '$499/night',
      oldPrice: '$599/night',
      discount: '-17%',
      image: hotelImages[1] || hotelImages[0],
      left: 9,
      type: 'Suite',
      guests: 2,
      description: 'Luxurious suite with premium amenities and ocean view.'
    }
  ];

  // Description
  const aboutText = hotel.description || hotel.snippet || 'Experience luxury at its finest in the heart of the city. Our hotel offers stunning views, world-class amenities, and exceptional services.';
  const descLimit = 200;
  const showDescToggle = aboutText.length > descLimit;
  const descToShow = showFullDesc ? aboutText : aboutText.slice(0, descLimit) + (showDescToggle ? '...' : '');

  // Amenities show more/less
  const amenityLimit = 3;
  const showAmenityToggle = amenities.length > amenityLimit;
  const amenitiesToShow = showAllAmenities ? amenities : amenities.slice(0, amenityLimit);

  const handleBookNow = () => {
    Alert.alert('Booking', 'This would open the booking flow. In a real app, this would integrate with a booking system.', [{ text: 'OK' }]);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality would be implemented here.');
  };

  const handleFavorite = () => {
    Alert.alert('Favorite', 'Hotel added to favorites!');
  };

  const handleViewMap = () => {
    Alert.alert('Map', 'Map view would be implemented here.');
  };

  return (
    <View style={styles.container}>
      {/* Header Image with overlay controls */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: hotelImages[currentImageIndex] }} style={styles.headerImage} resizeMode="cover" />
        <View style={styles.imageDots}>
          {hotelImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, { backgroundColor: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)' }]}
              onPress={() => setCurrentImageIndex(index)}
            />
          ))}
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#4CBC71" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleFavorite}>
              <Heart size={20} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Share size={20} color="#4CBC71" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Glassmorphism Card Overlay */}
      <View style={[styles.glassCard, { flex: 1 }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}>
          {/* Hotel Info */}
          <View style={styles.hotelInfoSection}>
            <Text style={styles.hotelName}>{hotel.name || 'Hotel Name'}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{hotel.location || 'Location'}</Text>
              <TouchableOpacity onPress={handleViewMap}>
                <Text style={styles.viewMap}>View Map</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ratingRow}>
              <Star size={16} color="#FFACC6" />
              <Text style={styles.ratingText}>{hotel.rating || '-'}</Text>
              <Text style={styles.reviewCount}>{hotel.reviews ? `| ${hotel.reviews} reviews` : ''}</Text>
            </View>
            <Text style={styles.priceLabel}>from</Text>
            <Text style={styles.price}>{hotel.price || '$219/night'}</Text>
            {/* Amenities Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenitiesScroll}>
              {amenitiesToShow.map((amenity: string, idx: number) => (
                <View key={idx} style={styles.amenityPill}>
                  <Text style={styles.amenityPillText}>{amenity}</Text>
                </View>
              ))}
              {showAmenityToggle && (
                <TouchableOpacity onPress={() => setShowAllAmenities(!showAllAmenities)} style={styles.amenityPill}>
                  <Text style={[styles.amenityPillText, { color: '#4CBC71', fontWeight: 'bold' }]}>{showAllAmenities ? 'Show less' : 'Show more'}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{descToShow}</Text>
            {showDescToggle && (
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={styles.showMoreText}>{showFullDesc ? 'Show less' : 'Show more'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Available Rooms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomsScroll}>
              {rooms.map((room: any) => (
                <View key={room.id} style={styles.roomCard}>
                  <Image source={{ uri: room.image }} style={styles.roomImage} resizeMode="cover" />
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.roomRow}>
                      <Text style={styles.roomPrice}>{room.price}</Text>
                      <Text style={styles.roomOldPrice}>{room.oldPrice}</Text>
                      <Text style={styles.roomDiscount}>{room.discount}</Text>
                    </View>
                    <View style={styles.roomTagsRow}>
                      <Text style={styles.roomTag}>{room.left} left</Text>
                      <Text style={styles.roomTag}>{room.type}</Text>
                      <Text style={styles.roomTag}>{room.guests} guest{room.guests > 1 ? 's' : ''}</Text>
                    </View>
                    <Text style={styles.roomDesc}>{room.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Guest Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Reviews</Text>
            <View style={styles.reviewScoreRow}>
              <Text style={styles.reviewScore}>{hotel.rating || '4.8'}</Text>
              <Star size={20} color="#FFACC6" />
              <Text style={styles.reviewScoreText}>Based on {hotel.reviews || '1245'} reviews</Text>
            </View>
            {/* Add more review details if available */}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
      {/* Book Now Button at the bottom, not overlaying content */}
      <View style={styles.bookNowContainerStatic}>
        <TouchableOpacity style={styles.bookNowBtn} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  imageContainer: { height: 300, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  imageDots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 0,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  hotelInfoSection: { marginBottom: 18 },
  hotelName: { fontSize: 28, fontWeight: '700', color: '#222', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  locationText: { fontSize: 16, color: '#6B6F7E', marginRight: 10 },
  viewMap: { fontSize: 14, color: '#4CBC71', fontWeight: '600', marginLeft: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#FFACC6', marginLeft: 6 },
  reviewCount: { fontSize: 14, color: '#A0A0A0', marginLeft: 8 },
  priceLabel: { fontSize: 14, color: '#A0A0A0', marginBottom: 2 },
  price: { fontSize: 32, fontWeight: '700', color: '#4CBC71', marginBottom: 10 },
  amenitiesScroll: { marginVertical: 8 },
  amenityPill: { backgroundColor: '#F3F7F5', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, marginBottom: 4 },
  amenityPillText: { fontSize: 14, color: '#4CBC71', fontWeight: '500' },
  section: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#E6E6E6' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#4CBC71', marginBottom: 10 },
  aboutText: { fontSize: 16, color: '#6B6F7E', lineHeight: 24 },
  showMoreText: { color: '#4CBC71', fontWeight: 'bold', marginTop: 6 },
  roomsScroll: { marginVertical: 8 },
  roomCard: { width: 220, backgroundColor: '#fff', borderRadius: 18, marginRight: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  roomImage: { width: 220, height: 120, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  roomInfo: { padding: 12 },
  roomName: { fontSize: 16, fontWeight: '600', color: '#6B6F7E', marginBottom: 4 },
  roomRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  roomPrice: { fontSize: 16, color: '#4CBC71', fontWeight: '700', marginRight: 6 },
  roomOldPrice: { fontSize: 14, color: '#A0A0A0', textDecorationLine: 'line-through', marginRight: 6 },
  roomDiscount: { fontSize: 14, color: '#FFACC6', fontWeight: '600' },
  roomTagsRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  roomTag: { fontSize: 12, color: '#4CBC71', backgroundColor: '#F3F7F5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  roomDesc: { fontSize: 13, color: '#6B6F7E', marginTop: 2 },
  reviewScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewScore: { fontSize: 32, fontWeight: '700', color: '#FFACC6' },
  reviewScoreText: { fontSize: 14, color: '#A0A0A0' },
  bookNowContainerStatic: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    padding: 20,
  },
  bookNowBtn: {
    backgroundColor: '#4CBC71',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookNowText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default HotelDetailScreen;