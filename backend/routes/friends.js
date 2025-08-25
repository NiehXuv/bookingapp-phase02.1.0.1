const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const friends = require('../components/friends');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Send friend request
router.post('/request', friends.sendFriendRequest);

// Check friend status between two users
router.get('/status', friends.checkFriendStatus);

// Accept friend request
router.post('/accept', friends.acceptFriendRequest);

// Reject friend request
router.post('/reject', friends.rejectFriendRequest);

// Get friend requests (incoming or outgoing)
router.get('/requests', friends.getFriendRequests);

// Remove friend
router.delete('/remove', friends.removeFriend);

// Get friends list
router.get('/', friends.getFriends);

module.exports = router;
