import { getBackendBaseUrl } from '../config/apiConfig';

export interface PlanningData {
  destinations: string[];
  tripDays: number;
  companion: string;
  preferences: any[];
  budget: number;
}

export interface GeneratedTripPlan {
  planName: string;
  summary: string;
  itinerary: {
    days: Array<{
      day: number;
      date: string;
      title: string;
      description: string;
      activities: Array<{
        time: string;
        activity: string;
        location: string;
        duration: string;
        cost: string;
        notes: string;
      }>;
      meals: {
        breakfast: string;
        lunch: string;
        dinner: string;
      };
      accommodation: string;
      transportation: string;
      estimatedCost: string;
    }>;
  };
  totalEstimatedCost: string;
  travelTips: string[];
  packingList: string[];
  emergencyContacts: {
    localEmergency: string;
    embassy: string;
  };
}

export interface GenerateTripPlanResponse {
  message: string;
  generatedContent: GeneratedTripPlan;
  // planId is not included here since plan is not saved yet
  // planId will be provided when user saves the plan
}

class GeminiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getBackendBaseUrl();
  }

  async generateTripPlan(planningData: PlanningData, token: string): Promise<GenerateTripPlanResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/trip-plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(planningData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error types
        if (response.status === 401) {
          if (errorData.error === 'Token expired.') {
            throw new Error('Token expired.');
          } else {
            throw new Error('Authentication failed. Please log in again.');
          }
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorData.error || 'Failed to generate trip plan');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating trip plan:', error);
      throw error;
    }
  }
}

export default new GeminiService();
