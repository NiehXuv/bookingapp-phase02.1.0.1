import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';

export interface TripPlan {
  id: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: any[];
  createdAt: number;
  updatedAt: number;
}

export interface TripPlansResponse {
  success: boolean;
  tripPlans: TripPlan[];
  count: number;
  message: string;
}

class TripPlanService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllTripPlans(): Promise<TripPlansResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/api/trip-plans`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trip plans:', error);
      throw new Error('Failed to fetch trip plans');
    }
  }

  async getTripPlan(planId: string): Promise<TripPlan> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/api/trip-plans/${planId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tripPlan;
    } catch (error) {
      console.error('Error fetching trip plan:', error);
      throw new Error('Failed to fetch trip plan');
    }
  }

  async createTripPlan(tripPlanData: Partial<TripPlan>): Promise<TripPlan> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/api/trip-plans`, {
        method: 'POST',
        headers,
        body: JSON.stringify(tripPlanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tripPlan;
    } catch (error) {
      console.error('Error creating trip plan:', error);
      throw new Error('Failed to create trip plan');
    }
  }

  async updateTripPlan(planId: string, tripPlanData: Partial<TripPlan>): Promise<TripPlan> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/api/trip-plans/${planId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(tripPlanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tripPlan;
    } catch (error) {
      console.error('Error updating trip plan:', error);
      throw new Error('Failed to update trip plan');
    }
  }

  async deleteTripPlan(planId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_CONFIG.BACKEND.BASE_URL}/api/trip-plans/${planId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting trip plan:', error);
      throw new Error('Failed to delete trip plan');
    }
  }
}

export default new TripPlanService();
