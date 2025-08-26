import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import chatService from '../../services/chatService';
import { Message } from '../../services/chatService';
import AuthContext from '../../context/AuthContext';

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  let authContext;
  let user;
  
  try {
    authContext = useContext(AuthContext);
    user = authContext?.user;
  } catch (error) {
    console.error('Error accessing AuthContext:', error);
    authContext = null;
    user = null;
  }
  
  // Safety check for route params
  if (!route?.params) {
    console.error('Route params are undefined');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Invalid route parameters</Text>
      </View>
    );
  }
  
  // Safety check for navigation
  if (!navigation) {
    console.error('Navigation is undefined');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Navigation not available</Text>
      </View>
    );
  }
  
  const routeParams = route.params as { chatId: string; participantName: string } | undefined;
  const chatId = routeParams?.chatId || '';
  const participantName = routeParams?.participantName || 'Chat';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      // Set up real-time updates here (Firebase listeners)
    }
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await chatService.getMessages(chatId);
      console.log('Loaded messages:', messagesData);
      console.log('Current user:', user);
      setMessages(messagesData);
      
      // Mark chat as read when opening
      try {
        await chatService.markChatAsRead(chatId);
      } catch (readError) {
        // Handle different types of read errors gracefully
        if (readError.message === 'Failed to mark chat as read') {
          console.log('Could not mark chat as read - this is normal for new chats or when backend is unavailable');
        } else if (readError.message.includes('Chat not found')) {
          console.log('Chat not found - this is normal for new chats');
        } else {
          console.log('Unexpected error marking chat as read:', readError.message);
        }
        // Don't show error to user - this is not critical functionality
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Handle different types of errors gracefully
      if (error.message === 'Failed to fetch messages' || 
          error.message === 'No messages found for this chat' ||
          error.message === 'Chat not found') {
        // These are expected for new chats - don't show error
        console.log('Chat is new or empty - this is normal');
        setMessages([]);
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        // Network errors - show retry option
        Alert.alert(
          'Connection Error', 
          'Failed to load messages. Please check your connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => loadMessages() }
          ]
        );
      } else {
        // Other errors - show generic message
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      }
      
      // Always set empty messages array as fallback
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !user?.uid) return;

    try {
      setSending(true);
      console.log('Sending message with user ID:', user.uid);
      
      const messageResponse = await chatService.sendMessage({
        chatId,
        content: newMessage.trim(),
        type: 'text'
      });

      console.log('Message sent successfully:', messageResponse);
      
      // Create a proper message object with the correct structure
      const newMessageObj = {
        id: messageResponse.messageId || messageResponse.id || Date.now().toString(),
        chatId,
        senderId: user.uid,
        content: messageResponse.data?.content || newMessage.trim(),
        type: 'text' as const,
        timestamp: messageResponse.data?.timestamp || Date.now(),
        readBy: messageResponse.data?.readBy || [user.uid]
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Safety check for message item
    if (!item || !item.senderId || !user?.uid) {
      console.log('Invalid message or user data:', { item, user });
      return null;
    }
    
    const isOwnMessage = item.senderId === user.uid;
    
    // Debug logging to see what's happening with message ownership
    console.log('Message debug:', {
      messageId: item.id,
      senderId: item.senderId,
      currentUserId: user.uid,
      isOwnMessage,
      content: item.content?.substring(0, 20) + '...' || 'No content'
    });

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {participantName ? participantName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        {isOwnMessage && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.ownAvatar]}>
              <Text style={styles.ownAvatarText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Safety check for user context
  if (!authContext || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading user context...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {participantName ? participantName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{participantName || 'Chat'}</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
        </View>
        
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={!messages || messages.length === 0 ? styles.emptyMessagesContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyMessagesContainer}>
            <Feather name="message-circle" size={48} color="#ccc" />
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
            <Text style={styles.emptyMessagesSubtext}>Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    letterSpacing: -0.2,
  },
  emptyMessagesSubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    lineHeight: 20,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownAvatar: {
    backgroundColor: '#FF6B9D',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  ownAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  otherMessageText: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#666',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#FFF5F5',
  },
  sendButton: {
    backgroundColor: '#FF6B9D',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatScreen;
