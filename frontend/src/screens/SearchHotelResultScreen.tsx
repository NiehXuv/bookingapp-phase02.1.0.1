import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, Filter, ArrowUpDown, Calendar, Map, Wand2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import Config from 'react-native-config';

// Fallback API key if environment variable is not set
const FALLBACK_API_KEY = '11CC8F76C2E14125B8DF907D5EF0CFFF';

const { width } = Dimensions.get('window');

const SearchHotelResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safely destructure route.params with a default empty object
  const params = route.params as { city?: string; locationId?: string; checkIn?: string; checkOut?: string; adults?: number; children?: number } || {};
  const { city, locationId, checkIn, checkOut, adults = 2, children = 1 } = params;

  useEffect(() => {
    if (!city) {
      setError('No city selected or invalid navigation parameters.');
      setLoading(false);
      return;
    }
    fetchHotels();
  }, [city, locationId, checkIn, checkOut, adults, children]);

  const fetchHotelDetails = async (locationId: string) => {
    try {
      const detailResponse = await axios.get(`https://api.content.tripadvisor.com/api/v1/location/${locationId}/details`, {
        params: {
          key: Config.TRIPADVISOR_API_KEY || FALLBACK_API_KEY,
          language: 'en',
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TravelTrek/1.0 (Android)',
        },
      });
      return detailResponse.data;
    } catch (error) {
      console.log('Hotel details fetch error:', error);
      return null;
    }
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://api.content.tripadvisor.com/api/v1/location/search', {
        params: {
          key: Config.TRIPADVISOR_API_KEY || FALLBACK_API_KEY,
          searchQuery: city,
          language: 'en',
          category: 'hotels',
          ...(locationId && { location_id: locationId }),
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TravelTrek/1.0 (Android)',
        },
      });
      const hotelData = response.data.data || [];
      console.log('TripAdvisor API Response:', JSON.stringify(response.data, null, 2));
      console.log('Hotel Data Sample:', hotelData.length > 0 ? JSON.stringify(hotelData[0], null, 2) : 'No hotels found');
      
      // Log price-related fields for debugging
      if (hotelData.length > 0) {
        const sampleHotel = hotelData[0];
        console.log('Price Debug Info:', {
          price_level: sampleHotel.price_level,
          price: sampleHotel.price,
          price_range: sampleHotel.price_range,
          price_tier: sampleHotel.price_tier,
          allFields: Object.keys(sampleHotel).filter(key => key.toLowerCase().includes('price'))
        });
      }
      
      const hotelsWithPhotos = await Promise.all(
        hotelData.slice(0, 5).map(async (hotel: any) => { // Limit to 5 hotels for performance
          try {
            // Fetch detailed information for better price data
            const hotelDetails = await fetchHotelDetails(hotel.location_id);
            console.log('Hotel Details for', hotel.name, ':', hotelDetails);
            
          const photoResponse = await axios.get(
            `https://api.content.tripadvisor.com/api/v1/location/${hotel.location_id}/photos`,
            {
                params: { key: Config.TRIPADVISOR_API_KEY || FALLBACK_API_KEY, language: 'en' },
            }
          );
          const photos = photoResponse.data.data || [];
          const image = photos.length > 0 ? photos[0].images.medium.url : null;
            
            // Enhanced price handling based on available data
            let priceDisplay = 'Price on request';
            
            // Convert price level to actual price range
            const getPriceFromLevel = (level: string | number) => {
              if (!level) return 'Price on request';
              
              // Handle string format like "$", "$$", "$$$"
              if (typeof level === 'string') {
                switch (level) {
                  case '$': return '$50-100/night';
                  case '$$': return '$100-200/night';
                  case '$$$': return '$200-300/night';
                  case '$$$$': return '$300-500/night';
                  case '$$$$$': return '$500+/night';
                  default: return 'Price on request';
                }
              }
              
              // Handle numeric format (1, 2, 3, etc.)
              const levelNum = typeof level === 'string' ? parseInt(level) : level;
              switch (levelNum) {
                case 1: return '$50-100/night';
                case 2: return '$100-200/night';
                case 3: return '$200-300/night';
                case 4: return '$300-500/night';
                case 5: return '$500+/night';
                default: return 'Price on request';
              }
            };
            
            if (hotelDetails?.price_level) {
              priceDisplay = getPriceFromLevel(hotelDetails.price_level);
            } else if (hotelDetails?.price) {
              priceDisplay = hotelDetails.price;
            } else if (hotelDetails?.price_range) {
              priceDisplay = hotelDetails.price_range;
            } else if (hotel.price_level) {
              priceDisplay = getPriceFromLevel(hotel.price_level);
            } else if (hotel.price) {
              priceDisplay = hotel.price;
            } else if (hotel.price_range) {
              priceDisplay = hotel.price_range;
            }
            
          return {
            id: hotel.location_id,
            name: hotel.name,
              location: hotel.address_string || hotel.location_string || hotel.address_obj?.address_string || 'Unknown location',
            rating: hotel.rating || (hotel.stars ? `${hotel.stars}/5` : '-'),
              price: priceDisplay,
            image: image,
              description: hotel.description || hotel.snippet || hotelDetails?.description || 'No description available',
              amenities: hotel.amenities || hotel.amenity_ids || hotelDetails?.amenities || [],
            reviews: hotel.num_reviews || 0,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            photos: photos.map((p: any) => p.images.medium.url),
              // Additional data for debugging
              rawData: hotel,
              details: hotelDetails,
            };
          } catch (photoError: any) {
            console.log('Photo fetch error for hotel:', hotel.location_id, photoError.message);
            // Convert price level to actual price range for fallback
            const getPriceFromLevel = (level: string | number) => {
              if (!level) return 'Price on request';
              
              // Handle string format like "$", "$$", "$$$"
              if (typeof level === 'string') {
                switch (level) {
                  case '$': return '$50-100/night';
                  case '$$': return '$100-200/night';
                  case '$$$': return '$200-300/night';
                  case '$$$$': return '$300-500/night';
                  case '$$$$$': return '$500+/night';
                  default: return 'Price on request';
                }
              }
              
              // Handle numeric format (1, 2, 3, etc.)
              const levelNum = typeof level === 'string' ? parseInt(level) : level;
              switch (levelNum) {
                case 1: return '$50-100/night';
                case 2: return '$100-200/night';
                case 3: return '$200-300/night';
                case 4: return '$300-500/night';
                case 5: return '$500+/night';
                default: return 'Price on request';
              }
            };
            
            return {
              id: hotel.location_id,
              name: hotel.name,
              location: hotel.address_string || hotel.location_string || hotel.address_obj?.address_string || 'Unknown location',
              rating: hotel.rating || (hotel.stars ? `${hotel.stars}/5` : '-'),
              price: hotel.price_level ? getPriceFromLevel(hotel.price_level) : 'Price on request',
              image: null,
              description: hotel.description || hotel.snippet || 'No description available',
              amenities: hotel.amenities || hotel.amenity_ids || [],
              reviews: hotel.num_reviews || 0,
              latitude: hotel.latitude,
              longitude: hotel.longitude,
              photos: [],
              rawData: hotel,
            };
          }
        })
      );
      setHotels(hotelsWithPhotos);
    } catch (error: any) {
      console.log('FetchHotels error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      if (error.response?.status === 401) {
        setError('API key is invalid or expired. Please check your TripAdvisor API configuration.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Please ensure your API key is approved for this endpoint.');
      } else if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (error.response?.status >= 500) {
        setError('TripAdvisor service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to fetch hotels. Status: ${error.response?.status || 'Unknown'}. Please try again.`);
      }
      setHotels([]);
      
      // Show sample data if API fails (for demo purposes)
      if (error.response?.status === 401 || error.response?.status === 403) {
        const sampleHotels = [
          {
            id: 'sample1',
            name: 'Sample Hotel 1',
            location: `${city}, Sample Location`,
            rating: '4.5',
            price: '$150/night',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            description: 'A beautiful sample hotel with great amenities.',
            amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
            reviews: 125,
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
          },
          {
            id: 'sample2',
            name: 'Sample Hotel 2',
            location: `${city}, Sample Location`,
            rating: '4.2',
            price: '$120/night',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
            description: 'Comfortable accommodation with modern facilities.',
            amenities: ['WiFi', 'Gym', 'Restaurant', 'Parking'],
            reviews: 89,
            photos: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'],
          },
        ];
        setHotels(sampleHotels);
        setError('Showing sample data due to API configuration issue. Please check your TripAdvisor API key.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHotelPress = (hotel: any) => {
    (navigation as any).navigate('HotelDetail', { hotel });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BlurView intensity={20} style={styles.headerCard} tint="light">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#4CBC71" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Results</Text>
        </BlurView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CBC71" />
          <Text style={styles.loadingText}>Searching for hotels...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.headerCard} tint="light">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#4CBC71" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hotel Results</Text>
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputRow}>
            <Search size={20} color="#6B6F7E" />
            <TextInput placeholder="Find your destination" placeholderTextColor="#A0A0A0" style={styles.searchInput} />
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Filter size={22} color="#4CBC71" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <ArrowUpDown size={22} color="#4CBC71" />
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <Calendar size={16} color="#4CBC71" />
            <Text style={styles.filterBtnText}>Change Dates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Map size={16} color="#4CBC71" />
            <Text style={styles.filterBtnText}>Map</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
      <ScrollView style={styles.resultsScroll} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.resultsCount}>{hotels.length} hotels found</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchHotels}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {hotels.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hotels found in this city.</Text>
            <Text style={styles.emptySubtext}>Try searching for a different city or area.</Text>
          </View>
        )}
        {hotels.map((hotel: any, idx: number) => (
          <TouchableOpacity key={hotel.id || idx} onPress={() => handleHotelPress(hotel)} activeOpacity={0.85}>
            <View style={styles.hotelCard}>
              {hotel.image ? (
                <Image source={{ uri: hotel.image }} style={styles.hotelImage} resizeMode="cover" />
              ) : (
                <View style={[styles.hotelImage, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#aaa' }}>No Image</Text>
                </View>
              )}
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name ? String(hotel.name) : 'Hotel Name'}</Text>
                <Text style={styles.hotelLocation}>{hotel.location ? String(hotel.location) : 'Location'}</Text>
                <View style={styles.hotelBottomRow}>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingText}>{hotel.rating ? String(hotel.rating) : '-'}</Text>
                    {hotel.reviews ? <Text style={styles.reviewCount}>({String(hotel.reviews)})</Text> : null}
                  </View>
                  <Text style={styles.hotelPrice}>{hotel.price ? String(hotel.price) : 'Price on request'}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Floating Action Button - Removed, now using global ChatbotFAB */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  headerCard: {
    width: width,
    alignSelf: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(252,252,252,0.9)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    elevation: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 54,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    zIndex: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#4CBC71', alignSelf: 'center', marginBottom: 24 },
  searchBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  searchInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#000', marginLeft: 10 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.5)',
    gap: 8,
  },
  filterBtnText: { fontSize: 14, color: '#4CBC71', fontWeight: '500', marginLeft: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B6F7E' },
  errorContainer: { alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#FF6B6B', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#4CBC71', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#6B6F7E', textAlign: 'center', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#A0A0A0', textAlign: 'center' },
  resultsScroll: { flex: 1, paddingHorizontal: 20 },
  resultsCount: { fontSize: 20, color: '#4CBC71', fontWeight: '700', marginBottom: 16, marginTop: 8 },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  hotelImage: { width: 120, height: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  hotelInfo: { flex: 1, padding: 16, justifyContent: 'space-between' },
  hotelName: { fontSize: 18, fontWeight: '600', color: '#6B6F7E', marginBottom: 4 },
  hotelLocation: { fontSize: 14, color: '#A0A0A0', marginBottom: 8 },
  hotelBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingStar: { color: '#FFACC6', fontSize: 16, marginRight: 2 },
  ratingText: { color: '#FFACC6', fontSize: 14, fontWeight: '500' },
  reviewCount: { color: '#A0A0A0', fontSize: 12, marginLeft: 4 },
  hotelPrice: { color: '#4CBC71', fontSize: 18, fontWeight: '700' },

});

export default SearchHotelResultScreen;