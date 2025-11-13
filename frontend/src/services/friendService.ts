import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = getApiBaseUrl();

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  user?: {
    uid: string;
    username: string;
    email: string;
    avatar?: string;
    country?: string;
  };
}

export interface Friend {
  uid: string;
  username: string;
  email: string;
  avatar?: string;
  country?: string;
  addedAt: number;
  lastSeen?: number;
  isOnline?: boolean;
}

export interface FriendStatus {
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends';
  currentUserId: string;
  targetUserId: string;
}

class FriendService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
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

  async sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<{ requestId: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fromUserId,
          toUserId,
          message: message || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }

      const result = await response.json();
      return { requestId: result.requestId };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async checkFriendStatus(currentUserId: string, targetUserId: string): Promise<FriendStatus> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/friends/status?currentUserId=${currentUserId}&targetUserId=${targetUserId}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check friend status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking friend status:', error);
      throw error;
    }
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async getFriendRequests(type: 'incoming' | 'outgoing' = 'incoming'): Promise<FriendRequest[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends/requests?type=${type}`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get friend requests');
      }

      const data = await response.json();
      return data.requests || [];
    } catch (error) {
      console.error('Error getting friend requests:', error);
      throw error;
    }
  }

  async getFriends(): Promise<Friend[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get friends');
      }

      const data = await response.json();
      return data.friends || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/friends/remove`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ friendId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
}

export default new FriendService();
