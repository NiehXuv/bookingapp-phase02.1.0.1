const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createChat,
  sendMessage,
  getChats,
  getMessages,
  markChatAsRead,
  searchUsers
} = require('../components/chat');

// Apply middleware to all routes
router.use(verifyToken);

// Search for users to chat with
router.get('/search', searchUsers);

// Create a new chat
router.post('/', createChat);

// Get user's chats
router.get('/', getChats);

// Send a message
router.post('/message', sendMessage);

// Get messages for a specific chat
router.get('/:chatId/messages', getMessages);

// Mark chat as read
router.patch('/:chatId/read', markChatAsRead);

module.exports = router;
