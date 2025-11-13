const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createPost,
  getAllPosts,
  deletePost
} = require('../components/posts');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new post
router.post('/', createPost);

// Get all posts for a user
router.get('/', getAllPosts);

// Delete a post
router.delete('/:postId', deletePost);

module.exports = router;

