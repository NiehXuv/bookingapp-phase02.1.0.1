import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Dimensions, Alert, RefreshControl, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import chatService, { Chat } from '../services/chatService';
import friendService, { FriendRequest, Friend } from '../services/friendService';
import notificationService, { Notification } from '../services/notificationService';
import { UserSearchScreen, AddFriendScreen } from './chat';
import { useAuth } from '../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

const InboxScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [showMessages, setShowMessages] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const contacts = [
    {
      id: 1,
      name: 'Find People',
      subtitle: 'Search and connect with other users',
      icon: 'search',
      hasArrow: true,
      action: 'search',
    },
    {
      id: 2,
      name: 'Friends',
      subtitle: 'Manage friend requests and connections',
      icon: 'users',
      hasArrow: true,
      action: 'friends',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadChats(),
        loadFriendRequests(),
        loadFriends(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const chatsData = await chatService.getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
      // Handle specific chat errors
      if (error instanceof Error && error.message && error.message.includes('Chat not found')) {
        console.log('Chat not found - this is normal for new users');
        setChats([]);
      } else {
        // Don't show alert for chats - they might be empty for new users
        setChats([]);
      }
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await friendService.getFriendRequests('incoming');
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      // Don't show alert for friend requests - they might be empty
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await friendService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      // Don't show alert for friends - they might be empty
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const notificationsData = await notificationService.getNotifications();
      console.log('Loaded notifications:', notificationsData);
      
      // Ensure notifications have the correct structure
      const formattedNotifications = notificationsData.map((notification: any) => ({
        id: notification.id || notification.notificationId || `notif_${Date.now()}_${Math.random()}`,
        title: notification.title || 'Notification',
        message: notification.message || 'No message content',
        type: notification.type || 'system',
        read: notification.read || false,
        createdAt: notification.createdAt || Date.now(),
        expiresAt: notification.expiresAt,
        data: notification.data || {}
      }));
      
      setNotifications(formattedNotifications);
      
      // Log the result
      if (formattedNotifications.length === 0) {
        console.log('No notifications found - this is normal for new users');
      } else {
        console.log(`Successfully loaded ${formattedNotifications.length} notifications`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't show alert for notifications - they might be empty
      setNotifications([]);
      
      // Log specific error types for debugging
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          console.log('Authentication issue - user may need to log in again');
        } else if (error.message.includes('Server error')) {
          console.log('Server issue - will retry on next load');
        } else if (error.message.includes('endpoint not found')) {
          console.log('API endpoint issue - check backend configuration');
        }
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    try {
      await friendService.acceptFriendRequest(request.id);
      Alert.alert('Success', `Friend request from ${request.user?.username || 'Unknown User'} accepted!`);
      
      // Update local state
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      if (request.user && request.user.uid && request.user.username) {
        const newFriend: Friend = {
          uid: request.user.uid,
          username: request.user.username,
          email: request.user.email || '',
          avatar: request.user.avatar || undefined,
          country: request.user.country || undefined,
          addedAt: Date.now(),
          lastSeen: Date.now(),
          isOnline: false
        };
        setFriends(prev => [...prev, newFriend]);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (request: FriendRequest) => {
    try {
      await friendService.rejectFriendRequest(request.id);
      Alert.alert('Success', `Friend request from ${request.user?.username || 'Unknown User'} rejected`);
      
      // Update local state
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleContactPress = (contact: any) => {
    if (contact.action === 'search') {
      // Find People - navigate to UserSearchScreen
      setShowMessages(false);
      // @ts-ignore - Navigation type issue
      navigation.navigate('UserSearchScreen');
    } else if (contact.action === 'friends') {
      // Friends - navigate to AddFriendScreen
      setShowMessages(false);
      // @ts-ignore - Navigation type issue
      navigation.navigate('AddFriendScreen');
    }
  };

  const openChat = (chat: Chat) => {
    try {
      // @ts-ignore - Navigation type issue
      navigation.navigate('ChatScreen', {
        chatId: chat.id,
        participantName: chat.participant?.username || 'Unknown User'
      });
    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert(
        'Error',
        'Unable to open chat. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const openFriendChat = async (friend: Friend) => {
    try {
      if (!user?.uid) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      // Create a consistent chat ID format (sorted user IDs)
      const participantIds = [user.uid, friend.uid].sort();
      const chatId = `${participantIds[0]}_${participantIds[1]}`;
      
      // @ts-ignore - Navigation type issue
      navigation.navigate('ChatScreen', {
        chatId: chatId,
        participantName: friend.username
      });
    } catch (error) {
      console.error('Error opening friend chat:', error);
      Alert.alert(
        'Error',
        'Unable to open chat. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'reminder':
        return 'clock';
      case 'promotion':
        return 'tag';
      case 'system':
        return 'settings';
      case 'chat':
        return 'message-circle';
      default:
        return 'bell';
    }
  };

  // Helper function to format notification time
  const formatNotificationTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return 'Vừa xong';
  };

  const renderMessagesTab = () => {
    console.log('renderMessagesTab called, showMessages:', showMessages);
    return (
      <Modal
        visible={showMessages}
        animationType="slide"
        onRequestClose={() => setShowMessages(false)}
      >
        <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowMessages(false)}
          >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>Messages</Text>
                         {(friendRequests.length > 0 || notifications.filter(n => !n.read).length > 0) && (
               <View style={styles.modalBadgesContainer}>
                 {friendRequests.length > 0 && (
                   <View style={styles.modalFriendRequestBadge}>
                     <Text style={styles.modalBadgeText}>{friendRequests.length}</Text>
                   </View>
                 )}
                 {notifications.filter(n => !n.read).length > 0 && (
                   <View style={styles.modalNotificationBadge}>
                     <Text style={styles.modalBadgeText}>
                       {notifications.filter(n => !n.read).length}
                     </Text>
                   </View>
                 )}
               </View>
             )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-3" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Contacts Section */}
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Contacts</Text>
            


            {/* Existing Contacts */}
            {contacts.map((contact) => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.contactRow}
                onPress={() => handleContactPress(contact)}
              >
                <View style={styles.contactLeft}>
                  {contact.icon.startsWith('http') ? (
                    <Image source={{ uri: contact.icon }} style={styles.contactAvatar} />
                  ) : (
                    <LinearGradient
                      colors={['#FFF5F5', '#FFE5F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.contactIconContainer}
                    >
                      <Feather name={contact.icon as any} size={20} color="#666" />
                    </LinearGradient>
                  )}
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
                  </View>
                </View>
                {contact.hasArrow && (
                  <Feather name="chevron-right" size={20} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Friend Requests Section */}
          {friendRequests.length > 0 && (
            <View style={styles.contactsSection}>
              <Text style={styles.sectionTitle}>Friend Requests ({friendRequests.length})</Text>
              {friendRequests.map((request) => (
                <View key={request.id} style={styles.friendRequestItem}>
                  <View style={styles.friendRequestInfo}>
                    <LinearGradient
                      colors={['#FFF5F5', '#FFE5F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.friendRequestAvatar}
                    >
                      {request.user && request.user.avatar ? (
                        <Image source={{ uri: request.user.avatar }} style={styles.avatarImage} />
                      ) : (
                        <Feather name="user" size={20} color="#666" />
                      )}
                    </LinearGradient>
                    <View style={styles.friendRequestDetails}>
                      <Text style={styles.friendRequestName}>
                        {request.user && request.user.username ? request.user.username : 'Unknown User'}
                      </Text>
                      <Text style={styles.friendRequestEmail}>
                        {request.user && request.user.email ? request.user.email : 'No email'}
                      </Text>
                      {request.message && (
                        <Text style={styles.friendRequestMessage}>"{request.message}"</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.friendRequestActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptFriendRequest(request)}
                    >
                      <Feather name="check" size={16} color="#fff" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectFriendRequest(request)}
                    >
                      <Feather name="x" size={16} color="#fff" />
                      <Text style={styles.acceptButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Friends Section */}
          {friends.length > 0 && (
            <View style={styles.contactsSection}>
              <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
              {(showAllFriends ? friends : friends.slice(0, 2)).map((friend) => (
                <TouchableOpacity
                  key={friend.uid}
                  style={styles.contactRow}
                  onPress={() => openFriendChat(friend)}
                >
                  <View style={styles.contactLeft}>
                    <LinearGradient
                      colors={['#FFF5F5', '#FFE5F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.contactIconContainer}
                    >
                      {friend.avatar ? (
                        <Image source={{ uri: friend.avatar }} style={styles.contactAvatar} />
                      ) : (
                        <Feather name="user" size={20} color="#666" />
                      )}
                    </LinearGradient>
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactName}>{friend.username}</Text>
                      <Text style={styles.contactSubtitle}>Tap to start chatting</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              ))}
              
              {friends.length > 2 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllFriends(!showAllFriends)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllFriends ? 'Show Less' : `Show ${friends.length - 2} More`}
                  </Text>
                  <Feather 
                    name={showAllFriends ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#007AFF" 
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Chats Section */}
          {chats.length > 0 && (
            <View style={styles.contactsSection}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
              {chats.slice(0, 5).map((chat) => (
                <TouchableOpacity 
                  key={chat.id} 
                  style={styles.contactRow}
                  onPress={() => openChat(chat)}
                >
                  <View style={styles.contactLeft}>
                    <LinearGradient
                      colors={['#FFF5F5', '#FFE5F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.contactIconContainer}
                    >
                      <Feather name="user" size={20} color="#666" />
                    </LinearGradient>
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactName}>
                        {chat.participant?.username || 'Unknown User'}
                      </Text>
                      <Text style={styles.contactSubtitle} numberOfLines={1}>
                        {chat.lastMessage || 'No messages yet'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatTimestamp}>
                      {formatTimestamp(chat.lastMessageTime)}
                    </Text>
                    {chat.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
    );
  };

  console.log('InboxScreen render, showMessages:', showMessages);
  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.editButton}>
          <Feather name="edit-3" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <View style={styles.badgesContainer}>
                {friendRequests.length > 0 && (
                  <View style={styles.friendRequestBadge}>
                    <Text style={styles.friendRequestBadgeText}>{friendRequests.length}</Text>
                  </View>
                )}
                {notifications.filter(n => !n.read).length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notifications.filter(n => !n.read).length}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => {
                console.log('See all button pressed, setting showMessages to true');
                setShowMessages(true);
              }}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.messageCard } 
                onPress={() => {
                setShowMessages(true);
              }}>
            <View style={styles.messageCardContent}>
              <LinearGradient
                colors={['#FF8FB1', '#FF6B9D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.messageIconContainer}
              >
                <Feather name="user-plus" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.messageTextContainer}>
                <Text style={styles.messageTitle}>
                  {notifications.filter(n => !n.read).length > 0 
                    ? `${notifications.filter(n => !n.read).length} unread message${notifications.filter(n => !n.read).length > 1 ? 's' : ''}`
                    : friendRequests.length > 0 
                    ? `${friendRequests.length} friend request${friendRequests.length > 1 ? 's' : ''}`
                    : friends.length > 0 
                    ? `${friends.length} friend${friends.length > 1 ? 's' : ''}`
                    : 'Find people to message'
                  }
                </Text>
                <Text style={styles.messageSubtitle}>
                  {notifications.filter(n => !n.read).length > 0 
                    ? 'Tap to view messages'
                    : friendRequests.length > 0 
                    ? 'Tap to view and respond to requests'
                    : friends.length > 0 
                    ? 'Tap to chat with friends'
                    : 'Connect to start chatting'
                  }
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>



        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {notificationsLoading ? (
            <View style={styles.notificationsLoadingContainer}>
              <Feather name="loader" size={24} color="#007AFF" style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  {!notification.read && <View style={styles.unreadDot} />}
                  <LinearGradient
                    colors={['#FFF5F5', '#FFE5F0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.notificationIconContainer}
                  >
                    <Feather 
                      name={getNotificationIcon(notification.type)} 
                      size={20} 
                      color="#666" 
                    />
                  </LinearGradient>
                  <View style={styles.notificationTextContainer}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadNotificationTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationDescription}>{notification.message}</Text>
                  </View>
                </View>
                <View style={styles.notificationRight}>
                  <Text style={styles.notificationTimestamp}>
                    {formatNotificationTime(notification.createdAt)}
                  </Text>
                  <TouchableOpacity style={styles.notificationOptions}>
                    <Feather name="more-vertical" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noNotificationsContainer}>
              <Feather name="bell" size={48} color="#ccc" />
              <Text style={styles.noNotificationsText}>No Notifications</Text>
              <Text style={styles.noNotificationsSubtext}>
                You're all caught up! New notifications will appear here.
              </Text>
              <View style={styles.noNotificationsActions}>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={loadNotifications}
                >
                  <Feather name="refresh-cw" size={16} color="#007AFF" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Messages Modal */}
      {renderMessagesTab()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  editButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendRequestBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  friendRequestBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  messageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  messageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  messageTextContainer: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  messageSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  updateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  updateThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  updateTextContainer: {
    flex: 1,
  },
  updateDescription: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  updateRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  updateTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  updateOptions: {
    padding: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  modalTitleContainer: {
    alignItems: 'center',
    gap: 10,
  },
  modalBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  modalFriendRequestBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalNotificationBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingTop: 8,
  },
  contactsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 18,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  contactSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  // Chat-related styles
  chatInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Friend Request Styles
  friendRequestItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  friendRequestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  friendRequestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  friendRequestDetails: {
    flex: 1,
  },
  friendRequestName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  friendRequestEmail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  friendRequestMessage: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  friendRequestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // Friend Styles
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    padding: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFF5F5',
    marginTop: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
  },
  showMoreText: {
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  // Notification Styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  unreadNotificationTitle: {
    fontWeight: '700',
    color: '#FF6B9D',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  notificationOptions: {
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
  },
  noNotificationsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noNotificationsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  noNotificationsSubtext: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  noNotificationsActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  // Loading States
  notificationsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

});

export default InboxScreen;