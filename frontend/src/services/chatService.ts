import { getApiBaseUrl } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = getApiBaseUrl();

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  createdAt: number;
  participant?: {
    uid: string;
    username: string;
    avatar?: string;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: number;
  readBy: string[];
}

export interface User {
  uid: string;
  username: string;
  email: string;
  avatar?: string;
  country?: string;
}

export interface CreateChatRequest {
  participantIds: string[];
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'location';
}

class ChatService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw new Error('Authentication failed');
    }
  }

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async createChat(data: CreateChatRequest): Promise<Chat> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const result = await response.json();
      return result.chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid message data');
        }
        
        if (response.status === 404) {
          throw new Error(errorData.error || 'Chat not found');
        }
        
        if (response.status === 500) {
          throw new Error('Server error - please try again later');
        }
        
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      
      // Handle the response structure properly
      if (result.data) {
        return result.data;
      } else if (result.message) {
        // Fallback for old response format
        return result.message;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getChats(): Promise<Chat[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages?limit=${limit}`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 404) {
          if (errorData.error === 'Chat not found') {
            throw new Error('Chat not found');
          }
          // For new chats, return empty array instead of error
          return [];
        }
        
        if (response.status === 500) {
          throw new Error('Server error - please try again later');
        }
        
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      
      // Handle empty messages gracefully
      if (!data.messages || data.messages.length === 0) {
        console.log(`No messages found for chat ${chatId} - this is normal for new chats`);
        return [];
      }
      
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // If it's a network error or fetch failure, provide more specific error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      
      throw error;
    }
  }

  async markChatAsRead(chatId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/read`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to mark chat as read');
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }
}

export default new ChatService();
