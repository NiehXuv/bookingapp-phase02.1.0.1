const express = require('express');
const router = express.Router();
const { database, ref, get } = require('../config/firebaseconfig.js');

// Get all users (public info only)
router.get('/', async (req, res) => {
  try {
    const usersRef = ref(database, 'Users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: 'No users found',
        users: []
      });
    }

    const users = snapshot.val();
    const safeUsers = [];

    // Extract safe user information
    for (const [uid, userData] of Object.entries(users)) {
      if (userData.profile) {
        safeUsers.push({
          uid,
          username: userData.profile.username || 'Unknown User',
          email: userData.profile.email || '',
          country: userData.profile.country || '',
          avatar: userData.profile.avatar || null,
          createdAt: userData.profile.createdAt || null
        });
      }
    }

    res.json({
      message: 'Users retrieved successfully',
      users: safeUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID (public info only)
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userProfileRef = ref(database, `Users/${id}/profile`);
    const snapshot = await get(userProfileRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const userProfile = snapshot.val();
    
    // Return only safe profile information
    const safeProfile = {
      uid: id,
      username: userProfile.username || 'Unknown User',
      email: userProfile.email || '',
      country: userProfile.country || '',
      avatar: userProfile.avatar || null,
      createdAt: userProfile.createdAt || null,
      updatedAt: userProfile.updatedAt || null
    };

    res.json({
      message: 'User profile retrieved successfully',
      profile: safeProfile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (public info only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userRef = ref(database, `Users/${id}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = snapshot.val();
    
    // Return only safe user information
    const safeUser = {
      uid: id,
      username: userData.profile?.username || 'Unknown User',
      email: userData.profile?.email || '',
      country: userData.profile?.country || '',
      avatar: userData.profile?.avatar || null,
      createdAt: userData.profile?.createdAt || null
    };

    res.json({
      message: 'User retrieved successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 