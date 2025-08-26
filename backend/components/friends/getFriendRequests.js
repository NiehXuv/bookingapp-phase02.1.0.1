const { database, ref, get } = require('../../config/firebaseconfig');

const getFriendRequests = async (req, res) => {
  try {
    const { uid } = req.user; // From JWT token
    const { type = 'incoming' } = req.query; // 'incoming' or 'outgoing'

    if (!['incoming', 'outgoing'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    const requestsRef = ref(database, `Users/${uid}/${type === 'incoming' ? 'incomingFriendRequests' : 'outgoingFriendRequests'}`);
    const requestsSnapshot = await get(requestsRef);

    if (!requestsSnapshot.exists()) {
      return res.status(200).json({
        requests: [],
        count: 0
      });
    }

    const requests = requestsSnapshot.val();
    const requestsArray = Object.entries(requests).map(([id, request]) => ({
      id,
      ...request
    }));

    // Filter only pending requests
    const pendingRequests = requestsArray.filter(request => request.status === 'pending');

    // Get user details for each request
    const requestsWithUserDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        const targetUserId = type === 'incoming' ? request.fromUserId : request.toUserId;
        
        try {
          // Try to get user profile first
          const userRef = ref(database, `Users/${targetUserId}/profile`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            const userProfile = userSnapshot.val();
            return {
              ...request,
              user: {
                uid: targetUserId,
                username: userProfile.username || 'Unknown User',
                email: userProfile.email || '',
                avatar: userProfile.avatar || null,
                country: userProfile.country || null
              }
            };
          }
        } catch (error) {
          console.error(`Error getting profile for user ${targetUserId}:`, error);
        }
        
        // Fallback: try to get basic user info from Users root
        try {
          const userRootRef = ref(database, `Users/${targetUserId}`);
          const userRootSnapshot = await get(userRootRef);
          
          if (userRootSnapshot.exists()) {
            const userData = userRootSnapshot.val();
            return {
              ...request,
              user: {
                uid: targetUserId,
                username: userData.username || userData.email?.split('@')[0] || 'Unknown User',
                email: userData.email || '',
                avatar: userData.avatar || null,
                country: userData.country || null
              }
            };
          }
        } catch (error) {
          console.error(`Error getting user data for ${targetUserId}:`, error);
        }
        
        // Final fallback with minimal data
        return {
          ...request,
          user: {
            uid: targetUserId,
            username: 'Unknown User',
            email: '',
            avatar: null,
            country: null
          }
        };
      })
    );

    res.status(200).json({
      requests: requestsWithUserDetails,
      count: requestsWithUserDetails.length
    });

  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getFriendRequests;
