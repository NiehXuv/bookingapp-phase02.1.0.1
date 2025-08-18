const { database } = require("../../config/firebaseconfig.js");
const { ref, get } = require("firebase/database");

async function getNotifications(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type, read, limit = 50 } = req.query; // Optional filters

    const notificationsRef = ref(database, `Users/${uid}/notifications`);
    const snapshot = await get(notificationsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No notifications found",
        notifications: []
      });
    }

    let notifications = [];
    snapshot.forEach((childSnapshot) => {
      const notificationId = childSnapshot.key;
      const notificationData = childSnapshot.val();
      
      // Filter by type if provided
      if (type && notificationData.type !== type) {
        return;
      }
      
      // Filter by read status if provided
      if (read !== undefined && notificationData.read !== (read === 'true')) {
        return;
      }
      
      notifications.push({
        notificationId: notificationId,
        ...notificationData
      });
    });

    // Sort by timestamp (newest first) and limit results
    notifications.sort((a, b) => b.createdAt - a.createdAt);
    notifications = notifications.slice(0, parseInt(limit));

    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getNotifications };
