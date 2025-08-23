import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Star, Search, Filter } from 'lucide-react-native';
import { useSearchContext } from '../context/SearchContext';

const { width } = Dimensions.get('window');

const AMADEUS_CLIENT_ID = 'xTCqf89AlcUFoUzg15AfGbYDgxh4WFDW';
const AMADEUS_CLIENT_SECRET = 'Fk4KhjJsdWFEkqOg';

// Simple static mapping for demo (expand as needed)
const cityGeo = {
  'Hanoi': { latitude: 21.0285, longitude: 105.8542 },
  'Ho Chi Minh City': { latitude: 10.7769, longitude: 106.7009 },
  'Da Nang': { latitude: 16.0544, longitude: 108.2022 },
  'Hoi An': { latitude: 15.8801, longitude: 108.3380 },
  'Hue': { latitude: 16.4637, longitude: 107.5909 },
  'Nha Trang': { latitude: 12.2388, longitude: 109.1967 },
};

async function getAmadeusToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
  });
  const data = await response.json();
  return data.access_token;
}

async function searchAmadeusExperiences({ latitude, longitude, radius = 30, startDate, endDate, token }: {
  latitude: number;
  longitude: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  token: string;
}) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
  });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`https://test.api.amadeus.com/v1/shopping/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

const SearchTourResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { destination: keyof typeof cityGeo; departureDate?: string; category?: string; searchQuery?: string };
  const { destination, departureDate, category, searchQuery } = params || {};

  // 🚀 Use SearchContext for persistent state
  const {
    serviceResults,
    setServiceResults,
    isLoadingServices,
    setIsLoadingServices,
    lastServiceQuery,
    setLastServiceQuery
  } = useSearchContext();

  const [error, setError] = useState<string | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);

  // Generate mock data for testing when API doesn't return results
  const generateMockData = useCallback((dest: string, cat: string) => {
    const baseData = [
      {
        id: '1',
        name: `${cat} Experience in ${dest}`,
        shortDescription: `Amazing ${cat.toLowerCase()} experience in ${dest}`,
        pictures: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
        geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
        rating: 4.5,
        price: { amount: 25 }
      },
      {
        id: '2',
        name: `Premium ${cat} in ${dest}`,
        shortDescription: `High-quality ${cat.toLowerCase()} service in ${dest}`,
        pictures: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'],
        geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
        rating: 4.8,
        price: { amount: 35 }
      },
      {
        id: '3',
        name: `Local ${cat} Guide ${dest}`,
        shortDescription: `Authentic local ${cat.toLowerCase()} experience in ${dest}`,
        pictures: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
        geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
        rating: 4.2,
        price: { amount: 20 }
      }
    ];

    // Add category-specific items
    if (cat === 'Restaurant') {
      baseData.push(
        {
          id: '4',
          name: `Traditional Vietnamese Restaurant in ${dest}`,
          shortDescription: `Authentic Vietnamese cuisine in ${dest}`,
          pictures: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'],
          geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
          rating: 4.6,
          price: { amount: 15 }
        }
      );
    } else if (cat === 'Coffee') {
      baseData.push(
        {
          id: '4',
          name: `Artisan Coffee Shop in ${dest}`,
          shortDescription: `Premium coffee experience in ${dest}`,
          pictures: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
          geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
          rating: 4.4,
          price: { amount: 8 }
        }
      );
    } else if (cat === 'Adventure') {
      baseData.push(
        {
          id: '4',
          name: `Mountain Adventure in ${dest}`,
          shortDescription: `Thrilling outdoor adventure in ${dest}`,
          pictures: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'],
          geoCode: { city: dest, latitude: 21.0285, longitude: 105.8542 },
          rating: 4.7,
          price: { amount: 45 }
        }
      );
    }

    return baseData;
  }, []);

  // Filter results by category
  const filterResultsByCategory = useCallback((results: any[], selectedCategory: string) => {
    if (!selectedCategory || selectedCategory === 'All') {
      return results;
    }
    
    // Map category names to search terms
    const categoryMappings: { [key: string]: string[] } = {
      'Restaurant': ['restaurant', 'food', 'dining', 'cafe', 'bar', 'kitchen'],
      'Coffee': ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'tea'],
      'Spa': ['spa', 'wellness', 'massage', 'relaxation', 'therapy', 'beauty'],
      'Adventure': ['adventure', 'outdoor', 'hiking', 'climbing', 'rafting', 'zip-line'],
      'Culture': ['culture', 'museum', 'temple', 'heritage', 'traditional', 'art'],
      'Shopping': ['shopping', 'market', 'mall', 'store', 'boutique', 'craft']
    };
    
    const searchTerms = categoryMappings[selectedCategory] || [];
    
    return results.filter(item => {
      const itemText = `${item.name || ''} ${item.shortDescription || ''} ${item.geoCode?.city || ''}`.toLowerCase();
      return searchTerms.some(term => itemText.includes(term));
    });
  }, []);

  useEffect(() => {
    const queryKey = `${destination}_${departureDate || 'no-date'}_${category || 'all'}`;
    
    // 🚀 Check if we already have results for this query (cache hit)
    if (queryKey === lastServiceQuery && serviceResults.length > 0) {
      console.log(`⚡ Services cache hit for "${queryKey}": ${serviceResults.length} results`);
      setIsLoadingServices(false);
                // Apply category filter to cached results
          const filtered = filterResultsByCategory(serviceResults, category || 'All');
          setFilteredResults(filtered);
      return;
    }

    (async () => {
      setIsLoadingServices(true);
      setError(null);
      try {
        console.log(`🔍 Services search started for: "${destination}" with category: "${category}"`);
        let geo = cityGeo[destination];
        if (!geo) {
          setError('Unknown destination. Please choose a major city in Vietnam.');
          setServiceResults([]);
          setFilteredResults([]);
          setIsLoadingServices(false);
          return;
        }
        const token = await getAmadeusToken();
        const data = await searchAmadeusExperiences({ latitude: geo.latitude, longitude: geo.longitude, startDate: departureDate, token });
        if (data && data.data && data.data.length > 0) {
          setServiceResults(data.data);
          setLastServiceQuery(queryKey);
          // Apply category filter to new results
          const filtered = filterResultsByCategory(data.data, category || 'All');
          setFilteredResults(filtered);
          console.log(`✅ Services search completed: ${data.data.length} total results, ${filtered.length} filtered for "${category}"`);
        } else {
          // Fallback to mock data for testing
          console.log(`⚠️ No Amadeus results, using mock data for testing`);
          const mockData = generateMockData(destination || 'Hanoi', category || 'All');
          setServiceResults(mockData);
          setLastServiceQuery(queryKey);
          const filtered = filterResultsByCategory(mockData, category || 'All');
          setFilteredResults(filtered);
          console.log(`✅ Mock data generated: ${mockData.length} total results, ${filtered.length} filtered for "${category}"`);
        }
      } catch (e) {
        console.log(`❌ Services search failed: ${e}`);
        // Fallback to mock data on error
        console.log(`⚠️ API error, using mock data as fallback`);
        const mockData = generateMockData(destination || 'Hanoi', category || 'All');
        setServiceResults(mockData);
        setLastServiceQuery(queryKey);
        const filtered = filterResultsByCategory(mockData, category || 'All');
        setFilteredResults(filtered);
        setError(null); // Clear error since we have fallback data
        console.log(`✅ Mock data fallback: ${mockData.length} total results, ${filtered.length} filtered for "${category}"`);
      } finally {
        setIsLoadingServices(false);
      }
    })();
  }, [destination, departureDate, category, lastServiceQuery, serviceResults.length, setServiceResults, setIsLoadingServices, setLastServiceQuery, filterResultsByCategory]);

  const handleBack = () => navigation.goBack();

  const handleTourPress = (tour: any) => {
    // Transform tour data to match PlaceDetailScreen expectations
    const placeData = {
      id: tour.id || `tour_${Date.now()}`,
      name: tour.name || 'Tour Experience',
      type: category || 'Tour',
      address: tour.geoCode?.city || destination || 'Vietnam',
      rating: tour.rating || 4.0,
      photos: tour.pictures || ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
      description: tour.shortDescription || 'No description available.',
      amenities: [category || 'Tour', 'Experience', 'Local Guide'],
      openingHours: ['Open daily'],
      tourOptions: [{
        id: tour.id || `tour_${Date.now()}`,
        name: tour.name || 'Tour Experience',
        price: tour.price?.amount ? tour.price.amount * 1000 : 500000, // Convert to VND
        description: tour.shortDescription || 'Experience this amazing tour.',
        duration: '2-3 hours',
        currency: 'VND',
        provider: 'Local Tours'
      }],
      reviews: [{
        id: '1',
        author: 'Local Guide',
        date: 'Recent',
        text: 'Highly recommended experience!',
        rating: 5,
        helpful: 12
      }],
      ticketsAvailable: true
    };

    // Navigate to PlaceDetailScreen with transformed data
    console.log('🚀 Navigating to PlaceDetailScreen with data:', {
      placeId: tour.id || `tour_${Date.now()}`,
      placeData: placeData,
      coordinates: {
        lat: tour.geoCode?.latitude || 21.0285,
        lng: tour.geoCode?.longitude || 105.8542
      }
    });
    
    try {
      (navigation as any).navigate('PlaceDetailScreen', {
        placeId: tour.id || `tour_${Date.now()}`,
        placeData: placeData,
        coordinates: {
          lat: tour.geoCode?.latitude || 21.0285, // Default to Hanoi coordinates
          lng: tour.geoCode?.longitude || 105.8542
        }
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to detail screen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category || 'Tour'} Results</Text>
        {searchQuery && (
          <Text style={styles.headerSubtitle}>"{searchQuery}" in {destination}</Text>
        )}
        {!searchQuery && destination && (
          <Text style={styles.headerSubtitle}>in {destination}</Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Search size={20} color="#6B7280" />
          <Text style={styles.searchText}>{searchQuery || destination || 'Search tours...'}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {/* Results Content */}
      {isLoadingServices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Searching for tours...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsScroll} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{filteredResults.length} {category?.toLowerCase() || 'tour'} options found</Text>
          </View>
          {filteredResults.length > 0 ? (
            filteredResults.map((tour: any) => (
              <TouchableOpacity 
                key={tour.id} 
                style={styles.tourCard}
                onPress={() => handleTourPress(tour)}
              >
                <Image source={{ uri: tour.pictures?.[0] }} style={styles.tourImage} resizeMode="cover" />
                <View style={styles.tourInfo}>
                  <Text style={styles.tourTitle}>{tour.name}</Text>
                  <View style={styles.tourMeta}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.tourLocation}>{tour.geoCode?.city || destination}</Text>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.tourRating}>{tour.rating || 'N/A'}</Text>
                  </View>
                  <Text style={styles.tourDescription}>{tour.shortDescription || 'No description.'}</Text>
                  <Text style={styles.tourPrice}>{tour.price?.amount ? `$${tour.price.amount}` : 'See details'}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No {category?.toLowerCase() || 'tour'} options found for this category.</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search or category selection.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
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
    color: '#111827'
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#6B7280',
    fontWeight: '500',
  },
  resultsScroll: { 
    flex: 1
  },
  tourCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  tourImage: { 
    width: 120, 
    height: 120,  
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tourInfo: { 
    flex: 1, 
    padding: 16, 
    justifyContent: 'space-between' 
  },
  tourTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 8,
    lineHeight: 22,
  },
  tourMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
    gap: 8,
  },
  tourLocation: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginLeft: 4,
    fontWeight: '500',
  },
  tourRating: { 
    fontSize: 14, 
    color: '#F59E0B', 
    marginLeft: 2,
    fontWeight: '600',
  },
  tourDescription: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 12,
    lineHeight: 20,
  },
  tourPrice: { 
    color: '#059669', 
    fontSize: 16, 
    fontWeight: '700', 
    marginTop: 4 
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchTourResultScreen; 