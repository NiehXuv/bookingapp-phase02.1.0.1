const { database, ref, get } = require('../../config/firebaseconfig');

const checkFriendStatus = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.query;
    const { uid } = req.user; // From JWT token

    // Validate input
    if (!currentUserId || !targetUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure user can only check status for themselves
    if (uid !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if users exist
    const currentUserRef = ref(database, `Users/${currentUserId}`);
    const targetUserRef = ref(database, `Users/${targetUserId}`);
    
    const [currentUserSnapshot, targetUserSnapshot] = await Promise.all([
      get(currentUserRef),
      get(targetUserRef)
    ]);

    if (!currentUserSnapshot.exists() || !targetUserSnapshot.exists()) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    let status = 'none'; // none, pending_sent, pending_received, friends

    // Check if already friends
    const friendsRef = ref(database, `Users/${currentUserId}/friends`);
    const friendsSnapshot = await get(friendsRef);
    
    if (friendsSnapshot.exists()) {
      const friends = friendsSnapshot.val();
      if (friends[targetUserId]) {
        status = 'friends';
      }
    }

    // If not friends, check for pending requests
    if (status === 'none') {
      // Check outgoing requests
      const outgoingRequestsRef = ref(database, `Users/${currentUserId}/outgoingFriendRequests`);
      const outgoingSnapshot = await get(outgoingRequestsRef);
      
      if (outgoingSnapshot.exists()) {
        const outgoingRequests = outgoingSnapshot.val();
        const hasOutgoingRequest = Object.values(outgoingRequests).some(request => 
          request.toUserId === targetUserId && request.status === 'pending'
        );
        if (hasOutgoingRequest) {
          status = 'pending_sent';
        }
      }

      // Check incoming requests
      if (status === 'none') {
        const incomingRequestsRef = ref(database, `Users/${currentUserId}/incomingFriendRequests`);
        const incomingSnapshot = await get(incomingRequestsRef);
        
        if (incomingSnapshot.exists()) {
          const incomingRequests = incomingSnapshot.val();
          const hasIncomingRequest = Object.values(incomingRequests).some(request => 
            request.fromUserId === targetUserId && request.status === 'pending'
          );
          if (hasIncomingRequest) {
            status = 'pending_received';
          }
        }
      }
    }

    res.status(200).json({
      status,
      currentUserId,
      targetUserId
    });

  } catch (error) {
    console.error('Error checking friend status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkFriendStatus;
