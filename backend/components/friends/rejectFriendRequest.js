const { database, ref, remove, get } = require('../../config/firebaseconfig');

const rejectFriendRequest = async (req, res) => {
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

    // Ensure user can only reject requests sent to them
    if (request.toUserId !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const { fromUserId, toUserId } = request;

    // Update request status to rejected
    await remove(ref(database, `FriendRequests/${requestId}`));

    // Remove from sender's outgoing requests
    await remove(ref(database, `Users/${fromUserId}/outgoingFriendRequests/${requestId}`));

    // Remove from recipient's incoming requests
    await remove(ref(database, `Users/${toUserId}/incomingFriendRequests/${requestId}`));

    res.status(200).json({
      message: 'Friend request rejected successfully',
      requestId,
      fromUserId,
      toUserId
    });

  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = rejectFriendRequest;
