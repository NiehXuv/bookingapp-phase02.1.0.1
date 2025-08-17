import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'plan' | 'booking'>('saved');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'saved':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabPlaceholder}>Your saved items will appear here</Text>
          </View>
        );
      case 'plan':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabPlaceholder}>Your travel plans will appear here</Text>
          </View>
        );
      case 'booking':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabPlaceholder}>Your bookings will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderProfileSettings = () => (
    <Modal
      visible={showProfileSettings}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowProfileSettings(false)}
    >
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowProfileSettings(false)}
          >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Your Account</Text>
          <View style={styles.placeholderRight} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Profile Info Section */}
          <View style={styles.profileInfoSection}>
            <View style={styles.profileInfoRow}>
              <View style={styles.profileInfoLeft}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.modalUsername}>{user?.username || 'Username'}</Text>
                  <Text style={styles.modalViewProfile}>View profile</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#666" />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Account Management</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Profile Display Mode</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Home Feed Adjustment</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
              <Text style={styles.infoText}>
                Now you can link Instagram and other external accounts with your profile.
              </Text>
              <TouchableOpacity style={styles.closeButton}>
                <Feather name="x" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.settingsSection}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Confirmed External Accounts</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Social Network Permissions</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Notifications</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Privacy and Data</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Violation Reporting Portal</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Login Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Login</Text>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Add Account</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Security</Text>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleLogout}
            >
              <Text style={[styles.settingText, styles.logoutText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarButton}
          onPress={() => setShowProfileSettings(true)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerTabs}>
          <TouchableOpacity 
            style={[styles.headerTab, activeTab === 'saved' && styles.activeHeaderTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.headerTabText, activeTab === 'saved' && styles.activeHeaderTabText]}>
              Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerTab, activeTab === 'plan' && styles.activeHeaderTab]}
            onPress={() => setActiveTab('plan')}
          >
            <Text style={[styles.headerTabText, activeTab === 'plan' && styles.activeHeaderTabText]}>
              Your Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerTab, activeTab === 'booking' && styles.activeHeaderTab]}
            onPress={() => setActiveTab('booking')}
          >
            <Text style={[styles.headerTabText, activeTab === 'booking' && styles.activeHeaderTabText]}>
              Your Booking
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search your saved items</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, styles.activeFilterTab]}>
          <Feather name="grid" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Feather name="heart" size={16} color="#666" />
          <Text style={styles.filterTabText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Feather name="user" size={16} color="#666" />
          <Text style={styles.filterTabText}>Created by you</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Profile Settings Modal */}
      {renderProfileSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarButton: {
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  headerTabs: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  headerTab: {
    paddingVertical: 8,
  },
  activeHeaderTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B9D',
  },
  headerTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeHeaderTabText: {
    color: '#000',
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#FF6B9D',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tabPlaceholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  profileInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  profileTextContainer: {
    flex: 1,
  },
  modalUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  modalViewProfile: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  logoutText: {
    color: '#FF3B30',
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  infoBoxContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});

export default ProfileScreen; 