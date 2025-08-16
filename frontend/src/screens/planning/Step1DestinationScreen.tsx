import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Alert, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { googlePlacesService } from '../../services/googlePlacesService';
import popularCities from '../../utils/popularCities';
import PlanningProgressIndicator from '../../components/PlanningProgressIndicator';

const { width } = Dimensions.get('window');

interface Destination {
  id: string;
  name: string;
  image: string;
  selected: boolean;
  placeId?: string;
  address?: string;
}

interface CitySuggestion {
  id: string;
  name: string;
  country: string;
  fullName: string;
  type: 'local' | 'api';
}

interface ApiCity {
  id: string;
  name: string;
  image: string;
  address: string;
  placeId: string;
}

const Step1DestinationScreen: React.FC<Step1DestinationScreenProps> = ({ 
  planningData, 
  onNext, 
  onCancel, 
  onUpdateData 
}) => {
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [tripDays, setTripDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [apiCities, setApiCities] = useState<ApiCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [selectedCity, setSelectedCity] = useState<Destination | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Fetch 4 random popular cities from Google Places API
  useEffect(() => {
    fetchRandomCities();
  }, []);

  // Load existing planning data when component mounts
  useEffect(() => {
    if (planningData?.destinations && planningData.destinations.length > 0) {
      // Set the selected destination
      setSelectedDestinations(prev => 
        prev.map(dest => ({
          ...dest,
          selected: dest.name === planningData.destinations[0]
        }))
      );
    }
    
    if (planningData?.tripDays) {
      setTripDays(planningData.tripDays);
    }
  }, [planningData]);

  const fetchRandomCities = async () => {
    setIsLoadingCities(true);
    try {
      // Get random cities from popularCities
      const shuffled = [...popularCities].sort(() => 0.5 - Math.random());
      const randomCities = shuffled.slice(0, 4);
      
      const citiesData: ApiCity[] = [];
      
      for (const cityName of randomCities) {
        try {
          // Search for the city using Google Places API
          const places = await googlePlacesService.searchPlaces(cityName, 'Vietnam', 50000);
          
          if (places.length > 0) {
            const place = places[0]; // Get the first result
            const cityData: ApiCity = {
              id: place.id,
              name: place.name,
              image: place.photos && place.photos.length > 0 
                ? place.photos[0] 
                : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
              address: place.address,
              placeId: place.id
            };
            citiesData.push(cityData);
          } else {
            // Fallback with mock data if API doesn't return results
            const cityData: ApiCity = {
              id: `fallback_${cityName}`,
              name: cityName,
              image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
              address: `${cityName}, Vietnam`,
              placeId: `fallback_${cityName}`
            };
            citiesData.push(cityData);
          }
        } catch (error) {
          console.error(`Error fetching data for ${cityName}:`, error);
          // Fallback with mock data
          const cityData: ApiCity = {
            id: `fallback_${cityName}`,
            name: cityName,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            address: `${cityName}, Vietnam`,
            placeId: `fallback_${cityName}`
          };
          citiesData.push(cityData);
        }
      }
      
      setApiCities(citiesData);
      
      // Initialize destinations with the fetched cities
      const initialDestinations: Destination[] = citiesData.map(city => ({
        id: city.id,
        name: city.name,
        image: city.image,
        selected: false,
        placeId: city.placeId,
        address: city.address
      }));
      
      setSelectedDestinations(initialDestinations);
    } catch (error) {
      console.error('Error fetching random cities:', error);
      // Fallback with mock data
      const fallbackCities: ApiCity[] = [
        {
          id: '1',
          name: 'Hanoi',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          address: 'Hanoi, Vietnam',
          placeId: 'fallback_hanoi'
        },
        {
          id: '2',
          name: 'Ho Chi Minh City',
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
          address: 'Ho Chi Minh City, Vietnam',
          placeId: 'fallback_hcmc'
        },
        {
          id: '3',
          name: 'Da Nang',
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
          address: 'Da Nang, Vietnam',
          placeId: 'fallback_danang'
        },
        {
          id: '4',
          name: 'Nha Trang',
          image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
          address: 'Nha Trang, Vietnam',
          placeId: 'fallback_nhatrang'
        }
      ];
      
      setApiCities(fallbackCities);
      const fallbackDestinations: Destination[] = fallbackCities.map(city => ({
        id: city.id,
        name: city.name,
        image: city.image,
        selected: false,
        placeId: city.placeId,
        address: city.address
      }));
      setSelectedDestinations(fallbackDestinations);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const toggleDestination = (id: string) => {
    // Only allow one selection at a time
    setSelectedDestinations(prev => 
      prev.map(dest => ({
        ...dest,
        selected: dest.id === id ? !dest.selected : false
      }))
    );
    
    // Update selected city
    const destination = selectedDestinations.find(dest => dest.id === id);
    if (destination) {
      if (destination.selected) {
        // Deselecting
        setSelectedCity(null);
        setSearchQuery('');
      } else {
        // Selecting
        setSelectedCity(destination);
        setSearchQuery(destination.address || destination.name);
      }
    }
  };

  const incrementDays = () => setTripDays(prev => Math.min(prev + 1, 30));
  const decrementDays = () => setTripDays(prev => Math.max(prev - 1, 1));

  // Local search function for instant suggestions using popularCities
  const getLocalCitySuggestions = (query: string): CitySuggestion[] => {
    if (query.length < 1) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return popularCities
      .filter(city => 
        city.toLowerCase().includes(lowercaseQuery) ||
        city.toLowerCase().startsWith(lowercaseQuery)
      )
      .slice(0, 8) // Show up to 8 local suggestions
      .map((city, index) => ({
        id: `local_${index}`,
        name: city,
        country: 'Vietnam',
        fullName: `${city}, Vietnam`,
        type: 'local' as const
      }));
  };

  // Debounced API search function
  const searchCitiesAPI = useCallback(async (query: string) => {
    if (query.length < 3) return []; // Only search API for longer queries
    
    try {
      const places = await googlePlacesService.searchPlaces(query, 'Vietnam', 50000);
      
      // Filter and transform to city suggestions
      const cities = places
        .filter((place: any) => place.types?.some((type: any) => 
          type.includes('locality') || 
          type.includes('administrative_area_level_1') ||
          type.includes('country')
        ))
        .slice(0, 3) // Limit API results to 3
        .map((place: any) => ({
          id: `api_${place.id}`,
          name: place.name,
          country: place.address.split(',').pop()?.trim() || 'Vietnam',
          fullName: place.address,
          type: 'api' as const
        }));

      return cities;
    } catch (error) {
      console.error('Error searching cities API:', error);
      return [];
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length < 1) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Show local suggestions immediately using popularCities
    const localSuggestions = getLocalCitySuggestions(query);
    setCitySuggestions(localSuggestions);
    setShowSuggestions(localSuggestions.length > 0);

    // Debounce API search for longer queries
    if (query.length >= 3) {
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          const apiSuggestions = await searchCitiesAPI(query);
          // Combine local and API suggestions, removing duplicates
          const allSuggestions = [...localSuggestions];
          apiSuggestions.forEach(apiCity => {
            if (!allSuggestions.some(localCity => 
              localCity.name.toLowerCase() === apiCity.name.toLowerCase()
            )) {
              allSuggestions.push(apiCity);
            }
          });
          
          setCitySuggestions(allSuggestions);
          setShowSuggestions(allSuggestions.length > 0);
        } finally {
          setIsSearching(false);
        }
      }, 800); // 800ms delay to reduce API calls
      
      setSearchTimeout(timeout);
    }
  }, [searchTimeout, searchCitiesAPI]);

  const handleCitySelect = (city: CitySuggestion) => {
    setSearchQuery(city.fullName);
    setShowSuggestions(false);
    
    // Clear any previously selected destination
    setSelectedDestinations(prev => 
      prev.map(dest => ({ ...dest, selected: false }))
    );
    setSelectedCity(null);
    
    console.log('Selected city from search:', city);
  };

  const handleNext = () => {
    // Get the selected destination
    const selectedDest = selectedDestinations.find(d => d.selected);
    
    if (!selectedDest) {
      setShowValidationModal(true);
      return;
    }
    
    // Save destination and trip length data before moving to next step
    const planningData = {
      destinations: [selectedDest.name],
      tripDays: tripDays
    };
    
    console.log('Step 1 - Saving data:', planningData);
    onUpdateData(planningData);
    
    onNext();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <PlanningProgressIndicator currentStep={1} />

        {/* Step Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.stepNumber}>Step 1</Text>
          <Text style={styles.stepTitle}>Your destination and length</Text>
        </View>

        {/* Search and Duration Card */}
        <View style={styles.inputCard}>
          {/* Destination Search */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Find your destination</Text>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#4CBC71" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#8E8E93"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {isSearching && (
                <View style={styles.searchingIndicator}>
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}
            </View>
            
            {/* City Suggestions */}
            {showSuggestions && citySuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={citySuggestions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleCitySelect(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name="location" 
                        size={16} 
                        color={item.type === 'local' ? '#4CBC71' : '#FF6B9D'} 
                      />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionName}>{item.name}</Text>
                        <Text style={styles.suggestionCountry}>
                          {item.country} {item.type === 'api' && '• API'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>

          {/* Trip Length */}
          <View style={styles.durationSection}>
            <Text style={styles.sectionTitle}>How many days is your trip?</Text>
            <View style={styles.daysContainer}>
              <TouchableOpacity style={styles.daysButton} onPress={decrementDays} activeOpacity={0.7}>
                <Text style={styles.daysButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.daysDisplay}>{tripDays}</Text>
              <TouchableOpacity style={styles.daysButton} onPress={incrementDays} activeOpacity={0.7}>
                <Text style={styles.daysButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Travie's Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travie's suggestions for you</Text>
          
          {isLoadingCities ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading suggestions...</Text>
            </View>
          ) : (
            <View style={styles.destinationsGrid}>
              {selectedDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={[styles.destinationCard, destination.selected && styles.selectedDestination]}
                  onPress={() => toggleDestination(destination.id)}
                >
                  <Image source={{ uri: destination.image }} style={styles.destinationImage} />
                  <Text style={styles.destinationName}>{destination.name}</Text>
                  {destination.selected && (
                    <View style={styles.selectedIcon}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CBC71" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Validation Modal */}
      <Modal
        visible={showValidationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Please select a destination</Text>
            <Text style={styles.modalMessage}>
              You must choose one of the suggested destinations to continue.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowValidationModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface Step1DestinationScreenProps {
  planningData?: any;
  onNext: () => void;
  onCancel: () => void;
  onUpdateData: (data: any) => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(76, 188, 113, 0.08)',
  },
  stepNumber: {
    fontSize: 16,
    color: '#FF8FB1',
    fontWeight: '600',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 22,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(76, 188, 113, 0.08)',
  },
  searchSection: {
    marginBottom: 20,
  },
  durationSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4CBC71',
    position: 'relative',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  searchingIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  searchingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  suggestionCountry: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  daysButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  daysButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  daysDisplay: {
    fontSize: 28,
    color: '#1C1C1E',
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  destinationCard: {
    width: (width - 80) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDestination: {
    borderColor: '#FF6B9D',
  },
  destinationImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  destinationName: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  selectedIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFE5EC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    color: '#1C1C1E',
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Step1DestinationScreen;

