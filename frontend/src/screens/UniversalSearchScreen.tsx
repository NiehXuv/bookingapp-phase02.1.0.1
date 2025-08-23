import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { contentService } from '../services/contentService';
import { googlePlacesService, GoogleHotel, GooglePlace } from '../services/googlePlacesService';
import airports from '../utils/airports';
import { useSearchContext } from '../context/SearchContext';

// Helper: map free-text city to supported Tour screen cities
const TOUR_CITIES = ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An', 'Hue', 'Nha Trang'];
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
const pickClosestTourCity = (q: string): string => {
  const n = normalize(q);
  // Exact contains
  for (const c of TOUR_CITIES) if (n.includes(normalize(c))) return c;
  // Simple heuristics
  if (n.includes('hcm') || n.includes('saigon') || n.includes('ho chi minh')) return 'Ho Chi Minh City';
  if (n.includes('danang') || n.includes('da nang')) return 'Da Nang';
  if (n.includes('hoi an')) return 'Hoi An';
  if (n.includes('hue')) return 'Hue';
  if (n.includes('nha trang')) return 'Nha Trang';
  if (n.includes('ha noi') || n.includes('hanoi')) return 'Hanoi';
  return 'Hanoi';
};

// Helper: map city string to IATA code using airports list
const findIata = (cityText: string): string | null => {
  if (!cityText || typeof cityText !== 'string') return null;
  
  const normalizedInput = normalize(cityText.trim().toLowerCase());
  
  // Try direct 3-letter code first (e.g., HAN, SGN)
  if (cityText.trim().length === 3 && /^[A-Z]{3}$/i.test(cityText.trim())) {
    return cityText.trim().toUpperCase();
  }
  
  // Try exact city match first
  const exactMatch = (airports as any[]).find(a => 
    normalize(a.city.toLowerCase()) === normalizedInput
  );
  if (exactMatch) return exactMatch.code;
  
  // Try partial city match
  const partialMatch = (airports as any[]).find(a => 
    normalize(a.city.toLowerCase()).includes(normalizedInput) ||
    normalizedInput.includes(normalize(a.city.toLowerCase()))
  );
  if (partialMatch) return partialMatch.code;
  
  // Try city name variations for Vietnamese cities (including diacritics and full names)
  const vietnameseCities: { [key: string]: string } = {
    // Hanoi variations
    'hanoi': 'HAN',
    'ha noi': 'HAN',
    'hà nội': 'HAN',
    'hanoi city': 'HAN',
    'thành phố hà nội': 'HAN',
    
    // Ho Chi Minh variations
    'ho chi minh': 'SGN',
    'ho chi minh city': 'SGN',
    'thành phố hồ chí minh': 'SGN',
    'tp hồ chí minh': 'SGN',
    'tp ho chi minh': 'SGN',
    'saigon': 'SGN',
    'sài gòn': 'SGN',
    
    // Da Nang variations
    'da nang': 'DAD',
    'danang': 'DAD',
    'đà nẵng': 'DAD',
    'thành phố đà nẵng': 'DAD',
    
    // Other cities with airports
    'nha trang': 'CXR',
    'nhatrang': 'CXR',
    'nha trang city': 'CXR',
    'phu quoc': 'PQC',
    'phuquoc': 'PQC',
    'đảo phú quốc': 'PQC',
    'hue': 'HUI',
    'huế': 'HUI',
    'thành phố huế': 'HUI',
    
    // Major cities without airports - map to nearest airport
    'sapa': 'HAN', // Sapa doesn't have airport, use Hanoi (closest)
    'hoi an': 'DAD', // Hoi An doesn't have airport, use Da Nang (closest)
    'ha long': 'HAN', // Ha Long doesn't have airport, use Hanoi (closest)
    'vung tau': 'SGN', // Vung Tau doesn't have airport, use Ho Chi Minh (closest)
    'can tho': 'SGN', // Can Tho doesn't have airport, use Ho Chi Minh (closest)
    'my tho': 'SGN', // My Tho doesn't have airport, use Ho Chi Minh (closest)
    'ben tre': 'SGN', // Ben Tre doesn't have airport, use Ho Chi Minh (closest)
    'tay ninh': 'SGN', // Tay Ninh doesn't have airport, use Ho Chi Minh (closest)
    'binh duong': 'SGN', // Binh Duong doesn't have airport, use Ho Chi Minh (closest)
    'dong nai': 'SGN', // Dong Nai doesn't have airport, use Ho Chi Minh (closest)
    'ba ria vung tau': 'SGN', // Ba Ria Vung Tau doesn't have airport, use Ho Chi Minh (closest)
    'long an': 'SGN', // Long An doesn't have airport, use Ho Chi Minh (closest)
    'tien giang': 'SGN', // Tien Giang doesn't have airport, use Ho Chi Minh (closest)
    'tra vinh': 'SGN', // Tra Vinh doesn't have airport, use Ho Chi Minh (closest)
    'soc trang': 'SGN', // Soc Trang doesn't have airport, use Ho Chi Minh (closest)
    'bac lieu': 'SGN', // Bac Lieu doesn't have airport, use Ho Chi Minh (closest)
    'ca mau': 'SGN', // Ca Mau doesn't have airport, use Ho Chi Minh (closest)
    'kien giang': 'SGN', // Kien Giang doesn't have airport, use Ho Chi Minh (closest)
    'an giang': 'SGN', // An Giang doesn't have airport, use Ho Chi Minh (closest)
    'dong thap': 'SGN', // Dong Thap doesn't have airport, use Ho Chi Minh (closest)
    'vinh long': 'SGN', // Vinh Long doesn't have airport, use Ho Chi Minh (closest)
    'binh thuan': 'SGN', // Binh Thuan doesn't have airport, use Ho Chi Minh (closest)
    'ninh thuan': 'SGN', // Ninh Thuan doesn't have airport, use Ho Chi Minh (closest)
    'khanh hoa': 'SGN', // Khanh Hoa doesn't have airport, use Ho Chi Minh (closest)
    'phu yen': 'SGN', // Phu Yen doesn't have airport, use Ho Chi Minh (closest)
    'binh dinh': 'SGN', // Binh Dinh doesn't have airport, use Ho Chi Minh (closest)
    'quang ngai': 'SGN', // Quang Ngai doesn't have airport, use Ho Chi Minh (closest)
    'quang nam': 'DAD', // Quang Nam doesn't have airport, use Da Nang (closest)
    'thua thien hue': 'HUI', // Thua Thien Hue doesn't have airport, use Hue (closest)
    'quang tri': 'HUI', // Quang Tri doesn't have airport, use Hue (closest)
    'quang binh': 'HUI', // Quang Binh doesn't have airport, use Hue (closest)
    'ha tinh': 'HAN', // Ha Tinh doesn't have airport, use Hanoi (closest)
    'nghe an': 'HAN', // Nghe An doesn't have airport, use Hanoi (closest)
    'thanh hoa': 'HAN', // Thanh Hoa doesn't have airport, use Hanoi (closest)
    'nam dinh': 'HAN', // Nam Dinh doesn't have airport, use Hanoi (closest)
    'thai binh': 'HAN', // Thai Binh doesn't have airport, use Hanoi (closest)
    'hai phong': 'HAN', // Hai Phong doesn't have airport, use Hanoi (closest)
    'quang ninh': 'HAN', // Quang Ninh doesn't have airport, use Hanoi (closest)
    'bac giang': 'HAN', // Bac Giang doesn't have airport, use Hanoi (closest)
    'bac ninh': 'HAN', // Bac Ninh doesn't have airport, use Hanoi (closest)
    'hung yen': 'HAN', // Hung Yen doesn't have airport, use Hanoi (closest)
    'hai duong': 'HAN', // Hai Duong doesn't have airport, use Hanoi (closest)
    'vinh phuc': 'HAN', // Vinh Phuc doesn't have airport, use Hanoi (closest)
  };
  
  // Enhanced matching logic for Vietnamese cities
  // First try exact match with original text
  if (vietnameseCities[cityText.trim()]) {
    console.log(`🎯 Exact Vietnamese city match: "${cityText}" -> ${vietnameseCities[cityText.trim()]}`);
    return vietnameseCities[cityText.trim()];
  }
  
  // Try normalized match
  const vietnameseMatch = vietnameseCities[normalizedInput];
  if (vietnameseMatch) {
    console.log(`🎯 Vietnamese city match found: "${cityText}" -> "${normalizedInput}" -> ${vietnameseMatch}`);
    return vietnameseMatch;
  }
  
  // Try fuzzy matching for Vietnamese cities
  // This handles cases where normalization changes Vietnamese characters
  const fuzzyMatches = Object.keys(vietnameseCities).filter(key => {
    const normalizedKey = normalize(key.toLowerCase());
    const normalizedCity = normalizedInput;
    
    // Check if normalized versions match
    if (normalizedKey === normalizedCity) return true;
    
    // Check if one contains the other
    if (normalizedKey.includes(normalizedCity) || normalizedCity.includes(normalizedKey)) return true;
    
    // Check for common Vietnamese city patterns
    if (normalizedCity.includes('ho chi minh') && key.includes('hồ chí minh')) return true;
    if (normalizedCity.includes('ha noi') && key.includes('hà nội')) return true;
    if (normalizedCity.includes('da nang') && key.includes('đà nẵng')) return true;
    if (normalizedCity.includes('thanh pho') && key.includes('thành phố')) return true;
    
    return false;
  });
  
  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    const result = vietnameseCities[bestMatch];
    console.log(`🎯 Fuzzy Vietnamese city match: "${cityText}" -> "${bestMatch}" -> ${result}`);
    return result;
  }
  
  console.log(`❌ No match found for: "${cityText}" (normalized: "${normalizedInput}")`);
  console.log(`🔍 Available keys:`, Object.keys(vietnameseCities));
  return null;
};

const parseTransportQuery = (q: string): { from: string; to: string; departureDate: string } => {
  // Default values - ensure date is at least 1 day in the future (Amadeus requirement)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format date as YYYY-MM-DD (Amadeus API requirement)
  const dep = tomorrow.toISOString().split('T')[0];
  
  console.log('📅 Generated departure date:', dep);
  console.log('📅 Date validation:', {
    today: today.toISOString().split('T')[0],
    tomorrow: dep,
    isValid: /^\d{4}-\d{2}-\d{2}$/.test(dep)
  });
  
  // Parse the query
  const parts = q.split(/\s*(?:to|->|→|\-|–)\s*/i);
  
  if (parts.length >= 2) {
    // Two parts: from and to
    const fromCity = parts[0].trim();
    const toCity = parts[1].trim();
    
    const fromCode = findIata(fromCity);
    const toCode = findIata(toCity);
    
    if (!fromCode || !toCode) {
      throw new Error(`Could not find airport codes for: ${fromCity} or ${toCity}`);
    }
    
    return { 
      from: fromCode.toUpperCase(), 
      to: toCode.toUpperCase(), 
      departureDate: dep 
    };
  } else if (parts.length === 1) {
    // Single city: treat as destination, use Hanoi as default origin
    const toCity = parts[0].trim();
    const toCode = findIata(toCity);
    
    if (!toCode) {
      throw new Error(`Could not find airport code for: ${toCity}`);
    }
    
    return { 
      from: 'HAN', // Default to Hanoi
      to: toCode.toUpperCase(), 
      departureDate: dep 
    };
  }
  
  // Fallback: default route
  return { 
    from: 'HAN', 
    to: 'SGN', // Default to Ho Chi Minh City instead of Da Nang
    departureDate: dep 
  };
};

type TabKey = 'Content' | 'Stay' | 'Services' | 'Transport';

const TABS: TabKey[] = ['Content', 'Stay', 'Services', 'Transport'];

// Real Google Places API recommendations will be fetched dynamically
interface RecommendedPlace {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
}

interface ContentResult {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
  url?: string;
}

const UniversalSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { searchQuery, setSearchQuery, activeTab, setActiveTab } = useSearchContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentResults, setContentResults] = useState<ContentResult[]>([]);
  const [hotelResults, setHotelResults] = useState<GoogleHotel[]>([]);
  const [placeResults, setPlaceResults] = useState<GooglePlace[]>([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState<RecommendedPlace[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Filter states
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('Restaurant');
  const [selectedTransportType, setSelectedTransportType] = useState<string>('Flight');
  
  // Transport search states
  const [transportFrom, setTransportFrom] = useState<string>('');
  const [transportTo, setTransportTo] = useState<string>('');

  // Fetch recommendations when component mounts
  useEffect(() => {
    fetchRecommendedPlaces();
  }, []);

  const placeholder = useMemo(() => {
    switch (activeTab) {
      case 'Content':
        return 'Search destinations or content';
      case 'Stay':
        return 'Find accommodation, hotels...';
      case 'Services':
        return 'Search services, experiences...';
      case 'Transport':
        return 'Enter departure and destination';
      default:
        return 'Search';
    }
  }, [activeTab]);

  // Fetch recommended places from Google Places API
  const fetchRecommendedPlaces = async () => {
    try {
      setIsLoadingRecommendations(true);
      
      // Popular Vietnamese destinations
      const popularDestinations = [
        'Ha Long Bay',
        'Ho Chi Minh City', 
        'Hanoi',
        'Da Nang',
        'Hoi An',
        'Hue',
        'Nha Trang',
        'Sapa',
        'Phu Quoc',
        'Mai Chau'
      ];
      
      const recommendations: RecommendedPlace[] = [];
      
      for (const destination of popularDestinations) {
        try {
          const places = await googlePlacesService.searchPlaces(destination, 'Vietnam', 5000);
          if (places.length > 0) {
            const place = places[0]; // Get the first/most relevant result
            
            // Get photo URL if available
            let imageUrl = '';
            
            if (place.photos && place.photos.length > 0) {
              imageUrl = place.photos[0]; // First photo URL
            }
            
            recommendations.push({
              id: place.id,
              title: place.name,
              subtitle: `${destination}, Vietnam`,
              location: place.address,
              coordinates: place.coordinates,
              imageUrl
            });
          }
        } catch (error) {
          console.log(`Failed to fetch recommendation for ${destination}:`, error);
        }
      }
      
      setRecommendedPlaces(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to static recommendations if API fails
      setRecommendedPlaces([
        { id: '1', title: 'Ha Long Bay', subtitle: 'UNESCO World Heritage Site', location: 'Quang Ninh Province, Vietnam', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
        { id: '2', title: 'Ho Chi Minh City', subtitle: 'Modern metropolis & history', location: 'Southern Vietnam', imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop' },
        { id: '3', title: 'Hanoi Old Quarter', subtitle: 'Ancient capital charm', location: 'Northern Vietnam', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
        { id: '4', title: 'Hoi An Ancient Town', subtitle: 'UNESCO Heritage & lanterns', location: 'Central Vietnam', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
        { id: '5', title: 'Sapa Mountains', subtitle: 'Terraced rice fields', location: 'Lao Cai Province, Vietnam', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' }
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Handle recommendation click
  const handleRecommendationClick = (place: RecommendedPlace) => {
    if (activeTab === 'Transport') {
      // For transport tab, apply to destination field
      setTransportTo(place.title);
    } else {
      // For other tabs, use standard search
      setSearchQuery(place.title);
    }
    // Auto-focus the search input
    // Note: In React Native, we can't programmatically focus TextInput easily
    // The user will see their selection in the input field
  };

  const runSearch = async () => {
    const q = searchQuery.trim();
    
    // For transport tab, we don't need searchQuery to be filled
    if (activeTab !== 'Transport' && !q) {
      return;
    }

    // Route to specific result screens for tabs as requested
    if (activeTab === 'Content') {
      (navigation as any).navigate('SearchContentResult', { query: q });
      return;
    }
    if (activeTab === 'Stay') {
      // Google Places based hotel search is in its own screen – pass city
      (navigation as any).navigate('SearchHotelResult', { city: q });
      return;
    }
    if (activeTab === 'Services') {
      const destination = pickClosestTourCity(q);
      const today = new Date().toISOString().slice(0, 10);
      (navigation as any).navigate('SearchTourResult', { 
        destination, 
        departureDate: today,
        category: selectedServiceCategory,
        searchQuery: q // Pass the search query
      });
      return;
    }
    if (activeTab === 'Transport') {
      console.log('🚀 Transport search triggered');
      console.log('🚀 Transport inputs:', { from: transportFrom, to: transportTo });
      
      // Use transport-specific inputs for transport search
      if (!transportFrom.trim() || !transportTo.trim()) {
        console.log('❌ Missing transport inputs');
        setError('Please enter both departure and destination');
        return;
      }
      
      try {
        const queryString = `${transportFrom.trim()} to ${transportTo.trim()}`;
        console.log('🚀 Query string:', queryString);
        
        const params = parseTransportQuery(queryString);
        console.log('🚀 Transport search params:', params);
        
        (navigation as any).navigate('SearchTransportResult', { 
          ...params, 
          transportType: selectedTransportType, 
          adults: 1, 
          children: 0,
          searchQuery: `${transportFrom.trim()} → ${transportTo.trim()}` // Pass search query for display
        });
      } catch (error: any) {
        console.error('❌ Transport query parsing error:', error.message);
        setError(`Invalid route: ${error.message}`);
      }
      return;
    }

    // Fallback inline search (should not reach here for current tabs)
    setIsLoading(true);
    setError(null);

    try {
      const places = await googlePlacesService.searchPlaces(q, 'Vietnam');
      setPlaceResults(places);
      setHotelResults([]);
      setContentResults([]);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab}</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => {
              setActiveTab(tab);
              // Clear transport inputs when switching away from transport tab
              if (activeTab === 'Transport' && tab !== 'Transport') {
                setTransportFrom('');
                setTransportTo('');
              }
              // Clear error when switching tabs
              setError(null);
            }} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[
        styles.searchCard,
        activeTab === 'Content' && styles.searchCardExpanded
      ]}>
        {activeTab === 'Transport' ? (
          // Transport-specific search interface
          <View style={styles.transportSearchContainer}>
            <View style={styles.transportInputRow}>
              <View style={styles.transportInputField}>
                <Text style={styles.transportInputLabel}>From</Text>
                <TextInput
                  value={transportFrom}
                  onChangeText={setTransportFrom}
                  placeholder="Departure"
                  placeholderTextColor="#9CA3AF"
                  style={styles.transportInput}
                  autoFocus
                />
              </View>
              <View style={styles.transportArrow}>
                <Text style={styles.transportArrowText}>→</Text>
              </View>
              <View style={styles.transportInputField}>
                <Text style={styles.transportInputLabel}>To</Text>
                <TextInput
                  value={transportTo}
                  onChangeText={setTransportTo}
                  placeholder="Destination"
                  placeholderTextColor="#9CA3AF"
                  style={styles.transportInput}
                />
              </View>
            </View>
            <Text style={styles.transportHelpText}>
              Enter city names or airport codes (e.g., HAN, SGN) 
            </Text>
          </View>
        ) : (
          // Standard search input for other tabs
          <View style={styles.searchInputRow}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoFocus
              onSubmitEditing={runSearch}
              returnKeyType="search"
            />
          </View>
        )}

        {isLoading && (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}
        {error && !isLoading && (
          <Text style={{ color: '#DC2626', paddingVertical: 8, paddingHorizontal: 4 }}>{error}</Text>
        )}

        {!isLoading && !error && contentResults.length === 0 && hotelResults.length === 0 && placeResults.length === 0 && (
          <>
            <Text style={styles.sectionLabel}>Recommended Destinations</Text>
            {isLoadingRecommendations ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#4CBC71" />
                <Text style={{ marginTop: 8, color: '#6B7280', fontSize: 14 }}>Loading recommendations...</Text>
              </View>
            ) : (
              <ScrollView 
                style={[
                  styles.recommendationsScroll,
                  activeTab === 'Content' && styles.recommendationsScrollExpanded
                ]} 
                showsVerticalScrollIndicator={false}
              >
                {recommendedPlaces.map((place) => (
                  <TouchableOpacity 
                    key={place.id} 
                    style={[
                      styles.suggestionRow,
                      activeTab === 'Transport' && styles.suggestionRowTransport
                    ]}
                    onPress={() => handleRecommendationClick(place)}
                  >
                    <View style={styles.suggestionIcon}>
                      {place.imageUrl ? (
                        <Image 
                          source={{ uri: place.imageUrl }} 
                          style={styles.suggestionImage}
                          resizeMode="cover"
                          onError={() => {
                            // If image fails to load, we could set a fallback
                            console.log(`Failed to load image for ${place.title}`);
                          }}
                        />
                      ) : (
                        <Text>🏙️</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>{place.title}</Text>
                      <Text style={styles.suggestionSubtitle} numberOfLines={1}>{place.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* Results */}
        {!isLoading && contentResults.length > 0 && (
          <ScrollView style={{ maxHeight: 360 }}>
            {contentResults.map(item => (
              <View key={item.id} style={styles.resultRow}>
                <View style={styles.resultThumbPlaceholder}><Text>🖼️</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>{item.source}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {!isLoading && hotelResults.length > 0 && (
          <ScrollView style={{ maxHeight: 360 }}>
            {hotelResults.map(h => (
              <View key={h.id} style={styles.resultRow}>
                <View style={styles.resultThumbPlaceholder}>
                  {h.photos && h.photos.length > 0 ? (
                    <Image 
                      source={{ uri: h.photos[0] }} 
                      style={styles.resultThumbImage}
                      resizeMode="cover"
                      onError={() => {
                        console.log(`Failed to load image for ${h.name}`);
                      }}
                    />
                  ) : (
                    <Text>🏨</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{h.name}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>{h.location || h.address}</Text>
                </View>
                <Text style={styles.resultBadge}>{h.rating?.toFixed(1) || '—'}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {!isLoading && placeResults.length > 0 && (
          <ScrollView style={{ maxHeight: 360 }}>
            {placeResults.map(p => (
              <View key={p.id} style={styles.resultRow}>
                <View style={styles.resultThumbPlaceholder}>
                  {p.photos && p.photos.length > 0 ? (
                    <Image 
                      source={{ uri: p.photos[0] }} 
                      style={styles.resultThumbImage}
                      resizeMode="cover"
                      onError={() => {
                        console.log(`Failed to load image for ${p.name}`);
                      }}
                    />
                  ) : (
                    <Text>📍</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>{p.address}</Text>
                </View>
                {!!p.rating && <Text style={styles.resultBadge}>{p.rating.toFixed(1)}</Text>}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Tab-specific filters */}
      {activeTab === 'Stay' && (
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterText}>Dates</Text>
            <Text style={styles.filterRight}>Add dates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterText}>Guests</Text>
            <Text style={styles.filterRight}>Add guests</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'Services' && (
        <View style={styles.filterCard}>
          <Text style={styles.filterSectionTitle}>Categories</Text>
          <View style={styles.filterPillsContainer}>
            {['Restaurant', 'Coffee', 'Spa', 'Adventure', 'Culture', 'Shopping'].map((category) => (
              <TouchableOpacity 
                key={category} 
                style={[
                  styles.filterPillSmall,
                  selectedServiceCategory === category && styles.filterPillSmallActive
                ]}
                onPress={() => setSelectedServiceCategory(category)}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedServiceCategory === category && styles.filterPillTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'Transport' && (
        <View style={styles.filterCard}>
          <Text style={styles.filterSectionTitle}>Transport Type</Text>
          <View style={styles.filterPillsContainer}>
            {['Flight', 'Bus', 'Train', 'Car', 'Motorbike', 'Boat'].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[
                  styles.filterPillSmall,
                  selectedTransportType === type && styles.filterPillSmallActive
                ]}
                onPress={() => setSelectedTransportType(type)}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedTransportType === type && styles.filterPillTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.searchBtn} onPress={runSearch}>
          <Search size={20} color="#FFFFFF" />
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  closeText: {
    fontSize: 18,
    color: '#4CBC71',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CBC71',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for close button width
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabBtnActive: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: { 
    fontSize: 14,
    color: '#6B7280', 
    fontWeight: '600' 
  },
  tabTextActive: { 
    fontSize: 16,
    color: '#FFFFFF', 
    fontWeight: '700' 
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchCardExpanded: {
    flex: 1, // Take up remaining space when Content tab is active
    marginBottom: 0, // Remove bottom margin to fill space
    minHeight: 500, // Ensure minimum height for better visual balance
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  searchIcon: { 
    marginRight: 12,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#111827',
    fontWeight: '500',
  },
  // Transport search styles
  transportSearchContainer: {
    marginBottom: 16,
  },
  transportInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transportInputField: {
    flex: 1,
  },
  transportInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  transportInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  transportArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  transportArrowText: {
    fontSize: 20,
    color: '#4CBC71',
    fontWeight: '700',
  },
  transportHelpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  sectionLabel: { 
    fontSize: 18, 
    color: '#111827', 
    marginBottom: 16, 
    marginLeft: 4,
    fontWeight: '700',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionRowTransport: {
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#4CBC71',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  suggestionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 4,
  },
  suggestionSubtitle: { 
    fontSize: 14, 
    color: '#6B7280',
    lineHeight: 20,
  },
  recommendationsScroll: {
    maxHeight: 300, // Default height for other tabs
  },
  recommendationsScrollExpanded: {
    maxHeight: '100%', // Take full height when Content tab is active
    flex: 1, // Expand to fill available space
  },
  filtersRow: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterSectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterPillSmall: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterPillSmallActive: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterText: { 
    fontSize: 16, 
    color: '#111827', 
    fontWeight: '600' 
  },
  filterPillText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterRight: { 
    position: 'absolute', 
    right: 20, 
    top: 20, 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  footerRow: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    // Ensure footer stays at bottom even when search card expands
    position: 'relative',
    zIndex: 1,
  },
  searchBtn: {
    backgroundColor: '#4CBC71',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 16 
  },
  // Results
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  resultThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  resultTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 4,
  },
  resultSubtitle: { 
    fontSize: 14, 
    color: '#6B7280',
    lineHeight: 20,
  },
  resultBadge: { 
    color: '#4CBC71', 
    fontWeight: '700',
    backgroundColor: 'rgba(76, 188, 113, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
  },
});

export default UniversalSearchScreen;


