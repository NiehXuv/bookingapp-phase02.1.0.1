const { database } = require("../../config/firebaseconfig.js");
const { ref, set, push } = require("firebase/database");

async function createNotification(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      title,
      message,
      type,
      data
    } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ error: "Title, message, and type are required" });
    }

    // Validate notification type
    const validTypes = ["booking", "reminder", "promotion", "system"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid notification type" });
    }

    const notificationData = {
      title,
      message,
      type,
      read: false,
      createdAt: Date.now(),
      data: data || {}
    };

    // Create new notification with auto-generated ID
    const notificationsRef = ref(database, `Users/${uid}/notifications`);
    const newNotificationRef = push(notificationsRef);
    const notificationId = newNotificationRef.key;

    await set(newNotificationRef, notificationData);

    res.status(201).json({
      message: "Notification created successfully",
      notificationId: notificationId,
      notification: notificationData
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createNotification };
