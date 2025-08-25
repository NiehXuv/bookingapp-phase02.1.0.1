const { database, get, set } = require("../../config/firebaseconfig.js");

async function markAsRead(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    // Get existing notification
    const notificationRef = ref(database, `Users/${uid}/notifications/${notificationId}`);
    const snapshot = await get(notificationRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const existingNotification = snapshot.val();

    // Mark as read
    const updatedNotification = {
      ...existingNotification,
      read: true,
      updatedAt: Date.now()
    };

    await set(ref(database, `Users/${uid}/notifications/${notificationId}`), updatedNotification);

    res.status(200).json({
      message: "Notification marked as read successfully",
      notification: {
        notificationId: notificationId,
        ...updatedNotification
      }
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { markAsRead };
