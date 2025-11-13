import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Modal, Dimensions, FlatList, RefreshControl, TextInput, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import userProfileService, { UserProfile } from '../services/userProfileService';
import savedContentService from '../services/savedContentService';
import { ContentItem } from '../types/content';
import bookingService, { Booking } from '../services/bookingService';
import postService, { Post, PostData } from '../services/postService';

interface BookingsResponse {
  bookings: Booking[];
  count: number;
  message: string;
}

const { width: screenWidth } = Dimensions.get('window');
const { width } = Dimensions.get('window');
const CARD_RADIUS = 24;
const GAP = 8;
const COLUMN_WIDTH = (width - 32 - GAP) / 2; // 16 padding on both sides, GAP between columns

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, token, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'plan' | 'booking'>('saved');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Saved content state
  const [savedContent, setSavedContent] = useState<ContentItem[]>([]);
  const [isLoadingSavedContent, setIsLoadingSavedContent] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Booking state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [hasBookingError, setHasBookingError] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasPostError, setHasPostError] = useState(false);
  const [postErrorMessage, setPostErrorMessage] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Modal state for removing saved content
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Fetch user profile and saved content
  useEffect(() => {
    if (token) {
      console.log('Token available, attempting to fetch data...');
      fetchUserProfile();
      fetchSavedContent();
      fetchBookings();
      fetchPosts();
    } else {
      console.log('No token available, setting error state');
      setHasError(true);
      setErrorMessage('Authentication required. Please log in again.');
    }
  }, [token]);

  const fetchUserProfile = async () => {
    if (!token) {
      console.log('No token available for profile fetch');
      setHasError(true);
      setErrorMessage('Authentication token not available');
      return;
    }
    
    console.log('Fetching user profile with token:', token.substring(0, 20) + '...');
    setIsLoadingProfile(true);
    try {
      const response = await userProfileService.getUserProfile(token);
      console.log('Profile response:', response);
      if (response.success && response.profile) {
        setUserProfile(response.profile);
        setHasError(false);
      } else {
        console.log('No user profile data received, using fallback data');
        setHasError(true);
        setErrorMessage('No profile data received from server');
        // Fallback to user data from AuthContext if available
        if (user) {
          setUserProfile({
            username: user.username || 'User',
            email: user.email || '',
            country: user.country || '',
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'user'
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setHasError(true);
      setErrorMessage(error.message || 'Failed to load profile data');
      // Fallback to user data from AuthContext on error
      if (user) {
        setUserProfile({
          username: user.username || 'User',
          email: user.email || '',
          country: user.country || '',
          phoneNumber: user.phoneNumber || '',
          role: user.role || 'user'
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchSavedContent = async () => {
    if (!token) {
      console.log('No token available for saved content fetch');
      setHasError(true);
      setErrorMessage('Authentication token not available');
      return;
    }
    
    console.log('Fetching saved content with token:', token.substring(0, 20) + '...');
    setIsLoadingSavedContent(true);
    try {
      const response = await savedContentService.getSavedContent(token);
      console.log('Saved content response:', response);
      // Handle the actual backend response structure
      if (response.success && response.favorites?.content) {
        setSavedContent(response.favorites.content);
        setHasError(false);
      } else if (response.favorites?.content) {
        // Direct response from backend (without success wrapper)
        setSavedContent(response.favorites.content);
        setHasError(false);
      } else {
        console.log('No saved content data received, using empty array');
        setSavedContent([]);
        setHasError(false);
      }
    } catch (error: any) {
      console.error('Error fetching saved content:', error);
      setHasError(true);
      setErrorMessage(error.message || 'Failed to load saved content');
      // On error, show empty state but don't crash the app
      setSavedContent([]);
    } finally {
      setIsLoadingSavedContent(false);
    }
  };

  const fetchBookings = async () => {
    if (!token) {
      console.log('No token available for bookings fetch');
      setHasBookingError(true);
      setBookingErrorMessage('Authentication token not available');
      return;
    }
    
    console.log('Fetching bookings with token:', token.substring(0, 20) + '...');
    setIsLoadingBookings(true);
    try {
      const response: BookingsResponse = await bookingService.getAllBookings();
      console.log('Bookings response:', response);
      
      // Handle the actual backend response structure
      if (response && response.bookings && Array.isArray(response.bookings)) {
        console.log('Bookings data found:', response.bookings.length, 'bookings');
        console.log('First booking sample:', JSON.stringify(response.bookings[0], null, 2));
        setBookings(response.bookings);
        setHasBookingError(false);
      } else {
        console.log('No valid bookings data received, using empty array');
        setBookings([]);
        setHasBookingError(false);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setHasBookingError(true);
      setBookingErrorMessage(error.message || 'Failed to load bookings');
      // On error, show empty state but don't crash the app
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchPosts = async () => {
    if (!token) {
      console.log('No token available for posts fetch');
      setHasPostError(true);
      setPostErrorMessage('Authentication token not available');
      return;
    }
    
    console.log('Fetching posts with token:', token.substring(0, 20) + '...');
    setIsLoadingPosts(true);
    try {
      const response = await postService.getAllPosts();
      console.log('Posts response:', response);
      
      if (response && response.posts && Array.isArray(response.posts)) {
        console.log('Posts data found:', response.posts.length, 'posts');
        setPosts(response.posts);
        setHasPostError(false);
      } else {
        console.log('No posts data received, using empty array');
        setPosts([]);
        setHasPostError(false);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setHasPostError(true);
      setPostErrorMessage(error.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      setErrorModalMessage('Please enter some content for your post');
      setShowErrorModal(true);
      return;
    }

    if (!token) {
      setErrorModalMessage('Authentication required. Please log in again.');
      setShowErrorModal(true);
      return;
    }

    setIsPosting(true);
    try {
      const postData: PostData = {
        content: postContent.trim(),
        imageUrl: postImageUrl.trim() || undefined,
        location: postLocation.trim() || undefined,
      };

      await postService.createPost(postData);
      
      // Clear form
      setPostContent('');
      setPostImageUrl('');
      setPostLocation('');
      setShowPostModal(false);
      
      // Refresh posts
      await fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      setErrorModalMessage(error.message || 'Failed to create post. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (post: Post) => {
    setSelectedPost(post);
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    if (!selectedPost || !token) return;
    
    try {
      await postService.deletePost(selectedPost.postId);
      // Remove from local state
      setPosts(prev => prev.filter(post => post.postId !== selectedPost.postId));
      setShowDeletePostModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setErrorModalMessage('Failed to delete post. Please try again.');
      setShowErrorModal(true);
    }
  };

  const retryFetch = () => {
    setHasError(false);
    setErrorMessage('');
    setHasBookingError(false);
    setBookingErrorMessage('');
    setHasPostError(false);
    setPostErrorMessage('');
    fetchUserProfile();
    fetchSavedContent();
    fetchBookings();
    fetchPosts();
  };

  const handleRemoveSavedContent = async (content: ContentItem) => {
    if (!token) return;
    
    setSelectedContent(content);
    setShowRemoveModal(true);
  };

  const confirmRemoveContent = async () => {
    if (!selectedContent || !token) return;
    
    try {
      await savedContentService.removeSavedContent(selectedContent.id, token);
      // Remove from local state
      setSavedContent(prev => prev.filter(item => item.id !== selectedContent.id));
      setShowRemoveModal(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error removing saved content:', error);
      setErrorModalMessage('Failed to remove content. Please try again.');
      setShowErrorModal(true);
    }
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setSelectedContent(null);
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setErrorModalMessage('Failed to sign out. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // Helper functions for booking display
  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'hotel';
      case 'tour':
        return 'explore';
      case 'transport':
        return 'directions-car';
      case 'restaurant':
        return 'restaurant';
      default:
        return 'place';
    }
  };

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return '#3B82F6';
      case 'tour':
        return '#10B981';
      case 'transport':
        return '#F59E0B';
      case 'restaurant':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'saved':
        return (
          <View style={styles.tabContent}>
            {isLoadingSavedContent ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading saved content...</Text>
              </View>
            ) : hasError ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : savedContent.length > 0 ? (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.savedContentList}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingSavedContent}
                    onRefresh={fetchSavedContent}
                    colors={['#FF6B9D']}
                    tintColor="#FF6B9D"
                  />
                }
              >
                <View style={styles.masonryRow}>
                  <View style={styles.column}>
                    {savedContent.filter((_, i) => i % 2 === 0).map((item, idx) => (
                      <View key={`col0_${item.id}_${idx}`} style={styles.tile}>
                        <TouchableOpacity onPress={() => {}}>
                          <View style={[styles.card, idx % 2 === 0 ? styles.cardTall : styles.cardShort]}>
                            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                            <TouchableOpacity 
                              style={styles.removeButton}
                              onPress={() => handleRemoveSavedContent(item)}
                            >
                              <Feather name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.metaSource}>{item.source}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <View style={styles.column}>
                    {savedContent.filter((_, i) => i % 2 !== 0).map((item, idx) => (
                      <View key={`col1_${item.id}_${idx}`} style={styles.tile}>
                        <TouchableOpacity onPress={() => {}}>
                          <View style={[styles.card, idx % 2 === 1 ? styles.cardTall : styles.cardShort]}>
                            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                            <TouchableOpacity 
                              style={styles.removeButton}
                              onPress={() => handleRemoveSavedContent(item)}
                            >
                              <Feather name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.metaSource}>{item.source}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Feather name="heart" size={48} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No saved content yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Save content from the home screen to see it here
                </Text>
              </View>
            )}
          </View>
        );
      case 'plan':
        return (
          <View style={styles.tabContent}>
            {isLoadingPosts ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your posts...</Text>
              </View>
            ) : hasPostError ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorMessage}>{postErrorMessage}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : posts.length > 0 ? (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.postsList}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingPosts}
                    onRefresh={fetchPosts}
                    colors={['#FF6B9D']}
                    tintColor="#FF6B9D"
                  />
                }
              >
                <View style={styles.masonryRow}>
                  <View style={styles.column}>
                    {posts.filter((_, i) => i % 2 === 0).map((post, idx) => (
                      <View key={`col0_${post.postId}_${idx}`} style={styles.tile}>
                        <TouchableOpacity onPress={() => {}}>
                          <View style={[styles.card, idx % 2 === 0 ? styles.cardTall : styles.cardShort]}>
                            {post.imageUrl ? (
                              <Image source={{ uri: post.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                            ) : (
                              <View style={styles.cardImagePlaceholder}>
                                <Feather name="image" size={32} color="#ccc" />
                              </View>
                            )}
                            <TouchableOpacity 
                              style={styles.removeButton}
                              onPress={() => handleDeletePost(post)}
                            >
                              <Feather name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaTitle} numberOfLines={2}>{post.content}</Text>
                          {post.location && (
                            <Text style={styles.metaSource}>{post.location}</Text>
                          )}
                        </View>
                        <View style={styles.postStats}>
                          <View style={styles.postStatItem}>
                            <Feather name="heart" size={14} color="#666" />
                            <Text style={styles.postStatText}>{post.likes}</Text>
                          </View>
                          <View style={styles.postStatItem}>
                            <Feather name="message-circle" size={14} color="#666" />
                            <Text style={styles.postStatText}>{post.comments}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                  <View style={styles.column}>
                    {posts.filter((_, i) => i % 2 !== 0).map((post, idx) => (
                      <View key={`col1_${post.postId}_${idx}`} style={styles.tile}>
                        <TouchableOpacity onPress={() => {}}>
                          <View style={[styles.card, idx % 2 === 1 ? styles.cardTall : styles.cardShort]}>
                            {post.imageUrl ? (
                              <Image source={{ uri: post.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                            ) : (
                              <View style={styles.cardImagePlaceholder}>
                                <Feather name="image" size={32} color="#ccc" />
                              </View>
                            )}
                            <TouchableOpacity 
                              style={styles.removeButton}
                              onPress={() => handleDeletePost(post)}
                            >
                              <Feather name="x" size={16} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaTitle} numberOfLines={2}>{post.content}</Text>
                          {post.location && (
                            <Text style={styles.metaSource}>{post.location}</Text>
                          )}
                        </View>
                        <View style={styles.postStats}>
                          <View style={styles.postStatItem}>
                            <Feather name="heart" size={14} color="#666" />
                            <Text style={styles.postStatText}>{post.likes}</Text>
                          </View>
                          <View style={styles.postStatItem}>
                            <Feather name="message-circle" size={14} color="#666" />
                            <Text style={styles.postStatText}>{post.comments}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Feather name="edit-3" size={48} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Share your travel experiences with the community
                </Text>
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={() => setShowPostModal(true)}
                >
                  <Feather name="plus" size={20} color="#fff" />
                  <Text style={styles.createPostButtonText}>Create Your First Post</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      case 'booking':
        return (
          <View style={styles.tabContent}>
            {isLoadingBookings ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your bookings...</Text>
              </View>
            ) : hasBookingError ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorMessage}>{bookingErrorMessage}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : bookings.length > 0 ? (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookingsList}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingBookings}
                    onRefresh={fetchBookings}
                    colors={['#FF6B9D']}
                    tintColor="#FF6B9D"
                  />
                }
              >
                {bookings.map((booking) => (
                  <View key={booking.bookingId || booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <View style={styles.bookingTypeContainer}>
                        <View style={[styles.bookingTypeIcon, { backgroundColor: getBookingTypeColor(booking.type) }]}>
                          <MaterialIcons name={getBookingTypeIcon(booking.type)} size={20} color="white" />
                        </View>
                        <View style={styles.bookingTypeInfo}>
                          <Text style={styles.bookingType}>{booking.type.toUpperCase()}</Text>
                          <Text style={[styles.bookingStatus, { color: getStatusColor(booking.status) }]}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.bookingPrice}>
                        <Text style={styles.bookingPriceText}>
                          {booking.details?.currency || 'VND'} {booking.details?.price?.toLocaleString() || '0'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.bookingTitle}>{booking.title}</Text>
                    <Text style={styles.bookingDescription}>{booking.description}</Text>
                    
                    <View style={styles.bookingDetails}>
                      <View style={styles.bookingDetailItem}>
                        <Feather name="calendar" size={16} color="#6B7280" />
                        <Text style={styles.bookingDetailText}>{booking.date}</Text>
                      </View>
                      <View style={styles.bookingDetailItem}>
                        <Feather name="clock" size={16} color="#6B7280" />
                        <Text style={styles.bookingDetailText}>{booking.time}</Text>
                      </View>
                      <View style={styles.bookingDetailItem}>
                        <Feather name="users" size={16} color="#6B7280" />
                        <Text style={styles.bookingDetailText}>{booking.guestsNumber} {booking.guestsNumber === 1 ? 'Guest' : 'Guests'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingActions}>
                      <TouchableOpacity style={styles.bookingActionButton}>
                        <Feather name="edit" size={16} color="#6B7280" />
                        <Text style={styles.bookingActionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.bookingActionButton}>
                        <Feather name="trash-2" size={16} color="#6B7280" />
                        <Text style={styles.bookingActionText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Feather name="calendar" size={48} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No bookings yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Book tours, hotels, or transport to see them here
                </Text>
              </View>
            )}
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
                    {(userProfile?.username || user?.username)?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.modalUsername}>{userProfile?.username || user?.username || 'Username'}</Text>
                  <TouchableOpacity onPress={() => (navigation as any).navigate('UserProfile')}>
                    <Text style={styles.modalViewProfile}>View profile</Text>
                  </TouchableOpacity>
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
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header with Avatar */}
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarButton}
          onPress={() => setShowProfileSettings(true)}
        >
          <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
            {(userProfile?.username || user?.username)?.charAt(0).toUpperCase() || 'U'}
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
              Your Posts
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

      {/* Search Bar - Only visible in Saved tab */}
      {activeTab === 'saved' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search your saved items</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={fetchSavedContent}
          >
            <Feather name="refresh-cw" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Content */}
      {renderTabContent()}

      {/* Pill Post Button - Only visible in Your Posts tab when there are posts */}
      {activeTab === 'plan' && posts.length > 0 && (
        <View style={styles.pillPostButtonContainer}>
          <TouchableOpacity 
            style={styles.pillPostButton}
            onPress={() => setShowPostModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.pillPostButtonText}>Add Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Settings Modal */}
      {renderProfileSettings()}

      {/* Remove Content Confirmation Modal */}
      <Modal
        visible={showRemoveModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeRemoveModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.removeModalContent}>
            <Text style={styles.removeModalTitle}>Confirm Removal</Text>
            <Text style={styles.removeModalMessage}>
              Are you sure you want to remove "{selectedContent?.title}"?
            </Text>
            <View style={styles.removeModalButtons}>
              <TouchableOpacity style={styles.removeModalButton} onPress={closeRemoveModal}>
                <Text style={styles.removeModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeModalButton} onPress={confirmRemoveContent}>
                <Text style={styles.removeModalButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.removeModalContent}>
            <Text style={styles.removeModalTitle}>Sign Out</Text>
            <Text style={styles.removeModalMessage}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.removeModalButtons}>
              <TouchableOpacity style={styles.removeModalButton} onPress={closeLogoutModal}>
                <Text style={styles.removeModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeModalButton} onPress={confirmLogout}>
                <Text style={styles.removeModalButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
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
            
            <Text style={styles.errorModalTitle}>Error</Text>
            <Text style={styles.errorModalMessage}>{errorModalMessage}</Text>
            
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.errorModalButtonGradient}
              >
                <Text style={styles.errorModalButtonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setShowPostModal(false);
                setPostContent('');
                setPostImageUrl('');
                setPostLocation('');
              }}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity 
              style={styles.postSubmitButton}
              onPress={handleCreatePost}
              disabled={isPosting || !postContent.trim()}
            >
              <Text style={[
                styles.postSubmitButtonText,
                (!postContent.trim() || isPosting) && styles.postSubmitButtonTextDisabled
              ]}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.postUserInfo}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {(userProfile?.username || user?.username)?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.postUserName}>{userProfile?.username || user?.username || 'User'}</Text>
            </View>

            {/* Post Content Input */}
            <View style={styles.postInputContainer}>
              <TextInput
                style={styles.postContentInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={postContent}
                onChangeText={setPostContent}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {postContent.length}/500
              </Text>
            </View>

            {/* Image URL Input */}
            <View style={styles.postInputContainer}>
              <Text style={styles.postInputLabel}>Image URL (optional)</Text>
              <TextInput
                style={styles.postTextInput}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#999"
                value={postImageUrl}
                onChangeText={setPostImageUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Location Input */}
            <View style={styles.postInputContainer}>
              <Text style={styles.postInputLabel}>Location (optional)</Text>
              <TextInput
                style={styles.postTextInput}
                placeholder="Where are you?"
                placeholderTextColor="#999"
                value={postLocation}
                onChangeText={setPostLocation}
              />
            </View>

            {/* Preview Image */}
            {postImageUrl && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: postImageUrl }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setPostImageUrl('')}
                >
                  <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Post Confirmation Modal */}
      <Modal
        visible={showDeletePostModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeletePostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.removeModalContent}>
            <Text style={styles.removeModalTitle}>Delete Post</Text>
            <Text style={styles.removeModalMessage}>
              Are you sure you want to delete this post? This action cannot be undone.
            </Text>
            <View style={styles.removeModalButtons}>
              <TouchableOpacity 
                style={[styles.removeModalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowDeletePostModal(false);
                  setSelectedPost(null);
                }}
              >
                <Text style={[styles.removeModalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeModalButton} 
                onPress={confirmDeletePost}
              >
                <Text style={styles.removeModalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
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
    marginBottom: 20, 
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
  tabContent: {
    flex: 1,
  },
  tabPlaceholder: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
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
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
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
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 2,
  },
  settingRowPressed: {
    backgroundColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
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
  closeButton: {
    padding: 4,
  },
  // Saved content styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  savedContentList: {
    paddingHorizontal: 0,
    paddingBottom: 120, // Add significant bottom padding to avoid tab bar overlap
  },
  tile: {
    width: '100%',
  },
  // Modal styles for remove content and logout confirmation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeModalContent: {
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
  removeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  removeModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  removeModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16,
  },
  removeModalButton: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  removeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  masonryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: GAP,
  },
  column: {
    flex: 1,
    gap: GAP,
  },
  card: {
    width: '100%',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTall: {
    height: COLUMN_WIDTH * 1.3,
  },
  cardShort: {
    height: COLUMN_WIDTH * 0.9,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 12,
  },
  metaTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    lineHeight: 18,
  },
  metaSource: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  
  // Booking styles
  bookingsList: {
    padding: 16,
    paddingBottom: 120, // Add significant bottom padding to avoid tab bar overlap
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingTypeInfo: {
    gap: 4,
  },
  bookingType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  bookingStatus: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bookingPrice: {
    alignItems: 'flex-end',
  },
  bookingPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  bookingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingDetailText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookingActionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
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
  errorModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorModalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 120,
  },
  errorModalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Post styles
  postsList: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  pillPostButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  pillPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pillPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    gap: 8,
    marginTop: 20,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  postInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  postContentInput: {
    minHeight: 120,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postTextInput: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  postSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  postSubmitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  imagePreviewContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
  },
});

export default ProfileScreen; 