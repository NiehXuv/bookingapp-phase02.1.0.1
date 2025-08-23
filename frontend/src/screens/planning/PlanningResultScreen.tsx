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

const PlanningResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, isTokenExpired, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [enhancedActivities, setEnhancedActivities] = useState<EnhancedActivity[][]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  
  // Get planning data and generated plan from navigation params
  const planningData = (route.params as any)?.planningData as PlanningData || {
    destinations: ['Hanoi'],
    tripDays: 7,
    companion: 'Solo',
    preferences: [],
    budget: 200,
  };

  const generatedPlan = (route.params as any)?.generatedPlan as GeneratedTripPlan;

  useEffect(() => {
    if (generatedPlan?.itinerary?.days) {
      enhanceActivitiesWithPlaces();
    }
  }, [generatedPlan]);

  const enhanceActivitiesWithPlaces = async () => {
    if (!generatedPlan?.itinerary?.days) return;
    
    setIsLoadingPlaces(true);
    try {
      const enhanced = await Promise.all(
        generatedPlan.itinerary.days.map(async (day, dayIndex) => {
          const enhancedDay = await Promise.all(
            day.activities.map(async (activity) => {
              try {
                // Search for the place using Google Places API
                const places = await googlePlacesService.searchPlaces(
                  activity.activity,
                  `${planningData.destinations.join(', ')}, Vietnam`,
                  50000
                );
                
                if (places.length > 0) {
                  const place = places[0]; // Get the best match
                  
                  // Ensure all required properties exist with default values
                  const enhancedPlace = {
                    ...place,
                    openingHours: Array.isArray(place.openingHours) ? place.openingHours : [],
                    photos: Array.isArray(place.photos) ? place.photos : [],
                    reviews: Array.isArray(place.reviews) ? place.reviews : [],
                    // Add missing properties that PlaceDetailScreen expects
                    amenities: [], // PlaceDetailScreen expects this but GooglePlace doesn't have it
                    tourOptions: [], // PlaceDetailScreen expects this but GooglePlace doesn't have it
                    // Only use properties that exist in GooglePlace interface
                    coordinates: place.coordinates || { lat: 0, lng: 0 }
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
    } catch (error) {
      console.error('Error enhancing activities:', error);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleSavePlan = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in to save your travel plan.');
      return;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      Alert.alert(
        'Session Expired', 
        'Your login session has expired. Please log in again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: async () => {
              await logout();
              (navigation as any).navigate('Login');
            }
          }
        ]
      );
      return;
    }

    setIsSaving(true);
    
    try {
      // Save the plan to the backend
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinations: planningData.destinations,
          tripDays: planningData.tripDays,
          companion: planningData.companion,
          preferences: planningData.preferences,
          budget: planningData.budget,
          // Include the AI-generated content
          aiGeneratedContent: {
            summary: generatedPlan.summary,
            itinerary: generatedPlan.itinerary,
            totalEstimatedCost: generatedPlan.totalEstimatedCost,
            travelTips: generatedPlan.travelTips,
            packingList: generatedPlan.packingList,
            emergencyContacts: generatedPlan.emergencyContacts
          },
          itinerary: generatedPlan.itinerary || { days: [] }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save travel plan');
      }

      const data = await response.json();
      setPlanId(data.planId);
      
      Alert.alert(
        'Plan Saved! 🎉',
        'Your travel plan has been saved successfully.',
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('Error saving plan:', error);
      Alert.alert(
        'Save Failed', 
        error.message || 'Failed to save travel plan. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getBackendBaseUrl = (): string => {
    return 'http://192.168.0.100:5000';
  };

  const handleActivityPress = (activity: EnhancedActivity) => {
    if (activity.placeDetails && activity.placeDetails.id && !activity.placeDetails.id.startsWith('fallback-') && !activity.placeDetails.id.startsWith('no-results-')) {
      // Navigate to PlaceDetailScreen with place data
      (navigation as any).navigate('PlaceDetailScreen', {
        placeId: activity.placeDetails.id,
        placeData: activity.placeDetails,
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

  const renderDaySelector = () => (
    <View style={styles.daySelector}>
      {generatedPlan?.itinerary?.days?.map((day, index) => (
        <TouchableOpacity
          key={index}
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
            {index === 0 ? 'Day 1' : `Day ${index + 1}`}
          </Text>
          <Text style={[
            styles.dayTabDate,
            selectedDay === index && styles.dayTabDateActive
          ]}>
            {day.date}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActivityCard = (activity: EnhancedActivity, index: number, dayIndex: number) => {
    const isFallbackActivity = activity.placeDetails?.id?.startsWith('fallback-') || activity.placeDetails?.id?.startsWith('no-results-');
    
    return (
      <View key={index} style={[styles.activityCard, isFallbackActivity && styles.fallbackActivityCard]}>
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

        {/* Travel Segment to Next Activity */}
        {index < enhancedActivities[dayIndex]?.length - 1 && (
          <View style={styles.travelSegment}>
            <View style={styles.travelIcons}>
              <MaterialIcons name="directions-walk" size={16} color="#4CBC71" />
              <MaterialIcons name="directions-car" size={16} color="#4CBC71" />
            </View>
            <Text style={styles.travelTime}>
              {calculateTravelTime(activity, enhancedActivities[dayIndex][index + 1])}
            </Text>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => handleGetDirections(enhancedActivities[dayIndex][index + 1])}
            >
              <Text style={styles.directionsText}>Direction →</Text>
            </TouchableOpacity>
          </View>
        )}
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
          {currentActivities.map((activity, index) => 
            renderActivityCard(activity, index, selectedDay)
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
                <Text style={styles.mealText}>🍽️ {currentDay.meals.lunch}</Text>
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
            
            {/* Travel Tips - Compact Display */}
            {generatedPlan.travelTips && generatedPlan.travelTips.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>💡 Quick Tips</Text>
                <View style={styles.tipsContainer}>
                  {generatedPlan.travelTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipText}>{tip}</Text>
              </View>
                  ))}
              </View>
            </View>
            )}
            
            {/* Packing List - Compact Display */}
            {generatedPlan.packingList && generatedPlan.packingList.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>🎒 Packing List</Text>
                <View style={styles.packingContainer}>
                  {generatedPlan.packingList.map((item, index) => (
                    <View key={index} style={styles.packingItem}>
                      <Text style={styles.packingText}>• {item}</Text>
              </View>
                  ))}
              </View>
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
          {/* Save Plan Note */}
          {!planId && (
            <View style={styles.saveNote}>
              <MaterialCommunityIcons name="information" size={20} color="#FF6B9D" />
              <Text style={styles.saveNoteText}>
                Don't forget to save your plan to access it later!
              </Text>
            </View>
          )}
          
          {/* Save Plan Button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleSavePlan}
            activeOpacity={0.8}
            disabled={isSaving || planId !== null}
          >
            {isSaving ? (
              <LinearGradient
                colors={['#4CBC71', '#45A364']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.primaryButtonText}>Saving...</Text>
              </LinearGradient>
            ) : planId ? (
              <LinearGradient
                colors={['#4CBC71', '#45A364']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>Plan Saved! 🎉</Text>
              </LinearGradient>
            ) : (
            <LinearGradient
              colors={['#4CBC71', '#45A364']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Save Plan</Text>
            </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Feather name="edit-3" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Feather name="share-2" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <MaterialCommunityIcons name="plus" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>New Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    backgroundColor: '#4CBC71',
  },
  backButton: {
    padding: 10,
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
    lineHeight: 22,
  },
  mapButton: {
    padding: 10,
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
  dayTabDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  dayTabDateActive: {
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
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E0E0E0',
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    marginTop: 12,
  },
  travelIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  travelTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  directionsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
  },
  directionsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#4CBC71',
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
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    fontWeight: '500',
  },
  packingItem: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  packingText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
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
  saveNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 350,
  },
  saveNoteText: {
    fontSize: 14,
    color: '#FF6B9D',
    marginLeft: 8,
    flexShrink: 1,
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
    gap: 8,
  },
  tipItem: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CBC71',
  },
  packingContainer: {
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
});

export default PlanningResultScreen;

