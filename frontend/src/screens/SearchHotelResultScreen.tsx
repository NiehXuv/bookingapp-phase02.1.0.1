import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, MapPin, Star, Filter } from 'lucide-react-native';
import { googlePlacesService } from '../services/googlePlacesService';
import { tripAdvisorService } from '../services/tripadvisorService';
import { hotelCacheService } from '../services/hotelCacheService';

const { width } = Dimensions.get('window');

const SearchHotelResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance optimization state
  const [displayedHotels, setDisplayedHotels] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreHotels, setHasMoreHotels] = useState(true);
  
  // Constants for incremental loading
  const INITIAL_LOAD_COUNT = 30;
  const LOAD_MORE_COUNT = 20;
  
  // Refs for performance
  const allHotelsRef = useRef<any[]>([]);
  
  // Debug: Log cache status on mount
  useEffect(() => {
    console.log('🏪 ===== CACHE STATUS =====');
    const cacheInfo = hotelCacheService.getCacheInfo();
    console.log('🏪 Current cache keys:', Object.keys(cacheInfo));
    console.log('🏪 Cache size:', hotelCacheService.getCacheSize());
    
    Object.entries(cacheInfo).forEach(([city, info]) => {
      console.log(`🏪 - ${city}: ${info.count} hotels, age: ${info.age}ms, valid: ${info.valid}`);
    });
  }, []);

  const params = route.params as { city?: string } || {};
  const { city } = params;
  
  // Incremental loading function
  const loadMoreHotels = useCallback(() => {
    if (isLoadingMore || !hasMoreHotels) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentCount = displayedHotels.length;
      const nextBatch = allHotelsRef.current.slice(currentCount, currentCount + LOAD_MORE_COUNT);
      
      if (nextBatch.length > 0) {
        setDisplayedHotels(prev => [...prev, ...nextBatch]);
        setHasMoreHotels(currentCount + nextBatch.length < allHotelsRef.current.length);
      } else {
        setHasMoreHotels(false);
      }
      
      setIsLoadingMore(false);
    }, 300);
  }, [displayedHotels.length, isLoadingMore, hasMoreHotels]);
  
  // Initialize displayed hotels when all hotels change
  useEffect(() => {
    if (hotels.length > 0) {
      const initialBatch = hotels.slice(0, INITIAL_LOAD_COUNT);
      setDisplayedHotels(initialBatch);
      setHasMoreHotels(hotels.length > INITIAL_LOAD_COUNT);
      allHotelsRef.current = hotels;
    }
  }, [hotels]);

  useEffect(() => {
    console.log('📍 ===== useEffect TRIGGERED =====');
    console.log('📍 useEffect triggered with city:', city);
    
    if (!city) {
      console.log('❌ No city provided, showing error');
      setError('No city selected or invalid navigation parameters.');
      setLoading(false);
      return;
    }
    
    console.log('✅ City validation passed');
    
    // Check cache FIRST before any API calls
    const cachedData = hotelCacheService.getCachedResults(city);
    
    console.log(`🔍 Cache check for "${city}":`, {
      hasCache: !!cachedData,
      cacheDataLength: cachedData?.length || 0
    });
    
    if (cachedData) {
      console.log(`⚡ INSTANT CACHE HIT for ${city}! Loading from cache immediately...`);
      setHotels(cachedData);
      setLoading(false);
      return;
    }
    
    console.log(`🔄 Cache miss for ${city}. Starting search...`);
    fetchHotels(city);
  }, [city, route.params]);

  const fetchHotels = async (searchCity?: string) => {
    const targetCity = searchCity || city;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Hotel search started for: ${targetCity}`);
      
      // Check cache first for instant results
      const cachedData = hotelCacheService.getCachedResults(targetCity || '');
      
      if (cachedData) {
        console.log(`⚡ Secondary cache hit for ${targetCity}! Loading from cache...`);
        setHotels(cachedData);
        setLoading(false);
        return;
      }
      
      console.log(`🔄 Secondary cache miss for ${targetCity}. Fetching fresh data...`);
      
      // Fetch hotels from Google Places (city-specific)
      let googleHotels: any[] = [];
      try {
        const googleResults = await googlePlacesService.searchHotels(city || 'Vietnam');
        console.log(`🌐 Google Places API: ${googleResults.length} results for ${city}`);
        
        googleHotels = googleResults.map(h => ({
          id: `google_${h.id}`,
          name: h.name,
          location: h.location || h.address,
          rating: h.rating || '-',
          price: h.priceLevel !== undefined ? ['$','$$','$$$','$$$$','$$$$$'][Math.min(Math.max((h.priceLevel || 0),0),4)] + '/night' : 'Price on request',
          image: h.photos?.[0] || null,
          description: h.editorialSummary || 'No description available',
          amenities: h.amenities || [],
          reviews: h.userRatingsTotal || 0,
          latitude: h.coordinates?.lat,
          longitude: h.coordinates?.lng,
          photos: h.photos || [],
          source: 'Google Places',
          place_id: h.id
        }));
        
        const cityLower = city?.toLowerCase() || '';
        
        // Light filtering for quality assurance
        const filteredGoogleHotels = googleHotels.filter(hotel => {
          const hotelLocation = hotel.location?.toLowerCase() || '';
          const hotelName = hotel.name?.toLowerCase() || '';
          
          const cityVariations = getCityVariations(city || '');
          const provinceMatch = getProvinceForCity(city || '');
          
          const isRelevant = 
            hotelLocation.includes(cityLower) ||
            cityVariations.some((variant: string) => hotelLocation.includes(variant.toLowerCase())) ||
            (provinceMatch && hotelLocation.includes(provinceMatch.toLowerCase())) ||
            hotelName.includes(cityLower) ||
            cityVariations.some((variant: string) => hotelName.includes(variant.toLowerCase())) ||
            hotelLocation.toLowerCase().includes(cityLower) ||
            hotelName.toLowerCase().includes(cityLower) ||
            (provinceMatch && (
              hotelLocation.toLowerCase().includes(provinceMatch.toLowerCase()) ||
              hotelName.toLowerCase().includes(provinceMatch.toLowerCase())
            ));
          
          return isRelevant;
        });
        
        googleHotels = filteredGoogleHotels;
        
      } catch (error) {
        console.log(`❌ Google Places API Error: ${(error as any)?.message || error}`);
      }

      // Fetch TripAdvisor content for the specific city
      let tripAdvisorHotels: any[] = [];
      try {
        const tripAdvisorResults = await tripAdvisorService.fetchVietnamTravelContent(50);
        console.log(`🗺️ TripAdvisor API for ${city}: ${tripAdvisorResults.length} results`);
        
        const citySpecificContent = tripAdvisorResults.filter(item => {
          const title = item.title.toLowerCase();
          const location = item.locationString?.toLowerCase() || '';
          const description = item.description.toLowerCase();
          const cityLower = city?.toLowerCase() || '';
          
          const isDirectCityMatch = location.includes(cityLower);
          const cityVariations = getCityVariations(city || '');
          const hasCityVariation = cityVariations.some((variant: string) => 
            location.includes(variant.toLowerCase())
          );
          
          const provinceMatch = getProvinceForCity(city || '');
          const hasProvinceMatch = provinceMatch && location.includes(provinceMatch.toLowerCase());
          
          const mentionsCity = title.includes(cityLower) || description.includes(cityLower);
          const hasCityVariationInContent = cityVariations.some((variant: string) => 
            title.includes(variant.toLowerCase()) || description.includes(variant.toLowerCase())
          );
          
          const hotelKeywords = ['hotel', 'resort', 'accommodation', 'stay', 'lodging', 'inn', 'guest house', 'hostel', 'motel', 'villa', 'apartment'];
          const isHotelRelated = hotelKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
          );
          
          const shouldInclude = 
            isDirectCityMatch || 
            hasCityVariation || 
            hasProvinceMatch || 
            (mentionsCity && isHotelRelated) ||
            (hasCityVariationInContent && isHotelRelated);
          
          return shouldInclude;
        });
        
        tripAdvisorHotels = citySpecificContent.map(item => ({
          id: `tripadvisor_${item.id}`,
          name: item.title
            .replace(' - Vietnam Travel', '')
            .replace(' in Vietnam 🇻🇳', '')
            .replace('Hotel in ', '')
            .replace('Resort in ', ''),
          location: item.locationString || `${city}, Vietnam`,
          rating: item.rating?.toString() || '4.5',
          price: 'Price on request',
          image: item.imageUrl,
          description: item.description,
          amenities: [],
          reviews: item.reviewCount || 0,
          latitude: null,
          longitude: null,
          photos: [item.imageUrl],
          source: 'TripAdvisor',
          place_id: item.id
        }));
        
      } catch (error) {
        console.log(`❌ TripAdvisor API Error: ${(error as any)?.message || error}`);
      }

      // Combine all hotels
      let allHotels = [...googleHotels, ...tripAdvisorHotels];
      console.log(`🔗 Combined: ${googleHotels.length} Google + ${tripAdvisorHotels.length} TripAdvisor = ${allHotels.length} total`);
      
      // Remove duplicates
      const uniqueHotels = allHotels.filter((hotel, index, self) => {
        if (hotel.source === 'TripAdvisor') {
          const baseId = hotel.id.split('_').slice(0, -1).join('_');
          const isDuplicateById = index !== self.findIndex(h => 
            h.source === 'TripAdvisor' && 
            h.id.includes(baseId)
          );
          
          if (isDuplicateById) return false;
          
          const isDuplicateByContent = index !== self.findIndex(h => 
            h.source === 'TripAdvisor' &&
            h.name.toLowerCase() === hotel.name.toLowerCase() &&
            h.description.toLowerCase() === hotel.description.toLowerCase()
          );
          
          if (isDuplicateByContent) return false;
        } else {
          const isDuplicate = index !== self.findIndex(h => 
            h.name.toLowerCase() === hotel.name.toLowerCase() && 
            h.location.toLowerCase() === hotel.location.toLowerCase()
          );
          
          if (isDuplicate) return false;
        }
        
        return true;
      });
      
      console.log(`✨ Deduplication: ${allHotels.length} → ${uniqueHotels.length} hotels`);
      
      // If no hotels found, show sample data
      if (uniqueHotels.length === 0) {
        console.log('⚠️ No hotels found from APIs, generating sample data');
        const sampleHotels = getSampleHotels(city || 'Vietnam');
        setHotels(sampleHotels);
      } else {
        const finalHotels = uniqueHotels.slice(0, 50);
        console.log(`🏨 Final results: ${uniqueHotels.length} total, ${finalHotels.length} displayed`);
        setHotels(finalHotels);
        
        // Cache the successful results
        if (targetCity) {
          hotelCacheService.cacheResults(targetCity, finalHotels);
        }
      }
      
      console.log('✅ ===== HOTEL SEARCH COMPLETED =====');
      
    } catch (error: any) {
      console.log(`❌ Hotel search failed: ${error?.message || error}`);
      setError('Failed to fetch hotels. Showing sample data.');
      const sampleHotels = getSampleHotels(targetCity || 'Vietnam');
      setHotels(sampleHotels);
      
      if (targetCity) {
        hotelCacheService.cacheResults(targetCity, sampleHotels);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Search completed');
    }
  };

  // Sample hotels fallback
  const getSampleHotels = (cityName: string) => {
    const sampleHotels = [
      {
        id: 'sample_1',
        name: `${cityName} Grand Hotel`,
        location: `${cityName}, Vietnam`,
        rating: '4.5',
        price: '$80-120/night',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        description: `Experience luxury and comfort at ${cityName} Grand Hotel. Perfect location with modern amenities.`,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
        reviews: 128,
        source: 'Sample Data',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'],
        latitude: null,
        longitude: null,
        place_id: 'sample_1'
      },
      {
        id: 'sample_2',
        name: `${cityName} Central Resort`,
        location: `${cityName}, Vietnam`,
        rating: '4.3',
        price: '$60-90/night',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
        description: `Beautiful resort in the heart of ${cityName}. Great views and excellent service.`,
        amenities: ['WiFi', 'Garden', 'Restaurant'],
        reviews: 95,
        source: 'Sample Data',
        photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop'],
        latitude: null,
        longitude: null,
        place_id: 'sample_2'
      },
      {
        id: 'sample_3',
        name: `${cityName} Boutique Hotel`,
        location: `${cityName}, Vietnam`,
        rating: '4.7',
        price: '$100-150/night',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
        description: `Charming boutique hotel offering personalized service in ${cityName}.`,
        amenities: ['WiFi', 'Bar', 'Room Service', 'Concierge'],
        reviews: 67,
        source: 'Sample Data',
        photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop'],
        latitude: null,
        longitude: null,
        place_id: 'sample_3'
      }
    ];
    
    return sampleHotels;
  };

  // Smart city name variations
  const getCityVariations = (cityName: string): string[] => {
    const variations: string[] = [cityName];
    
    let coreCity = cityName.toLowerCase()
      .replace(/thành phố\s*/i, '')
      .replace(/thanh pho\s*/i, '')
      .replace(/tp\.\s*/i, '')
      .replace(/tp\s*/i, '')
      .replace(/vịnh\s*/i, '')
      .replace(/vinh\s*/i, '')
      .replace(/thị xã\s*/i, '')
      .replace(/thi xa\s*/i, '')
      .trim();
    
    if (coreCity !== cityName.toLowerCase()) {
      variations.push(coreCity);
    }
    
    const normalizedCore = coreCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (normalizedCore !== coreCity) {
      variations.push(normalizedCore);
    }
    
    const noSpaces = coreCity.replace(/\s+/g, '');
    if (noSpaces !== coreCity) {
      variations.push(noSpaces);
    }
    
    if (coreCity.includes('hồ chí minh') || coreCity.includes('ho chi minh')) {
      variations.push('hcm', 'saigon', 'sài gòn');
    } else if (coreCity.includes('hà nội') || coreCity.includes('ha noi')) {
      variations.push('hanoi');
    } else if (coreCity.includes('đà nẵng') || coreCity.includes('da nang')) {
      variations.push('danang');
    }
    
    return variations;
  };

  // Smart province detection
  const getProvinceForCity = (cityName: string): string | null => {
    let coreCity = cityName.toLowerCase()
      .replace(/thành phố\s*/i, '')
      .replace(/thanh pho\s*/i, '')
      .replace(/tp\.\s*/i, '')
      .replace(/tp\s*/i, '')
      .replace(/vịnh\s*/i, '')
      .replace(/vinh\s*/i, '')
      .replace(/thị xã\s*/i, '')
      .replace(/thi xa\s*/i, '')
      .trim();
    
    const provinceMap: { [key: string]: string } = {
      'hồ chí minh': 'Hồ Chí Minh',
      'ho chi minh': 'Hồ Chí Minh',
      'hcm': 'Hồ Chí Minh',
      'saigon': 'Hồ Chí Minh',
      'sài gòn': 'Hồ Chí Minh',
      'hà nội': 'Hà Nội',
      'ha noi': 'Hà Nội',
      'hanoi': 'Hà Nội',
      'đà nẵng': 'Đà Nẵng',
      'da nang': 'Đà Nẵng',
      'danang': 'Đà Nẵng',
      'hội an': 'Quảng Nam',
      'hoi an': 'Quảng Nam',
      'hạ long': 'Quảng Ninh',
      'ha long': 'Quảng Ninh',
      'halong': 'Quảng Ninh',
      'nha trang': 'Khánh Hòa',
      'nhatrang': 'Khánh Hòa',
      'sapa': 'Lào Cai',
      'sa pa': 'Lào Cai',
      'phú quốc': 'Kiên Giang',
      'phu quoc': 'Kiên Giang'
    };
    
    if (provinceMap[coreCity]) {
      return provinceMap[coreCity];
    }
    
    for (const [city, province] of Object.entries(provinceMap)) {
      if (coreCity.includes(city) || city.includes(coreCity)) {
        return province;
      }
    }
    
    return null;
  };

  const handleHotelPress = (hotel: any) => {
    console.log('🖱️ ===== HOTEL PRESSED =====');
    console.log('🖱️ Hotel details:', {
      id: hotel.id,
      name: hotel.name,
      source: hotel.source,
      location: hotel.location,
      photos: hotel.photos?.length || 0,
      coordinates: hotel.latitude && hotel.longitude ? { lat: hotel.latitude, lng: hotel.longitude } : null,
      place_id: hotel.place_id
    });
    
    const coordinates = hotel.latitude && hotel.longitude 
      ? { lat: hotel.latitude, lng: hotel.longitude }
      : { lat: 0, lng: 0 };
    
    const hotelData = {
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      rating: hotel.rating,
      price: hotel.price,
      description: hotel.description,
      amenities: hotel.amenities || [],
      reviews: hotel.reviews,
      photos: hotel.photos || [],
      source: hotel.source,
      address: hotel.location,
      coordinates: coordinates,
      phone: hotel.phone,
      website: hotel.website,
      openingHours: hotel.openingHours || [],
      priceLevel: hotel.priceLevel,
      userRatingsTotal: hotel.reviews,
      types: hotel.types || []
    };
    
    let placeId = hotel.id;
    if (hotel.source === 'Google Places' && hotel.id.startsWith('google_')) {
      placeId = hotel.id.replace('google_', '');
    } else if (hotel.place_id) {
      placeId = hotel.place_id;
    }
    
    console.log('🖱️ Navigating to HotelDetailScreen with data:', {
      hotelId: placeId,
      coordinates,
      photos: hotel.photos?.length || 0,
      originalId: hotel.id
    });
    
    (navigation as any).navigate('HotelDetailScreen', { 
      hotelId: placeId,
      hotelData: hotelData,
      coordinates: coordinates,
      price: hotel.price
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Results</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Searching for hotels...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hotel Results</Text>
        {city && (
          <Text style={styles.headerSubtitle}>in {city}</Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Search size={20} color="#6B7280" />
          <Text style={styles.searchText}>{city || 'Search hotels...'}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={displayedHotels}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item: hotel, index }) => (
          <TouchableOpacity onPress={() => handleHotelPress(hotel)} activeOpacity={0.9}>
            <View style={styles.hotelCard}>
                <Image 
                source={{ uri: hotel.image }} 
                style={styles.hotelImage} 
                resizeMode="cover"
                />
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName} numberOfLines={2}>{hotel.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.hotelLocation} numberOfLines={1}>{hotel.location}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{hotel.rating}</Text>
                  <Text style={styles.reviewCount}>({hotel.reviews} reviews)</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.hotelPrice}>{hotel.price}</Text>
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceText}>{hotel.source}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        style={styles.resultsList}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreHotels}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={() => (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {hotels.length} hotels found
            </Text>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <>
            {isLoadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            )}
            {!hasMoreHotels && displayedHotels.length > 0 && (
              <View style={styles.endOfResults}>
                <Text style={styles.endOfResultsText}>All hotels loaded</Text>
              </View>
            )}
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  resultsList: {
    flex: 1,
  },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  hotelImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hotelInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  endOfResults: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default SearchHotelResultScreen;