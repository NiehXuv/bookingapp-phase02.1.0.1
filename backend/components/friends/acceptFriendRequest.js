const { database, ref, set, remove, get } = require('../../config/firebaseconfig');

const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const { uid } = req.user; // From JWT token

    // Validate input
    if (!requestId) {
      return res.status(400).json({ error: 'Missing request ID' });
    }

    // Get the friend request
    const requestRef = ref(database, `FriendRequests/${requestId}`);
    const requestSnapshot = await get(requestRef);

    if (!requestSnapshot.exists()) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const request = requestSnapshot.val();

    // Ensure user can only accept requests sent to them
    if (request.toUserId !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const { fromUserId, toUserId } = request;

    // Update request status to accepted
    await set(ref(database, `FriendRequests/${requestId}/status`), 'accepted');

    // Add to both users' friends lists
    await set(ref(database, `Users/${fromUserId}/friends/${toUserId}`), {
      uid: toUserId,
      addedAt: Date.now()
    });

    await set(ref(database, `Users/${toUserId}/friends/${fromUserId}`), {
      uid: fromUserId,
      addedAt: Date.now()
    });

    // Update outgoing request status for sender
    await set(ref(database, `Users/${fromUserId}/outgoingFriendRequests/${requestId}/status`), 'accepted');

    // Update incoming request status for recipient
    await set(ref(database, `Users/${toUserId}/incomingFriendRequests/${requestId}/status`), 'accepted');

    // Remove from pending requests after a delay (optional - for cleanup)
    setTimeout(async () => {
      try {
        await remove(ref(database, `Users/${fromUserId}/outgoingFriendRequests/${requestId}`));
        await remove(ref(database, `Users/${toUserId}/incomingFriendRequests/${requestId}`));
      } catch (error) {
        console.error('Error cleaning up friend requests:', error);
      }
    }, 60000); // 1 minute delay

    res.status(200).json({
      message: 'Friend request accepted successfully',
      requestId,
      fromUserId,
      toUserId
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = acceptFriendRequest;
