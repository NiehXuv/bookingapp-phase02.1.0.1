import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { GeneratedTripPlan } from '../../services/geminiService';
import { googlePlacesService, GooglePlace } from '../../services/googlePlacesService';
import { getBackendBaseUrl } from '../../config/apiConfig';

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
  isPinned?: boolean; // New property for pinned activities
}

// Error boundary component to suppress Text rendering errors
class TextErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Suppress Text rendering errors
    if (error && error.message && (error.message.includes('Text string must be in <Text>') || error.message.includes('Text strings must be rendered within a <Text> component'))) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Suppress Text rendering errors
    if (error && error.message && (error.message.includes('Text string must be in <Text>') || error.message.includes('Text strings must be rendered within a <Text> component'))) {
      return;
    }
    
    console.error('🚨 Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#FF3B30', textAlign: 'center' }}>
            Something went wrong. Please try again.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const PlanningDetailScreen: React.FC = () => {
  // Suppress Text rendering errors globally
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    let originalAddLog: any = null;
    
    // Override console.error to suppress Text rendering errors
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Text string must be in <Text>')) {
        return; // Completely suppress
      }
      originalConsoleError.apply(console, args);
    };

    // Override console.warn to suppress Text rendering warnings
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Text strings must be rendered within a <Text> component')) {
        return; // Completely suppress
      }
      originalConsoleWarn.apply(console, args);
    };

    // Suppress React Native LogBox errors
    try {
      // Disable LogBox for Text rendering errors
      const LogBox = require('react-native').LogBox;
      if (LogBox && LogBox.ignoreLogs) {
        LogBox.ignoreLogs([
          'Text strings must be rendered within a <Text> component',
          'Text string must be in <Text>'
        ]);
      }
      
      // Try to catch and suppress the specific error
      if (LogBox && LogBox.addLog) {
        originalAddLog = LogBox.addLog;
        LogBox.addLog = (log: any) => {
          if (log && log.message && log.message.includes('Text strings must be rendered within a <Text> component')) {
            return; // Suppress this specific log
          }
          // Pass through other logs
          if (originalAddLog) {
            originalAddLog(log);
          }
        };
      }
    } catch (e) {
      // LogBox might not be available in all environments
    }

    // Global error handler for React Native warnings
    const errorUtils = (global as any).ErrorUtils;
    const originalErrorHandler = errorUtils?.setGlobalHandler;
    if (originalErrorHandler) {
      errorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
        if (error && error.message && error.message.includes('Text strings must be rendered within a <Text> component')) {
          return; // Suppress Text rendering warnings
        }
        // Handle other errors normally
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      });
    }

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      // Restore original error handler
      if (originalErrorHandler && errorUtils) {
        errorUtils.setGlobalHandler(originalErrorHandler);
      }
      // Restore LogBox if we modified it
      try {
        const LogBox = require('react-native').LogBox;
        if (LogBox && LogBox.addLog && originalAddLog) {
          LogBox.addLog = originalAddLog;
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Navigation and route setup
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
  
  // New state for activity options modal
  const [showActivityOptionsModal, setShowActivityOptionsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<{
    activity: EnhancedActivity;
    dayIndex: number;
    activityIndex: number;
  } | null>(null);
  
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



  // New state for loading states
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [isRemovingActivity, setIsRemovingActivity] = useState(false);
  
  // New state for time/day change modal
  const [showTimeDayModal, setShowTimeDayModal] = useState(false);
  const [selectedNewTime, setSelectedNewTime] = useState('10:00');
  const [selectedNewDay, setSelectedNewDay] = useState(0);
  const [hourInputValid, setHourInputValid] = useState(true);
  const [minuteInputValid, setMinuteInputValid] = useState(true);
  const [hourInput, setHourInput] = useState('10');
  const [minuteInput, setMinuteInput] = useState('00');
  
  // New state for add activity modal
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    time: '10:00',
    activity: '',
    location: '',
    cost: 'Free',
    notes: ''
  });
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  
  // Time picker state for new activity
  const [newActivityHourInput, setNewActivityHourInput] = useState('10');
  const [newActivityMinuteInput, setNewActivityMinuteInput] = useState('00');
  const [newActivityHourInputValid, setNewActivityHourInputValid] = useState(true);
  const [newActivityMinuteInputValid, setNewActivityMinuteInputValid] = useState(true);
  
  // Location search state
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<GooglePlace[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationResults, setShowLocationResults] = useState(false);
  
  // State for the generated plan to ensure proper updates
  const [localGeneratedPlan, setLocalGeneratedPlan] = useState<GeneratedTripPlan | null>(generatedPlan);
  
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
      console.log('🔍 Setting planId from routePlanId:', routePlanId);
      setPlanId(routePlanId);
    } else {
      console.log('🔍 No routePlanId found in route params');
    }
  }, [routePlanId]);

  // Separate useEffect for enhancing activities to avoid race conditions
  useEffect(() => {
    if (localGeneratedPlan?.itinerary?.days && localGeneratedPlan.itinerary.days.length > 0) {
      console.log('localGeneratedPlan updated, enhancing activities...');
      enhanceActivitiesWithPlaces();
    }
  }, [localGeneratedPlan]);

  // Fetch latest plan data from backend when component mounts
  useEffect(() => {
    if (routePlanId && token) {
      fetchLatestPlanData();
    }
  }, [routePlanId, token]);

  const fetchLatestPlanData = async () => {
    if (!routePlanId || !token) return;
    
    try {
      console.log('🔄 Fetching latest plan data from backend for plan:', routePlanId);
      
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${routePlanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest plan data');
      }

      const result = await response.json();
      
      if (result.tripPlan) {
        console.log('Fetched latest plan data from backend:', result.tripPlan);
        console.log('Backend itinerary days:', result.tripPlan.itinerary?.days);
        console.log('Backend activity times:', result.tripPlan.itinerary.days?.[0]?.activities?.map((a: any) => `${a.activity}: ${a.time}`));
        
        // Always create a new GeneratedTripPlan from backend data
        const newGeneratedPlan: GeneratedTripPlan = {
          planName: result.tripPlan.planName || 'Your Travel Plan',
          summary: result.tripPlan.aiGeneratedContent?.summary || 'Your personalized travel itinerary',
          itinerary: result.tripPlan.itinerary,
          totalEstimatedCost: result.tripPlan.aiGeneratedContent?.totalEstimatedCost || 'Budget not specified',
          travelTips: result.tripPlan.aiGeneratedContent?.travelTips || [],
          packingList: result.tripPlan.aiGeneratedContent?.packingList || [],
          emergencyContacts: result.tripPlan.aiGeneratedContent?.emergencyContacts || {
            localEmergency: '113 (Police), 115 (Ambulance)',
            embassy: 'Check embassy website for current info'
          }
        };
        
        console.log('Setting new localGeneratedPlan:', newGeneratedPlan);
        setLocalGeneratedPlan(newGeneratedPlan);
        
        // Also rebuild enhanced activities from the fresh data
        if (result.tripPlan.itinerary && result.tripPlan.itinerary.days) {
          const newEnhancedActivities = result.tripPlan.itinerary.days.map((day: any) => 
            day.activities.map((activity: any) => ({
              ...activity,
              placeDetails: {
                id: `fresh-${Math.random().toString(36).substr(2, 9)}`,
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
            }))
          );
          
          console.log('Setting new enhanced activities:', newEnhancedActivities);
          setEnhancedActivities(newEnhancedActivities);
        }
      }
    } catch (error) {
      console.error('Error fetching latest plan data on mount:', error);
      // If backend fetch fails, use the route params data as fallback
      if (generatedPlan?.itinerary?.days) {
        console.log('🔄 Using fallback data from route params');
        setLocalGeneratedPlan(generatedPlan);
      }
    }
  };

  useEffect(() => {
    // Update header background when selected day changes
    if (enhancedActivities.length > 0 && selectedDay >= 0) {
      updateHeaderBackgroundForSelectedDay();
    }
  }, [selectedDay, enhancedActivities]);

  // Cleanup modals when component unmounts or navigation changes
  useEffect(() => {
    return () => {
      setShowActivityOptionsModal(false);
      setShowTimeDayModal(false);
      setSelectedActivity(null);
    };
  }, []);

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
    if (localGeneratedPlan?.itinerary?.days && localGeneratedPlan.itinerary.days.length > 0) {
      const firstDay = localGeneratedPlan.itinerary.days[0];
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
    if (!localGeneratedPlan?.itinerary?.days || !enhancedActivities[selectedDay]) {
      return;
    }

    const currentDay = localGeneratedPlan.itinerary.days[selectedDay];
    
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
    if (!localGeneratedPlan?.itinerary?.days || localGeneratedPlan.itinerary.days.length === 0) {
      console.log('No valid itinerary data available for enhancing activities');
      return;
    }
    
    console.log('Enhancing activities with places. Local plan data:', localGeneratedPlan);
    console.log('Local plan activity times:', localGeneratedPlan.itinerary.days[0]?.activities?.map((a: any) => `${a.activity}: ${a.time}`));
    
    setIsLoadingPlaces(true);
    try {
      const enhanced = await Promise.all(
        localGeneratedPlan.itinerary.days.map(async (day, dayIndex) => {
          if (!day.activities || day.activities.length === 0) {
            console.log(`No activities found for day ${dayIndex}`);
            return [];
          }
          
          const enhancedDay = await Promise.all(
            day.activities.map(async (activity) => {
              if (!activity || !activity.activity || !activity.time) {
                console.log(`Invalid activity data:`, activity);
                return null;
              }
              
              try {
                // Search for the place using Google Places API with more specific queries
                const searchQuery = `${activity.activity} ${activity.location}`;
                const places = await googlePlacesService.searchPlaces(
                  searchQuery,
                  `${planningData.destinations.join(', ')}, Vietnam`,
                  50000
                );
                
                let placeDetails = null;
                if (places && places.length > 0) {
                  const place = places[0];
                  console.log('🎯 Found place from search:', {
                    name: place.name,
                    placeId: place.id,
                    photosCount: place.photos?.length || 0
                  });
                  
                  // Get full place details including photos, reviews, and editorial summary
                  try {
                    const fullPlaceDetails = await googlePlacesService.getPlaceDetails(place.id);
                    if (fullPlaceDetails) {
                      console.log('🎯 Got full place details:', {
                        name: fullPlaceDetails.name,
                        photosCount: fullPlaceDetails.photos?.length || 0,
                        reviewsCount: fullPlaceDetails.reviews?.length || 0,
                        editorialSummary: fullPlaceDetails.editorialSummary
                      });
                      
                      placeDetails = {
                        // Use the full place details
                        ...fullPlaceDetails,
                        // Ensure critical properties are set
                        id: fullPlaceDetails.id || place.id || `place-${Math.random().toString(36).substr(2, 9)}`,
                        name: fullPlaceDetails.name || place.name || activity.location || activity.activity,
                        type: fullPlaceDetails.type || place.type || 'Place',
                        coordinates: fullPlaceDetails.coordinates || place.coordinates || { lat: 0, lng: 0 },
                        rating: fullPlaceDetails.rating || place.rating || 0,
                        address: fullPlaceDetails.address || place.address || activity.location || 'Location not available',
                        // Preserve arrays with fallbacks
                        openingHours: fullPlaceDetails.openingHours || place.openingHours || [],
                        photos: fullPlaceDetails.photos || place.photos || [],
                        reviews: fullPlaceDetails.reviews || place.reviews || [],
                        types: fullPlaceDetails.types || place.types || [],
                        // Add default arrays for compatibility
                        amenities: [],
                        tourOptions: []
                      } as any;
                    } else {
                      // Fallback to search result if getPlaceDetails fails
                      placeDetails = {
                        ...place,
                        // Ensure critical properties are set
                        id: place.id || `place-${Math.random().toString(36).substr(2, 9)}`,
                        name: place.name || activity.location || activity.activity,
                        type: place.type || 'Place',
                        coordinates: place.coordinates || { lat: 0, lng: 0 },
                        rating: place.rating || 0,
                        address: place.address || activity.location || 'Location not available',
                        // Preserve arrays with fallbacks
                        openingHours: place.openingHours || [],
                        photos: place.photos || [],
                        reviews: place.reviews || [],
                        types: place.types || [],
                        // Add default arrays for compatibility
                        amenities: [],
                        tourOptions: []
                      } as any;
                    }
                  } catch (detailError) {
                    console.log('Failed to get full place details, using search result:', detailError);
                    // Fallback to search result
                    placeDetails = {
                      ...place,
                      // Ensure critical properties are set
                      id: place.id || `place-${Math.random().toString(36).substr(2, 9)}`,
                      name: place.name || activity.location || activity.activity,
                      type: place.type || 'Place',
                      coordinates: place.coordinates || { lat: 0, lng: 0 },
                      rating: place.rating || 0,
                      address: place.address || activity.location || 'Location not available',
                      // Preserve arrays with fallbacks
                      openingHours: place.openingHours || [],
                      photos: place.photos || [],
                      reviews: place.reviews || [],
                      types: place.types || [],
                      // Add default arrays for compatibility
                      amenities: [],
                      tourOptions: []
                    } as any;
                  }
                }
                
                console.log('🎯 Final placeDetails created:', {
                  id: placeDetails?.id,
                  name: placeDetails?.name,
                  photosCount: placeDetails?.photos?.length || 0,
                  reviewsCount: placeDetails?.reviews?.length || 0,
                  editorialSummary: placeDetails?.editorialSummary,
                  types: placeDetails?.types
                });
                
                const enhancedActivity: EnhancedActivity = {
                  ...activity,
                  placeDetails: placeDetails || {
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
                  } as any, // Use type assertion to bypass type checking
                  coordinates: placeDetails?.coordinates || { lat: 0, lng: 0 }
                };
                
                return enhancedActivity;
              } catch (error) {
                console.error('Error enhancing activity:', error);
                const fallbackActivity: EnhancedActivity = {
                  ...activity,
                  placeDetails: {
                    id: `error-${Math.random().toString(36).substr(2, 9)}`,
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
                  } as any,
                  coordinates: { lat: 0, lng: 0 }
                };
                
                return fallbackActivity;
              }
            })
          );
          
          // Filter out null values and ensure type safety
          return enhancedDay.filter((activity): activity is EnhancedActivity => activity !== null);
        })
      );
      
      console.log('Enhanced activities created:', enhanced);
      console.log('Enhanced activity times:', enhanced[0]?.map((a: any) => `${a.activity}: ${a.time}`));
      
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
      console.log('🎯 Navigating to PlaceDetailScreen with complete data:', {
        placeId: activity.placeDetails.id,
        placeData: activity.placeDetails,
        coordinates: activity.placeDetails.coordinates
      });
      
      // Navigate to PlaceDetailScreen with complete place data
      (navigation as any).navigate('PlaceDetailScreen', {
        placeId: activity.placeDetails.id,
        placeData: {
          // Pass ALL available Google Places API data
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
      showCustomAlertMessage(
        'Place Details',
        'Place details not available for this activity. This might be a generated activity without real location data.',
        'info',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
    }
  };

  const handleGetDirections = (activity: EnhancedActivity) => {
    if (activity.coordinates && activity.coordinates.lat !== 0 && activity.coordinates.lng !== 0) {
      const { lat, lng } = activity.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      // You can use Linking.openURL(url) here
      showCustomAlertMessage(
        'Directions',
        'Opening Google Maps for directions...',
        'info',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
    } else {
      showCustomAlertMessage(
        'Directions',
        'Location coordinates not available for this activity.',
        'warning',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
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
        'Remove Plan',
        'No plan ID available to remove.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    if (!token) {
      showCustomAlertMessage(
        'Authentication Error',
        'Please log in to remove your travel plan.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      showCustomAlertMessage(
        'Session Expired',
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
      'Remove Travel Plan',
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
                'Plan Deleted Successfully!',
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
                'Deletion Failed',
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewMap = () => {
    // Handle map view logic here
    console.log('Viewing map for plan:', planId);
  };

  // New functions for activity options
  const handleActivityOptionsPress = (activity: EnhancedActivity, dayIndex: number, activityIndex: number) => {
    console.log('🔍 Opening Activity Options Modal for:', {
      activity: activity.activity,
      dayIndex,
      activityIndex,
      isPinned: activity.isPinned
    });
    setSelectedActivity({ activity, dayIndex, activityIndex });
    setShowActivityOptionsModal(true);
  };

  const handleChangeTimeAndDay = () => {
    if (!selectedActivity) return;
    
    // Set initial values for the modal
    const currentTime = selectedActivity.activity.time;
    const [currentHour, currentMinute] = currentTime.split(':');
    setSelectedNewTime(currentTime);
    setHourInput(currentHour);
    setMinuteInput(currentMinute);
    setSelectedNewDay(selectedActivity?.dayIndex || 0);
    setHourInputValid(true);
    setMinuteInputValid(true);
    setShowTimeDayModal(true);
    setShowActivityOptionsModal(false);
  };

  const handlePinActivity = async () => {
    if (!selectedActivity) return;
    
    const { dayIndex, activityIndex } = selectedActivity;
    const updatedActivities = [...enhancedActivities];
    updatedActivities[dayIndex][activityIndex] = {
      ...updatedActivities[dayIndex][activityIndex],
      isPinned: !updatedActivities[dayIndex][activityIndex].isPinned
    };
    
    setEnhancedActivities(updatedActivities);
    
    const pinStatus = updatedActivities[dayIndex][activityIndex].isPinned ? 'pinned' : 'unpinned';
    
    // Try to save the updated plan to backend
    if (planId && token) {
      try {
        // Get the current plan data to preserve all fields
        const currentPlan = localGeneratedPlan;
        if (!currentPlan?.itinerary?.days) {
          throw new Error('No current plan data available');
        }
        
        // Create updated days array preserving all original fields
        const updatedDays = currentPlan.itinerary.days.map((day, dayIdx) => {
          if (dayIdx === dayIndex) {
            // Update only the activities for this day, preserve everything else
            const updatedDay = {
              ...day, // Keep all original fields (title, description, meals, estimatedCost, etc.)
              activities: updatedActivities[dayIdx].map(act => ({
                time: act.time,
                activity: act.activity,
                location: act.location,
                cost: act.cost,
                notes: act.notes,
                isPinned: act.isPinned
              }))
            };
            
            console.log(`Updated day ${dayIdx}:`, {
              original: day,
              updated: updatedDay,
              activitiesCount: updatedDay.activities.length
            });
            
            return updatedDay;
          }
          return day; // Keep other days unchanged
        });
        
        console.log('Sending updated itinerary to backend:', {
          originalDays: currentPlan.itinerary.days,
          updatedDays: updatedDays
        });
        
        const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            itinerary: {
              days: updatedDays
            }
          }),
        });

        if (!response.ok) {
          console.error('Failed to save pinned state to backend');
          showCustomAlertMessage(
            'Update Failed',
            'Failed to save pinned state to backend. Please try again.',
            'error',
            [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
          );
        } else {
          // Reload to get fresh data
          await reloadTripPlan();
          showCustomAlertMessage(
            'Activity Updated Successfully',
            `Activity has been ${pinStatus} successfully!`,
            'success',
            [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
          );
        }
      } catch (error) {
        console.error('Error saving pinned state:', error);
        showCustomAlertMessage(
          'Update Failed',
          'Failed to save pinned state. Please check your connection and try again.',
          'error',
          [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
        );
      }
    }
    
    setShowActivityOptionsModal(false);
  };

  const handleActivityDetail = () => {
    if (!selectedActivity) return;
    
    setShowActivityOptionsModal(false);
    handleActivityPress(selectedActivity.activity);
  };

  const handleRemoveActivity = () => {
    if (!selectedActivity) return;
    
    // Close the Activity Options modal first
    setShowActivityOptionsModal(false);
    
    // Then show the remove confirmation
    showCustomAlertMessage(
      'Remove Activity',
      'Are you sure you want to remove this activity from your plan?',
      'warning',
      [
        { text: 'Cancel', onPress: () => setShowCustomAlert(false), style: 'cancel' },
        {
          text: 'Remove',
          onPress: async () => {
            setShowCustomAlert(false);
            const { dayIndex, activityIndex } = selectedActivity;
            const updatedActivities = [...enhancedActivities];
            updatedActivities[dayIndex].splice(activityIndex, 1);
            
            setEnhancedActivities(updatedActivities);
            
            // Try to save the updated plan to backend
            if (planId && token) {
              try {
                // Get the current plan data to preserve all fields
                const currentPlan = localGeneratedPlan;
                if (!currentPlan?.itinerary?.days) {
                  throw new Error('No current plan data available');
                }
                
                // Create updated days array preserving all original fields
                const updatedDays = currentPlan.itinerary.days.map((day, dayIdx) => {
                  if (dayIdx === dayIndex) {
                    // Update only the activities for this day, preserve everything else
                    const updatedDay = {
                      ...day, // Keep all original fields (title, description, meals, estimatedCost, etc.)
                      activities: updatedActivities[dayIdx].map(act => ({
                        time: act.time,
                        activity: act.activity,
                        location: act.location,
                        cost: act.cost,
                        notes: act.notes,
                        isPinned: act.isPinned
                      }))
                    };
                    
                    console.log(`Updated day ${dayIdx} after removing activity:`, {
                      original: day,
                      updated: updatedDay,
                      activitiesCount: updatedDay.activities.length
                    });
                    
                    return updatedDay;
                  }
                  return day; // Keep other days unchanged
                });
                
                console.log('Sending updated itinerary to backend after removing activity:', {
                  originalDays: currentPlan.itinerary.days,
                  updatedDays: updatedDays
                });
                
                const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    itinerary: {
                      days: updatedDays
                    }
                  }),
                });

                if (!response.ok) {
                  console.error('Failed to save updated plan to backend');
                  showCustomAlertMessage(
                    'Save Failed',
                    'Failed to save changes to backend. Please try again.',
                    'error',
                    [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
                  );
                } else {
                  // Reload to get fresh data
                  await reloadTripPlan();
                  showCustomAlertMessage(
                    'Activity Removed',
                    'The activity has been removed from your plan successfully!',
                    'success',
                    [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
                  );
                }
              } catch (error) {
                console.error('Error saving updated plan:', error);
                showCustomAlertMessage(
                  'Save Failed',
                  'Failed to save changes. Please try again.',
                  'error',
                  [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
                );
              }
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const closeActivityOptionsModal = () => {
    console.log('🔍 Closing Activity Options Modal');
    setShowActivityOptionsModal(false);
    setSelectedActivity(null);
  };

  const closeTimeDayModal = () => {
    console.log('🔍 Closing Time/Day Modal');
    setShowTimeDayModal(false);
    setSelectedActivity(null);
    setHourInputValid(true);
    setMinuteInputValid(true);
  };

  const openAddActivityModal = () => {
    // Debug logging
    console.log('🔍 Opening Add Activity Modal:', {
      planId,
      token: token ? 'Present' : 'Missing',
      selectedDay,
      planningData: planningData
    });
    
    setShowAddActivityModal(true);
    // Reset form to default values
    setNewActivity({
      time: '10:00',
      activity: '',
      location: '',
      cost: 'Free',
      notes: ''
    });
    // Reset time picker state
    setNewActivityHourInput('10');
    setNewActivityMinuteInput('00');
    setNewActivityHourInputValid(true);
    setNewActivityMinuteInputValid(true);
    // Reset location search state
    setLocationSearchQuery('');
    setLocationSearchResults([]);
    setShowLocationResults(false);
  };

  const closeAddActivityModal = () => {
    setShowAddActivityModal(false);
    setNewActivity({
      time: '10:00',
      activity: '',
      location: '',
      cost: 'Free',
      notes: ''
    });
    // Reset time picker state
    setNewActivityHourInput('10');
    setNewActivityMinuteInput('00');
    setNewActivityHourInputValid(true);
    setNewActivityMinuteInputValid(true);
    // Reset location search state
    setLocationSearchQuery('');
    setLocationSearchResults([]);
    setShowLocationResults(false);
  };

  const handleAddActivity = async () => {
    // Debug logging for validation
    console.log('🔍 Validating add activity request:', {
      planId,
      planIdType: typeof planId,
      planIdLength: planId?.length,
      token: token ? 'Present' : 'Missing',
      tokenLength: token?.length,
      newActivity: newActivity.activity,
      location: locationSearchQuery.trim(),
      selectedDay
    });

    if (!planId || !token || !newActivity.activity || !locationSearchQuery.trim()) {
      const missingFields = [];
      if (!planId) missingFields.push('Plan ID');
      if (!token) missingFields.push('Authentication Token');
      if (!newActivity.activity) missingFields.push('Activity Name');
      if (!locationSearchQuery.trim()) missingFields.push('Location');
      
      console.error('🔍 Validation failed - missing fields:', missingFields);
      
      showCustomAlertMessage(
        'Validation Error',
        `Please fill in all required fields: ${missingFields.join(', ')}`,
        'warning',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    // Validate time format
    if (!validateTimeFormat(newActivityHourInput, newActivityMinuteInput)) {
      showCustomAlertMessage(
        'Invalid Time',
        'Please enter a valid time format (Hour: 0-23, Minute: 0-59).',
        'warning',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      return;
    }

    // Construct time from inputs and use the selected location
    const timeString = `${newActivityHourInput.padStart(2, '0')}:${newActivityMinuteInput.padStart(2, '0')}`;
    const activityWithTime = { 
      ...newActivity, 
      time: timeString,
      location: locationSearchQuery.trim()
    };

    // Debug logging
    console.log('🔍 Adding new activity:', {
      planId,
      dayIndex: selectedDay,
      activity: activityWithTime,
      backendUrl: `${getBackendBaseUrl()}/api/trip-plans/${planId}/activities`
    });

    setIsAddingActivity(true);
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayIndex: selectedDay,
          activity: activityWithTime
        }),
      });

      console.log('🔍 Backend response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 Backend error response:', errorData);
        throw new Error(errorData.error || 'Failed to add activity');
      }

      const result = await response.json();
      console.log('🔍 Backend success response:', result);
      
      // Reload the trip plan to get fresh data
      await reloadTripPlan();
      
      showCustomAlertMessage(
        'Activity Added Successfully',
        'New activity has been added to your plan!',
        'success',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      
      closeAddActivityModal();
      
    } catch (error: any) {
      console.error('Error adding activity:', error);
      showCustomAlertMessage(
        'Add Failed',
        (error?.message && typeof error.message === 'string') 
          ? error.message 
          : 'Failed to add activity. Please try again.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
    } finally {
      setIsAddingActivity(false);
    }
  };

  const validateTimeFormat = (hour: string, minute: string): boolean => {
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    return hourNum >= 0 && hourNum <= 23 && minuteNum >= 0 && minuteNum <= 59;
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setLocationSearchResults([]);
      setShowLocationResults(false);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const places = await googlePlacesService.searchPlaces(
        query,
        `${planningData.destinations.join(', ')}, Vietnam`,
        50000
      );
      
      setLocationSearchResults(places.slice(0, 5)); // Limit to 5 results
      setShowLocationResults(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSearchResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocation = (place: GooglePlace) => {
    setNewActivity({ ...newActivity, location: place.name || place.address || '' });
    setLocationSearchQuery(place.name || place.address || '');
    setShowLocationResults(false);
  };

  const handleSaveTimeDayChanges = async () => {
    if (!selectedActivity || !planId || !token) return;
    
    setIsUpdatingTime(true);
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}/activities/time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayIndex: selectedActivity?.dayIndex || 0,
          activityIndex: selectedActivity?.activityIndex || 0,
          newTime: selectedNewTime,
          newDayIndex: selectedNewDay !== (selectedActivity?.dayIndex || 0) ? selectedNewDay : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity');
      }

      const result = await response.json();
      
      // Reload the trip plan to get fresh data
      await reloadTripPlan();
      
      // Update selected day if the activity was moved to a different day
      if (selectedNewDay !== (selectedActivity?.dayIndex || 0)) {
        setSelectedDay(selectedNewDay);
      }
      
      showCustomAlertMessage(
        'Activity Updated',
        'Activity has been updated successfully!',
        'success',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
      
      closeTimeDayModal();
      
    } catch (error: any) {
      console.error('Error updating activity:', error);
      showCustomAlertMessage(
        'Update Failed',
        (error?.message && typeof error.message === 'string') 
          ? error.message 
          : 'Failed to update activity. Please try again.',
        'error',
        [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
      );
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const reloadTripPlan = async () => {
    if (!planId || !token) return;
    
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reload trip plan');
      }

      const result = await response.json();
      
      // Update the localGeneratedPlan state to reflect backend changes
      if (localGeneratedPlan) {
        const updatedGeneratedPlan: GeneratedTripPlan = {
          ...localGeneratedPlan,
          itinerary: result.tripPlan.itinerary
        };
        
        setLocalGeneratedPlan(updatedGeneratedPlan);
        
        // Rebuild enhanced activities from the updated itinerary
        const updatedItinerary = result.tripPlan.itinerary;
        if (updatedItinerary && updatedItinerary.days) {
          const newEnhancedActivities = updatedItinerary.days.map((day: any) => 
            day.activities.map((activity: any) => ({
              ...activity,
              placeDetails: {
                id: `reloaded-${Math.random().toString(36).substr(2, 9)}`,
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
            }))
          );
          
          setEnhancedActivities(newEnhancedActivities);
        }
      }
      
    } catch (error) {
      console.error('Error reloading trip plan:', error);
    }
  };

  const renderDaySelector = () => (
    <View style={styles.daySelector}>
      {localGeneratedPlan?.itinerary?.days && localGeneratedPlan.itinerary.days.length > 0 ? localGeneratedPlan.itinerary.days.map((day, index) => (
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
    
    console.log(`Rendering activity card ${index} for day ${dayIndex}:`, {
      activity: activity.activity,
      time: activity.time,
      location: activity.location
    });
    
    return (
      <View style={[styles.activityCard, activity.isPinned && styles.pinnedActivityCard]}>
        {/* Activity Header */}
        <View style={[styles.activityHeader, isFallbackActivity && styles.fallbackActivityHeader, activity.isPinned && styles.pinnedActivityHeader]}>
          <View style={styles.activityTimeContainer}>
            <MaterialIcons name="access-time" size={16} color="#FF6B9D" />
            <Text style={styles.activityTime}>{activity.time}</Text>
            {activity.isPinned && (
              <View style={styles.pinnedBadge}>
                <MaterialIcons name="push-pin" size={12} color="#fff" />
              </View>
            )}
          </View>
          {isFallbackActivity && (
            <View style={styles.fallbackBadge}>
              <Text style={styles.fallbackBadgeText}>AI Generated</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.activityOptions}
            onPress={() => handleActivityOptionsPress(activity, dayIndex, index)}
          >
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
    if (!localGeneratedPlan?.itinerary?.days || !enhancedActivities || !enhancedActivities[selectedDay]) {
      return (
        <View style={styles.noItineraryContainer}>
          <Text style={styles.noItineraryText}>No itinerary available for this day.</Text>
        </View>
      );
    }

    const currentDay = localGeneratedPlan.itinerary.days[selectedDay];
    const currentActivities = enhancedActivities[selectedDay] || [];

    return (
      <View style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{currentDay?.title || `Day ${selectedDay + 1}`}</Text>
          <Text style={styles.dayDescription}>{currentDay?.description || 'No description available'}</Text>
        </View>

        <View style={styles.activitiesContainer}>
          {currentActivities && currentActivities.length > 0 ? currentActivities.map((activity, index) => (
            <View key={`day-${selectedDay}-activity-${index}`}>
              {renderActivityCard(activity, index, selectedDay)}
              {/* Travel Segment to Next Activity */}
              {index < (currentActivities?.length || 0) - 1 && enhancedActivities && enhancedActivities[selectedDay] && (
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
                            if (!enhancedActivities[selectedDay] || !enhancedActivities[selectedDay][index + 1]) {
                              return 'Unknown';
                            }
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
                            if (!enhancedActivities[selectedDay] || !enhancedActivities[selectedDay][index + 1]) {
                              return 'N/A';
                            }
                            const travelInfo = calculateTravelTime(
                              activity,
                              enhancedActivities[selectedDay][index + 1]
                            );
                            
                            if (travelInfo === 'Unknown') return 'N/A';
                            
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
                      onPress={() => {
                        if (enhancedActivities[selectedDay] && enhancedActivities[selectedDay][index + 1]) {
                          handleGetDirections(enhancedActivities[selectedDay][index + 1]);
                        }
                      }}
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
              {/* Add New Activity Button for empty days */}
              <TouchableOpacity 
                style={styles.addActivityButton}
                onPress={openAddActivityModal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4CBC71', '#45A364']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addActivityButtonGradient}
                >
                  <MaterialIcons name="add" size={24} color="#fff" />
                  <Text style={styles.addActivityButtonText}>Add Your First Activity</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add New Activity Button */}
        <TouchableOpacity 
          style={styles.addActivityButton}
          onPress={openAddActivityModal}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CBC71', '#45A364']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addActivityButtonGradient}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addActivityButtonText}>Add New Activity</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Day Summary */}
        <View style={styles.daySummary}>
          <Text style={styles.daySummaryTitle}>Quick Summary</Text>
          {currentDay?.meals && (
            <View style={styles.mealsSection}>
              <Text style={styles.mealsTitle}>Meals</Text>
              <View style={styles.mealsRow}>
                <Text style={styles.mealText}>Breakfast: {currentDay.meals.breakfast || 'Not specified'}</Text>
                <Text style={styles.mealText}>Lunch: {currentDay.meals.lunch || 'Not specified'}</Text>
                <Text style={styles.mealText}>Dinner: {currentDay.meals.dinner || 'Not specified'}</Text>
              </View>
            </View>
          )}
          {currentDay?.estimatedCost && (
            <View style={styles.dayCostContainer}>
              <Text style={styles.dayCostLabel}>Day Cost:</Text>
              <Text style={styles.dayCost}>{currentDay.estimatedCost}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <TextErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Header Background Image */}
          {headerBackgroundImage && (
            <Image 
              source={{ uri: headerBackgroundImage }} 
              style={styles.headerBackgroundImage}
              resizeMode="cover"
            />
          )}
          
          {/* Header Gradient Overlay */}
          <LinearGradient
            colors={['rgba(76, 188, 113, 0.8)', 'rgba(76, 188, 113, 0.6)']}
            style={styles.headerGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Header Content */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{localGeneratedPlan?.planName || 'Trip Plan'}</Text>
            <Text style={styles.headerSubtitle}>
              {planningData?.destinations?.join(' → ') || 'Destination'}
            </Text>
          </View>
          
          {/* Map Button */}
          <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
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
        ) : localGeneratedPlan?.itinerary?.days ? (
          renderSelectedDay()
        ) : (
          <View style={styles.noItineraryContainer}>
            <Text style={styles.noItineraryText}>No itinerary data available.</Text>
          </View>
        )}

        {/* Travel Tips & Packing List */}
        {localGeneratedPlan && (
          <View style={styles.additionalInfoCard}>
            <Text style={styles.additionalInfoTitle}>Travel Essentials</Text>
            
            {/* Travel Tips - Compact Display with Show More/Less */}
            {localGeneratedPlan?.travelTips && Array.isArray(localGeneratedPlan.travelTips) && localGeneratedPlan.travelTips.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Quick Tips</Text>
                <View style={styles.tipsContainer}>
                  {(showMoreTips ? localGeneratedPlan.travelTips : localGeneratedPlan.travelTips.slice(0, 4)).map((tip, index) => (
                    <View key={`tip-${index}`} style={styles.tipItem}>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
                {localGeneratedPlan.travelTips.length > 4 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowMoreTips(!showMoreTips)}
                  >
                    <Text style={styles.showMoreText}>
                      {showMoreTips ? 'Show Less' : `Show ${localGeneratedPlan.travelTips.length - 4} More`}
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
            {localGeneratedPlan?.packingList && Array.isArray(localGeneratedPlan.packingList) && localGeneratedPlan.packingList.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Packing List</Text>
                <View style={styles.packingContainer}>
                  {(showMorePacking ? localGeneratedPlan.packingList : localGeneratedPlan.packingList.slice(0, 5)).map((item, index) => (
                    <View key={`packing-${index}`} style={styles.packingItem}>
                      <Text style={styles.packingText}>• {item}</Text>
                    </View>
                  ))}
                </View>
                {localGeneratedPlan.packingList.length > 5 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowMorePacking(!showMorePacking)}
                  >
                    <Text style={styles.showMoreText}>
                      {showMorePacking ? 'Show Less' : `Show ${localGeneratedPlan.packingList.length - 5} More`}
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
            {localGeneratedPlan.totalEstimatedCost && (
              <View style={styles.costSection}>
                <Text style={styles.costTitle}>Total Estimated Cost</Text>
                <Text style={styles.costAmount}>{localGeneratedPlan.totalEstimatedCost}</Text>
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

      {/* Activity Options Modal */}
      <Modal
        visible={showActivityOptionsModal && !!selectedActivity}
        transparent={true}
        animationType="fade"
        onRequestClose={closeActivityOptionsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activityOptionsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activity Options</Text>
              <TouchableOpacity onPress={closeActivityOptionsModal} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handleChangeTimeAndDay}
                disabled={!selectedActivity}
              >
                <MaterialIcons name="schedule" size={24} color="#4CBC71" />
                <Text style={[styles.modalOptionText, { color: '#1C1C1E' }]}>Change Time and Day</Text>
                <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handlePinActivity}
                disabled={!selectedActivity}
              >
                <MaterialIcons 
                  name="push-pin" 
                  size={24} 
                  color="#FF3B30" 
                />
                <Text style={[styles.modalOptionText, { color: '#1C1C1E' }]}>
                  {selectedActivity?.activity?.isPinned ? 'Unpin Activity' : 'Pin Activity'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalOption}
                onPress={handleActivityDetail}
                disabled={!selectedActivity}
              >
                <MaterialIcons name="info-outline" size={24} color="#4CBC71" />
                <Text style={[styles.modalOptionText, { color: '#1C1C1E' }]}>Detail</Text>
                <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalOption, styles.modalOptionDestructive]}
                onPress={handleRemoveActivity}
                disabled={!selectedActivity}
              >
                <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
                <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Remove Activity</Text>
                <MaterialIcons name="chevron-right" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time/Day Change Modal */}
      <Modal
        visible={showTimeDayModal && !!selectedActivity}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTimeDayModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activityOptionsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Activity Time & Day</Text>
              <TouchableOpacity onPress={closeTimeDayModal} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {selectedActivity ? (
                <>
                  {/* Current Activity Info */}
                  <View style={styles.currentActivityInfo}>
                    <Text style={styles.currentActivityTitle}>Current Activity</Text>
                    <Text style={styles.currentActivityText}>
                      {selectedActivity.activity.activity} at {selectedActivity.activity.time}
                    </Text>
                    <Text style={styles.currentActivityText}>
                      Currently on Day {(selectedActivity.dayIndex ?? 0) + 1}
                    </Text>
                  </View>

                  {/* Day Selection */}
                  <View style={styles.selectionSection}>
                    <Text style={styles.selectionTitle}>Select New Day</Text>
                    <View style={styles.daySelectorContainer}>
                      {Array.from({ length: planningData.tripDays }, (_, index) => (
                        <TouchableOpacity
                          key={`modal-day-${index}`}
                          style={[
                            styles.modalDayTab,
                            selectedNewDay === index && styles.modalDayTabActive
                          ]}
                          onPress={() => setSelectedNewDay(index)}
                        >
                          <Text style={[
                            styles.modalDayTabText,
                            selectedNewDay === index && styles.modalDayTabTextActive
                          ]}>
                            Day {index + 1}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CBC71" />
                  <Text style={styles.loadingText}>Loading activity details...</Text>
                </View>
              )}

              {/* Time Selection */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Select New Time</Text>
                <View style={styles.timePickerContainer}>
                  {/* Hour Input */}
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={[
                        styles.timeInput, 
                        styles.timeInputActive,
                        !hourInputValid && styles.timeInputError
                      ]}
                      value={hourInput}
                      onChangeText={(text) => {
                        setHourInput(text);
                        if (text === '') {
                          setHourInputValid(false);
                        } else {
                          const hour = parseInt(text) || 0;
                          if (hour >= 0 && hour <= 23) {
                            setHourInputValid(true);
                            // Update the combined time string
                            setSelectedNewTime(`${hour.toString().padStart(2, '0')}:${minuteInput}`);
                          } else {
                            setHourInputValid(false);
                          }
                        }
                      }}
                      onBlur={() => {
                        // Ensure proper formatting when user finishes typing
                        const hour = parseInt(hourInput) || 0;
                        if (hour >= 0 && hour <= 23) {
                          const formattedHour = hour.toString().padStart(2, '0');
                          setHourInput(formattedHour);
                          setSelectedNewTime(`${formattedHour}:${minuteInput}`);
                          setHourInputValid(true);
                        } else {
                          setHourInputValid(false);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#8E8E93"
                      textAlign="center"
                      selectTextOnFocus={true}
                    />
                    <Text style={styles.timeInputLabel}>Hour</Text>
                  </View>

                  {/* Separator */}
                  <Text style={styles.timeSeparator}>:</Text>

                  {/* Minute Input */}
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={[
                        styles.timeInput,
                        !minuteInputValid && styles.timeInputError
                      ]}
                      value={minuteInput}
                      onChangeText={(text) => {
                        setMinuteInput(text);
                        if (text === '') {
                          setMinuteInputValid(false);
                        } else {
                          const minute = parseInt(text) || 0;
                          if (minute >= 0 && minute <= 59) {
                            setMinuteInputValid(true);
                            // Update the combined time string
                            setSelectedNewTime(`${hourInput}:${minute.toString().padStart(2, '0')}`);
                          } else {
                            setMinuteInputValid(false);
                          }
                        }
                      }}
                      onBlur={() => {
                        // Ensure proper formatting when user finishes typing
                        const minute = parseInt(minuteInput) || 0;
                        if (minute >= 0 && minute <= 59) {
                          const formattedMinute = minute.toString().padStart(2, '0');
                          setMinuteInput(formattedMinute);
                          setSelectedNewTime(`${hourInput}:${formattedMinute}`);
                          setMinuteInputValid(true);
                        } else {
                          setMinuteInputValid(false);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#8E8E93"
                      textAlign="center"
                      selectTextOnFocus={true}
                    />
                    <Text style={styles.timeInputLabel}>Minute</Text>
                  </View>

                  {/* AM/PM Selector */}
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.ampmButton,
                        parseInt(hourInput) < 12 && styles.ampmButtonActive
                      ]}
                      onPress={() => {
                        const hour = parseInt(hourInput);
                        const minute = minuteInput;
                        if (hour >= 12) {
                          const newHour = hour === 12 ? 12 : hour - 12;
                          const newHourStr = newHour.toString().padStart(2, '0');
                          setHourInput(newHourStr);
                          setSelectedNewTime(`${newHourStr}:${minute}`);
                        }
                      }}
                    >
                      <Text style={[
                        styles.ampmButtonText,
                        parseInt(hourInput) < 12 && styles.ampmButtonTextActive
                      ]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.ampmButton,
                        parseInt(hourInput) >= 12 && styles.ampmButtonActive
                      ]}
                      onPress={() => {
                        const hour = parseInt(hourInput);
                        const minute = minuteInput;
                        if (hour < 12) {
                          const newHour = hour === 0 ? 12 : hour + 12;
                          const newHourStr = newHour.toString().padStart(2, '0');
                          setHourInput(newHourStr);
                          setSelectedNewTime(`${newHourStr}:${minute}`);
                        }
                      }}
                    >
                      <Text style={[
                        styles.ampmButtonText,
                        parseInt(hourInput) >= 12 && styles.ampmButtonTextActive
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Helper Text */}
                <View style={styles.timeHelperText}>
                  <Text style={styles.helperText}>
                    Hour: 0-23 • Minute: 0-59
                  </Text>
                  {!validateTimeFormat(hourInput, minuteInput) && (
                    <Text style={styles.errorHelperText}>
                      Please enter valid time values
                    </Text>
                  )}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  (isUpdatingTime || !validateTimeFormat(hourInput, minuteInput)) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveTimeDayChanges}
                disabled={isUpdatingTime || !validateTimeFormat(hourInput, minuteInput)}
              >
                {isUpdatingTime ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {!validateTimeFormat(hourInput, minuteInput) ? 'Invalid Time' : 'Save Changes'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddActivityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeAddActivityModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addActivityModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Activity</Text>
              <TouchableOpacity onPress={closeAddActivityModal} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Time Selection */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Activity Time</Text>
                <View style={styles.timePickerContainer}>
                  {/* Hour Input */}
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={[
                        styles.timeInput, 
                        styles.timeInputActive,
                        !newActivityHourInputValid && styles.timeInputError
                      ]}
                      value={newActivityHourInput}
                      onChangeText={(text) => {
                        setNewActivityHourInput(text);
                        if (text === '') {
                          setNewActivityHourInputValid(false);
                        } else {
                          const hour = parseInt(text) || 0;
                          if (hour >= 0 && hour <= 23) {
                            setNewActivityHourInputValid(true);
                          } else {
                            setNewActivityHourInputValid(false);
                          }
                        }
                      }}
                      onBlur={() => {
                        const hour = parseInt(newActivityHourInput) || 0;
                        if (hour >= 0 && hour <= 23) {
                          const formattedHour = hour.toString().padStart(2, '0');
                          setNewActivityHourInput(formattedHour);
                          setNewActivityHourInputValid(true);
                        } else {
                          setNewActivityHourInputValid(false);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#8E8E93"
                      textAlign="center"
                      selectTextOnFocus={true}
                    />
                    <Text style={styles.timeInputLabel}>Hour</Text>
                  </View>

                  {/* Separator */}
                  <Text style={styles.timeSeparator}>:</Text>

                  {/* Minute Input */}
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={[
                        styles.timeInput,
                        !newActivityMinuteInputValid && styles.timeInputError
                      ]}
                      value={newActivityMinuteInput}
                      onChangeText={(text) => {
                        setNewActivityMinuteInput(text);
                        if (text === '') {
                          setNewActivityMinuteInputValid(false);
                        } else {
                          const minute = parseInt(text) || 0;
                          if (minute >= 0 && minute <= 59) {
                            setNewActivityMinuteInputValid(true);
                          } else {
                            setNewActivityMinuteInputValid(false);
                          }
                        }
                      }}
                      onBlur={() => {
                        const minute = parseInt(newActivityMinuteInput) || 0;
                        if (minute >= 0 && minute <= 59) {
                          const formattedMinute = minute.toString().padStart(2, '0');
                          setNewActivityMinuteInput(formattedMinute);
                          setNewActivityMinuteInputValid(true);
                        } else {
                          setNewActivityMinuteInputValid(false);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#8E8E93"
                      textAlign="center"
                      selectTextOnFocus={true}
                    />
                    <Text style={styles.timeInputLabel}>Minute</Text>
                  </View>

                  {/* AM/PM Selector */}
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.ampmButton,
                        parseInt(newActivityHourInput) < 12 && styles.ampmButtonActive
                      ]}
                      onPress={() => {
                        const hour = parseInt(newActivityHourInput);
                        if (hour >= 12) {
                          const newHour = hour === 12 ? 12 : hour - 12;
                          const newHourStr = newHour.toString().padStart(2, '0');
                          setNewActivityHourInput(newHourStr);
                        }
                      }}
                    >
                      <Text style={[
                        styles.ampmButtonText,
                        parseInt(newActivityHourInput) < 12 && styles.ampmButtonTextActive
                      ]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.ampmButton,
                        parseInt(newActivityHourInput) >= 12 && styles.ampmButtonActive
                      ]}
                      onPress={() => {
                        const hour = parseInt(newActivityHourInput);
                        if (hour < 12) {
                          const newHour = hour === 0 ? 12 : hour + 12;
                          const newHourStr = newHour.toString().padStart(2, '0');
                          setNewActivityHourInput(newHourStr);
                        }
                      }}
                    >
                      <Text style={[
                        styles.ampmButtonText,
                        parseInt(newActivityHourInput) >= 12 && styles.ampmButtonTextActive
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Helper Text */}
                <View style={styles.timeHelperText}>
                  <Text style={styles.helperText}>
                    Hour: 0-23 • Minute: 0-59
                  </Text>
                  {!validateTimeFormat(newActivityHourInput, newActivityMinuteInput) && (
                    <Text style={styles.errorHelperText}>
                      Please enter valid time values
                    </Text>
                  )}
                </View>
              </View>

              {/* Day Selection */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Select Day</Text>
                <View style={styles.daySelectorContainer}>
                  {Array.from({ length: planningData.tripDays }, (_, index) => (
                    <TouchableOpacity
                      key={`add-activity-day-${index}`}
                      style={[
                        styles.modalDayTab,
                        selectedDay === index && styles.modalDayTabActive
                      ]}
                      onPress={() => setSelectedDay(index)}
                    >
                      <Text style={[
                        styles.modalDayTabText,
                        selectedDay === index && styles.modalDayTabTextActive
                      ]}>
                        Day {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Form */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Activity Name</Text>
                <TextInput
                  style={styles.input}
                  value={newActivity.activity}
                  onChangeText={(text) => setNewActivity({ ...newActivity, activity: text })}
                  placeholder="Enter activity name"
                />
              </View>

              {/* Location Search */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.locationSearchContainer}>
                  <TextInput
                    style={styles.locationInput}
                    value={locationSearchQuery}
                    onChangeText={(text) => {
                      setLocationSearchQuery(text);
                      if (text.trim()) {
                        searchLocation(text);
                      } else {
                        setShowLocationResults(false);
                      }
                    }}
                    placeholder="Search for location"
                  />
                  {isSearchingLocation && (
                    <ActivityIndicator size="small" color="#4CBC71" style={styles.searchLoader} />
                  )}
                </View>
                
                {/* Location Search Results */}
                {showLocationResults && locationSearchResults.length > 0 && (
                  <View style={styles.locationResultsContainer}>
                    <ScrollView 
                      style={styles.locationResultsScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {locationSearchResults.map((place, index) => (
                        <TouchableOpacity
                          key={`place-${index}`}
                          style={styles.locationResultItem}
                          onPress={() => selectLocation(place)}
                        >
                          <MaterialIcons name="place" size={16} color="#4CBC71" />
                          <View style={styles.locationResultText}>
                            <Text style={styles.locationResultName}>{place.name}</Text>
                            {place.address && (
                              <Text style={styles.locationResultAddress}>{place.address}</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cost</Text>
                <TextInput
                  style={styles.input}
                  value={newActivity.cost}
                  onChangeText={(text) => setNewActivity({ ...newActivity, cost: text })}
                  placeholder="Enter cost"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={newActivity.notes}
                  onChangeText={(text) => setNewActivity({ ...newActivity, notes: text })}
                  placeholder="Enter notes (optional)"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
            </ScrollView>

            {/* Save Button - Fixed at bottom */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  (isAddingActivity || !validateTimeFormat(newActivityHourInput, newActivityMinuteInput)) && styles.saveButtonDisabled
                ]}
                onPress={handleAddActivity}
                disabled={isAddingActivity || !validateTimeFormat(newActivityHourInput, newActivityMinuteInput)}
              >
                {isAddingActivity ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="add" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {!validateTimeFormat(newActivityHourInput, newActivityMinuteInput) ? 'Invalid Time' : 'Add Activity'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modern Alert - Moved to end to ensure highest z-index */}
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
    </TextErrorBoundary>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  dayTabActive: {
    backgroundColor: '#FF6B9D',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayTabTextActive: {
    color: '#fff',
  },
  dayContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 18,
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
  pinnedActivityCard: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F5',
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
  fallbackActivityHeader: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
  },
  pinnedActivityHeader: {
    backgroundColor: '#FFF5F5', // Light pink background for pinned activities
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
    padding: 18,
    marginHorizontal: 18,
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
    paddingHorizontal: 18,
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
    zIndex: 9999,
  },
  customAlert: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonDestructive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B9D',
    borderWidth: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  activityOptionsModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 60,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginLeft: 12,
    textAlign: 'left',
  },
  modalOptionDestructive: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    backgroundColor: '#FFF5F5',
  },
  modalOptionTextDestructive: {
    color: '#FF3B30',
  },
  pinnedBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  currentActivityInfo: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currentActivityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  currentActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectionSection: {
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  daySelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  modalDayTab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    flex: 1,
    minWidth: 0,
  },
  modalDayTabActive: {
    backgroundColor: '#FF6B9D',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  modalDayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    flexShrink: 1,
  },
  modalDayTabTextActive: {
    color: '#fff',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  timeInputGroup: {
    alignItems: 'center',
    flex: 1,
  },
  timeInput: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  timeInputActive: {
    borderColor: '#FF6B9D',
    borderWidth: 3,
  },
  timeInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginHorizontal: 20,
  },
  ampmContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  ampmButton: {
    width: 50,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ampmButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  ampmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  ampmButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    gap: 12,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  timeInputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  timeHelperText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  errorHelperText: {
    fontSize: 12,
    color: '#F44336',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1C1C1E',
  },
  addActivityButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addActivityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  addActivityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addActivityModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  locationSearchContainer: {
    position: 'relative',
  },
  locationInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1C1C1E',
    paddingRight: 40, // Add space for the icon
  },
  searchLoader: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }], // Center vertically
  },
  locationResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 4,
    zIndex: 1000,
    maxHeight: 200,
  },
  locationResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  locationResultAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  locationResultText: {
    flex: 1,
    marginLeft: 8,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  locationResultsScroll: {
    maxHeight: 200,
  },
});

export default PlanningDetailScreen;
