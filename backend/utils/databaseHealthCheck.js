const { database, ref, get } = require('../config/firebaseconfig');

/**
 * Database Health Check Utility
 * Provides functions to check database integrity and handle missing data
 */

class DatabaseHealthCheck {
  /**
   * Check if a user exists and has basic profile data
   */
  static async checkUserExists(userId) {
    try {
      const userRef = ref(database, `Users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        return { exists: false, hasProfile: false, hasBasicData: false };
      }
      
      const userData = userSnapshot.val();
      const hasProfile = userData.profile && Object.keys(userData.profile).length > 0;
      const hasBasicData = userData.email || userData.username;
      
      return {
        exists: true,
        hasProfile,
        hasBasicData,
        userData
      };
    } catch (error) {
      console.error(`Error checking user ${userId}:`, error);
      return { exists: false, hasProfile: false, hasBasicData: false, error: error.message };
    }
  }

  /**
   * Get user data with fallbacks for missing profile
   */
  static async getUserDataWithFallback(userId) {
    try {
      const userRef = ref(database, `Users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        return {
          uid: userId,
          username: 'Unknown User',
          email: '',
          avatar: null,
          country: null,
          exists: false
        };
      }
      
      const userData = userSnapshot.val();
      
      // Try to get profile data first
      let profile = {};
      try {
        const profileRef = ref(database, `Users/${userId}/profile`);
        const profileSnapshot = await get(profileRef);
        if (profileSnapshot.exists()) {
          profile = profileSnapshot.val();
        }
      } catch (error) {
        console.log(`Profile not found for user ${userId}, using fallback`);
      }
      
      return {
        uid: userId,
        username: profile.username || userData.username || userData.email?.split('@')[0] || 'Unknown User',
        email: profile.email || userData.email || '',
        avatar: profile.avatar || userData.avatar || null,
        country: profile.country || userData.country || null,
        exists: true,
        hasProfile: Object.keys(profile).length > 0
      };
    } catch (error) {
      console.error(`Error getting user data for ${userId}:`, error);
      return {
        uid: userId,
        username: 'Unknown User',
        email: '',
        avatar: null,
        country: null,
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a chat exists and is accessible to user
   */
  static async checkChatAccess(userId, chatId) {
    try {
      const chatRef = ref(database, `Users/${userId}/chats/${chatId}`);
      const chatSnapshot = await get(chatRef);
      
      if (!chatSnapshot.exists()) {
        return { exists: false, accessible: false };
      }
      
      const chatData = chatSnapshot.val();
      const isParticipant = chatData.participants && chatData.participants.includes(userId);
      
      return {
        exists: true,
        accessible: isParticipant,
        chatData
      };
    } catch (error) {
      console.error(`Error checking chat access for user ${userId}, chat ${chatId}:`, error);
      return { exists: false, accessible: false, error: error.message };
    }
  }

  /**
   * Validate friend request data
   */
  static async validateFriendRequest(requestId) {
    try {
      const requestRef = ref(database, `FriendRequests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (!requestSnapshot.exists()) {
        return { valid: false, error: 'Request not found' };
      }
      
      const request = requestSnapshot.val();
      
      // Check if both users exist
      const [fromUser, toUser] = await Promise.all([
        this.checkUserExists(request.fromUserId),
        this.checkUserExists(request.toUserId)
      ]);
      
      if (!fromUser.exists || !toUser.exists) {
        return { valid: false, error: 'One or both users not found' };
      }
      
      return {
        valid: true,
        request,
        fromUser: fromUser.userData,
        toUser: toUser.userData
      };
    } catch (error) {
      console.error(`Error validating friend request ${requestId}:`, error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get system health summary
   */
  static async getSystemHealth() {
    try {
      const healthRef = ref(database, 'SystemHealth');
      const healthSnapshot = await get(healthRef);
      
      if (healthSnapshot.exists()) {
        return healthSnapshot.val();
      }
      
      return {
        status: 'unknown',
        lastCheck: Date.now(),
        message: 'No health data available'
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'error',
        lastCheck: Date.now(),
        error: error.message
      };
    }
  }
}

module.exports = DatabaseHealthCheck;
