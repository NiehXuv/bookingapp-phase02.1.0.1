const { database, ref, remove, get } = require('../../config/firebaseconfig');

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const { uid } = req.user; // From JWT token

    // Validate input
    if (!friendId) {
      return res.status(400).json({ error: 'Missing friend ID' });
    }

    // Check if users are actually friends
    const friendsRef = ref(database, `Users/${uid}/friends/${friendId}`);
    const friendsSnapshot = await get(friendsRef);

    if (!friendsSnapshot.exists()) {
      return res.status(404).json({ error: 'Friend relationship not found' });
    }

    // Remove from current user's friends list
    await remove(ref(database, `Users/${uid}/friends/${friendId}`));

    // Remove from other user's friends list
    await remove(ref(database, `Users/${friendId}/friends/${uid}`));

    res.status(200).json({
      message: 'Friend removed successfully',
      friendId,
      currentUserId: uid
    });

  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = removeFriend;
