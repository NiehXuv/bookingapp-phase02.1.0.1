import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, Filter, Plane, Clock, Target, Star } from 'lucide-react-native';
import axios from 'axios';
import Config from 'react-native-config';
import airports from '../utils/airports';
import { useSearchContext } from '../context/SearchContext';

const { width } = Dimensions.get('window');

interface FlightResult {
  id: string;
  airline: string;
  airlineLogo: string;
  flightClass: string;
  departure: {
    time: string;
    airport: string;
    city: string;
  };
  arrival: {
    time: string;
    airport: string;
    city: string;
  };
  duration: string;
  isDirect: boolean;
  originalPrice: string;
  discountedPrice: string;
  stops: number;
}

const SearchTransportResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;

  // 🚀 Use SearchContext for persistent state
  const {
    transportResults,
    setTransportResults,
    isLoadingTransport,
    setIsLoadingTransport,
    lastTransportQuery,
    setLastTransportQuery
  } = useSearchContext();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Extract search parameters
  const { from, to, departureDate, returnDate, adults, children, transportType = 'Flight', searchQuery } = params || {};

  useEffect(() => {
    console.log('🚀 SearchTransportResultScreen received params:', { from, to, departureDate, returnDate, adults, children, transportType, searchQuery });
    
    const queryKey = `${from}_${to}_${departureDate}_${returnDate || 'no-return'}_${adults || 1}_${children || 0}_${transportType}`;
    
    // 🚀 Check if we already have results for this query (cache hit)
    if (queryKey === lastTransportQuery && transportResults.length > 0) {
      console.log(`⚡ Transport cache hit for "${queryKey}": ${transportResults.length} results`);
      setIsLoadingTransport(false);
      return;
    }

    if (transportType === 'Flight') {
      searchFlights();
    } else {
      // For other transport types, show sample data
      console.log(`🔍 Transport search for non-flight: ${transportType}`);
      setIsLoadingTransport(false);
      const sampleData = getSampleResults(transportType);
      setTransportResults(sampleData);
      setLastTransportQuery(queryKey);
      console.log(`✅ Transport sample data loaded: ${sampleData.length} results`);
    }
  }, [from, to, departureDate, returnDate, adults, children, transportType, lastTransportQuery, transportResults.length, setTransportResults, setIsLoadingTransport, setLastTransportQuery]);

  const validateSearchParams = () => {
    if (!from || !to) {
      console.log('Missing origin or destination');
      return false;
    }
    
    if (!departureDate) {
      console.log('Missing departure date');
      return false;
    }
    
    // Validate airport codes (should be 3 letters and exist in our database)
    if (from.length !== 3 || to.length !== 3) {
      console.log('Invalid airport codes - should be 3 letters');
      return false;
    }
    
    // Check if airport codes exist in our database
    const fromAirport = airports.find(a => a.code === from.toUpperCase());
    const toAirport = airports.find(a => a.code === to.toUpperCase());
    
    if (!fromAirport) {
      console.log(`Invalid origin airport code: ${from}`);
      return false;
    }
    
    if (!toAirport) {
      console.log(`Invalid destination airport code: ${to}`);
      return false;
    }
    
    return true;
  };

  const searchFlights = async () => {
    const queryKey = `${from}_${to}_${departureDate}_${returnDate || 'no-return'}_${adults || 1}_${children || 0}_${transportType}`;
    
    try {
      setIsLoadingTransport(true);
      console.log(`🔍 Transport search started for: "${from}" to "${to}"`);
      
      // Enhanced parameter validation and logging
      console.log('🔍 Raw parameters received:', { from, to, departureDate, returnDate, adults, children });
      console.log('🔍 Parameter types:', { 
        fromType: typeof from, 
        toType: typeof to, 
        departureDateType: typeof departureDate,
        fromLength: from?.length,
        toLength: to?.length
      });
      
      // Validate parameters first
      console.log('🔍 Validating search parameters:', { from, to, departureDate });
      if (!validateSearchParams()) {
        console.log('❌ Validation failed, using sample data due to invalid parameters');
        const sampleData = getSampleResults();
        setTransportResults(sampleData);
        setLastTransportQuery(queryKey);
        setIsLoadingTransport(false);
        return;
      }
      console.log('✅ Validation passed, proceeding with API call');
      
      // Additional validation for Amadeus API
      if (from === to) {
        console.log('❌ Origin and destination cannot be the same');
        Alert.alert('Invalid Route', 'Origin and destination cannot be the same city');
        const sampleData = getSampleResults();
        setTransportResults(sampleData);
        setLastTransportQuery(queryKey);
        setIsLoadingTransport(false);
        return;
      }
      
      // Validate date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(departureDate)) {
        console.log('❌ Invalid date format:', departureDate);
        Alert.alert('Invalid Date', 'Date must be in YYYY-MM-DD format');
        const sampleData = getSampleResults();
        setTransportResults(sampleData);
        setLastTransportQuery(queryKey);
        setIsLoadingTransport(false);
        return;
      }
      
      // Amadeus API credentials
      const AMADEUS_CLIENT_ID = 'xTCqf89AlcUFoUzg15AfGbYDgxh4WFDW';
      const AMADEUS_CLIENT_SECRET = 'Fk4KhjJsdWFEkqOg';
      
      console.log('🔍 Final validated parameters:', { from, to, departureDate, returnDate, adults, children });
      console.log('Making API call to Amadeus...');
      
      // Get access token
      const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
        `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;
      console.log('Access token received');

      // Search flights with strict parameter validation
      const searchParams: any = {
        originLocationCode: from.toUpperCase().trim(),
        destinationLocationCode: to.toUpperCase().trim(),
        departureDate: departureDate.trim(),
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
        max: 20,
        currencyCode: 'USD',
      };

      // Add return date only for round trips
      if (returnDate && returnDate.trim()) {
        searchParams.returnDate = returnDate.trim();
      }

      console.log('🔍 Final search params for Amadeus:', searchParams);

      const flightResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: searchParams,
      });

      console.log('✅ Amadeus API response received');
      console.log('🔍 Response status:', flightResponse.status);
      console.log('🔍 Response data structure:', {
        hasData: !!flightResponse.data.data,
        dataLength: flightResponse.data.data?.length || 0,
        hasErrors: !!flightResponse.data.errors,
        errors: flightResponse.data.errors
      });
      
      // Check for Amadeus API errors
      if (flightResponse.data.errors && flightResponse.data.errors.length > 0) {
        const error = flightResponse.data.errors[0];
        console.error('❌ Amadeus API error:', {
          status: error.status,
          code: error.code,
          title: error.title,
          detail: error.detail
        });
        
        // Handle specific error codes
        if (error.code === 4926) {
          console.log('❌ Error 4926: Multiple O/D overlap - likely duplicate parameters');
          Alert.alert('Search Error', 'Invalid search parameters. Please check your origin and destination.');
        } else {
          Alert.alert('Search Error', `API Error: ${error.title} - ${error.detail}`);
        }
        
        // Fallback to sample data
        const sampleData = getSampleResults();
        setTransportResults(sampleData);
        setLastTransportQuery(queryKey);
        setIsLoadingTransport(false);
        return;
      }

      console.log('Number of flights found:', flightResponse.data.data?.length || 0);

      if (!flightResponse.data.data || flightResponse.data.data.length === 0) {
        console.log('No flights found, showing sample data');
        const sampleData = getSampleResults();
        setTransportResults(sampleData);
        setLastTransportQuery(queryKey);
        setIsLoadingTransport(false);
        return;
      }

      const flights = flightResponse.data.data.map((flight: any, index: number) => ({
        id: flight.id,
        airline: flight.validatingAirlineCodes[0],
        airlineLogo: getAirlineLogo(flight.validatingAirlineCodes[0]),
        flightClass: flight.travelerPricings[0].fareDetailsBySegment[0].cabin,
        departure: {
          time: flight.itineraries[0].segments[0].departure.at.split('T')[1].substring(0, 5),
          airport: flight.itineraries[0].segments[0].departure.iataCode,
          city: flight.itineraries[0].segments[0].departure.iataCode,
        },
        arrival: {
          time: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at.split('T')[1].substring(0, 5),
          airport: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
          city: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
        },
        duration: flight.itineraries[0].duration,
        isDirect: flight.itineraries[0].segments.length === 1,
        originalPrice: `$${Math.round(parseFloat(flight.price.total) * 1.2)}`,
        discountedPrice: `$${flight.price.total}`,
        stops: flight.itineraries[0].segments.length - 1,
      }));

      setTransportResults(flights);
      setLastTransportQuery(queryKey);
      console.log(`✅ Transport search completed: ${flights.length} results`);
    } catch (error: any) {
      console.error('Flight search error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Show error message to user
      Alert.alert(
        'API Error',
        `Failed to fetch flights: ${error.response?.status || error.message}. Showing sample data instead.`,
        [{ text: 'OK' }]
      );
      
      // Fallback to sample data
      console.log('Falling back to sample data');
      const sampleData = getSampleResults();
      setTransportResults(sampleData);
      setLastTransportQuery(queryKey);
    } finally {
      setIsLoadingTransport(false);
    }
  };

  const getAirlineLogo = (airlineCode: string) => {
    const logos: { [key: string]: string } = {
      'VN': 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60',
      'VJ': 'https://cdn.builder.io/api/v1/image/assets/TEMP/84eae4b7e9c0cfce666b479e4f79966618556919?width=58',
      'QH': 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60',
    };
    return logos[airlineCode] || 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60';
  };

  const getSampleResults = (type: string = 'Flight'): FlightResult[] => [
    {
      id: '1',
      airline: 'Vietnam Airlines',
      airlineLogo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60',
      flightClass: 'Economy',
      departure: { time: '07:30', airport: 'HAN', city: 'Hanoi' },
      arrival: { time: '09:00', airport: 'DAD', city: 'Da Nang' },
      duration: 'PT1H30M',
      isDirect: true,
      originalPrice: '$198.85',
      discountedPrice: '$114.82',
      stops: 0,
    },
    {
      id: '2',
      airline: 'Vietjet Air',
      airlineLogo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/84eae4b7e9c0cfce666b479e4f79966618556919?width=58',
      flightClass: 'Economy',
      departure: { time: '08:15', airport: 'HAN', city: 'Hanoi' },
      arrival: { time: '09:45', airport: 'DAD', city: 'Da Nang' },
      duration: 'PT1H30M',
      isDirect: true,
      originalPrice: '$134.68',
      discountedPrice: '$102.46',
      stops: 0,
    },
    {
      id: '3',
      airline: 'Vietnam Airlines',
      airlineLogo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60',
      flightClass: 'Economy',
      departure: { time: '10:25', airport: 'HAN', city: 'Hanoi' },
      arrival: { time: '12:10', airport: 'DAD', city: 'Da Nang' },
      duration: 'PT1H35M',
      isDirect: true,
      originalPrice: '$203.14',
      discountedPrice: '$123.75',
      stops: 0,
    },
  ];

  const handleBackClick = () => {
    navigation.goBack();
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleSortClick = () => {
    setShowSortModal(true);
  };

  const handleFlightSelect = (flight: FlightResult) => {
    const navigationData = {
      transportData: flight,
      searchParams: {
        from,
        to,
        departureDate,
        returnDate,
        adults,
        children,
        transportType,
        // Add any additional search parameters you want to pass
        departureCoords: '21.0285,105.8542', // Default to Hanoi coordinates
        arrivalCoords: '16.0544,108.2022', // Default to Da Nang coordinates
      }
    };
    
    console.log('🚀 Navigating to TransportDetailScreen with data:', navigationData);
    
    // Navigate to TransportDetailScreen with all necessary data
    (navigation as any).navigate('TransportDetailScreen', navigationData);
  };

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+)H(\d+)?M?/);
    if (match) {
      const hours = match[1];
      const minutes = match[2] || '0';
      return `${hours}h${minutes}m`;
    }
    return duration;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackClick}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transportType} Results</Text>
        {searchQuery && (
          <Text style={styles.headerSubtitle}>{searchQuery}</Text>
        )}
        {!searchQuery && from && to && (
          <Text style={styles.headerSubtitle}>{from} → {to}</Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Search size={20} color="#6B7280" />
          <Text style={styles.searchText}>{searchQuery || (from && to ? `${from} → ${to}` : 'Search transport...')}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>



      {/* Results Content */}
      <View style={styles.resultsContent}>
        <Text style={styles.resultsCount}>
          {isLoadingTransport ? 'Searching...' : `${transportResults.length} ${transportType.toLowerCase()} options found`}
        </Text>

        {isLoadingTransport ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CBC71" />
            <Text style={styles.loadingText}>Searching for flights...</Text>
          </View>
        ) : (
          <ScrollView style={styles.flightList} showsVerticalScrollIndicator={false}>
            {transportResults.map((flight) => (
              <TouchableOpacity
                key={flight.id}
                style={styles.flightCard}
                onPress={() => handleFlightSelect(flight)}
              >
                {/* Airline Header */}
                <View style={styles.airlineHeader}>
                  <View style={styles.airlineInfo}>
                    <Image source={{ uri: flight.airlineLogo }} style={styles.airlineLogo} />
                    <Text style={styles.airlineName}>{flight.airline}</Text>
                  </View>
                  <View style={styles.flightClassBadge}>
                    <Text style={styles.flightClassText}>{flight.flightClass}</Text>
                  </View>
                </View>

                {/* Flight Details */}
                <View style={styles.flightDetails}>
                  {/* Flight Info */}
                  <View style={styles.flightInfo}>
                    <View style={styles.infoRow}>
                      <Target size={16} color="#6B6F7E" />
                      <Text style={styles.infoText}>
                        {flight.isDirect ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Clock size={16} color="#6B6F7E" />
                      <Text style={styles.infoText}>{formatDuration(flight.duration)}</Text>
                    </View>
                  </View>

                  {/* Route */}
                  <View style={styles.routeContainer}>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeTime}>{flight.departure.time}</Text>
                      <Text style={styles.routeAirport}>{flight.departure.airport}</Text>
                    </View>
                    <View style={styles.routeArrow}>
                      <Plane size={16} color="#4CBC71" />
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeTime}>{flight.arrival.time}</Text>
                      <Text style={styles.routeAirport}>{flight.arrival.airport}</Text>
                    </View>
                  </View>

                  {/* Pricing */}
                  <View style={styles.pricingContainer}>
                    <Text style={styles.originalPrice}>{flight.originalPrice}</Text>
                    <Text style={styles.discountedPrice}>{flight.discountedPrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
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
  resultsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  flightList: {
    flex: 1,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  airlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airlineLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  airlineName: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  flightClassBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  flightClassText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flightInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeInfo: {
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  routeAirport: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  routeArrow: {
    alignItems: 'center',
  },
  pricingContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountedPrice: {
    fontSize: 24,
    color: '#059669',
    fontWeight: '700',
  },
});

export default SearchTransportResultScreen; 