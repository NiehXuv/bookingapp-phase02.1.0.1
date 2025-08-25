const API_BASE_URL = 'http://192.168.1.88:5000/api';

export interface UserProfile {
  username: string;
  email: string;
  country?: string;
  phoneNumber?: string;
  role?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

class UserProfileService {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  async getUserProfile(token: string): Promise<UserProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
      }

      return {
        success: true,
        message: data.message || 'User profile retrieved successfully',
        profile: data.profile,
      };
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      
      // Handle network errors specifically
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>, token: string): Promise<UserProfileResponse> {
    try {
      console.log('Sending profile update data:', JSON.stringify(profileData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user profile');
      }

      return {
        success: true,
        message: data.message || 'User profile updated successfully',
        profile: data.profile,
      };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default new UserProfileService();
