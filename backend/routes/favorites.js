const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  clearFavorites
} = require('../components/favorites');

// Apply middleware to all routes
router.use(verifyToken);

// Add item to favorites
router.post('/add', addToFavorites);

// Remove item from favorites
router.post('/remove', removeFromFavorites);

// Get favorites for a user
router.get('/', getFavorites);

// Clear favorites (all or specific type)
router.delete('/', clearFavorites);

module.exports = router;
