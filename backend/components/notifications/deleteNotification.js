const { database, remove } = require("../../config/firebaseconfig.js");

async function deleteNotification(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    const notificationRef = `Users/${uid}`/`notifications/${notificationId}`;
    
    // Delete the notification
    await remove(notificationRef);

    res.status(200).json({
      message: "Notification deleted successfully",
      notificationId: notificationId
    });

  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deleteNotification };
