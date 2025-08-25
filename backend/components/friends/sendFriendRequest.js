const { database, ref, push, set, get } = require('../../config/firebaseconfig');

const sendFriendRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    const { uid } = req.user; // From JWT token

    // Validate input
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure user can only send requests for themselves
    if (uid !== fromUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if users exist
    const fromUserRef = ref(database, `Users/${fromUserId}`);
    const toUserRef = ref(database, `Users/${toUserId}`);
    
    const [fromUserSnapshot, toUserSnapshot] = await Promise.all([
      get(fromUserRef),
      get(toUserRef)
    ]);

    if (!fromUserSnapshot.exists() || !toUserSnapshot.exists()) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Check if friend request already exists
    const existingRequestRef = ref(database, `FriendRequests`);
    const existingRequestSnapshot = await get(existingRequestRef);
    
    let requestExists = false;
    if (existingRequestSnapshot.exists()) {
      const requests = existingRequestSnapshot.val();
      requestExists = Object.values(requests).some(request => 
        (request.fromUserId === fromUserId && request.toUserId === toUserId) ||
        (request.fromUserId === toUserId && request.toUserId === fromUserId)
      );
    }

    if (requestExists) {
      return res.status(409).json({ error: 'Friend request already exists' });
    }

    // Check if already friends
    const fromUserFriendsRef = ref(database, `Users/${fromUserId}/friends`);
    const fromUserFriendsSnapshot = await get(fromUserFriendsRef);
    
    if (fromUserFriendsSnapshot.exists()) {
      const friends = fromUserFriendsSnapshot.val();
      if (friends[toUserId]) {
        return res.status(409).json({ error: 'Users are already friends' });
      }
    }

    // Create friend request
    const friendRequestRef = push(ref(database, `FriendRequests`));
    const requestId = friendRequestRef.key;

    const friendRequestData = {
      id: requestId,
      fromUserId,
      toUserId,
      message: message || '',
      status: 'pending',
      createdAt: Date.now()
    };

    await set(friendRequestRef, friendRequestData);

    // Add to sender's outgoing requests
    await set(ref(database, `Users/${fromUserId}/outgoingFriendRequests/${requestId}`), {
      toUserId,
      message: message || '',
      status: 'pending',
      createdAt: Date.now()
    });

    // Add to recipient's incoming requests
    await set(ref(database, `Users/${toUserId}/incomingFriendRequests/${requestId}`), {
      fromUserId,
      message: message || '',
      status: 'pending',
      createdAt: Date.now()
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      requestId,
      friendRequest: friendRequestData
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = sendFriendRequest;
