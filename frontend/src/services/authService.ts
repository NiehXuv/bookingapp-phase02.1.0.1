import { Alert, Platform } from 'react-native';
import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 AuthService: Using API URL:', API_BASE_URL);

export interface LoginData {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  country: string;
  phoneNumber: string;
}

// Updated to match backend response format
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    username: string;
    email: string;
    country?: string;
    phoneNumber?: string;
    role?: string;
  };
  token?: string;
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting login with:', loginData.email);
      console.log('AuthService: Using URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('AuthService: Backend response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Transform backend response to match frontend expectations
      return {
        success: true,
        message: data.message || 'Login successful',
        user: {
          uid: data.user?.uid || data.uid,
          username: data.user?.profile?.username || data.user?.username,
          email: data.user?.profile?.email || data.user?.email,
          country: data.user?.profile?.country,
          phoneNumber: data.user?.profile?.phoneNumber,
          role: data.user?.profile?.role
        },
        token: data.token
      };
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      
      // Better error handling for network issues
      if (error?.message?.includes('Network request failed')) {
        throw new Error(`Cannot connect to backend server. Please check:
1. Backend server is running on port 5000
2. You're using the correct IP address
3. No firewall blocking the connection

Current API URL: ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  async signup(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Attempting signup for:', signUpData.email);
      console.log('AuthService: Using URL:', `${API_BASE_URL}/auth/signup`);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();
      console.log('AuthService: Backend signup response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Transform backend response to match frontend expectations
      return {
        success: true,
        message: data.message || 'Signup successful',
        user: {
          uid: data.user?.uid || data.uid,
          username: data.user?.profile?.username || data.user?.username,
          email: data.user?.profile?.email || data.user?.email,
          country: data.user?.profile?.country,
          phoneNumber: data.user?.profile?.phoneNumber,
          role: data.user?.profile?.role
        },
        token: data.token
      };
    } catch (error: any) {
      console.error('AuthService: Signup error:', error);
      
      // Better error handling for network issues
      if (error?.message?.includes('Network request failed')) {
        throw new Error(`Cannot connect to backend server. Please check:
1. Backend server is running on port 5000
2. You're using the correct IP address
3. No firewall blocking the connection

Current API URL: ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear any stored tokens or user data
      // This could involve AsyncStorage or other storage mechanisms
      console.log('AuthService: User logged out');
    } catch (error) {
      console.error('AuthService: Logout error:', error);
      throw error;
    }
  }

  // Test backend connection with better error handling
  async testConnection(): Promise<boolean> {
    try {
      console.log('AuthService: Testing connection to:', `${API_BASE_URL}/health`);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('AuthService: Health check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('AuthService: Health check data:', data);
        return true;
      } else {
        console.log('AuthService: Health check failed with status:', response.status);
        return false;
      }
    } catch (error: any) {
      console.error('AuthService: Connection test failed:', error);
      
      // Provide specific error information
      if (error?.message?.includes('Network request failed')) {
        console.error(`Network Error Details:
- API URL: ${API_BASE_URL}
- Platform: ${Platform.OS}
- Development Mode: ${__DEV__}
- Error: ${error?.message}`);
      }
      
      return false;
    }
  }

  // Get current API URL for debugging
  getApiUrl(): string {
    return API_BASE_URL;
  }
}

export default new AuthService(); 