const { database, ref, get } = require('../../config/firebaseconfig');

const getFriends = async (req, res) => {
  try {
    const { uid } = req.user; // From JWT token

    const friendsRef = ref(database, `Users/${uid}/friends`);
    const friendsSnapshot = await get(friendsRef);

    if (!friendsSnapshot.exists()) {
      return res.status(200).json({
        friends: [],
        count: 0
      });
    }

    const friends = friendsSnapshot.val();
    const friendsArray = Object.entries(friends).map(([friendId, friendData]) => ({
      uid: friendId,
      addedAt: friendData.addedAt
    }));

    // Get user details for each friend
    const friendsWithDetails = await Promise.all(
      friendsArray.map(async (friend) => {
        try {
          // Try to get user profile first
          const userRef = ref(database, `Users/${friend.uid}/profile`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            const userProfile = userSnapshot.val();
            return {
              ...friend,
              username: userProfile.username || 'Unknown User',
              email: userProfile.email || '',
              avatar: userProfile.avatar || null,
              country: userProfile.country || null,
              lastSeen: userProfile.lastSeen || null,
              isOnline: userProfile.isOnline || false
            };
          }
        } catch (error) {
          console.error(`Error getting profile for friend ${friend.uid}:`, error);
        }
        
        // Fallback: try to get basic user info from Users root
        try {
          const userRootRef = ref(database, `Users/${friend.uid}`);
          const userRootSnapshot = await get(userRootRef);
          
          if (userRootSnapshot.exists()) {
            const userData = userRootSnapshot.val();
            return {
              ...friend,
              username: userData.username || userData.email?.split('@')[0] || 'Unknown User',
              email: userData.email || '',
              avatar: userData.avatar || null,
              country: userData.country || null,
              lastSeen: userData.lastSeen || null,
              isOnline: userData.isOnline || false
            };
          }
        } catch (error) {
          console.error(`Error getting user data for friend ${friend.uid}:`, error);
        }
        
        // Final fallback with minimal data
        return {
          ...friend,
          username: 'Unknown User',
          email: '',
          avatar: null,
          country: null,
          lastSeen: null,
          isOnline: false
        };
      })
    );

    // Sort by username
    friendsWithDetails.sort((a, b) => a.username.localeCompare(b.username));

    res.status(200).json({
      friends: friendsWithDetails,
      count: friendsWithDetails.length
    });

  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getFriends;
