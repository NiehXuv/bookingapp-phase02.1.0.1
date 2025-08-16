import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PlanCard {
  id: string;
  title: string;
  dateRange: string;
  destinations: number;
  timeAgo: string;
}

const mockPlans: PlanCard[] = [
  {
    id: '1',
    title: 'Hoi An trip with family',
    dateRange: '24/06/2025 - 03/07/2025',
    destinations: 5,
    timeAgo: '8hrs ago'
  },
  {
    id: '2',
    title: 'Besties and Cao Bang',
    dateRange: '15/07/2025 - 22/07/2025',
    destinations: 4,
    timeAgo: '1 day ago'
  },
  {
    id: '3',
    title: 'Lovers\' date',
    dateRange: '08/08/2025 - 12/08/2025',
    destinations: 3,
    timeAgo: '2 days ago'
  },
  {
    id: '4',
    title: 'Solo adventure to Sapa',
    dateRange: '20/08/2025 - 25/08/2025',
    destinations: 2,
    timeAgo: '3 days ago'
  }
];

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePlanWithTravie = () => {
    // Navigate to PlanningFlow from the root stack
    (navigation as any).navigate('PlanningFlow');
  };

  const handleCreateManually = () => {
    // Navigate to manual planning screen
    (navigation as any).navigate('PlanManual');
  };

  const handleEditPlan = (planId: string) => {
    // TODO: Implement edit logic
    console.log('Edit plan:', planId);
  };

  const handleDeletePlan = (planId: string) => {
    // TODO: Implement delete logic
    console.log('Delete plan:', planId);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.planningCard}>
            <View style={styles.titleContainer}>
              <View style={styles.titleIconContainer}>
                <MaterialCommunityIcons name="magic-staff" size={32} color="#FF6B9D" />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.mainTitle}>
                  Plan perfect trips with
                </Text>
                <Text style={styles.travieText}>
                  Travie – Your AI bestie
                </Text>
              </View>
            </View>
            
            <Text style={styles.subtitle}>
              Let Travie plan the perfect trip
            </Text>

            <LinearGradient
              colors={['#FF8FB1', '#FF6B9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handlePlanWithTravie}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>+ Plan with Travie</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.separatorContainer}>
              <Text style={styles.separatorText}>or</Text>
            </View>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCreateManually}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create manually</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Created Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.plansSectionTitle}>Your Created Plans</Text>
          
          {mockPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planCardLeft}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={16} color="#fff" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <View style={styles.planDetails}>
                    <Text style={styles.planDetailText}>• {plan.dateRange}</Text>
                    <Text style={styles.planDetailText}>• {plan.destinations} Destinations</Text>
                  </View>
                  <Text style={styles.timeAgo}>{plan.timeAgo}</Text>
                </View>
              </View>
              
              <View style={styles.planCardRight}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditPlan(plan.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-3" size={18} color="#B3B4BB" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeletePlan(plan.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={18} color="#B3B4BB" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  scrollContent: {
    paddingBottom: 120, // Space for tab bar and FAB
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 60, // Increased top margin to avoid camera notch
    paddingBottom: 32,
    alignItems: 'center',
  },
  planningCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 188, 113, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  titleTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleIconContainer: {
    marginRight: 12,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF8FB1',
    textAlign: 'left',
    lineHeight: 28,
  },
  travieText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9D',
    textAlign: 'left',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  primaryButtonGradient: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  separatorContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  separatorText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CBC71',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#4CBC71',
    fontSize: 18,
    fontWeight: '600',
  },
  plansSection: {
    paddingHorizontal: 24,
  },
  plansSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CBC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CBC71',
    marginBottom: 8,
    lineHeight: 22,
  },
  planDetails: {
    marginBottom: 8,
  },
  planDetailText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  timeAgo: {
    fontSize: 12,
    color: '#C7C7CC',
    fontWeight: '400',
  },
  planCardRight: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlanScreen; 