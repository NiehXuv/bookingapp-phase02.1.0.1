import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

interface User {
  uid: string;
  username: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, country: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  testBackendConnection: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    if (!token) return true;
    
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (exp field is in seconds)
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Refresh token by re-authenticating
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!user?.email) {
        console.log('No user email available for token refresh');
        return false;
      }

      console.log('Attempting to refresh token...');
      
      // For now, we'll need the user to re-enter their password
      // In a production app, you'd implement a refresh token mechanism
      console.log('Token refresh requires re-authentication');
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Check if token is expired
          const tokenParts = storedToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              if (payload.exp > currentTime) {
                // Token is still valid
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
              } else {
                // Token is expired, clear it
                console.log('Stored token is expired, clearing...');
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
              }
            } catch (error) {
              console.error('Error parsing stored token:', error);
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting login process...');
      
      // Use authService instead of direct API call
      const response = await authService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        console.log('AuthContext: Login successful, user:', response.user);
        
        setUser(response.user);
        setToken(response.token);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('AuthContext: Login error:', err);
      throw new Error(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, country: string, phoneNumber: string) => {
    setLoading(true);
    try {
      console.log('AuthContext: Starting signup process...');
      
      // Use authService instead of direct API call
      const response = await authService.signup({ username, email, password, country, phoneNumber });
      
      if (response.success && response.user && response.token) {
        console.log('AuthContext: Signup successful, user:', response.user);
        
        setUser(response.user);
        setToken(response.token);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err: any) {
      console.error('AuthContext: Signup error:', err);
      throw new Error(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('AuthContext: User logged out successfully');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  };

  const testBackendConnection = async (): Promise<boolean> => {
    try {
      return await authService.testConnection();
    } catch (error) {
      console.error('AuthContext: Backend connection test failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      loading, 
      login, 
      signup, 
      logout,
      testBackendConnection,
      refreshToken,
      isTokenExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};