import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Modal, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getBackendBaseUrl } from '../config/apiConfig';

const { width } = Dimensions.get('window');

interface PlanCard {
  planId: string;
  planName: string;
  destinations: string[];
  tripDays: number;
  companion: string;
  status: string;
  createdAt: number;
  aiGeneratedContent?: {
    summary?: string;
    itinerary?: any;
    totalEstimatedCost?: string;
    travelTips?: string[];
    packingList?: string[];
  };
}

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token, isTokenExpired, logout } = useAuth();
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);



  const fetchPlans = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.tripPlans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to load your travel plans');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPlans();
    }, [token])
  );

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours}hr${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handlePlanPress = async (plan: PlanCard) => {
    if (!token) return;
    
    setLoadingPlanId(plan.planId);
    
    try {
      // Fetch the latest plan data from backend to ensure we have the most current information
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${plan.planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest plan data');
      }

      const latestPlanData = await response.json();
      
      // Show brief success feedback
      console.log(`✅ Successfully fetched latest data for plan: ${plan.planName}`);
      
      // Validate that we have the required data
      if (!latestPlanData.tripPlan) {
        throw new Error('Invalid plan data received from backend');
      }
      
      // Navigate to PlanningDetailScreen with the latest plan data from backend
      (navigation as any).navigate('PlanningDetail', {
        planId: plan.planId,
        planningData: {
          destinations: latestPlanData.tripPlan.destinations || plan.destinations,
          tripDays: latestPlanData.tripPlan.tripDays || plan.tripDays,
          companion: latestPlanData.tripPlan.companion || plan.companion,
          preferences: latestPlanData.tripPlan.preferences || [],
          budget: latestPlanData.tripPlan.budget || 0,
        },
        generatedPlan: latestPlanData.tripPlan.aiGeneratedContent || plan.aiGeneratedContent || {},
      });
      
    } catch (error) {
      console.error('Error fetching latest plan data:', error);
      // Fallback to using the plan data from the list if backend fetch fails
      (navigation as any).navigate('PlanningDetail', {
        planId: plan.planId,
        planningData: {
          destinations: plan.destinations,
          tripDays: plan.tripDays,
          companion: plan.companion,
          preferences: [],
          budget: 0,
        },
        generatedPlan: plan.aiGeneratedContent || {},
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

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
    setDeletePlanId(planId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletePlanId || !token) {
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/trip-plans/${deletePlanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }

      // Remove the plan from local state
      setPlans(prevPlans => prevPlans.filter(plan => plan.planId !== deletePlanId));
      
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting plan:', error);
      setErrorMessage('Unable to delete the travel plan. Please check your connection and try again.');
      setShowDeleteModal(false);
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <ImageBackground 
        source={require('../../assets/background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading your travel plans...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
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
          
          {plans.map((plan) => (
            <TouchableOpacity 
              key={plan.planId} 
              style={[styles.planCard, loadingPlanId === plan.planId && styles.planCardLoading]}
              onPress={() => handlePlanPress(plan)}
              disabled={loadingPlanId === plan.planId}
              activeOpacity={loadingPlanId === plan.planId ? 1 : 0.8}
            >
              <View style={styles.planCardLeft}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location" size={16} color="#fff" />
                </View>
                <View style={styles.planInfo}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planTitle}>{plan.planName}</Text>
                  </View>
                  
                  <View style={styles.planDetails}>
                    <Text style={styles.planDetailText}>• {plan.tripDays} days</Text>
                    <Text style={styles.planDetailText}>• {plan.companion}</Text>
                  </View>
                  <Text style={styles.timeAgo}>{formatTimeAgo(plan.createdAt)}</Text>
                </View>
              </View>
              
              <View style={styles.planCardRight}>
                {loadingPlanId === plan.planId ? (
                  <ActivityIndicator size="small" color="#FF6B9D" />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditPlan(plan.planId)}
                      activeOpacity={0.7}
                    >
                      <Feather name="edit-3" size={18} color="#B3B4BB" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeletePlan(plan.planId)}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={18} color="#B3B4BB" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialCommunityIcons name="delete-alert" size={32} color="#FF6B9D" />
              </View>
              <Text style={styles.modalTitle}>Delete Travel Plan</Text>
              <Text style={styles.modalMessage}>
                This action will permanently delete your travel plan and all associated data. Are you sure you want to continue?
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonDelete}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                )}
                <Text style={styles.modalButtonDeleteText}>
                  {isDeleting ? 'Deleting...' : 'Delete Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, styles.successIconContainer]}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#4CBC71" />
              </View>
              <Text style={styles.modalTitle}>Plan Deleted Successfully!</Text>
              <Text style={styles.modalMessage}>
                Your travel plan has been permanently removed from your account.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButtonSuccess}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonSuccessText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, styles.errorIconContainer]}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#FF6B9D" />
              </View>
              <Text style={styles.modalTitle}>Deletion Failed</Text>
              <Text style={styles.modalMessage}>
                {errorMessage}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButtonError}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonErrorText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  planCardLoading: {
    opacity: 0.7, // Make the card look disabled
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
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CBC71',
    marginBottom: 8,
    lineHeight: 22,
  },
  planTitleLoader: {
    marginLeft: 8,
  },
  planLoadingText: {
    fontSize: 12,
    color: '#FF6B9D',
    fontStyle: 'italic',
    marginBottom: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconContainer: {
    backgroundColor: '#F0FFF0',
  },
  errorIconContainer: {
    backgroundColor: '#FFF5F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8E8E93',
    shadowColor: '#8E8E93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonCancelText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDelete: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSuccess: {
    backgroundColor: '#4CBC71',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#4CBC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonSuccessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonError: {
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlanScreen; 