const express = require('express');
const router = express.Router();

// Mock users database (replace with MongoDB in production)
let users = [];

// Get all users
router.get('/', (req, res) => {
  try {
    // Return users without sensitive information
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }));

    res.json({
      message: 'Users retrieved successfully',
      users: safeUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (MUST come before /:id route)
router.get('/:id/profile', (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user profile without sensitive information
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'User profile retrieved successfully',
      profile: userProfile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
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

// Update user
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === email && u.id !== id);
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      updatedAt: new Date()
    };

    // Return updated user without sensitive information
    const safeUser = {
      id: users[userIndex].id,
      email: users[userIndex].email,
      name: users[userIndex].name,
      createdAt: users[userIndex].createdAt,
      updatedAt: users[userIndex].updatedAt
    };

    res.json({
      message: 'User updated successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    // Return deleted user without sensitive information
    const safeUser = {
      id: deletedUser.id,
      email: deletedUser.email,
      name: deletedUser.name,
      createdAt: deletedUser.createdAt
    };

    res.json({
      message: 'User deleted successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 