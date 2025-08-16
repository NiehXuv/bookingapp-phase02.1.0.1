import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PlanningData {
  destinations: string[];
  tripDays: number;
  companion: string;
  preferences: any[];
  budget: number;
}

const PlanningResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get planning data from navigation params
  const planningData = (route.params as any)?.planningData as PlanningData || {
    destinations: ['Hanoi'],
    tripDays: 7,
    companion: 'Solo',
    preferences: [],
    budget: 200,
  };

  const handleSavePlan = () => {
    // TODO: Save plan to database/storage
    console.log('Saving plan:', planningData);
    // Show success message and navigate back
    navigation.goBack();
  };

  const handleEditPlan = () => {
    // Navigate back to planning flow to edit
    console.log('Editing plan');
    (navigation as any).navigate('PlanningFlow', { planningData });
  };

  const handleSharePlan = () => {
    // TODO: Implement share functionality
    console.log('Sharing plan');
  };

  const handleCreateNewPlan = () => {
    // Navigate back to main PlanScreen
    (navigation as any).navigate('Main', { screen: 'Plan' });
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
            <MaterialCommunityIcons name="magic-staff" size={64} color="#4CBC71" />
          </View>
          <Text style={styles.headerTitle}>AI Plan Generated! ✨</Text>
          <Text style={styles.headerSubtitle}>
            Travie has created your personalized trip itinerary
          </Text>
        </View>

        {/* AI Generated Itinerary Card */}
        <View style={styles.itineraryCard}>
          <Text style={styles.itineraryTitle}>AI Generated Itinerary</Text>
          <Text style={styles.itinerarySubtitle}>
            Travie has created a personalized itinerary based on your preferences
          </Text>
          
          {/* Sample itinerary items */}
          <View style={styles.itineraryItems}>
            <View style={styles.itineraryItem}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>Day 1</Text>
              </View>
              <View style={styles.itineraryContent}>
                <Text style={styles.itineraryText}>
                  Arrival in {planningData.destinations[0]} • Check-in • Welcome dinner at local restaurant
                </Text>
              </View>
            </View>
            
            <View style={styles.itineraryItem}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>Day 2</Text>
              </View>
              <View style={styles.itineraryContent}>
                <Text style={styles.itineraryText}>
                  Morning city tour • Afternoon free time • Evening cultural show
                </Text>
              </View>
            </View>
            
            <View style={styles.itineraryItem}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>Day 3</Text>
              </View>
              <View style={styles.itineraryContent}>
                <Text style={styles.itineraryText}>
                  Day trip to nearby attractions • Local market visit • Traditional cooking class
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => (navigation as any).navigate('Main', { screen: 'Plan' })}
            activeOpacity={0.8}
          >
            <Feather name="x" size={20} color="#8E8E93" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleSavePlan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CBC71', '#45A364']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Save Plan</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleEditPlan}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleSharePlan}
              activeOpacity={0.8}
            >
              <Feather name="share-2" size={20} color="#FF6B9D" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCreateNewPlan}
              activeOpacity={0.8}
            >
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
  itineraryCard: {
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
  itineraryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  itinerarySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  itineraryItems: {
    gap: 16,
  },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
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
});

export default PlanningResultScreen;
