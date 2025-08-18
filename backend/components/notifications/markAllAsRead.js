const { database, get, set } = require("../../config/firebaseconfig.js");

async function markAllAsRead(req, res) {
  try {
    const { uid } = req.user; // From JWT token

    const notificationsRef = `Users/${uid}`/notifications;
    const snapshot = await get(notificationsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No notifications found to mark as read"
      });
    }

    let updatedCount = 0;
    const updatePromises = [];

    snapshot.forEach((childSnapshot) => {
      const notificationId = childSnapshot.key;
      const notificationData = childSnapshot.val();
      
      // Only update unread notifications
      if (!notificationData.read) {
        const notificationRef = `Users/${uid}`/`notifications/${notificationId}`;
        const updatedNotification = {
          ...notificationData,
          read: true,
          updatedAt: Date.now()
        };
        
        updatePromises.push(set(notificationRef, updatedNotification));
        updatedCount++;
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    res.status(200).json({
      message: "All notifications marked as read successfully",
      updatedCount: updatedCount
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { markAllAsRead };
