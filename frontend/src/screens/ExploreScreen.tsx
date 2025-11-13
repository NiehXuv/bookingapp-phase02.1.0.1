import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  ImageBackground
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// API calls commented out due to billing issues - using mock data instead
// import { googlePlacesService, GooglePlace, GoogleHotel } from '../services/googlePlacesService';
// import { getGooglePlacesApiKey } from '../config/apiConfig';
import { GooglePlace, GoogleHotel } from '../services/googlePlacesService';
import { getMockHotels, getMockPlaces, getMockTours, MockTour } from '../mockdata';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'PLACES' | 'HOTELS' | 'TICKETS'>('HOTELS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDates, setSelectedDates] = useState('8/16 ~ 8/17');
  const [guests, setGuests] = useState('2 Adults');
  const [isLoading, setIsLoading] = useState(false);
  const [hotels, setHotels] = useState<GoogleHotel[]>([]);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [tours, setTours] = useState<MockTour[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: 21.0285, lng: 105.8542 }); // Hanoi coordinates
  const webViewRef = useRef<WebView>(null);
  
  // Sliding bottom sheet state
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(height * 0.6)).current;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Using mock data instead of API calls (API billing issues)
      // TODO: Re-enable API calls when billing is resolved
      // const [hotelsData, placesData] = await Promise.all([
      //   googlePlacesService.searchHotels('Hoan Kiem', 'Hanoi, Vietnam', 50000),
      //   googlePlacesService.searchPlaces('attractions', 'Hanoi, Vietnam', 50000)
      // ]);
      
      // Load mock data
      const hotelsData = getMockHotels();
      const placesData = getMockPlaces();
      const toursData = getMockTours();
      
      setHotels(hotelsData);
      setPlaces(placesData);
      setTours(toursData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      let searchResults: any[] = [];
      
      // Using mock data instead of API calls (API billing issues)
      // TODO: Re-enable API calls when billing is resolved
      // if (activeTab === 'HOTELS') {
      //   searchResults = await googlePlacesService.searchHotels(searchQuery, 'Hanoi, Vietnam', 50000);
      //   setHotels(searchResults);
      // } else if (activeTab === 'PLACES') {
      //   searchResults = await googlePlacesService.searchPlaces(searchQuery, 'Hanoi, Vietnam', 50000);
      //   setPlaces(searchResults);
      // }
      
      // Use mock data with search filtering
      if (activeTab === 'HOTELS') {
        searchResults = getMockHotels(searchQuery);
        setHotels(searchResults);
      } else if (activeTab === 'PLACES') {
        searchResults = getMockPlaces(searchQuery);
        setPlaces(searchResults);
      } else if (activeTab === 'TICKETS') {
        searchResults = getMockTours(searchQuery);
        setTours(searchResults);
      }
      
      if (searchResults.length === 0) {
        Alert.alert('No Results', `No ${activeTab.toLowerCase()} found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelPress = (hotel: GoogleHotel) => {
    // Navigate to HotelDetailScreen with hotel data including price
    (navigation as any).navigate('HotelDetailScreen', { 
      hotelId: hotel.id,
      hotelData: hotel,
      coordinates: hotel.coordinates,
      price: hotel.price // Pass the price to ensure consistency
    });
  };

  const handlePlacePress = (place: GooglePlace) => {
    // Navigate to PlaceDetailScreen with place data
    (navigation as any).navigate('PlaceDetailScreen', { 
      placeId: place.id,
      placeData: place,
      coordinates: place.coordinates
    });
  };

  const getDirectionsToHotel = async (hotel: GoogleHotel) => {
    try {
      // For now, show mock directions since Google Directions API requires separate setup
      const distance = Math.sqrt(
        Math.pow(userLocation.lat - hotel.coordinates.lat, 2) + 
        Math.pow(userLocation.lng - hotel.coordinates.lng, 2)
      ) * 111; // Rough conversion to km
      
      const duration = Math.round(distance * 3); // Rough estimate: 3 minutes per km
      
      Alert.alert(
        'Directions',
        `Distance: ${Math.round(distance * 10) / 10} km\nDuration: ${duration} minutes\n\nWould you like to open in maps?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Maps', onPress: () => console.log('Open in maps app') }
        ]
      );
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Error', 'Failed to get directions');
    }
  };

  const getDirectionsToPlace = async (place: GooglePlace) => {
    try {
      // For now, show mock directions since Google Directions API requires separate setup
      const distance = Math.sqrt(
        Math.pow(userLocation.lat - place.coordinates.lat, 2) + 
        Math.pow(userLocation.lng - place.coordinates.lng, 2)
      ) * 111; // Rough conversion to km
      
      const duration = Math.round(distance * 3); // Rough estimate: 3 minutes per km
      
      Alert.alert(
        'Directions',
        `Distance: ${Math.round(distance * 10) / 10} km\nDuration: ${duration} minutes\n\nWould you like to open in maps?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Maps', onPress: () => console.log('Open in maps app') }
        ]
      );
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Error', 'Failed to get directions');
    }
  };

  // Format place type from API format to readable format
  const formatPlaceType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'tourist_attraction': 'Tourist Attraction',
      'place_of_worship': 'Place of Worship',
      'establishment': 'Establishment',
      'point_of_interest': 'Point of Interest',
      'natural_feature': 'Natural Feature',
      'park': 'Park',
      'museum': 'Museum',
      'art_gallery': 'Art Gallery',
      'library': 'Library',
      'school': 'School',
      'university': 'University',
      'hospital': 'Hospital',
      'police': 'Police Station',
      'fire_station': 'Fire Station',
      'post_office': 'Post Office',
      'bank': 'Bank',
      'atm': 'ATM',
      'restaurant': 'Restaurant',
      'cafe': 'Café',
      'bar': 'Bar',
      'night_club': 'Night Club',
      'shopping_mall': 'Shopping Mall',
      'store': 'Store',
      'gas_station': 'Gas Station',
      'lodging': 'Lodging',
      'amusement_park': 'Amusement Park',
      'aquarium': 'Aquarium',
      'zoo': 'Zoo',
      'stadium': 'Stadium',
      'movie_theater': 'Movie Theater',
      'theater': 'Theater',
      'bus_station': 'Bus Station',
      'train_station': 'Train Station',
      'subway_station': 'Subway Station',
      'airport': 'Airport',
      'transit_station': 'Transit Station'
    };
    
    return typeMap[type] || type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Sliding bottom sheet gesture handlers
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      
      // Determine if should expand or collapse based on gesture
      if (translationY < -50 && !isExpanded) {
        // Expand
        expandBottomSheet();
      } else if (translationY > 50 && isExpanded) {
        // Collapse
        collapseBottomSheet();
      } else {
        // Return to previous state
        if (isExpanded) {
          expandBottomSheet();
        } else {
          collapseBottomSheet();
        }
      }
    }
  };

  const expandBottomSheet = () => {
    setIsExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: height * 0.96, // Expand to cover 90% of screen
      useNativeDriver: false, // Height animation requires native driver to be false
      tension: 100,
      friction: 8
    }).start();
  };

  const collapseBottomSheet = () => {
    setIsExpanded(false);
    Animated.spring(animatedHeight, {
      toValue: height * 0.6, // Collapse to 50% of screen
      useNativeDriver: false, // Height animation requires native driver to be false
      tension: 100,
      friction: 8
    }).start();
  };

  // Map HTML using Leaflet with OpenStreetMap tiles - 100% FREE, no API key required
  // OpenStreetMap is a free, open-source map service that doesn't require billing
  // Using Leaflet.js library for map rendering
  const mapHTML = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Map - Vietnam</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8f9fa;
        }
        #map { 
          width: 100%; 
          height: 100vh; 
        }
        .map-controls {
          position: absolute;
          top: 60px;
          right: 8px;
          z-index: 1000;
        }
        .control-button {
          background: white;
          border: none;
          border-radius: 50%;
          padding: 12px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #5f6368;
          transition: all 0.2s ease;
          width: 44px;
          height: 44px;
        }
        .control-button:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.16);
          color: #1a73e8;
        }
        .control-button.active {
          background: #e8f0fe;
          color: #1a73e8;
          border: 1px solid #dadce0;
        }
        .control-button .icon {
          font-size: 18px;
        }
        .info-window {
          max-width: 320px;
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .info-window-content {
          padding: 20px;
        }
        .info-window-title {
          font-size: 18px;
          font-weight: 600;
          color: #202124;
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .info-window-details {
          font-size: 14px;
          color: #5f6368;
          margin-bottom: 16px;
        }
        .info-window-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .star {
          color: #fbbc04;
          font-size: 18px;
        }
        .rating-text {
          font-weight: 500;
          color: #202124;
        }
        .price-text {
          font-weight: 600;
          color: #34a853;
          font-size: 16px;
        }
        .info-window-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .action-button {
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          text-align: center;
        }
        .action-button:hover {
          background: #1557b0;
          transform: translateY(-1px);
        }
        .action-button.secondary {
          background: #f1f3f4;
          color: #5f6368;
          border: 1px solid #dadce0;
        }
        .action-button.secondary:hover {
          background: #e8eaed;
          color: #202124;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          text-align: center;
          z-index: 1000;
          min-width: 200px;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f1f3f4;
          border-top: 4px solid #1a73e8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        .loading-text {
          color: #5f6368;
          font-size: 16px;
          font-weight: 500;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .location-button {
          position: absolute;
          bottom: 30px;
          left: 20px;
          background: white;
          border: none;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #5f6368;
          transition: all 0.2s ease;
          width: 48px;
          height: 48px;
          z-index: 1000;
        }
        .location-button:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.16);
          color: #1a73e8;
        }
        
      </style>
    </head>
    <body>
      <div id="map"></div>
      
     <!-- Search Box -->

      <!-- Right Side Controls -->
      <div class="map-controls">
        <button class="control-button" id="trafficBtn" onclick="toggleTraffic()" title="Toggle Traffic">
          🚗
        </button>
        <button class="control-button" id="transitBtn" onclick="toggleTransit()" title="Toggle Transit">
          🚇
        </button>
      </div>

      <!-- Location Button -->
      <button class="location-button" onclick="getCurrentLocation()" title="My Location">
        📍
      </button>

      <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading Map...</div>
      </div>

      <script>
        let map;
        let markers = [];
        let currentPopup = null;

        // Initialize Leaflet map (OpenStreetMap - Free alternative)
        function initMap() {
          try {
            // Center on Hanoi, Vietnam
            map = L.map('map', {
              center: [21.0285, 105.8542],
              zoom: 13,
              zoomControl: true,
              attributionControl: true
            });
            
            // Add OpenStreetMap tile layer with multiple subdomains for better performance
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
              subdomains: ['a', 'b', 'c']
            });
            
            // Add the tile layer to map
            osmLayer.addTo(map);
            
            // Fallback: If OSM tiles fail to load, try alternative free tile provider
            osmLayer.on('tileerror', function(error, tile) {
              console.warn('OSM tile load error, using fallback');
              // Remove failed layer and add fallback
              map.removeLayer(osmLayer);
              L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors, Tiles style by HOT',
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
              }).addTo(map);
            });

          // Add hotel markers from mock data
          const hotels = ${JSON.stringify(hotels)};
          hotels.forEach((hotel) => {
            const hotelIcon = L.divIcon({
              className: 'custom-marker',
              html: \`<div style="background: #EA4335; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏨</div>\`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            const marker = L.marker([hotel.coordinates.lat, hotel.coordinates.lng], { icon: hotelIcon })
              .addTo(map)
              .bindPopup(\`
                <div class="info-window">
                  <div class="info-window-content">
                    <div class="info-window-title">\${hotel.name}</div>
                    <div class="info-window-details">
                      <div style="margin-bottom: 8px;">\${hotel.address}</div>
                      <div class="info-window-rating">
                        <span class="star">★</span>
                        <span class="rating-text">\${hotel.rating}/5</span>
                      </div>
                      <div class="price-text">from VND \${hotel.price.toLocaleString()}/night</div>
                    </div>
                    <div class="info-window-actions">
                      <button class="action-button" onclick="getDirections(\${hotel.coordinates.lat}, \${hotel.coordinates.lng})">
                        🚗 Directions
                      </button>
                    </div>
                  </div>
                </div>
              \`);

            markers.push(marker);
          });

          // Add place markers from mock data
          const places = ${JSON.stringify(places)};
          places.forEach((place) => {
            const placeIcon = L.divIcon({
              className: 'custom-marker',
              html: \`<div style="background: #34A853; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>\`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: placeIcon })
              .addTo(map)
              .bindPopup(\`
                <div class="info-window">
                  <div class="info-window-content">
                    <div class="info-window-title">\${place.name}</div>
                    <div class="info-window-details">
                      <div style="margin-bottom: 8px;">\${place.type}</div>
                      <div class="info-window-rating">
                        <span class="star">★</span>
                        <span class="rating-text">\${place.rating}/5</span>
                      </div>
                      <div>\${place.address}</div>
                    </div>
                    <div class="info-window-actions">
                      <button class="action-button" onclick="getDirections(\${place.coordinates.lat}, \${place.coordinates.lng})">
                        🚗 Directions
                      </button>
                    </div>
                  </div>
                </div>
              \`);

            markers.push(marker);
          });

          // Add tour markers from mock data
          const tours = ${JSON.stringify(tours)};
          tours.forEach((tour) => {
            const tourIcon = L.divIcon({
              className: 'custom-marker',
              html: \`<div style="background: #EC4899; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎫</div>\`,
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            });

            const marker = L.marker([tour.coordinates.lat, tour.coordinates.lng], { icon: tourIcon })
              .addTo(map)
              .bindPopup(\`
                <div class="info-window">
                  <div class="info-window-content">
                    <div class="info-window-title">\${tour.name}</div>
                    <div class="info-window-details">
                      <div style="margin-bottom: 8px;">\${tour.category} • \${tour.duration}</div>
                      <div class="info-window-rating">
                        <span class="star">★</span>
                        <span class="rating-text">\${tour.rating}/5</span>
                      </div>
                      <div class="price-text">VND \${tour.price.toLocaleString()}</div>
                    </div>
                    <div class="info-window-actions">
                      <button class="action-button" onclick="getDirections(\${tour.coordinates.lat}, \${tour.coordinates.lng})">
                        🚗 Directions
                      </button>
                    </div>
                  </div>
                </div>
              \`);

            markers.push(marker);
          });

          // Add user location marker
          const userIcon = L.divIcon({
            className: 'custom-marker',
            html: \`<div style="background: #FBBC04; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">👤</div>\`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          L.marker([21.0285, 105.8542], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location');

          // Add user location circle
          L.circle([21.0285, 105.8542], {
            color: '#FBBC04',
            fillColor: '#FBBC04',
            fillOpacity: 0.1,
            radius: 800
          }).addTo(map);

            // Hide loading
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
              loadingEl.style.display = 'none';
            }
          } catch (error) {
            console.error('Error initializing map:', error);
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
              loadingEl.innerHTML = '<div style="color: #EF4444; text-align: center;">Map failed to load. Please refresh.</div>';
            }
          }
        }

        // Control functions (simplified for Leaflet)
        function toggleTraffic() {
          const btn = document.getElementById('trafficBtn');
          btn.classList.toggle('active');
          // Traffic layer not available in free OpenStreetMap
          alert('Traffic layer requires Google Maps API');
        }

        function toggleTransit() {
          const btn = document.getElementById('transitBtn');
          btn.classList.toggle('active');
          // Transit layer not available in free OpenStreetMap
          alert('Transit layer requires Google Maps API');
        }

        function getCurrentLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 15);
              },
              () => {
                // Fallback to Hanoi if geolocation fails
                map.setView([21.0285, 105.8542], 13);
              }
            );
          } else {
            map.setView([21.0285, 105.8542], 13);
          }
        }

        // Action functions
        function getDirections(lat, lng) {
          const userLat = 21.0285;
          const userLng = 105.8542;
          const url = \`https://www.google.com/maps/dir/\${userLat},\${userLng}/\${lat},\${lng}\`;
          window.open(url, '_blank');
        }

        // Initialize map when Leaflet is loaded
        function tryInitMap() {
          if (typeof L !== 'undefined' && typeof L.map === 'function') {
            try {
              initMap();
            } catch (error) {
              console.error('Map initialization error:', error);
              // Retry after delay
              setTimeout(tryInitMap, 500);
            }
          } else {
            // Leaflet not loaded yet, wait and retry
            setTimeout(tryInitMap, 100);
          }
        }
        
        // Start initialization
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          // DOM already loaded
          setTimeout(tryInitMap, 100);
        } else {
          // Wait for DOM to load
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(tryInitMap, 100);
          });
        }
        
        // Fallback: Try after window load
        window.addEventListener('load', function() {
          setTimeout(function() {
            if (typeof L !== 'undefined' && typeof L.map === 'function' && !map) {
              tryInitMap();
            }
          }, 500);
        });
      </script>
    </body>
    </html>
  `, [hotels, places, tours]);

  const renderHotelItem = (hotel: GoogleHotel) => {
    const defaultHotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    const imageUri = (hotel.photos && hotel.photos.length > 0) ? hotel.photos[0] : defaultHotelImage;
    
    return (
      <TouchableOpacity 
        key={hotel.id} 
        style={styles.hotelItem}
        onPress={() => handleHotelPress(hotel)}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.hotelImage}
          onError={() => {
            console.log('Failed to load hotel image:', imageUri);
          }}
        />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{hotel.name}</Text>
        <Text style={styles.hotelLocation}>{hotel.location}</Text>
        <View style={styles.hotelMeta}>
          <Text style={styles.hotelPrice}>from VND {hotel.price ? hotel.price.toLocaleString() : 'N/A'}/night</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{hotel.rating}</Text>
          </View>
        </View>
        <View style={styles.amenitiesContainer}>
          {hotel.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderPlaceItem = (place: GooglePlace) => {
    const defaultPlaceImage = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800';
    const imageUri = (place.photos && place.photos.length > 0) ? place.photos[0] : defaultPlaceImage;
    
    return (
    <TouchableOpacity 
      key={place.id} 
      style={styles.placeItem}
      onPress={() => handlePlacePress(place)}
    >
      <Image 
        source={{ uri: imageUri }} 
        style={styles.placeImage}
        onError={() => {
          console.log('Failed to load place image:', imageUri);
        }}
      />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeType}>{formatPlaceType(place.type)}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{place.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const handleTourPress = (tour: MockTour) => {
    // Navigate to tour detail screen or booking screen
    (navigation as any).navigate('BookingScreen', {
      type: 'tour',
      itemId: tour.id,
      itemName: tour.name,
      itemImage: tour.photos?.[0],
      price: tour.price,
      currency: tour.currency,
      additionalData: {
        duration: tour.duration,
        category: tour.category,
        location: tour.location,
        includes: tour.includes,
        highlights: tour.highlights
      }
    });
  };

  const renderTourItem = (tour: MockTour) => {
    const defaultTourImage = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800';
    const imageUri = (tour.photos && tour.photos.length > 0) ? tour.photos[0] : defaultTourImage;
    
    return (
      <TouchableOpacity 
        key={tour.id} 
        style={styles.tourItem}
        onPress={() => handleTourPress(tour)}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.tourImage}
          onError={() => {
            console.log('Failed to load tour image:', imageUri);
          }}
        />
      <View style={styles.tourInfo}>
        <Text style={styles.tourName}>{tour.name}</Text>
        <View style={styles.tourMeta}>
          <View style={styles.tourCategory}>
            <MaterialIcons name="category" size={14} color="#6B7280" />
            <Text style={styles.tourCategoryText}>{tour.category}</Text>
          </View>
          <View style={styles.tourDuration}>
            <MaterialIcons name="schedule" size={14} color="#6B7280" />
            <Text style={styles.tourDurationText}>{tour.duration}</Text>
          </View>
        </View>
        <Text style={styles.tourDescription} numberOfLines={2}>{tour.description}</Text>
        <View style={styles.tourFooter}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{tour.rating}</Text>
          </View>
          <Text style={styles.tourPrice}>VND {tour.price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
        <WebView
          key={`map-${hotels.length}-${places.length}-${tours.length}`}
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
          }}
          renderLoading={() => (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.mapLoadingText}>Loading map...</Text>
            </View>
          )}
        />
      </View>

      {/* Content Section */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            height: animatedHeight,
            pointerEvents: 'auto'
          }
        ]}
      >
        {/* Drag Handle */}
        <PanGestureHandler
          onHandlerStateChange={onHandlerStateChange}
        >
          <TouchableOpacity 
            style={styles.dragHandle}
            onPress={() => isExpanded ? collapseBottomSheet() : expandBottomSheet()}
            activeOpacity={0.7}
          >
            <View style={styles.dragIndicator} />
          </TouchableOpacity>
        </PanGestureHandler>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'PLACES' && styles.activeTab]}
              onPress={() => setActiveTab('PLACES')}
            >
              <Text style={[styles.tabText, activeTab === 'PLACES' && styles.activeTabText]}>PLACES</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'HOTELS' && styles.activeTab]}
              onPress={() => setActiveTab('HOTELS')}
            >
              <Text style={[styles.tabText, activeTab === 'HOTELS' && styles.activeTabText]}>HOTELS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'TICKETS' && styles.activeTab]}
              onPress={() => setActiveTab('TICKETS')}
            >
              <Text style={[styles.tabText, activeTab === 'TICKETS' && styles.activeTabText]}>TICKETS & TOURS</Text>
            </TouchableOpacity>
          </View>

          {/* Search and Filter Bar */}
          <View style={styles.searchContainer}>
            {activeTab === 'HOTELS' && (
              <>
                <TouchableOpacity style={styles.filterButton}>
                  <MaterialIcons name="event" size={20} color="#6B7280" />
                  <Text style={styles.filterText}>{selectedDates}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <MaterialIcons name="person" size={20} color="#6B7280" />
                  <Text style={styles.filterText}>{guests}</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.searchInputContainer}>
              <MaterialIcons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Keyword of attraction"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              {isLoading && <ActivityIndicator size="small" color="#3B82F6" />}
            </View>
          </View>

          {/* Content List */}
          <ScrollView 
            style={styles.contentList} 
            contentContainerStyle={styles.contentListContainer}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'HOTELS' && hotels.map(renderHotelItem)}
            {activeTab === 'PLACES' && places.map(renderPlaceItem)}
            {activeTab === 'TICKETS' && tours.map(renderTourItem)}
            {activeTab === 'TICKETS' && tours.length === 0 && (
              <View style={styles.comingSoon}>
                <MaterialCommunityIcons name="ticket" size={48} color="#9CA3AF" />
                <Text style={styles.comingSoonText}>No Tours Found</Text>
                <Text style={styles.comingSoonSubtext}>Try a different search</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#EC4899',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#EC4899',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentListContainer: {
    paddingBottom: 120,
  },
  hotelItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  hotelImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  hotelIcon: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  hotelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  amenityTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  placeItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  placeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  placeImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  placeAddress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
  },
  tourItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  tourImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 14,
  },
  tourIcon: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tourInfo: {
    flex: 1,
  },
  tourName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  tourCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tourCategoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tourDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tourDurationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tourDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
  },
});

export default ExploreScreen; 