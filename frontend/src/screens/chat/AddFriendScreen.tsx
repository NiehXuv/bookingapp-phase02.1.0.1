import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import friendService, { FriendRequest, Friend } from '../../services/friendService';

// Using imported interfaces from friendService

const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls for friend requests and friends list
      await loadFriendRequests();
      await loadFriends();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await friendService.getFriendRequests('incoming');
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await friendService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    try {
      // Accept friend request via API
      await friendService.acceptFriendRequest(request.id);
      
      Alert.alert('Success', `Friend request from ${request.user?.username || 'Unknown User'} accepted!`);
      
      // Update local state
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      if (request.user) {
        setFriends(prev => [...prev, {
          uid: request.user.uid,
          username: request.user.username,
          email: request.user.email,
          avatar: request.user.avatar,
          country: request.user.country,
          addedAt: Date.now(),
          lastSeen: Date.now(),
          isOnline: false
        }]);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (request: FriendRequest) => {
    try {
      // Reject friend request via API
      await friendService.rejectFriendRequest(request.id);
      
      Alert.alert('Success', `Friend request from ${request.user?.username || 'Unknown User'} rejected`);
      
      // Update local state
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const removeFriend = async (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.username} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove friend via API
              await friendService.removeFriend(friend.uid);
              
              Alert.alert('Success', `${friend.username} removed from friends list`);
              
              // Update local state
              setFriends(prev => prev.filter(f => f.uid !== friend.uid));
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          }
        }
      ]
    );
  };

  const startChatWithFriend = (friend: Friend) => {
    // Navigate to chat screen
    navigation.navigate('ChatScreen', {
      chatId: `${friend.uid}_${Date.now()}`, // Generate a chat ID
      participantName: friend.username
    });
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.userInfoContainer}>
        <View style={styles.userAvatar}>
          {item.user?.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={24} color="#666" />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user?.username || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{item.user?.email || ''}</Text>
          {item.user?.country && (
            <Text style={styles.userCountry}>{item.user.country}</Text>
          )}
          {item.message && (
            <Text style={styles.requestMessage}>{item.message}</Text>
          )}
          <Text style={styles.requestTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => acceptFriendRequest(item)}
        >
          <Feather name="check" size={16} color="#fff" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={() => rejectFriendRequest(item)}
        >
          <Feather name="x" size={16} color="#fff" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity 
        style={styles.userInfoContainer}
        onPress={() => startChatWithFriend(item)}
      >
        <View style={styles.userAvatar}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={24} color="#666" />
          )}
          <View style={[
            styles.onlineIndicator,
            { backgroundColor: item.isOnline ? '#4CAF50' : '#999' }
          ]} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.country && (
            <Text style={styles.userCountry}>{item.country}</Text>
          )}
          <Text style={styles.lastSeen}>
            {item.isOnline ? 'Online' : `Last seen ${formatTimeAgo(item.lastSeen || 0)}`}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.friendActions}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => startChatWithFriend(item)}
        >
          <Feather name="message-circle" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFriend(item)}
        >
          <Feather name="user-minus" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const renderEmptyState = () => {
    if (activeTab === 'requests') {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="user-plus" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Friend Requests</Text>
          <Text style={styles.emptyStateSubtitle}>
            When someone sends you a friend request, it will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Feather name="users" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start by searching for users and sending friend requests
        </Text>
        <TouchableOpacity 
          style={styles.findPeopleButton}
          onPress={() => navigation.navigate('UserSearchScreen')}
        >
          <Text style={styles.findPeopleButtonText}>Find People</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('UserSearchScreen')}
        >
          <Feather name="user-plus" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({friendRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'requests' ? friendRequests : friends}
          renderItem={activeTab === 'requests' ? renderFriendRequest : renderFriend}
          keyExtractor={(item) => item.id || item.uid}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  addButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#FFF5F5',
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
    paddingTop: 8,
  },
  listContainer: {
    flexGrow: 1,
  },
  requestItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  friendItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  userCountry: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 20,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 16,
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
  rejectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  removeButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  findPeopleButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  findPeopleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddFriendScreen;
