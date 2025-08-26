import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import userProfileService, { UserProfile } from '../services/userProfileService';
import savedContentService from '../services/savedContentService';
import bookingService from '../services/bookingService';
import friendService from '../services/friendService';
import tripPlanService from '../services/tripPlanService';

const { width: sw, height: sh } = Dimensions.get('window');

interface UserProfileScreenProps {
  navigation: any;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Stats state
  const [stats, setStats] = useState({
    savedItems: 0,
    bookings: 0,
    tripPlans: 0,
    friends: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({
    username: '',
    email: '',
    country: '',
    phoneNumber: '',
  });

  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
      headerBackTitle: 'Back',
    });
    fetchUserProfile();
    fetchStats();
  }, [navigation]);

  const fetchUserProfile = async () => {
    if (!token) {
      setHasError(true);
      setErrorMessage('Authentication required. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userProfileService.getUserProfile(token);
      if (response.success && response.profile) {
        setUserProfile(response.profile);
        setEditForm({
          username: response.profile.username || '',
          email: response.profile.email || '',
          country: response.profile.country || '',
          phoneNumber: response.profile.phoneNumber || '',
        });
        setHasError(false);
      } else {
        // Fallback to user data from AuthContext
        if (user) {
          const fallbackProfile: UserProfile = {
            username: user.username || 'User',
            email: user.email || '',
            country: user.country || '',
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'user',
          };
          setUserProfile(fallbackProfile);
          setEditForm(fallbackProfile);
        }
        setHasError(false);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setHasError(true);
      setErrorMessage(error.message || 'Failed to load profile data');
      // Fallback to user data from AuthContext on error
      if (user) {
        const fallbackProfile: UserProfile = {
          username: user.username || 'User',
          email: user.email || '',
          country: user.country || '',
          phoneNumber: user.phoneNumber || '',
          role: user.role || 'user',
        };
        setUserProfile(fallbackProfile);
        setEditForm(fallbackProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    
    setIsLoadingStats(true);
    try {
      // Fetch saved content count
      const savedContentResponse = await savedContentService.getSavedContent(token);
      const savedItemsCount = savedContentResponse.success && savedContentResponse.favorites?.content 
        ? savedContentResponse.favorites.content.length 
        : 0;

      // Fetch bookings count
      const bookingsResponse = await bookingService.getAllBookings();
      const bookingsCount = bookingsResponse && bookingsResponse.bookings 
        ? bookingsResponse.bookings.length 
        : 0;

      // Fetch friends count
      const friendsResponse = await friendService.getFriends();
      const friendsCount = friendsResponse ? friendsResponse.length : 0;

      // Fetch trip plans count
      const tripPlansResponse = await tripPlanService.getAllTripPlans();
      const tripPlansCount = tripPlansResponse && tripPlansResponse.tripPlans 
        ? tripPlansResponse.tripPlans.length 
        : 0;

      setStats({
        savedItems: savedItemsCount,
        bookings: bookingsCount,
        tripPlans: tripPlansCount,
        friends: friendsCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values on error
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!token || !userProfile) return;

    // Validate required fields
    if (!editForm.username || !editForm.email || !editForm.country || !editForm.phoneNumber) {
      setErrorModalMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userProfileService.updateUserProfile(editForm, token);
      
             if (response.success && response.profile) {
         setUserProfile(response.profile);
         setShowEditModal(false);
         setShowSuccessModal(true);
               } else {
          setErrorModalMessage('Failed to update profile. Please try again.');
          setShowErrorModal(true);
        }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorModalMessage(error.message || 'Failed to update profile');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#EF4444';
      case 'user':
        return '#10B981';
      case 'moderator':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (hasError && !userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#FFF5F5', '#FFE5F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          
          <Text style={styles.username}>{userProfile?.username || 'Username'}</Text>
          <Text style={styles.email}>{userProfile?.email || 'email@example.com'}</Text>
          
          <View style={styles.roleContainer}>
            <Text style={[styles.roleText, { color: getRoleColor(userProfile?.role || 'user') }]}>
              {userProfile?.role?.toUpperCase() || 'USER'}
            </Text>
          </View>
        </View>

        {/* Profile Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editButtonGradient}
            >
              <Feather name="edit-3" size={20} color="white" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="user" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Username</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.username || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="mail" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.email || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="phone" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Phone Number</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.phoneNumber || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="globe" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Country</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.country || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="shield" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Role</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile?.role?.toUpperCase() || 'USER'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="calendar" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>
                {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="clock" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Last Updated</Text>
              </View>
              <Text style={styles.infoValue}>
                {userProfile?.updatedAt ? formatDate(userProfile.updatedAt) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

                 {/* Quick Stats */}
         <View style={styles.statsSection}>
           <View style={styles.statsHeader}>
             <Text style={styles.sectionTitle}>Quick Stats</Text>
             <TouchableOpacity 
               style={styles.refreshStatsButton}
               onPress={fetchStats}
               disabled={isLoadingStats}
             >
               <Feather 
                 name="refresh-cw" 
                 size={16} 
                 color={isLoadingStats ? "#9CA3AF" : "#6B7280"} 
               />
             </TouchableOpacity>
           </View>
           
           <View style={styles.statsGrid}>
             <View style={styles.statCard}>
               <View style={styles.statIconContainer}>
                 <Feather name="heart" size={20} color="#FF6B9D" />
               </View>
               <Text style={styles.statNumber}>
                 {isLoadingStats ? '...' : stats.savedItems}
               </Text>
               <Text style={styles.statLabel}>Saved Items</Text>
             </View>
             
             <View style={styles.statCard}>
               <View style={styles.statIconContainer}>
                 <Feather name="calendar" size={20} color="#10B981" />
               </View>
               <Text style={styles.statNumber}>
                 {isLoadingStats ? '...' : stats.bookings}
               </Text>
               <Text style={styles.statLabel}>Bookings</Text>
             </View>
             
             <View style={styles.statCard}>
               <View style={styles.statIconContainer}>
                 <Feather name="map" size={20} color="#F59E0B" />
               </View>
               <Text style={styles.statNumber}>
                 {isLoadingStats ? '...' : stats.tripPlans}
               </Text>
               <Text style={styles.statLabel}>Trip Plans</Text>
             </View>
             
             <View style={styles.statCard}>
               <View style={styles.statIconContainer}>
                 <Feather name="users" size={20} color="#3B82F6" />
               </View>
               <Text style={styles.statNumber}>
                 {isLoadingStats ? '...' : stats.friends}
               </Text>
               <Text style={styles.statLabel}>Friends</Text>
             </View>
           </View>
         </View>
      </ScrollView>

             {/* Edit Profile Modal */}
       <Modal
         visible={showEditModal}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={() => setShowEditModal(false)}
       >
         <View style={styles.modalContainer}>
           {/* Modal Header */}
           <View style={styles.modalHeader}>
             <TouchableOpacity 
               style={styles.modalBackButton}
               onPress={() => setShowEditModal(false)}
             >
               <Feather name="arrow-left" size={24} color="#000" />
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Edit Profile</Text>
             <View style={styles.placeholderRight} />
           </View>

           <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
             {/* Profile Info Section */}
             <View style={styles.profileInfoSection}>
               <View style={styles.profileInfoRow}>
                 <View style={styles.profileInfoLeft}>
                   <View style={styles.modalAvatar}>
                     <Text style={styles.modalAvatarText}>
                       {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                     </Text>
                   </View>
                   <View style={styles.profileTextContainer}>
                     <Text style={styles.modalUsername}>{userProfile?.username || 'Username'}</Text>
                     <Text style={styles.modalViewProfile}>Editing profile</Text>
                   </View>
                 </View>
               </View>
             </View>

             {/* Form Section */}
             <View style={styles.formSection}>
               <Text style={styles.sectionTitle}>Personal Information</Text>
               
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Username</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editForm.username}
                   onChangeText={(value) => handleInputChange('username', value)}
                   placeholder="Enter username"
                   placeholderTextColor="#9CA3AF"
                 />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Email</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editForm.email}
                   onChangeText={(value) => handleInputChange('email', value)}
                   placeholder="Enter email"
                   placeholderTextColor="#9CA3AF"
                   keyboardType="email-address"
                   autoCapitalize="none"
                 />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Country Code</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editForm.country}
                   onChangeText={(value) => handleInputChange('country', value)}
                   placeholder="e.g., US, VN, GB"
                   placeholderTextColor="#9CA3AF"
                   autoCapitalize="characters"
                   maxLength={2}
                 />
               </View>

               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Phone Number</Text>
                 <TextInput
                   style={styles.textInput}
                   value={editForm.phoneNumber}
                   onChangeText={(value) => handleInputChange('phoneNumber', value)}
                   placeholder="Enter phone number"
                   placeholderTextColor="#9CA3AF"
                   keyboardType="phone-pad"
                 />
               </View>
             </View>

             {/* Info Box */}
             <View style={styles.infoBox}>
               <View style={styles.infoBoxContent}>
                 <View style={styles.infoIcon}>
                   <Text style={styles.infoIconText}>i</Text>
                 </View>
                 <Text style={styles.infoText}>
                   Your profile information will be updated immediately after saving.
                 </Text>
               </View>
             </View>
           </ScrollView>

           {/* Modal Footer */}
           <View style={styles.modalFooter}>
             <TouchableOpacity
               style={styles.cancelButton}
               onPress={() => setShowEditModal(false)}
             >
               <Text style={styles.cancelButtonText}>Cancel</Text>
             </TouchableOpacity>
             
             <TouchableOpacity
               style={styles.saveButton}
               onPress={handleSaveProfile}
               disabled={isLoading}
             >
               {isLoading ? (
                 <ActivityIndicator color="white" size="small" />
               ) : (
                 <LinearGradient
                   colors={['#FF6B9D', '#FF8E53']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                   style={styles.saveButtonGradient}
                 >
                   <Feather name="check" size={20} color="white" />
                   <Text style={styles.saveButtonText}>Save Changes</Text>
                 </LinearGradient>
               )}
             </TouchableOpacity>
           </View>
                   </View>
        </Modal>

                 {/* Success Modal */}
         <Modal
           visible={showSuccessModal}
           animationType="fade"
           transparent={true}
           onRequestClose={() => setShowSuccessModal(false)}
         >
           <View style={styles.successModalOverlay}>
             <View style={styles.successModalContent}>
               <View style={styles.successIconContainer}>
                 <LinearGradient
                   colors={['#10B981', '#059669']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                   style={styles.successIconGradient}
                 >
                   <Feather name="check" size={32} color="white" />
                 </LinearGradient>
               </View>
               
               <Text style={styles.successTitle}>Success!</Text>
               <Text style={styles.successMessage}>Profile updated successfully!</Text>
               
               <TouchableOpacity
                 style={styles.successButton}
                 onPress={() => setShowSuccessModal(false)}
               >
                 <LinearGradient
                   colors={['#FF6B9D', '#FF8E53']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                   style={styles.successButtonGradient}
                 >
                   <Text style={styles.successButtonText}>OK</Text>
                 </LinearGradient>
               </TouchableOpacity>
             </View>
           </View>
         </Modal>

         {/* Error Modal */}
         <Modal
           visible={showErrorModal}
           animationType="fade"
           transparent={true}
           onRequestClose={() => setShowErrorModal(false)}
         >
           <View style={styles.errorModalOverlay}>
             <View style={styles.errorModalContent}>
               <View style={styles.errorIconContainer}>
                 <LinearGradient
                   colors={['#EF4444', '#DC2626']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                   style={styles.errorIconGradient}
                 >
                   <Feather name="alert-circle" size={32} color="white" />
                 </LinearGradient>
               </View>
               
               <Text style={styles.errorTitle}>Error</Text>
               <Text style={styles.errorMessage}>{errorModalMessage}</Text>
               
               <TouchableOpacity
                 style={styles.errorButton}
                 onPress={() => setShowErrorModal(false)}
               >
                 <LinearGradient
                   colors={['#FF6B9D', '#FF8E53']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                   style={styles.errorButtonGradient}
                 >
                   <Text style={styles.errorButtonText}>OK</Text>
                 </LinearGradient>
               </TouchableOpacity>
             </View>
           </View>
         </Modal>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  roleContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Actions Section
  actionsSection: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Info Sections
  infoSection: {
    padding: 24,
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  infoCard: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  
  // Stats Section - Redesigned
  statsSection: {
    padding: 24,
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshStatsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  
  // Modal Styles - Modern Design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalBackButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholderRight: {
    width: 40,
  },
  modalBody: {
    padding: 20,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // New Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  profileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileTextContainer: {
    flex: 1,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalViewProfile: {
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  infoBoxContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 120,
  },
  successButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 120,
  },
  errorButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default UserProfileScreen;
