const { database, ref, get } = require("../../config/firebaseconfig.js");

async function getNotifications(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type, read, limit = 50 } = req.query; // Optional filters

    console.log(`Getting notifications for user: ${uid}`);

    const notificationsRef = `Users/${uid}/notifications`;
    const snapshot = await get(notificationsRef);

    if (!snapshot.exists()) {
      console.log(`No notifications found for user ${uid}`);
      return res.status(200).json({
        message: "No notifications found",
        notifications: [],
        count: 0,
        isEmpty: true
      });
    }

    let notifications = [];
    const notificationsData = snapshot.val();
    
    console.log(`Found ${Object.keys(notificationsData).length} notifications for user ${uid}`);
    
    // Iterate over the notifications object
    for (const [notificationId, notificationData] of Object.entries(notificationsData)) {
      try {
        // Filter by type if provided
        if (type && notificationData.type !== type) {
          continue;
        }
        
        // Filter by read status if provided
        if (read !== undefined && notificationData.read !== (read === 'true')) {
          continue;
        }
        
        notifications.push({
          id: notificationId,
          ...notificationData
        });
      } catch (notificationError) {
        console.error(`Error processing notification ${notificationId}:`, notificationError);
        // Continue with other notifications
      }
    }

    // Check if we have any notifications after filtering
    if (notifications.length === 0) {
      console.log(`No notifications found for user ${uid} after filtering (type: ${type}, read: ${read})`);
      return res.status(200).json({
        message: "No notifications found with the specified criteria",
        notifications: [],
        count: 0,
        isEmpty: true,
        filters: { type, read, limit }
      });
    }

    // Sort by timestamp (newest first) and limit results
    notifications.sort((a, b) => b.createdAt - a.createdAt);
    notifications = notifications.slice(0, parseInt(limit));

    console.log(`Returning ${notifications.length} notifications for user ${uid}`);

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
