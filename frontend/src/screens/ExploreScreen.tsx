import React, { useState, useEffect, useRef } from 'react';
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
  Animated
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { googlePlacesService, GooglePlace, GoogleHotel } from '../services/googlePlacesService';
import { getGooglePlacesApiKey } from '../config/apiConfig';
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
      // Load initial hotels and places for Hanoi, Vietnam
      const [hotelsData, placesData] = await Promise.all([
        googlePlacesService.searchHotels('Hanoi', 'Hanoi, Vietnam', 50000),
        googlePlacesService.searchPlaces('attractions', 'Hanoi, Vietnam', 50000)
      ]);
      
      setHotels(hotelsData);
      setPlaces(placesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      let searchResults: any[] = [];
      
      if (activeTab === 'HOTELS') {
        searchResults = await googlePlacesService.searchHotels(searchQuery, 'Hanoi, Vietnam', 50000);
        setHotels(searchResults);
      } else if (activeTab === 'PLACES') {
        searchResults = await googlePlacesService.searchPlaces(searchQuery, 'Hanoi, Vietnam', 50000);
        setPlaces(searchResults);
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

  // Google Maps HTML with authentic Google Maps style
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google Maps - Vietnam</title>
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
        <div class="loading-text">Loading Google Maps...</div>
      </div>

      <script>
        let map;
        let markers = [];
        let trafficLayer;
        let transitLayer;
        let isTrafficVisible = false;
        let isTransitVisible = false;
        let searchBox;
        let currentInfoWindow;

        // Initialize Google Maps
        function initMap() {
          // Center on Hanoi, Vietnam
          const hanoi = { lat: 21.0285, lng: 105.8542 };
          
          // Create the map with cleaner Google Maps styling
          map = new google.maps.Map(document.getElementById('map'), {
            center: hanoi,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e3f2fd' }]
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#fafafa' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#e0e0e0' }]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#424242' }]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#bdbdbd' }]
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#e0e0e0' }]
              },
              {
                featureType: 'poi.business',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#e8f5e8' }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'cooperative',
            backgroundColor: '#fafafa'
          });

          // Initialize layers
          trafficLayer = new google.maps.TrafficLayer();
          transitLayer = new google.maps.TransitLayer();

          // Initialize search box
          const searchInput = document.getElementById('searchInput');
          searchBox = new google.maps.places.SearchBox(searchInput);

          // Add hotel markers
          const hotels = ${JSON.stringify(hotels)};
          hotels.forEach((hotel, index) => {
            const marker = new google.maps.Marker({
              position: { lat: hotel.coordinates.lat, lng: hotel.coordinates.lng },
              map: map,
              title: hotel.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="12" fill="#EA4335" stroke="white" stroke-width="3"/>
                    <text x="14" y="19" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🏨</text>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(28, 28)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: \`
                <div class="info-window">
                  <div class="info-window-content">
                    <div class="info-window-title">\${hotel.name}</div>
                    <div class="info-window-details">
                      <div style="margin-bottom: 8px;">\${hotel.address}</div>
                      <div class="info-window-rating">
                        <span class="star">★</span>
                        <span class="rating-text">\${hotel.rating}/5</span>
                      </div>
                      <div class="price-text">from VND \${hotel.price}/night</div>
                    </div>
                    <div class="info-window-actions">
                      <button class="action-button" onclick="getDirections(\${hotel.coordinates.lat}, \${hotel.coordinates.lng})">
                        🚗 Directions
                      </button>
                      <button class="action-button secondary" onclick="viewDetails('\${hotel.id}')">
                        📋 Details
                      </button>
                    </div>
                  </div>
                </div>
              \`
            });

            marker.addListener('click', () => {
              if (currentInfoWindow) {
                currentInfoWindow.close();
              }
              infoWindow.open(map, marker);
              currentInfoWindow = infoWindow;
            });

            markers.push(marker);
          });

          // Add place markers
          const places = ${JSON.stringify(places)};
          places.forEach((place, index) => {
            const marker = new google.maps.Marker({
              position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
              map: map,
              title: place.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#34A853" stroke="white" stroke-width="2"/>
                    <text x="12" y="15" text-anchor="middle" fill="white" font-size="12" font-weight="bold">📍</text>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(24, 24)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: \`
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
                      <button class="action-button secondary" onclick="viewDetails('\${place.id}')">
                        📋 Details
                      </button>
                    </div>
                  </div>
                </div>
              \`
            });

            marker.addListener('click', () => {
              if (currentInfoWindow) {
                currentInfoWindow.close();
              }
              infoWindow.open(map, marker);
              currentInfoWindow = infoWindow;
            });

            markers.push(marker);
          });

          // Add user location marker
          const userMarker = new google.maps.Marker({
            position: { lat: 21.0285, lng: 105.8542 },
            map: map,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="12" fill="#FBBC04" stroke="white" stroke-width="3"/>
                  <text x="14" y="19" text-anchor="middle" fill="white" font-size="16" font-weight="bold">👤</text>
                </svg>
              \`),
              scaledSize: new google.maps.Size(28, 28)
            }
          });

          // Add user location circle
          new google.maps.Circle({
            strokeColor: '#FBBC04',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: '#FBBC04',
            fillOpacity: 0.1,
            map: map,
            center: { lat: 21.0285, lng: 105.8542 },
            radius: 800
          });

          // Handle search box
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places.length === 0) return;

            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
              if (!place.geometry || !place.geometry.location) return;
              
              if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }
            });
            
            map.fitBounds(bounds);
            if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
              map.setZoom(16);
            }
          });

          // Hide loading
          document.getElementById('loading').style.display = 'none';

          // Add map event listeners
          map.addListener('click', function(e) {
            if (currentInfoWindow) {
              currentInfoWindow.close();
            }
          });

          map.addListener('zoom_changed', function() {
            console.log('Zoom level:', map.getZoom());
          });
        }

        // Control functions
        function toggleTraffic() {
          const btn = document.getElementById('trafficBtn');
          if (isTrafficVisible) {
            trafficLayer.setMap(null);
            isTrafficVisible = false;
            btn.classList.remove('active');
          } else {
            trafficLayer.setMap(map);
            isTrafficVisible = true;
            btn.classList.add('active');
          }
        }

        function toggleTransit() {
          const btn = document.getElementById('transitBtn');
          if (isTransitVisible) {
            transitLayer.setMap(null);
            isTransitVisible = false;
            btn.classList.remove('active');
          } else {
            transitLayer.setMap(map);
            isTransitVisible = true;
            btn.classList.add('active');
          }
        }

        function getCurrentLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                map.setCenter(pos);
                map.setZoom(15);
              },
              () => {
                // Fallback to Hanoi if geolocation fails
                map.setCenter({ lat: 21.0285, lng: 105.8542 });
                map.setZoom(13);
              }
            );
          } else {
            // Fallback to Hanoi if geolocation not supported
            map.setCenter({ lat: 21.0285, lng: 105.8542 });
            map.setZoom(13);
          }
        }

        // Action functions
        function getDirections(lat, lng) {
          const userLat = 21.0285;
          const userLng = 105.8542;
          const url = \`https://www.google.com/maps/dir/\${userLat},\${userLng}/\${lat},\${lng}\`;
          window.open(url, '_blank');
        }

        function viewDetails(id) {
          console.log('View details for:', id);
          // You can implement navigation to detail screen here
        }

        // Initialize map when Google Maps API is loaded
        window.initMap = initMap;
      </script>
      
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=${getGooglePlacesApiKey()}&callback=initMap&libraries=places">
      </script>
    </body>
    </html>
  `;

  const renderHotelItem = (hotel: GoogleHotel) => (
    <TouchableOpacity 
      key={hotel.id} 
      style={styles.hotelItem}
      onPress={() => handleHotelPress(hotel)}
    >
      {hotel.photos && hotel.photos.length > 0 ? (
        <Image source={{ uri: hotel.photos[0] }} style={styles.hotelImage} />
      ) : (
        <View style={styles.hotelIcon}>
          <MaterialCommunityIcons 
            name="bed" 
            size={24} 
            color="#3B82F6" 
          />
        </View>
      )}
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

  const renderPlaceItem = (place: GooglePlace) => (
    <TouchableOpacity 
      key={place.id} 
      style={styles.placeItem}
      onPress={() => handlePlacePress(place)}
    >
      {place.photos && place.photos.length > 0 ? (
        <Image 
          source={{ uri: place.photos[0] }} 
          style={styles.placeImage} 
        />
      ) : (
        <View style={styles.placeIcon}>
          <MaterialCommunityIcons 
            name={place.type === 'Lake' ? 'water' : place.type === 'Historical Site' ? 'castle' : 'map-marker'} 
            size={24} 
            color="#3B82F6" 
          />
        </View>
      )}
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

  return (
  <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
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
          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {activeTab === 'HOTELS' && hotels.map(renderHotelItem)}
            {activeTab === 'PLACES' && places.map(renderPlaceItem)}
            {activeTab === 'TICKETS' && (
              <View style={styles.comingSoon}>
                <MaterialCommunityIcons name="ticket" size={48} color="#9CA3AF" />
                <Text style={styles.comingSoonText}>Tickets & Tours</Text>
                <Text style={styles.comingSoonSubtext}>Coming soon...</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
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
});

export default ExploreScreen; 