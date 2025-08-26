import { getApiBaseUrl } from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = getApiBaseUrl();

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'promotion' | 'system' | 'chat';
  read: boolean;
  createdAt: number;
  expiresAt?: number;
  data?: {
    chatId?: string;
    senderId?: string;
    actionUrl?: string;
    priority?: 'high' | 'normal' | 'low';
    [key: string]: any;
  };
}

class NotificationService {
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

    async getNotifications(): Promise<Notification[]> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('Fetching notifications from:', `${API_BASE_URL}/notifications`);
      
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers
      });

      console.log('Notification response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Notification API error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (response.status === 404) {
          throw new Error('Notifications endpoint not found');
        } else if (response.status === 500) {
          throw new Error('Server error - please try again later');
        } else {
          throw new Error(errorData.error || `Failed to fetch notifications (${response.status})`);
        }
      }

      const data = await response.json();
      console.log('Notification response data:', data);
      
      // Handle empty notifications gracefully
      if (!data.notifications || data.notifications.length === 0) {
        console.log('No notifications found - returning empty array');
        return [];
      }
      
      // Validate and clean notification data
      const validNotifications = await Promise.all(
        data.notifications.map(async (notification: any) => {
          // Ensure required fields exist
          if (!notification.id || !notification.message || !notification.createdAt) {
            console.warn('Invalid notification found:', notification);
            return null;
          }
          
          // Ensure message doesn't contain raw user IDs
          if (notification.message && notification.message.includes('user_')) {
            // Try to extract username from data if available
            if (notification.data && notification.data.senderUsername) {
              notification.message = notification.message.replace(
                /user_[a-zA-Z0-9_]+/g, 
                notification.data.senderUsername
              );
            } else {
              // If no username in data, try to extract user ID and fetch username
              const userIDMatch = notification.message.match(/user_[a-zA-Z0-9_]+/);
              if (userIDMatch && notification.data && notification.data.senderId) {
                // Try to fetch username from backend
                try {
                  const username = await this.fetchUsername(notification.data.senderId);
                  if (username) {
                    notification.message = notification.message.replace(
                      /user_[a-zA-Z0-9_]+/g, 
                      username
                    );
                    // Update the notification data for future use
                    if (notification.data) {
                      notification.data.senderUsername = username;
                    }
                  } else {
                    // Fallback to "Unknown User" if username fetch fails
                    notification.message = notification.message.replace(
                      /user_[a-zA-Z0-9_]+/g, 
                      'Unknown User'
                    );
                  }
                } catch (error) {
                  console.log('Could not fetch username, using Unknown User as fallback');
                  notification.message = notification.message.replace(
                    /user_[a-zA-Z0-9_]+/g, 
                    'Unknown User'
                  );
                }
              } else {
                // If no senderId available, just clean up the message
                notification.message = notification.message.replace(
                  /user_[a-zA-Z0-9_]+/g, 
                  'Unknown User'
                );
              }
            }
          }
          
          return notification;
        })
      );
      
      // Filter out null notifications (invalid ones)
      return validNotifications.filter(notification => notification !== null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Fetch username for a given user ID
   * This is used as a fallback when notifications don't have senderUsername
   */
  private async fetchUsername(userId: string): Promise<string | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        return data.profile?.username || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching username:', error);
      return null;
    }
  }

  async createNotification(notificationData: {
    title: string;
    message: string;
    type: Notification['type'];
    data?: Notification['data'];
  }): Promise<Notification> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const result = await response.json();
      return result.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
