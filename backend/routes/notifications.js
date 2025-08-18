const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../components/notifications');

// Apply middleware to all routes
router.use(verifyToken);

// Create a new notification
router.post('/', createNotification);

// Get notifications for a user
router.get('/', getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete a specific notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
