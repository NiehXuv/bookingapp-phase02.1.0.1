const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  deleteUserProfile
} = require('../components/userProfile');

// Apply middleware to all routes
router.use(verifyToken);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/', updateUserProfile);

// Update user avatar
router.patch('/avatar', updateAvatar);

// Delete user profile
router.delete('/', deleteUserProfile);

module.exports = router;
