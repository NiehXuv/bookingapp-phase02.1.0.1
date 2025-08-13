import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, Filter, ArrowUpDown, Calendar, Plane, Clock, Target, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import Config from 'react-native-config';
import airports from '../utils/airports';

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

  const [loading, setLoading] = useState(true);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Extract search parameters
  const { from, to, departureDate, returnDate, adults, children, transportType } = params || {};

  useEffect(() => {
    if (transportType === 'Flight') {
      searchFlights();
    } else {
      // For other transport types, show sample data
      setFlightResults(getSampleResults());
      setLoading(false);
    }
  }, []);

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
    try {
      setLoading(true);
      
      // Validate parameters first
      if (!validateSearchParams()) {
        console.log('Using sample data due to invalid parameters');
        setFlightResults(getSampleResults());
        setLoading(false);
        return;
      }
      
      // Amadeus API credentials
      const AMADEUS_CLIENT_ID = 'xTCqf89AlcUFoUzg15AfGbYDgxh4WFDW';
      const AMADEUS_CLIENT_SECRET = 'Fk4KhjJsdWFEkqOg';
      
      console.log('Search parameters:', { from, to, departureDate, returnDate, adults, children });
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

      // Search flights
      const searchParams: any = {
        originLocationCode: from.toUpperCase(),
        destinationLocationCode: to.toUpperCase(),
        departureDate: departureDate,
        adults: adults || 1,
        children: children || 0,
        max: 20,
        currencyCode: 'USD',
      };

      // Add return date only for round trips
      if (returnDate) {
        searchParams.returnDate = returnDate;
      }

      console.log('Flight search params:', searchParams);

      const flightResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: searchParams,
      });

      console.log('Flight response:', flightResponse.data);
      console.log('Number of flights found:', flightResponse.data.data?.length || 0);

      if (!flightResponse.data.data || flightResponse.data.data.length === 0) {
        console.log('No flights found, showing sample data');
        setFlightResults(getSampleResults());
        setLoading(false);
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

      setFlightResults(flights);
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
      setFlightResults(getSampleResults());
    } finally {
      setLoading(false);
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

  const getSampleResults = (): FlightResult[] => [
    {
      id: '1',
      airline: 'Vietnam Airlines',
      airlineLogo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60',
      flightClass: 'Economy',
      departure: { time: '07:30', airport: 'HAN', city: 'Hanoi' },
      arrival: { time: '09:00', airport: 'DAD', city: 'Da Nang' },
      duration: '1h30',
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
      duration: '1h30',
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
      duration: '1h35',
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
    Alert.alert(
      'Flight Selected',
      `You selected ${flight.airline} flight for ${flight.discountedPrice}`,
      [{ text: 'OK' }]
    );
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
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Background Blur Blob */}
      <View style={styles.backgroundBlob} />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackClick}>
          <ArrowLeft size={20} color="#4CBC71" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport Results</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Search size={20} color="#4CBC71" />
          <Text style={styles.searchPlaceholder}>Find your destination</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterClick}>
          <Filter size={20} color="#4CBC71" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={handleSortClick}>
          <ArrowUpDown size={20} color="#4CBC71" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.filterBtn}>
          <Calendar size={16} color="#4CBC71" />
          <Text style={styles.filterBtnText}>Change Dates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Plane size={16} color="#4CBC71" />
          <Text style={styles.filterBtnText}>Change Type</Text>
        </TouchableOpacity>
      </View>

      {/* Search Summary */}
      <View style={styles.searchSummary}>
        <Text style={styles.searchSummaryText}>
          {from} → {to} • {departureDate}
          {returnDate && ` • Return: ${returnDate}`}
        </Text>
      </View>

      {/* Results Content */}
      <View style={styles.resultsContent}>
        <Text style={styles.resultsCount}>
          {loading ? 'Searching...' : `${flightResults.length} tickets found`}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CBC71" />
            <Text style={styles.loadingText}>Searching for flights...</Text>
          </View>
        ) : (
          <ScrollView style={styles.flightList} showsVerticalScrollIndicator={false}>
            {flightResults.map((flight) => (
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
    backgroundColor: '#FCFCFC',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FCFCFC',
  },
  backgroundBlob: {
    position: 'absolute',
    width: 562,
    height: 562,
    borderRadius: 281,
    opacity: 0.6,
    left: 1,
    top: 428,
    transform: [{ rotate: '-30deg' }],
    backgroundColor: 'rgba(46, 123, 89, 0.30)',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CBC71',
  },
  placeholder: {
    width: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#A0A0A0',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  sortButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 5,
  },
  filterBtnText: {
    fontSize: 14,
    color: '#4CBC71',
  },
  resultsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 20,
    color: '#6B6F7E',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B6F7E',
  },
  flightList: {
    flex: 1,
  },
  flightCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  airlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  airlineLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  airlineName: {
    fontSize: 20,
    color: '#6B6F7E',
  },
  flightClassBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CBC71',
    backgroundColor: 'rgba(76, 188, 113, 0.1)',
  },
  flightClassText: {
    fontSize: 14,
    color: '#4CBC71',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flightInfo: {
    gap: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#6B6F7E',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeInfo: {
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 20,
    color: '#4CBC71',
    fontWeight: '600',
  },
  routeAirport: {
    fontSize: 14,
    color: '#6B6F7E',
  },
  routeArrow: {
    alignItems: 'center',
  },
  pricingContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  originalPrice: {
    fontSize: 16,
    color: '#A0A0A0',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 24,
    color: '#4CBC71',
    fontWeight: 'bold',
  },
  searchSummary: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  searchSummaryText: {
    fontSize: 14,
    color: '#6B6F7E',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SearchTransportResultScreen; 