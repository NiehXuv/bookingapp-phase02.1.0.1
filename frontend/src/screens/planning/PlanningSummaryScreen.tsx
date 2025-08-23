import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import geminiService, { PlanningData } from '../../services/geminiService';

const { width } = Dimensions.get('window');

const PlanningSummaryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, isTokenExpired, logout } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get planning data from navigation params
  const planningData = (route.params as any)?.planningData as PlanningData || {
    destinations: ['Hanoi'],
    tripDays: 7,
    companion: 'Solo',
    preferences: [],
    budget: 200,
  };

  const getBackendBaseUrl = (): string => {
    return 'http://192.168.0.100:5000';
  };

  const handleEditPlan = () => {
    // Navigate back to PlanningFlow to edit the plan
    (navigation as any).navigate('PlanningFlow', { planningData });
  };

  const handleGeneratePlan = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in to generate a travel plan.');
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

    setIsGenerating(true);
    
    try {
      // Call Gemini API to generate travel plan
      const response = await geminiService.generateTripPlan(planningData, token);
      
      // Save the generated plan to backend
      const saveResponse = await fetch(`${getBackendBaseUrl()}/api/trip-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: response.generatedContent.planName || `Trip to ${planningData.destinations.join(', ')}`,
          destinations: planningData.destinations,
          tripDays: planningData.tripDays,
          companion: planningData.companion,
          preferences: planningData.preferences,
          budget: planningData.budget,
          status: "active",
          // Include the AI-generated content
          aiGeneratedContent: {
            summary: response.generatedContent.summary,
            itinerary: response.generatedContent.itinerary,
            totalEstimatedCost: response.generatedContent.totalEstimatedCost,
            travelTips: response.generatedContent.travelTips,
            packingList: response.generatedContent.packingList,
            emergencyContacts: response.generatedContent.emergencyContacts
          },
          itinerary: response.generatedContent.itinerary || { days: [] }
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save travel plan');
      }

      const saveData = await saveResponse.json();
      
      // Navigate to PlanningDetailScreen with the saved plan
      (navigation as any).navigate('PlanningDetail', { 
        planId: saveData.planId,
        planningData,
        generatedPlan: response.generatedContent,
      });
      
    } catch (error: any) {
      console.error('Error generating/saving plan:', error);
      
      // Handle token expiration error specifically
      if (error.message === 'Token expired.' || error.message.includes('Token expired')) {
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
      } else {
        Alert.alert(
          'Generation Failed', 
          error.message || 'Failed to generate travel plan. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPreferences = (preferences: any[]) => {
    if (!preferences || preferences.length === 0) {
      return 'No preferences selected';
    }
    
    // Our preferences are just a simple array of strings
    return preferences.join(' • ');
  };

  const formatBudget = (budget: number) => {
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(1)}M VND`;
    }
    return `${(budget / 1000).toFixed(0)}K VND`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.successIconContainer}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#4CBC71" />
          </View>
          <Text style={styles.headerTitle}>Planning Complete! 🎉</Text>
          <Text style={styles.headerSubtitle}>
            Travie has created your perfect trip itinerary
          </Text>
        </View>

        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Trip Summary</Text>
          
          {/* Destinations */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Destinations</Text>
            </View>
            <Text style={styles.sectionContent}>
              {planningData.destinations.join(', ')}
            </Text>
          </View>

          {/* Trip Duration */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar" size={24} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Duration</Text>
            </View>
            <Text style={styles.sectionContent}>
              {planningData.tripDays} days
            </Text>
          </View>

          {/* Travel Companions */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-group" size={24} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Travel Style</Text>
            </View>
            <Text style={styles.sectionContent}>
              {planningData.companion}
            </Text>
          </View>

          {/* Preferences */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="heart" size={24} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Your Preferences</Text>
            </View>
            <Text style={styles.sectionContent}>
              {formatPreferences(planningData.preferences)}
            </Text>
          </View>

          {/* Budget */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="wallet" size={24} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Budget</Text>
            </View>
            <Text style={styles.sectionContent}>
              {formatBudget(planningData.budget)} per person
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => (navigation as any).navigate('Main', { screen: 'Plan' })}
            activeOpacity={0.8}
            disabled={isGenerating}
          >
            <Feather name="x" size={20} color="#8E8E93" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPlan}
            activeOpacity={0.8}
            disabled={isGenerating}
          >
            <Feather name="edit-3" size={20} color="#8E8E93" />
            <Text style={styles.editButtonText}>Edit Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.generateButton}
            onPress={handleGeneratePlan}
            activeOpacity={0.8}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={['#4CBC71', '#45A364']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButtonGradient}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.generateButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="magic-staff" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Plan</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  sectionContent: {
    flex: 1,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'right',
  },
  actionButtonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  editButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlanningSummaryScreen;
