const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  clearSearchHistory
} = require('../components/searchHistory');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new search history entry
router.post('/', createSearchHistory);

// Get search history for a user
router.get('/', getSearchHistory);

// Delete a specific search history entry
router.delete('/:searchId', deleteSearchHistory);

// Clear all search history
router.delete('/', clearSearchHistory);

module.exports = router;
