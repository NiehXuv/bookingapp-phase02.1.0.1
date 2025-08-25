import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import chatService, { User } from '../../services/chatService';
import friendService, { FriendStatus } from '../../services/friendService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserWithStatus extends User {
  isFriend?: boolean;
  isPending?: boolean;
}

const UserSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    getCurrentUserId();
  }, []);

  const getCurrentUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.uid);
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      Alert.alert('Search Error', 'Please enter at least 2 characters to search');
      return;
    }

    try {
      setLoading(true);
      const results = await chatService.searchUsers(searchQuery.trim());
      
      // Filter out current user and get real friend status
      const filteredResults = results.filter(user => user.uid !== currentUserId);
      
      // Get friend status for each user
      const usersWithStatus = await Promise.all(
        filteredResults.map(async (user) => {
          try {
            const friendStatus = await friendService.checkFriendStatus(currentUserId, user.uid);
            return {
              ...user,
              isFriend: friendStatus.status === 'friends',
              isPending: friendStatus.status === 'pending_sent'
            };
          } catch (error) {
            console.error('Error checking friend status for user:', user.uid, error);
            return {
              ...user,
              isFriend: false,
              isPending: false
            };
          }
        })
      );
      
      setUsers(usersWithStatus);
      setSearched(true);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user: UserWithStatus) => {
    try {
      if (!currentUserId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      const chat = await chatService.createChat({
        participantIds: [currentUserId, user.uid]
      });

      // Navigate to chat screen
      navigation.navigate('ChatScreen', {
        chatId: chat.id,
        participantName: user.username
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const addFriend = async (user: UserWithStatus) => {
    try {
      if (!currentUserId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Send friend request via API
      await friendService.sendFriendRequest(currentUserId, user.uid);
      
      Alert.alert(
        'Friend Request Sent',
        `Friend request sent to ${user.username}`,
        [{ text: 'OK' }]
      );
      
      // Update user status locally
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === user.uid ? { ...u, isPending: true } : u
        )
      );
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const renderUser = ({ item }: { item: UserWithStatus }) => (
    <View style={styles.userItem}>
      <TouchableOpacity 
        style={styles.userInfoContainer}
        onPress={() => startChat(item)}
      >
        <View style={styles.userAvatar}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={24} color="#666" />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.country && (
            <Text style={styles.userCountry}>{item.country}</Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        {item.isPending ? (
          <View style={styles.pendingButton}>
            <Feather name="clock" size={16} color="#999" />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        ) : item.isFriend ? (
          <View style={styles.friendButton}>
            <Feather name="check" size={16} color="#4CAF50" />
            <Text style={styles.friendText}>Friends</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addFriendButton}
            onPress={() => addFriend(item)}
          >
            <Feather name="user-plus" size={16} color="#007AFF" />
            <Text style={styles.addFriendText}>Add Friend</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.startChatButton}
          onPress={() => startChat(item)}
        >
          <Feather name="message-circle" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (!searched) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="search" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>Search for Users</Text>
          <Text style={styles.emptyStateSubtitle}>
            Find other users by username or email to start chatting or add as friends
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Feather name="users" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>No Users Found</Text>
        <Text style={styles.emptyStateSubtitle}>
          Try searching with different keywords
        </Text>
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
        <Text style={styles.headerTitle}>Find People</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by username or email..."
            placeholderTextColor="#999"
            onSubmitEditing={searchUsers}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchUsers}
          disabled={loading || searchQuery.trim().length < 2}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={users.length === 0 ? styles.emptyListContainer : undefined}
      />
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
  searchContainer: {
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF5F5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  searchButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsList: {
    flex: 1,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  userItem: {
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
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addFriendText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  startChatButton: {
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  friendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  friendText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  },
});

export default UserSearchScreen;
