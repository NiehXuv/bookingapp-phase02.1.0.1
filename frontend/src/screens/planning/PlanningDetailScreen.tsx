import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { GeneratedTripPlan } from '../../services/geminiService';
import { googlePlacesService, GooglePlace } from '../../services/googlePlacesService';

const { width, height } = Dimensions.get('window');

interface PlanningData {
  destinations: string[];
  tripDays: number;
  companion: string;
  preferences: any[];
  budget: number;
}

interface EnhancedActivity {
  time: string;
  activity: string;
  location: string;
  duration: string;
  cost: string;
  notes: string;
  placeDetails?: GooglePlace;
  coordinates?: { lat: number; lng: number };
}

const PlanningDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, isTokenExpired, logout } = useAuth();
  const [planId, setPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [enhancedActivities, setEnhancedActivities] = useState<EnhancedActivity[][]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [showMoreTips, setShowMoreTips] = useState(false);
  const [showMorePacking, setShowMorePacking] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<string | null>(null);
  const [isHeaderImageLoading, setIsHeaderImageLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    actions: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    title: '',
    message: '',
    type: 'info',
    actions: []
  });
  
  // Get planning data, generated plan, and planId from navigation params
  const planningData = (route.params as any)?.planningData as PlanningData || {
    destinations: ['Hanoi'],
    tripDays: 7,
    companion: 'Solo',
    preferences: [],
    budget: 200,
  };

  const generatedPlan = (route.params as any)?.generatedPlan as GeneratedTripPlan;
  const routePlanId = (route.params as any)?.planId as string;

  // Debug logging
  console.log('PlanningDetailScreen - Route params:', route.params);
  console.log('PlanningDetailScreen - Generated plan:', generatedPlan);
  console.log('PlanningDetailScreen - Generated plan itinerary:', generatedPlan?.itinerary);
  console.log('PlanningDetailScreen - Generated plan days:', generatedPlan?.itinerary?.days);
  console.log('PlanningDetailScreen - Planning data:', planningData);
  console.log('PlanningDetailScreen - Plan ID:', routePlanId);

  const getBackendBaseUrl = (): string => {
    return 'http://192.168.0.100:5000';
  };

  const showCustomAlertMessage = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', actions: Array<{text: string, onPress: () => void, style?: 'default' | 'cancel' | 'destructive'}>) => {
    setAlertConfig({
      title,
      message,
      type,
      actions
    });
    setShowCustomAlert(true);
  };

  useEffect(() => {
    if (routePlanId) {
      setPlanId(routePlanId);
    }
    if (generatedPlan?.itinerary?.days) {
      enhanceActivitiesWithPlaces();
    }
  }, [generatedPlan, routePlanId]);

  useEffect(() => {
    // Update header background when selected day changes
    if (enhancedActivities.length > 0 && selectedDay >= 0) {
      updateHeaderBackgroundForSelectedDay();
    }
  }, [selectedDay, enhancedActivities]);

  const setHeaderBackgroundFromPlaces = () => {
    // First, try to get an iconic photo of the main destination
    const mainDestination = planningData.destinations[0]; // Use the first destination as main
    if (mainDestination) {
      // Search for iconic places in the main destination
      googlePlacesService.searchPlaces(
        mainDestination, // Search for the destination name itself
        `${mainDestination}, Vietnam`,
        50000
      ).then(places => {
        if (places.length > 0 && places[0].photos && places[0].photos.length > 0) {
          // Use the first photo from the main destination
          setHeaderBackgroundImage(places[0].photos[0]);
          return;
        }
        
        // If no photos from destination search, try searching for "attractions" in the destination
        googlePlacesService.searchPlaces(
          `attractions ${mainDestination}`,
          `${mainDestination}, Vietnam`,
          50000
        ).then(attractionPlaces => {
          if (attractionPlaces.length > 0 && attractionPlaces[0].photos && attractionPlaces[0].photos.length > 0) {
            setHeaderBackgroundImage(attractionPlaces[0].photos[0]);
            return;
          }
          
          // Try searching for landmarks or famous places in the destination
          const iconicSearchTerms = [
            `landmark ${mainDestination}`,
            `temple ${mainDestination}`,
            `museum ${mainDestination}`,
            `park ${mainDestination}`,
            `viewpoint ${mainDestination}`,
            `historic ${mainDestination}`
          ];
          
          // Try each iconic search term
          const tryIconicSearch = (index: number) => {
            if (index >= iconicSearchTerms.length) {
              // If all iconic searches fail, fall back to activity photos
              setHeaderBackgroundFromActivityPhotos();
              return;
            }
            
            googlePlacesService.searchPlaces(
              iconicSearchTerms[index],
              `${mainDestination}, Vietnam`,
              50000
            ).then(iconicPlaces => {
              if (iconicPlaces.length > 0 && iconicPlaces[0].photos && iconicPlaces[0].photos.length > 0) {
                setHeaderBackgroundImage(iconicPlaces[0].photos[0]);
                return;
              }
              // Try next iconic search term
              tryIconicSearch(index + 1);
            }).catch(error => {
              console.log(`Could not fetch ${iconicSearchTerms[index]} photos:`, error);
              // Try next iconic search term
              tryIconicSearch(index + 1);
            });
          };
          
          tryIconicSearch(0);
        }).catch(error => {
          console.log('Could not fetch destination attraction photos:', error);
          setHeaderBackgroundFromActivityPhotos();
        });
      }).catch(error => {
        console.log('Could not fetch destination photos:', error);
        setHeaderBackgroundFromActivityPhotos();
      });
    } else {
      // If no destinations, fall back to activity photos
      setHeaderBackgroundFromActivityPhotos();
    }
  };

  const setHeaderBackgroundFromActivityPhotos = () => {
    // Find the first available photo from any activity across all days
    for (const dayActivities of enhancedActivities) {
      for (const activity of dayActivities) {
        if (activity.placeDetails?.photos && activity.placeDetails.photos.length > 0) {
          // Use the first photo as header background
          setHeaderBackgroundImage(activity.placeDetails.photos[0]);
          return;
        }
      }
    }
    
    // If no photos found, try to get from the first activity's location
    if (generatedPlan?.itinerary?.days && generatedPlan.itinerary.days.length > 0) {
      const firstDay = generatedPlan.itinerary.days[0];
      if (firstDay.activities && firstDay.activities.length > 0) {
        const firstActivity = firstDay.activities[0];
        // Try to search for a place photo for the first activity
        googlePlacesService.searchPlaces(
          firstActivity.activity,
          `${planningData.destinations.join(', ')}, Vietnam`,
          50000
        ).then(places => {
          if (places.length > 0 && places[0].photos && places[0].photos.length > 0) {
            setHeaderBackgroundImage(places[0].photos[0]);
          }
        }).catch(error => {
          console.log('Could not fetch header background image:', error);
        });
      }
    }
    
    // If still no photos found, keep the default green background
    setHeaderBackgroundImage(null);
  };

  const updateHeaderBackgroundForSelectedDay = () => {
    if (!generatedPlan?.itinerary?.days || !enhancedActivities[selectedDay]) {
      return;
    }

    const currentDay = generatedPlan.itinerary.days[selectedDay];
    
    // Try to get a photo from the current day's activities first
    const currentActivities = enhancedActivities[selectedDay] || [];
    for (const activity of currentActivities) {
      if (activity.placeDetails?.photos && activity.placeDetails.photos.length > 0) {
        setHeaderBackgroundImage(activity.placeDetails.photos[0]);
        return;
      }
    }

    // If no activity photos, try to get an iconic photo of the current day's location
    if (currentDay.activities && currentDay.activities.length > 0) {
      const firstActivity = currentDay.activities[0];
      const activityLocation = firstActivity.location || firstActivity.activity;
      
      googlePlacesService.searchPlaces(
        activityLocation,
        `${planningData.destinations.join(', ')}, Vietnam`,
        50000
      ).then(places => {
        if (places.length > 0 && places[0].photos && places[0].photos.length > 0) {
          setHeaderBackgroundImage(places[0].photos[0]);
        }
      }).catch(error => {
        console.log('Could not fetch day-specific header background:', error);
      });
    }
  };

  const enhanceActivitiesWithPlaces = async () => {
    if (!generatedPlan?.itinerary?.days) return;
    
    setIsLoadingPlaces(true);
    try {
      const enhanced = await Promise.all(
        generatedPlan.itinerary.days.map(async (day, dayIndex) => {
          const enhancedDay = await Promise.all(
            day.activities.map(async (activity) => {
              try {
                // Search for the place using Google Places API with more specific queries
                let places = await googlePlacesService.searchPlaces(
                  activity.activity,
                  `${planningData.destinations.join(', ')}, Vietnam`,
                  50000
                );
                
                // If no results, try searching with the location name
                if (places.length === 0 && activity.location) {
                  places = await googlePlacesService.searchPlaces(
                    activity.location,
                    `${planningData.destinations.join(', ')}, Vietnam`,
                    50000
                  );
                }
                
                // If still no results, try a broader search
                if (places.length === 0) {
                  places = await googlePlacesService.searchPlaces(
                    `${activity.activity} ${planningData.destinations[0]}`,
                    `${planningData.destinations.join(', ')}, Vietnam`,
                    50000
                  );
                }
                
                if (places.length > 0) {
                  const place = places[0]; // Get the best match
                  
                  // Get detailed place information using getPlaceDetails
                  let detailedPlace = place;
                  if (place.id && !place.id.startsWith('place_')) {
                    try {
                      const placeDetails = await googlePlacesService.getPlaceDetails(place.id);
                      if (placeDetails) {
                        detailedPlace = placeDetails;
                        console.log(`Enhanced place ${placeDetails.name} with detailed info:`, {
                          photos: placeDetails.photos?.length || 0,
                          reviews: placeDetails.reviews?.length || 0,
                          openingHours: placeDetails.openingHours?.length || 0
                        });
                      }
                    } catch (error) {
                      console.log('Could not get detailed place info, using basic info:', error);
                    }
                  }
                  
                  // Ensure all required properties exist with default values
                  const enhancedPlace = {
                    ...detailedPlace,
                    openingHours: Array.isArray(detailedPlace.openingHours) ? detailedPlace.openingHours : 
                                  (typeof detailedPlace.openingHours === 'string' ? [detailedPlace.openingHours] : []),
                    photos: Array.isArray(detailedPlace.photos) ? detailedPlace.photos : [],
                    reviews: Array.isArray(detailedPlace.reviews) ? detailedPlace.reviews : [],
                    // Add missing properties that PlaceDetailScreen expects
                    amenities: [], // PlaceDetailScreen expects this but GooglePlace doesn't have it
                    tourOptions: [], // PlaceDetailScreen expects this but GooglePlace doesn't have it
                    // Only use properties that exist in GooglePlace interface
                    coordinates: detailedPlace.coordinates || { lat: 0, lng: 0 }
                  };
                  
                  // Ensure reviews have the right structure if they exist
                  if (enhancedPlace.reviews && enhancedPlace.reviews.length > 0) {
                    enhancedPlace.reviews = enhancedPlace.reviews.map(review => ({
                      ...review,
                      // Map GooglePlaceReview properties to what PlaceDetailScreen expects
                      author: review.author_name || 'Anonymous',
                      date: review.relative_time_description || 'Recently',
                      text: review.text || 'No review text available'
                    }));
                  }
                  
                  return {
                    ...activity,
                    placeDetails: enhancedPlace,
                    coordinates: enhancedPlace.coordinates
                  };
                } else {
                  // No places found, return activity with minimal place details
                  return {
                    ...activity,
                    placeDetails: {
                      id: `no-results-${Math.random().toString(36).substr(2, 9)}`,
                      name: activity.location || activity.activity,
                      type: 'Place',
                      coordinates: { lat: 0, lng: 0 },
                      rating: 0,
                      address: activity.location || 'Location not available',
                      openingHours: [],
                      photos: [],
                      reviews: [],
                      amenities: [],
                      tourOptions: []
                    },
                    coordinates: { lat: 0, lng: 0 }
                  };
                }
              } catch (error) {
                console.log('Could not enhance activity with place details:', error);
                // Return activity with minimal place details if API fails
                return {
                  ...activity,
                  placeDetails: {
                    id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
                    name: activity.location || activity.activity,
                    type: 'Place',
                    coordinates: { lat: 0, lng: 0 },
                    rating: 0,
                    address: activity.location || 'Location not available',
                    openingHours: [],
                    photos: [],
                    reviews: [],
                    amenities: [],
                    tourOptions: []
                  },
                  coordinates: { lat: 0, lng: 0 }
                };
              }
              
              return activity;
            })
          );
          return enhancedDay;
        })
      );
      
      setEnhancedActivities(enhanced);
      setHeaderBackgroundFromPlaces(); // Set header background after activities are enhanced
    } catch (error) {
      console.error('Error enhancing activities:', error);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleActivityPress = (activity: EnhancedActivity) => {
    if (activity.placeDetails && activity.placeDetails.id && !activity.placeDetails.id.startsWith('fallback-') && !activity.placeDetails.id.startsWith('no-results-')) {
      // Debug: Log what data we're passing
      console.log('Navigating to PlaceDetailScreen with data:', {
        placeId: activity.placeDetails.id,
        placeData: activity.placeDetails,
        coordinates: activity.placeDetails.coordinates
      });
      
      // Navigate to PlaceDetailScreen with complete place data
      (navigation as any).navigate('PlaceDetailScreen', {
        placeId: activity.placeDetails.id,
        placeData: {
          // Pass all available Google Places API data
          id: activity.placeDetails.id,
          name: activity.placeDetails.name,
          type: activity.placeDetails.type,
          types: activity.placeDetails.types,
          coordinates: activity.placeDetails.coordinates,
          rating: activity.placeDetails.rating,
          userRatingsTotal: activity.placeDetails.userRatingsTotal,
          address: activity.placeDetails.address,
          phone: activity.placeDetails.phone,
          website: activity.placeDetails.website,
          openingHours: activity.placeDetails.openingHours || [],
          photos: activity.placeDetails.photos || [],
          priceLevel: activity.placeDetails.priceLevel,
          reviews: activity.placeDetails.reviews || [],
          editorialSummary: activity.placeDetails.editorialSummary,
          // Add default arrays for PlaceDetailScreen compatibility
          amenities: [],
          tourOptions: []
        },
        coordinates: activity.placeDetails.coordinates
      });
    } else {
      Alert.alert('Place Details', 'Place details not available for this activity. This might be a generated activity without real location data.');
    }
  };

  const handleGetDirections = (activity: EnhancedActivity) => {
    if (activity.coordinates && activity.coordinates.lat !== 0 && activity.coordinates.lng !== 0) {
      const { lat, lng } = activity.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      // You can use Linking.openURL(url) here
      Alert.alert('Directions', 'Opening Google Maps for directions...');
    } else {
      Alert.alert('Directions', 'Location coordinates not available for this activity.');
    }
  };

  const calculateTravelTime = (fromActivity: EnhancedActivity, toActivity: EnhancedActivity): string => {
    if (!fromActivity.coordinates || !toActivity.coordinates || 
        fromActivity.coordinates.lat === 0 || fromActivity.coordinates.lng === 0 ||
        toActivity.coordinates.lat === 0 || toActivity.coordinates.lng === 0) {
      return 'Unknown';
    }
    
    // Simple distance calculation (you can integrate with Google Directions API for real travel time)
    const lat1 = fromActivity.coordinates.lat;
    const lon1 = fromActivity.coordinates.lng;
    const lat2 = toActivity.coordinates.lat;
    const lon2 = toActivity.coordinates.lng;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Estimate travel time (walking: 5 km/h, driving: 30 km/h in city)
    const walkingTime = Math.round(distance / 5 * 60); // minutes
    const drivingTime = Math.round(distance / 30 * 60); // minutes
    
    return `${walkingTime}m walk / ${drivingTime}m drive`;
  };

  const handleRemovePlan = async () => {
    if (!planId) {
      showCustomAlertMessage(
        '❌ Error',
        'No plan ID available to remove.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    if (!token) {
      showCustomAlertMessage(
        '🔐 Authentication Error',
        'Please log in to remove your travel plan.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      showCustomAlertMessage(
        '⏰ Session Expired',
        'Your login session has expired. Please log in again.',
        'warning',
        [
          { text: 'Cancel', onPress: () => setShowCustomAlert(false), style: 'cancel' },
          { 
            text: 'Login', 
            onPress: async () => {
              setShowCustomAlert(false);
              await logout();
              (navigation as any).navigate('Login');
            }
          }
        ]
      );
      return;
    }

    showCustomAlertMessage(
      '🗑️ Remove Travel Plan',
      'This action will permanently delete your travel plan and all associated data. Are you sure you want to continue?',
      'warning',
      [
        {
          text: 'Keep Plan',
          onPress: () => setShowCustomAlert(false),
          style: 'cancel'
        },
        {
          text: 'Delete Plan',
          onPress: async () => {
            setShowCustomAlert(false);
            setIsRemoving(true);
            try {
              const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove plan');
              }

              showCustomAlertMessage(
                '✅ Plan Deleted Successfully!',
                'Your travel plan has been permanently removed from your account.',
                'success',
                [
                  {
                    text: 'Continue',
                    onPress: () => {
                      setShowCustomAlert(false);
                      navigation.goBack();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error removing plan:', error);
              showCustomAlertMessage(
                '❌ Deletion Failed',
                'Unable to remove the travel plan. Please check your connection and try again.',
                'error',
                [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
              );
            } finally {
              setIsRemoving(false);
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const renderDaySelector = () => (
    <View style={styles.daySelector}>
      {generatedPlan?.itinerary?.days && generatedPlan.itinerary.days.length > 0 ? generatedPlan.itinerary.days.map((day, index) => (
        <TouchableOpacity
          key={`day-tab-${index}`}
          style={[
            styles.dayTab,
            selectedDay === index && styles.dayTabActive
          ]}
          onPress={() => setSelectedDay(index)}
        >
          <Text style={[
            styles.dayTabText,
            selectedDay === index && styles.dayTabTextActive
          ]}>
            Day {index + 1}
          </Text>
        </TouchableOpacity>
      )) : (
        <View style={styles.noDaysContainer}>
          <Text style={styles.noDaysText}>No days available</Text>
        </View>
      )}
    </View>
  );

  const renderActivityCard = (activity: EnhancedActivity, index: number, dayIndex: number) => {
    const isFallbackActivity = activity.placeDetails?.id?.startsWith('fallback-') || activity.placeDetails?.id?.startsWith('no-results-');
    
    return (
      <View style={styles.activityCard}>
        {/* Activity Header */}
        <View style={[styles.activityHeader, isFallbackActivity && styles.fallbackActivityHeader]}>
          <View style={styles.activityTimeContainer}>
            <MaterialIcons name="access-time" size={16} color="#FF6B9D" />
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
          {isFallbackActivity && (
            <View style={styles.fallbackBadge}>
              <Text style={styles.fallbackBadgeText}>AI Generated</Text>
            </View>
          )}
          <TouchableOpacity style={styles.activityOptions}>
            <MaterialIcons name="more-vert" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Activity Image and Details */}
        <TouchableOpacity 
          style={styles.activityContent}
          onPress={() => handleActivityPress(activity)}
          activeOpacity={0.8}
        >
          {activity.placeDetails?.photos?.[0] ? (
            <Image 
              source={{ uri: activity.placeDetails.photos[0] }} 
              style={styles.activityImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.activityImagePlaceholder}>
              <MaterialIcons name="place" size={40} color="#8E8E93" />
            </View>
          )}
          
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>{activity.activity}</Text>
            <Text style={styles.activityLocation}>{activity.location}</Text>
            
            {/* Rating */}
            {activity.placeDetails?.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialIcons
                      key={star}
                      name={star <= activity.placeDetails!.rating ? "star" : "star-border"}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.reviewCount}>
                  {activity.placeDetails.userRatingsTotal || 0} reviews
                </Text>
              </View>
            )}
          </View>

          {/* Map Icon */}
          <TouchableOpacity 
            style={styles.mapIcon}
            onPress={() => handleGetDirections(activity)}
          >
            <MaterialIcons name="map" size={24} color="#4CBC71" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectedDay = () => {
    if (!generatedPlan?.itinerary?.days || !enhancedActivities[selectedDay]) {
      return (
        <View style={styles.noItineraryContainer}>
          <Text style={styles.noItineraryText}>No itinerary available for this day.</Text>
        </View>
      );
    }

    const currentDay = generatedPlan.itinerary.days[selectedDay];
    const currentActivities = enhancedActivities[selectedDay] || [];

    return (
      <View style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{currentDay.title}</Text>
          <Text style={styles.dayDescription}>{currentDay.description}</Text>
        </View>

        <View style={styles.activitiesContainer}>
          {currentActivities && currentActivities.length > 0 ? currentActivities.map((activity, index) => (
            <View key={`day-${selectedDay}-activity-${index}`}>
              {renderActivityCard(activity, index, selectedDay)}
              {/* Travel Segment to Next Activity */}
              {index < enhancedActivities[selectedDay]?.length - 1 && (
                <View style={styles.travelSegment}>
                  <View style={styles.travelSeparator}>
                    <View style={styles.travelDot} />
                    <View style={styles.travelLine} />
                    <View style={styles.travelDot} />
                  </View>
                  <View style={styles.travelContent}>
                    <View style={styles.travelInfoGroup}>
                      <View style={styles.travelDetailRow}>
                        <MaterialIcons name="directions-walk" size={16} color="#4CBC71" />
                        <Text style={styles.travelDetailText}>
                          {(() => {
                            const travelInfo = calculateTravelTime(
                              activity,
                              enhancedActivities[selectedDay][index + 1]
                            );
                            
                            if (travelInfo === 'Unknown') return 'Unknown';
                            
                            const parts = travelInfo.split(' / ');
                            if (parts.length === 2) {
                              return parts[0]; // "278m walk"
                            }
                            return travelInfo;
                          })()}
                        </Text>
                      </View>
                      <View style={styles.travelDetailRow}>
                        <MaterialIcons name="directions-car" size={16} color="#4CBC71" />
                        <Text style={styles.travelDetailText}>
                          {(() => {
                            const travelInfo = calculateTravelTime(
                              activity,
                              enhancedActivities[selectedDay][index + 1]
                            );
                            
                            if (travelInfo === 'Unknown') return 'Unknown';
                            
                            const parts = travelInfo.split(' / ');
                            if (parts.length === 2) {
                              return parts[1]; // "3m drive"
                            }
                            return 'N/A';
                          })()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.directionsButton}
                      onPress={() => handleGetDirections(enhancedActivities[selectedDay][index + 1])}
                    >
                      <MaterialIcons name="directions" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )) : (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>No activities planned for this day.</Text>
            </View>
          )}
        </View>

        {/* Day Summary */}
        <View style={styles.daySummary}>
          <Text style={styles.daySummaryTitle}>Quick Summary</Text>
          {currentDay.meals && (
            <View style={styles.mealsSection}>
              <Text style={styles.mealsTitle}>Meals</Text>
              <View style={styles.mealsRow}>
                <Text style={styles.mealText}>🍳 {currentDay.meals.breakfast}</Text>
                <Text style={styles.mealText}>🍴 {currentDay.meals.lunch}</Text>
                <Text style={styles.mealText}>🌙 {currentDay.meals.dinner}</Text>
              </View>
            </View>
          )}
          {currentDay.estimatedCost && (
            <View style={styles.dayCostContainer}>
              <Text style={styles.dayCostLabel}>💵 Day Cost:</Text>
              <Text style={styles.dayCost}>{currentDay.estimatedCost}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {headerBackgroundImage && (
            <Image 
              source={{ uri: headerBackgroundImage }} 
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              onLoadStart={() => setIsHeaderImageLoading(true)}
              onLoadEnd={() => setIsHeaderImageLoading(false)}
              onError={() => {
                setHeaderBackgroundImage(null);
                setIsHeaderImageLoading(false);
              }}
            />
          )}
          
          {isHeaderImageLoading && (
            <View style={styles.headerImageLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGradient}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {generatedPlan?.planName || 'Your Travel Plan'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {planningData.destinations.join(', ')} • {planningData.tripDays} days
            </Text>
          </View>

          <TouchableOpacity style={styles.mapButton}>
            <MaterialIcons name="map" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
            
      {/* Day Selector */}
      {renderDaySelector()}

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoadingPlaces ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CBC71" />
            <Text style={styles.loadingText}>Loading place details...</Text>
              </View>
        ) : (
          renderSelectedDay()
        )}

        {/* Travel Tips & Packing List */}
        {generatedPlan && (
          <View style={styles.additionalInfoCard}>
            <Text style={styles.additionalInfoTitle}>Travel Essentials</Text>
            
            {/* Travel Tips - Compact Display with Show More/Less */}
            {generatedPlan.travelTips && generatedPlan.travelTips.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>💡 Quick Tips</Text>
                <View style={styles.tipsContainer}>
                  {(showMoreTips ? generatedPlan.travelTips : generatedPlan.travelTips.slice(0, 4)).map((tip, index) => (
                    <View key={`tip-${index}`} style={styles.tipItem}>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
                {generatedPlan.travelTips.length > 4 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowMoreTips(!showMoreTips)}
                  >
                    <Text style={styles.showMoreText}>
                      {showMoreTips ? 'Show Less' : `Show ${generatedPlan.travelTips.length - 4} More`}
                    </Text>
                    <MaterialIcons 
                      name={showMoreTips ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={20} 
                      color="#FF6B9D" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Packing List - Compact Display with Show More/Less */}
            {generatedPlan.packingList && generatedPlan.packingList.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>🎒 Packing List</Text>
                <View style={styles.packingContainer}>
                  {(showMorePacking ? generatedPlan.packingList : generatedPlan.packingList.slice(0, 5)).map((item, index) => (
                    <View key={`packing-${index}`} style={styles.packingItem}>
                      <Text style={styles.packingText}>• {item}</Text>
                    </View>
                  ))}
                </View>
                {generatedPlan.packingList.length > 5 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowMorePacking(!showMorePacking)}
                  >
                    <Text style={styles.showMoreText}>
                      {showMorePacking ? 'Show Less' : `Show ${generatedPlan.packingList.length - 5} More`}
                    </Text>
                    <MaterialIcons 
                      name={showMorePacking ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={20} 
                      color="#FF6B9D" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Total Cost - Prominent Display */}
            {generatedPlan.totalEstimatedCost && (
              <View style={styles.costSection}>
                <Text style={styles.costTitle}>Total Estimated Cost</Text>
                <Text style={styles.costAmount}>{generatedPlan.totalEstimatedCost}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Primary Action Button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CBC71', '#45A364']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Back to My Plans</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Feather name="edit-3" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Edit Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Feather name="share-2" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Share Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, isRemoving && styles.secondaryButtonDisabled]}
              onPress={() => handleRemovePlan()}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color="#FF6B9D" />
              ) : (
                <MaterialCommunityIcons name="delete" size={20} color="#FF6B9D" />
              )}
              <Text style={[styles.secondaryButtonText, isRemoving && styles.secondaryButtonTextDisabled]}>
                {isRemoving ? 'Deleting...' : 'Delete Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Modern Alert */}
      {showCustomAlert && (
        <View style={styles.alertOverlay}>
          <View style={[
            styles.customAlert, 
            alertConfig.type === 'info' && styles.alertInfo,
            alertConfig.type === 'success' && styles.alertSuccess,
            alertConfig.type === 'warning' && styles.alertWarning,
            alertConfig.type === 'error' && styles.alertError
          ]}>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={styles.alertActions}>
              {alertConfig.actions && alertConfig.actions.length > 0 ? alertConfig.actions.map((action, index) => (
                <TouchableOpacity
                  key={`alert-action-${index}`}
                  style={[
                    styles.alertButton,
                    action.style === 'destructive' && styles.alertButtonDestructive,
                    action.style === 'cancel' && styles.alertButtonCancel
                  ]}
                  onPress={action.onPress}
                >
                  <Text style={[
                    styles.alertButtonText,
                    action.style === 'destructive' && styles.alertButtonTextDestructive,
                    action.style === 'cancel' && styles.alertButtonTextCancel
                  ]}>
                    {action.text}
                  </Text>
                </TouchableOpacity>
              )) : null}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    height: 220, // Fixed height for the header
    backgroundColor: '#4CBC71', // Default background
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80, // Adjust for status bar
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: 220,
    opacity: 0.8, // Adjust as needed for background effect
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: '100%',
    opacity: 0.8, // Adjust as needed for gradient effect
  },
  headerImageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust for status bar
    left: 24,
    zIndex: 10,
  },
  headerContent: {
    position: 'absolute',
    top: 100, // Adjust for status bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  mapButton: {
    position: 'absolute',
    top: 50, // Adjust for status bar
    right: 24,
    zIndex: 10,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTab: {
    alignItems: 'center',
  },
  dayTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B9D',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayTabTextActive: {
    color: '#FF6B9D',
  },
  dayContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dayHeader: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  activitiesContainer: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  fallbackActivityCard: {
    backgroundColor: '#F0F0F0', // Lighter background for fallback activities
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  fallbackActivityHeader: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
  },
  fallbackBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  fallbackBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activityTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  activityOptions: {
    padding: 8,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  activityImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  mapIcon: {
    padding: 8,
  },
  travelSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  travelSeparator: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 16,
    width: 20,
    position: 'relative',
  },
  travelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CBC71',
    zIndex: 2,
  },
  travelLine: {
    width: 2,
    height: 20,
    backgroundColor: '#4CBC71',
    marginVertical: 4,
    opacity: 0.8,
  },
  travelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travelInfoGroup: {
    flex: 1,
    marginRight: 16,
  },
  travelDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  travelDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 8,
  },
  directionsButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#4CBC71',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  directionsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  daySummary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  daySummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  mealsSection: {
    marginBottom: 12,
  },
  mealsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  mealText: {
    fontSize: 13,
    color: '#1C1C1E',
    lineHeight: 18,
    backgroundColor: '#F0F8FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0F0FF',
  },
  dayCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  noItineraryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noItineraryText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#8E8E93',
    fontSize: 16,
  },
  additionalInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  additionalInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#1C1C1E',
    lineHeight: 18,
    fontWeight: '500',
  },
  packingItem: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  packingText: {
    fontSize: 13,
    color: '#1C1C1E',
    lineHeight: 18,
    fontWeight: '500',
  },
  costSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CBC71',
  },
  actionButtonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8E8E93',
    shadowColor: '#8E8E93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipItem: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  packingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCostContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  dayCostLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CBC71',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  showMoreText: {
    fontSize: 14,
    color: '#4CBC71',
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonTextDisabled: {
    color: '#8E8E93',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  customAlert: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  alertInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CBC71',
  },
  alertSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CBC71',
  },
  alertWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  alertError: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonDestructive: {
    backgroundColor: '#FFE0E0',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  alertButtonTextDestructive: {
    color: '#FF6B9D',
  },
  alertButtonCancel: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#4CBC71',
  },
  alertButtonTextCancel: {
    color: '#4CBC71',
  },
  noActivitiesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  noDaysContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDaysText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default PlanningDetailScreen;

