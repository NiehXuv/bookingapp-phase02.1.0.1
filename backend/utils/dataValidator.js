const { database, ref, get } = require('../config/firebaseconfig');

/**
 * Data Validation Utility
 * Provides comprehensive validation and fallback handling for missing data
 */

class DataValidator {
  /**
   * Validate and sanitize user data with fallbacks
   */
  static validateUserData(userData, userId) {
    if (!userData) {
      return {
        uid: userId,
        username: 'Unknown User',
        email: '',
        avatar: null,
        country: null,
        isValid: false,
        missingFields: ['all']
      };
    }

    const missingFields = [];
    const validatedData = {
      uid: userId,
      username: userData.username || userData.email?.split('@')[0] || 'Unknown User',
      email: userData.email || '',
      avatar: userData.avatar || null,
      country: userData.country || null,
      isValid: true
    };

    // Check for missing critical fields
    if (!userData.username && !userData.email) {
      missingFields.push('username', 'email');
      validatedData.isValid = false;
    }

    if (missingFields.length > 0) {
      validatedData.missingFields = missingFields;
      validatedData.isValid = false;
    }

    return validatedData;
  }

  /**
   * Validate and sanitize chat data with fallbacks
   */
  static validateChatData(chatData, chatId) {
    if (!chatData) {
      return {
        chatId,
        participants: [],
        lastMessage: '',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        createdAt: Date.now(),
        isValid: false,
        missingFields: ['all']
      };
    }

    const missingFields = [];
    const validatedData = {
      chatId,
      participants: Array.isArray(chatData.participants) ? chatData.participants : [],
      lastMessage: chatData.lastMessage || '',
      lastMessageTime: chatData.lastMessageTime || Date.now(),
      unreadCount: parseInt(chatData.unreadCount) || 0,
      createdAt: chatData.createdAt || Date.now(),
      isValid: true
    };

    // Check for missing critical fields
    if (!Array.isArray(chatData.participants) || chatData.participants.length === 0) {
      missingFields.push('participants');
      validatedData.isValid = false;
    }

    if (missingFields.length > 0) {
      validatedData.missingFields = missingFields;
      validatedData.isValid = false;
    }

    return validatedData;
  }

  /**
   * Validate and sanitize message data with fallbacks
   */
  static validateMessageData(messageData, messageId) {
    if (!messageData) {
      return {
        id: messageId,
        chatId: '',
        senderId: '',
        content: '',
        type: 'text',
        timestamp: Date.now(),
        readBy: [],
        isValid: false,
        missingFields: ['all']
      };
    }

    const missingFields = [];
    const validatedData = {
      id: messageId,
      chatId: messageData.chatId || '',
      senderId: messageData.senderId || '',
      content: messageData.content || '',
      type: messageData.type || 'text',
      timestamp: messageData.timestamp || Date.now(),
      readBy: Array.isArray(messageData.readBy) ? messageData.readBy : [],
      isValid: true
    };

    // Check for missing critical fields
    if (!messageData.chatId) missingFields.push('chatId');
    if (!messageData.senderId) missingFields.push('senderId');
    if (!messageData.content) missingFields.push('content');

    if (missingFields.length > 0) {
      validatedData.missingFields = missingFields;
      validatedData.isValid = false;
    }

    return validatedData;
  }

  /**
   * Validate and sanitize friend request data with fallbacks
   */
  static validateFriendRequestData(requestData, requestId) {
    if (!requestData) {
      return {
        id: requestId,
        fromUserId: '',
        toUserId: '',
        message: '',
        status: 'pending',
        createdAt: Date.now(),
        isValid: false,
        missingFields: ['all']
      };
    }

    const missingFields = [];
    const validatedData = {
      id: requestId,
      fromUserId: requestData.fromUserId || '',
      toUserId: requestData.toUserId || '',
      message: requestData.message || '',
      status: requestData.status || 'pending',
      createdAt: requestData.createdAt || Date.now(),
      isValid: true
    };

    // Check for missing critical fields
    if (!requestData.fromUserId) missingFields.push('fromUserId');
    if (!requestData.toUserId) missingFields.push('toUserId');

    if (missingFields.length > 0) {
      validatedData.missingFields = missingFields;
      validatedData.isValid = false;
    }

    return validatedData;
  }

  /**
   * Get user data with comprehensive validation and fallbacks
   */
  static async getUserDataWithValidation(userId) {
    try {
      // Try multiple paths for user data
      const paths = [
        `Users/${userId}`,
        `Users/${userId}/profile`,
        `Users/${userId}/basic`
      ];

      let userData = null;
      let usedPath = '';

      for (const path of paths) {
        try {
          const userRef = ref(database, path);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            userData = userSnapshot.val();
            usedPath = path;
            break;
          }
        } catch (error) {
          console.log(`Path ${path} failed for user ${userId}:`, error.message);
        }
      }

      // Validate the found data
      const validatedData = this.validateUserData(userData, userId);
      validatedData.sourcePath = usedPath;

      return validatedData;
    } catch (error) {
      console.error(`Error getting user data for ${userId}:`, error);
      return this.validateUserData(null, userId);
    }
  }

  /**
   * Get chat data with comprehensive validation and fallbacks
   */
  static async getChatDataWithValidation(userId, chatId) {
    try {
      const chatRef = ref(database, `Users/${userId}/chats/${chatId}`);
      const chatSnapshot = await get(chatRef);
      
      if (!chatSnapshot.exists()) {
        return this.validateChatData(null, chatId);
      }

      const chatData = chatSnapshot.val();
      return this.validateChatData(chatData, chatId);
    } catch (error) {
      console.error(`Error getting chat data for ${chatId}:`, error);
      return this.validateChatData(null, chatId);
    }
  }

  /**
   * Check if data structure is healthy
   */
  static async checkDataHealth(userId) {
    const healthReport = {
      userId,
      timestamp: Date.now(),
      checks: {},
      overallHealth: 'unknown'
    };

    try {
      // Check user existence
      const userData = await this.getUserDataWithValidation(userId);
      healthReport.checks.user = {
        exists: userData.isValid,
        missingFields: userData.missingFields || [],
        sourcePath: userData.sourcePath
      };

      // Check chats
      try {
        const chatsRef = ref(database, `Users/${userId}/chats`);
        const chatsSnapshot = await get(chatsRef);
        healthReport.checks.chats = {
          exists: chatsSnapshot.exists(),
          count: chatsSnapshot.exists() ? Object.keys(chatsSnapshot.val() || {}).length : 0
        };
      } catch (error) {
        healthReport.checks.chats = { exists: false, error: error.message };
      }

      // Check messages
      try {
        const messagesRef = ref(database, `Users/${userId}/messages`);
        const messagesSnapshot = await get(messagesRef);
        healthReport.checks.messages = {
          exists: messagesSnapshot.exists(),
          count: messagesSnapshot.exists() ? Object.keys(messagesSnapshot.val() || {}).length : 0
        };
      } catch (error) {
        healthReport.checks.messages = { exists: false, error: error.message };
      }

      // Determine overall health
      const allChecks = Object.values(healthReport.checks);
      const healthyChecks = allChecks.filter(check => check.exists !== false);
      
      if (healthyChecks.length === allChecks.length) {
        healthReport.overallHealth = 'healthy';
      } else if (healthyChecks.length > 0) {
        healthReport.overallHealth = 'partial';
      } else {
        healthReport.overallHealth = 'unhealthy';
      }

    } catch (error) {
      healthReport.overallHealth = 'error';
      healthReport.error = error.message;
    }

    return healthReport;
  }
}

module.exports = DataValidator;
