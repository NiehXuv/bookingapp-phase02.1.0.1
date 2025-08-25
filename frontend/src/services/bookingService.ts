import { API_CONFIG } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BookingData {
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'hotel' | 'tour' | 'transport' | 'restaurant';
  guestsNumber: number;
  details: {
    hotelId?: string;
    tourId?: string;
    transportId?: string;
    price: number;
    currency: string;
    [key: string]: any;
  };
}

export interface Booking {
  id?: string; // Optional for backward compatibility
  bookingId: string; // Backend returns this
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'hotel' | 'tour' | 'transport' | 'restaurant';
  guestsNumber: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
  updatedAt: number;
  details: {
    hotelId?: string;
    tourId?: string;
    transportId?: string;
    price: number;
    currency: string;
    [key: string]: any;
  };
}

class BookingService {
  private baseUrl = API_CONFIG.BACKEND.BASE_URL;

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getStoredToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('🔐 Token retrieved successfully, length:', token.length);
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      console.log('🔐 Attempting to retrieve token from AsyncStorage...');
      const token = await AsyncStorage.getItem('token');
      console.log('🔐 Token retrieved:', token ? `Length: ${token.length}` : 'null');
      return token;
    } catch (error) {
      console.error('🔐 Error getting stored token:', error);
      return null;
    }
  }

  async createBooking(bookingData: BookingData): Promise<{ bookingId: string; booking: Booking }> {
    try {
      console.log('🔐 Creating booking with data:', bookingData);
      console.log('🔐 Base URL:', this.baseUrl);
      
      // Test backend connectivity first
      try {
        const healthCheck = await fetch(`${this.baseUrl}/api/health`);
        console.log('🔐 Backend health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('🔐 Backend health check failed:', healthError);
      }
      
      const headers = await this.getAuthHeaders();
      console.log('🔐 Headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData),
      });

      console.log('🔐 Response status:', response.status);
      console.log('🔐 Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔐 API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('🔐 Booking created successfully:', result);
      return result;
    } catch (error) {
      console.error('🔐 Error creating booking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<{ bookings: Booking[]; count: number; message: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/bookings`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async updateBooking(bookingId: string, updates: Partial<BookingData>): Promise<Booking> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

export default new BookingService();
