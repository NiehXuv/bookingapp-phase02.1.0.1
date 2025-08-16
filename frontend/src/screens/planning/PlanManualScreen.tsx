import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Alert, Modal, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { googlePlacesService } from '../../services/googlePlacesService';
import { tripAdvisorService } from '../../services/tripadvisorService';

const { width, height } = Dimensions.get('window');

interface Activity {
  id: string;
  time: string;
  activity: string;
  placeId?: string;
  placeName?: string;
  placeType?: string;
  coordinates?: { lat: number; lng: number };
}

interface Meal {
  id: string;
  type: 'lunch' | 'dinner';
  placeId?: string;
  placeName?: string;
  placeType?: string;
  coordinates?: { lat: number; lng: number };
}

interface DayPlan {
  id: string;
  dayNumber: number;
  morning: Activity[];
  lunch: Meal;
  afternoon: Activity[];
  dinner: Meal;
  evening: Activity[];
  optional: Activity[];
}

const PlanManualScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner' | null>(null);
  const [activeSearchCard, setActiveSearchCard] = useState<string>(''); // Track which card is showing search
  // Individual loading states for each activity
  const [searchLoadingStates, setSearchLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedActivityForTime, setSelectedActivityForTime] = useState<Activity | null>(null);

  // Time options for dropdown (AM/PM only)
  const timeOptions = ['AM', 'PM'];

  // Helper function to format time input
  const formatTimeInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/[^0-9]/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length === 1) return numbers;
    if (numbers.length === 2) return numbers;
    if (numbers.length === 3) return numbers.slice(0, 2) + ':' + numbers.slice(2);
    if (numbers.length === 4) return numbers.slice(0, 2) + ':' + numbers.slice(2);
    
    // Limit to 4 digits
    return numbers.slice(0, 2) + ':' + numbers.slice(2, 4);
  };

  // Helper function to validate time
  const isValidTime = (time: string): boolean => {
    const timeParts = time.split(':');
    if (timeParts.length !== 2) return false;
    
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  // Initialize first day plan
  useEffect(() => {
    if (dayPlans.length === 0) {
      const initialDayPlan: DayPlan = {
        id: 'day1',
        dayNumber: 1,
        morning: [],
        lunch: { id: 'lunch1', type: 'lunch' },
        afternoon: [],
        dinner: { id: 'dinner1', type: 'dinner' },
        evening: [],
        optional: []
      };
      setDayPlans([initialDayPlan]);
    }
  }, []);

  const handleAddActivity = (timeSlot: 'morning' | 'afternoon' | 'evening' | 'optional') => {
    const newActivity: Activity = {
      id: `${timeSlot}_${Date.now()}`,
      time: '',
      activity: ''
    };

    setDayPlans(prev => prev.map(day => 
      day.dayNumber === currentDay 
        ? { ...day, [timeSlot]: [...day[timeSlot], newActivity] }
        : day
    ));
  };

  const handleUpdateActivity = (activityId: string, field: 'time' | 'activity', value: string) => {
    setDayPlans(prev => prev.map(day => 
      day.dayNumber === currentDay 
        ? {
            ...day,
            morning: day.morning.map(act => 
              act.id === activityId ? { ...act, [field]: value } : act
            ),
            afternoon: day.afternoon.map(act => 
              act.id === activityId ? { ...act, [field]: value } : act
            ),
            evening: day.evening.map(act => 
              act.id === activityId ? { ...act, [field]: value } : act
            ),
            optional: day.optional.map(act => 
              act.id === activityId ? { ...act, [field]: value } : act
            )
          }
        : day
    ));
  };

  const handleRemoveActivity = (timeSlot: 'morning' | 'afternoon' | 'evening' | 'optional', activityId: string) => {
    setDayPlans(prev => prev.map(day => 
      day.dayNumber === currentDay 
        ? {
            ...day,
            [timeSlot]: (day as any)[timeSlot].filter((act: Activity) => act.id !== activityId)
          }
        : day
    ));
  };

  const handleSearchPlaces = async (query: string, type: 'activity' | 'restaurant' | 'place', cardType: string, activityId?: string) => {
    if (!query.trim()) return;

    // Set loading state for specific activity
    if (activityId) {
      setSearchLoadingStates(prev => ({ ...prev, [activityId]: true }));
    }

    try {
      let searchResults: any[] = [];
      
      if (type === 'restaurant') {
        const places = await googlePlacesService.searchPlaces(query, 'Hanoi, Vietnam', 5000);
        searchResults = places.map(place => ({
          id: place.id,
          name: place.name,
          address: place.address,
          rating: place.rating,
          photos: place.photos,
          types: place.types
        }));
      } else {
        const places = await googlePlacesService.searchPlaces(query, 'Hanoi, Vietnam', 5000);
        searchResults = places.map(place => ({
          id: place.id,
          name: place.name,
          address: place.address,
          rating: place.rating,
          photos: place.photos,
          types: place.types
        }));
      }

      setSearchResults(searchResults);
      setActiveSearchCard(cardType);
      setSearchQuery(query);
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'Failed to search places. Please try again.');
    } finally {
      // Clear loading state for specific activity
      if (activityId) {
        setSearchLoadingStates(prev => ({ ...prev, [activityId]: false }));
      }
    }
  };

  const handleSelectPlace = (place: any, timeSlot: string) => {
    // Check if this is a meal type (lunch or dinner)
    if (timeSlot.startsWith('lunch_') || timeSlot.startsWith('dinner_')) {
      const [mealType, dayIndexStr] = timeSlot.split('_');
      const dayIndex = parseInt(dayIndexStr);
      
      // Update the meal for the specific day
      setDayPlans(prev => prev.map((day, index) => {
        if (index === dayIndex) {
          return {
            ...day,
            [mealType]: {
              ...day[mealType as 'lunch' | 'dinner'],
              placeId: place.id,
              placeName: place.name,
              placeType: place.type,
              coordinates: place.coordinates
            }
          };
        }
        return day;
      }));
    } else {
      // Handle activity time slots - find the current day and update the specific activity
      setDayPlans(prev => prev.map(day => {
        if (day.dayNumber === currentDay) {
          // Find which time slot this activity belongs to
          const timeSlots: ('morning' | 'afternoon' | 'evening' | 'optional')[] = ['morning', 'afternoon', 'evening', 'optional'];
          
          for (const slot of timeSlots) {
            const activityIndex = day[slot].findIndex(activity => activity.id === timeSlot);
            if (activityIndex !== -1) {
              // Update the specific activity
              const updatedActivities = [...day[slot]];
              updatedActivities[activityIndex] = {
                ...updatedActivities[activityIndex],
                placeId: place.id,
                placeName: place.name,
                placeType: place.type,
                coordinates: place.coordinates
              };
              
              return {
                ...day,
                [slot]: updatedActivities
              };
            }
          }
        }
        return day;
      }));
    }

    // Close search results
    setActiveSearchCard('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCloseSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    // Don't clear selectedTimeSlot, selectedMealType, or activeSearchCard
    // This keeps the search input visible for continued searching
  };

  const handleCloseSearchCompletely = () => {
    setSearchResults([]);
    setSearchQuery('');
    setSelectedTimeSlot('');
    setSelectedMealType(null);
    setActiveSearchCard('');
  };

  const handleTimeSelect = (ampm: string) => {
    if (selectedActivityForTime) {
      const currentTime = selectedActivityForTime.time;
      const timePart = currentTime ? currentTime.split(' ')[0] : '';
      
      // If no time is set, default to 12:00
      let newTime = '12:00';
      if (timePart && timePart.trim()) {
        // Use the helper function to ensure proper format
        newTime = formatTimeInput(timePart);
        if (!newTime) {
          newTime = '12:00';
        }
      }
      
      // Ensure the time has proper format with validation
      if (!newTime.includes(':')) {
        if (newTime.length === 1) {
          newTime = '0' + newTime + ':00';
        } else if (newTime.length === 2) {
          newTime = newTime + ':00';
        } else if (newTime.length === 3) {
          newTime = newTime.slice(0, 1) + ':' + newTime.slice(1) + '0';
        } else if (newTime.length === 4) {
          newTime = newTime.slice(0, 2) + ':' + newTime.slice(2);
        }
      }
      
      // Validate the final time
      if (isValidTime(newTime)) {
        handleUpdateActivity(selectedActivityForTime.id, 'time', newTime + ' ' + ampm);
      } else {
        // If invalid, use a default time
        handleUpdateActivity(selectedActivityForTime.id, 'time', '12:00 ' + ampm);
      }
      
      setSelectedActivityForTime(null);
    }
    setShowTimeModal(false);
  };

  const handleAddDay = () => {
    const newDayNumber = dayPlans.length + 1;
    const newDay: DayPlan = {
      id: `day${newDayNumber}`,
      dayNumber: newDayNumber,
      morning: [],
      lunch: { id: `lunch${newDayNumber}`, type: 'lunch' },
      afternoon: [],
      dinner: { id: `dinner${newDayNumber}`, type: 'dinner' },
      evening: [],
      optional: []
    };
    setDayPlans([...dayPlans, newDay]);
    setCurrentDay(newDayNumber);
  };

  const handleRemoveLastDay = () => {
    if (dayPlans.length > 1) {
      const newDayPlans = dayPlans.slice(0, -1);
      setDayPlans(newDayPlans);
      // If we removed the current day, go to the last remaining day
      if (currentDay > newDayPlans.length) {
        setCurrentDay(newDayPlans.length);
      }
    }
  };

  const handleSavePlan = () => {
    // TODO: Save plan to storage/database
    console.log('Saving manual plan:', dayPlans);
    Alert.alert('Success', 'Your manual plan has been saved!');
    navigation.goBack();
  };

  const renderTimeSlot = (title: string, timeSlot: 'morning' | 'afternoon' | 'evening' | 'optional', activities: Activity[]) => (
    <View style={styles.timeSlotContainer}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.timeSlotTitle}>{title}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddActivity(timeSlot)}
        >
          <Feather name="plus" size={18} color="#4CBC71" />
        </TouchableOpacity>
      </View>
      
      {activities.map((activity, index) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={styles.activityInputs}>
            <View style={styles.timeInputSection}>
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={[
                    styles.timeInput, 
                    activity.time && activity.time.split(' ')[0] && !isValidTime(activity.time.split(' ')[0]) && styles.timeInputError
                  ]}
                  placeholder="hh:mm"
                  value={activity.time ? activity.time.split(' ')[0] : ''}
                  onChangeText={(value) => {
                    // Format the time input using helper function
                    const formatted = formatTimeInput(value);
                    
                    // Update the activity with formatted time
                    if (formatted) {
                      const currentAMPM = activity.time ? activity.time.split(' ')[1] || 'AM' : 'AM';
                      handleUpdateActivity(activity.id, 'time', formatted + ' ' + currentAMPM);
                    } else {
                      // Clear the time if input is empty
                      const currentAMPM = activity.time ? activity.time.split(' ')[1] || 'AM' : 'AM';
                      handleUpdateActivity(activity.id, 'time', currentAMPM);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity 
                  style={styles.ampmPill}
                  onPress={() => {
                    setSelectedActivityForTime(activity);
                    setShowTimeModal(true);
                  }}
                >
                  <Text style={styles.ampmText}>
                    {activity.time && activity.time.split(' ')[1] ? activity.time.split(' ')[1] : 'AM'}
                  </Text>
                  <Feather name="chevron-down" size={10} color="#4CBC71" />
                </TouchableOpacity>
              </View>
              {activity.time && activity.time.split(' ')[0] && !isValidTime(activity.time.split(' ')[0]) && (
                <Text style={styles.timeInputHint}>Invalid time format. Use hh:mm (e.g., 09:30)</Text>
              )}
            </View>
            <TextInput
              style={styles.activityInput}
              placeholder="Activity"
              value={activity.activity}
              onChangeText={(value) => handleUpdateActivity(activity.id, 'activity', value)}
            />
          </View>
          
          <View style={styles.activityActions}>
            <TouchableOpacity 
              style={[styles.searchButton, searchLoadingStates[activity.id] && styles.searchButtonLoading]}
              onPress={() => {
                if (!searchLoadingStates[activity.id]) {
                  setSelectedTimeSlot(activity.id);
                  setSearchQuery(activity.activity || '');
                  if (activity.activity) {
                    // Search for places without restrictions
                    handleSearchPlaces(activity.activity, 'activity', activity.id);
                  }
                }
              }}
              disabled={searchLoadingStates[activity.id]}
            >
              {searchLoadingStates[activity.id] ? (
                <ActivityIndicator size="small" color="#FF6B9D" />
              ) : (
                <Feather name="search" size={14} color="#FF6B9D" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveActivity(timeSlot, activity.id)}
            >
              <Feather name="trash-2" size={14} color="#FF6B9D" />
            </TouchableOpacity>
          </View>
          
          {activity.placeName && (
            <View style={styles.placeInfo}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#4CBC71" />
              <Text style={styles.placeName}>{activity.placeName}</Text>
            </View>
          )}

          {/* Search Results for this specific activity */}
          {activeSearchCard === activity.id && selectedTimeSlot === activity.id && (
            <View style={styles.inlineSearchResults}>
              {/* Search Input Header */}
              <View style={styles.searchInputHeader}>
                <Text style={styles.searchInputTitle}>Search Places</Text>
                <TouchableOpacity onPress={handleCloseSearchCompletely} style={styles.searchCloseButton}>
                  <Feather name="x" size={16} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={[styles.searchInputContainer, searchLoadingStates[activity.id] && styles.searchInputContainerLoading]}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchLoadingStates[activity.id] ? "Searching..." : "Search for places..."}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => {
                    if (!searchLoadingStates[activity.id] && searchQuery.trim()) {
                      handleSearchPlaces(searchQuery, 'activity', activity.id);
                    }
                  }}
                  editable={!searchLoadingStates[activity.id]}
                />
                <TouchableOpacity 
                  style={[styles.searchSubmitButton, searchLoadingStates[activity.id] && styles.searchSubmitButtonLoading]}
                  onPress={() => {
                    if (!searchLoadingStates[activity.id] && searchQuery.trim()) {
                      handleSearchPlaces(searchQuery, 'activity', activity.id);
                    }
                  }}
                  disabled={searchLoadingStates[activity.id]}
                >
                  {searchLoadingStates[activity.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="search" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <>
                  <View style={styles.inlineSearchHeader}>
                    <Text style={styles.inlineSearchTitle}>Search Results</Text>
                    <TouchableOpacity onPress={handleCloseSearchCompletely} style={styles.closeButton}>
                      <Feather name="x" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  {searchResults.map((place, index) => (
                    <TouchableOpacity
                      key={`${place.id}_${index}`}
                      style={styles.inlineSearchResultItem}
                      onPress={() => handleSelectPlace(place, activity.id)}
                    >
                      <View style={styles.inlineSearchResultImageContainer}>
                        {place.photos && place.photos.length > 0 ? (
                          <Image 
                            source={{ uri: place.photos[0] }} 
                            style={styles.inlineSearchResultImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.inlineSearchResultImagePlaceholder}>
                            <MaterialCommunityIcons name="image" size={20} color="#C7C7CC" />
                          </View>
                        )}
                      </View>
                      <View style={styles.inlineSearchResultContent}>
                        <Text style={styles.inlineSearchResultName}>{place.name}</Text>
                        <Text style={styles.inlineSearchResultType}>{place.source} • {place.type || place.placeType}</Text>
                        {place.address && (
                          <Text style={styles.inlineSearchResultAddress}>{place.address}</Text>
                        )}
                      </View>
                      <Feather name="chevron-right" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* No Results Message */}
              {!searchLoadingStates[activity.id] && searchQuery && searchResults.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No places found for "{searchQuery}"</Text>
                  <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                </View>
              )}

              {/* Loading State */}
              {searchLoadingStates[activity.id] && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FF6B9D" style={styles.loadingSpinner} />
                  <Text style={styles.loadingText}>Searching places...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderMeal = (type: 'lunch' | 'dinner', meal: Meal) => {
    const dayIndex = dayPlans.findIndex(day => day.dayNumber === currentDay);
    return (
      <View style={styles.mealContainer}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
          <TouchableOpacity 
            style={[styles.mealSearchButton, searchLoadingStates[`${type}_${dayIndex}`] && styles.searchButtonLoading]}
            onPress={() => {
              if (!searchLoadingStates[`${type}_${dayIndex}`]) {
                setSelectedMealType(type);
                setSearchQuery('');
                handleSearchPlaces('restaurant', 'restaurant', `${type}_${dayIndex}`, `${type}_${dayIndex}`);
              }
            }}
            disabled={searchLoadingStates[`${type}_${dayIndex}`]}
          >
            {searchLoadingStates[`${type}_${dayIndex}`] ? (
              <ActivityIndicator size="small" color="#FF6B9D" />
            ) : (
              <>
                <Feather name="search" size={16} color="#FF6B9D" />
                <Text style={styles.mealSearchText}>Find</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {meal.placeName ? (
          <View style={styles.mealPlaceInfo}>
            <MaterialCommunityIcons name="food-fork-drink" size={14} color="#FF6B9D" />
            <Text style={styles.mealPlaceName}>{meal.placeName}</Text>
          </View>
        ) : (
          <Text style={styles.mealHint}>Find places for {type}</Text>
        )}

        {/* Search Results for this meal */}
        {activeSearchCard === `${type}_${dayIndex}` && (
          <View style={styles.inlineSearchResults}>
            {/* Search Input Header */}
            <View style={styles.searchInputHeader}>
              <Text style={styles.searchInputTitle}>Search Restaurants</Text>
              <TouchableOpacity onPress={handleCloseSearchCompletely} style={styles.searchCloseButton}>
                <Feather name="x" size={16} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchInputContainer, searchLoadingStates[`${type}_${dayIndex}`] && styles.searchInputContainerLoading]}>
              <TextInput
                style={styles.searchInput}
                placeholder={searchLoadingStates[`${type}_${dayIndex}`] ? "Searching..." : "Search for restaurants..."}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (!searchLoadingStates[`${type}_${dayIndex}`] && searchQuery.trim()) {
                    // Back to restaurant type for better food results
                    handleSearchPlaces(searchQuery.trim(), 'restaurant', `${type}_${dayIndex}`);
                  }
                }}
                editable={!searchLoadingStates[`${type}_${dayIndex}`]}
              />
              <TouchableOpacity 
                style={[styles.searchSubmitButton, searchLoadingStates[`${type}_${dayIndex}`] && styles.searchSubmitButtonLoading]}
                onPress={() => {
                  if (!searchLoadingStates[`${type}_${dayIndex}`] && searchQuery.trim()) {
                    // Back to restaurant type for better food results
                    handleSearchPlaces(searchQuery.trim(), 'restaurant', `${type}_${dayIndex}`);
                  }
                }}
                disabled={searchLoadingStates[`${type}_${dayIndex}`]}
              >
                {searchLoadingStates[`${type}_${dayIndex}`] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="search" size={14} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <>
                <View style={styles.inlineSearchHeader}>
                  <Text style={styles.inlineSearchTitle}>Search Results</Text>
                  <TouchableOpacity onPress={handleCloseSearchCompletely} style={styles.closeButton}>
                    <Feather name="x" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                {searchResults.map((place, index) => (
                  <TouchableOpacity
                    key={`${place.id}_${index}`}
                    style={styles.inlineSearchResultItem}
                    onPress={() => handleSelectPlace(place, `${type}_${dayIndex}`)}
                  >
                    <View style={styles.inlineSearchResultImageContainer}>
                      {place.photos && place.photos.length > 0 ? (
                        <Image 
                          source={{ uri: place.photos[0] }} 
                          style={styles.inlineSearchResultImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.inlineSearchResultImagePlaceholder}>
                          <MaterialCommunityIcons name="image" size={20} color="#C7C7CC" />
                        </View>
                      )}
                    </View>
                    <View style={styles.inlineSearchResultContent}>
                      <Text style={styles.inlineSearchResultName}>{place.name}</Text>
                      <Text style={styles.inlineSearchResultType}>{place.source} • {place.type || place.placeType}</Text>
                      {place.address && (
                        <Text style={styles.inlineSearchResultAddress}>{place.address}</Text>
                      )}
                    </View>
                    <Feather name="chevron-right" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* No Results Message */}
            {!searchLoadingStates[`${type}_${dayIndex}`] && searchQuery && searchResults.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No restaurants found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            )}

            {/* Loading State */}
            {searchLoadingStates[`${type}_${dayIndex}`] && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF6B9D" style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Searching restaurants...</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const currentDayPlan = dayPlans.find(day => day.dayNumber === currentDay);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manual Trip Planning</Text>
            <Text style={styles.headerSubtitle}>Create your perfect itinerary</Text>
          </View>
        </View>

        {/* Day Navigation */}
        <View style={styles.dayNavigation}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayTabsContainer}
            scrollEventThrottle={16}
          >
            {dayPlans.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayTab, currentDay === day.dayNumber && styles.activeDayTab]}
                onPress={() => setCurrentDay(day.dayNumber)}
              >
                <Text style={[styles.dayTabText, currentDay === day.dayNumber && styles.activeDayTabText]}>
                  Day {day.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {dayPlans.length > 4 && (
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>{dayPlans.length} days</Text>
              <Feather name="chevrons-right" size={16} color="#8E8E93" />
            </View>
          )}
          
          <View style={styles.dayActionButtons}>
            <TouchableOpacity 
              style={styles.removeDayButton} 
              onPress={handleRemoveLastDay}
              disabled={dayPlans.length <= 1}
            >
              <Feather name="minus" size={16} color={dayPlans.length <= 1 ? "#C7C7CC" : "#FF6B9D"} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addDayButton} onPress={handleAddDay}>
              <Feather name="plus" size={16} color="#4CBC71" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Plan Content */}
        {currentDayPlan && (
          <View style={styles.dayPlanContent}>
            {renderTimeSlot('Morning', 'morning', currentDayPlan.morning)}
            {renderMeal('lunch', currentDayPlan.lunch)}
            {renderTimeSlot('Afternoon', 'afternoon', currentDayPlan.afternoon)}
            {renderMeal('dinner', currentDayPlan.dinner)}
            {renderTimeSlot('Evening', 'evening', currentDayPlan.evening)}
            {renderTimeSlot('Optional', 'optional', currentDayPlan.optional)}
          </View>
        )}

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSavePlan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CBC71', '#45A364']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeModalContainer}>
            <View style={styles.timeModalHeader}>
              <Text style={styles.timeModalTitle}>Select AM/PM</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeOptionsList}>
              {timeOptions.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timeOption}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={styles.timeOptionText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },

  addDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CBC71',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayPlanContent: {
    paddingHorizontal: 24,
  },
  timeSlotContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2E9',
  },
  activityItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activityInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  timeInputSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 120,
    marginRight: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    minWidth: 100,
    maxWidth: 120,
  },
  timeInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1C1E',
    textAlign: 'center',
    minWidth: 50,
  },
  timeInputError: {
    borderColor: '#FF6B9D',
    borderWidth: 1,
    backgroundColor: '#FFF0F5',
  },
  ampmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 50,
    justifyContent: 'center',
    gap: 4,
  },
  ampmText: {
    fontSize: 12,
    color: '#4CBC71',
    fontWeight: '600',
    
  },
  activityInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 44,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E9',
  },
  searchButtonLoading: {
    backgroundColor: '#FFE0E9',
    opacity: 0.7,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E9',
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2E9',
  },
  placeName: {
    fontSize: 13,
    color: '#4CBC71',
    fontWeight: '500',
    marginLeft: 6,
  },
  mealContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  mealSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0E9',
    gap: 6,
  },
  mealSearchButtonLoading: {
    backgroundColor: '#FFE0E9',
    opacity: 0.7,
  },
  mealSearchText: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  mealHint: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
  },
  mealPlaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  mealPlaceName: {
    fontSize: 14,
    color: '#4CBC71',
    fontWeight: '500',
    marginLeft: 8,
  },
  searchResultsContainer: {
    // This style is no longer used
  },
  searchIndicator: {
    // This style is no longer used
  },
  searchIndicatorText: {
    // This style is no longer used
  },
  resultsList: {
    // No specific styles needed, just for grouping
  },
  searchResultItem: {
    // This style is no longer used
  },
  searchResultContent: {
    // This style is no longer used
  },
  searchResultName: {
    // This style is no longer used
  },
  searchResultType: {
    // This style is no longer used
  },
  searchResultAddress: {
    // This style is no longer used
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingSpinner: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  loadingPulse: {
    opacity: 0.7,
  },
  saveButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    color: '#1C1C1E',
  },
  searchSubmitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  searchSubmitButtonLoading: {
    backgroundColor: '#FF6B9D',
    opacity: 0.7,
  },
  mealSearchSubmitButtonLoading: {
    backgroundColor: '#FF6B9D',
    opacity: 0.7,
  },
  inlineSearchResults: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  searchCloseButton: {
    padding: 4,
  },
  inlineSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inlineSearchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  inlineSearchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inlineSearchResultImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  inlineSearchResultImage: {
    width: '100%',
    height: '100%',
  },
  inlineSearchResultImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  inlineSearchResultContent: {
    flex: 1,
  },
  inlineSearchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  inlineSearchResultType: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  inlineSearchResultAddress: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  timeOptionsList: {
    maxHeight: 200,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchInputContainerLoading: {
    opacity: 0.7,
  },
  dayNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    gap: 16,
    minHeight: 60,
  },
  dayTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayActionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
    alignItems: 'center',
  },
  removeDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dayTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDayTab: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeDayTabText: {
    color: '#fff',
  },
  scrollIndicator: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollIndicatorText: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 6,
    fontWeight: '500',
  },
  timeInputHint: {
    fontSize: 11,
    color: '#FF6B9D',
    marginTop: 2,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default PlanManualScreen;
