import { ContentItem } from '../types/content';
import { getBackendBaseUrl } from '../config/apiConfig';

const API_BASE_URL = `${getBackendBaseUrl()}/api`;

export interface SavedContentResponse {
  success: boolean;
  message: string;
  favorites?: {
    hotels: string[];
    places: string[];
    tours: string[];
    content?: ContentItem[]; // For content items
  };
}

class SavedContentService {
  private getAuthHeaders(): HeadersInit {
    // Get token from AsyncStorage or wherever it's stored
    // For now, we'll need to pass it from the component
    return {
      'Content-Type': 'application/json',
    };
  }

  async saveContent(content: ContentItem, token: string): Promise<SavedContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/add`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'content', // New type for content items
          itemId: content.id,
          contentData: content, // Store the full content data
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save content');
      }

      return {
        success: true,
        message: data.message || 'Content saved successfully',
        favorites: data.favorites,
      };
    } catch (error: any) {
      console.error('Error saving content:', error);
      
      // Handle network errors specifically
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async removeSavedContent(contentId: string, token: string): Promise<SavedContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/remove`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'content',
          itemId: contentId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove saved content');
      }

      return {
        success: true,
        message: data.message || 'Content removed from saved successfully',
        favorites: data.favorites,
      };
    } catch (error: any) {
      console.error('Error removing saved content:', error);
      
      // Handle network errors specifically
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async getSavedContent(token: string): Promise<SavedContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites?type=content`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get saved content');
      }

      // The backend returns data directly, not wrapped in a success object
      return {
        success: true,
        message: data.message || 'Saved content retrieved successfully',
        favorites: data.favorites,
      };
    } catch (error: any) {
      console.error('Error getting saved content:', error);
      
      // Handle network errors specifically
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async checkIfContentSaved(contentId: string, token: string): Promise<boolean> {
    try {
      const savedContent = await this.getSavedContent(token);
      if (savedContent.favorites?.content) {
        return savedContent.favorites.content.some(item => item.id === contentId);
      }
      return false;
    } catch (error) {
      console.error('Error checking if content is saved:', error);
      return false;
    }
  }
}

export default new SavedContentService();
