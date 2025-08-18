const { database, remove } = require("../../config/firebaseconfig.js");

async function deleteUserProfile(req, res) {
  try {
    const { uid } = req.user; // From JWT token

    // Delete entire user data including profile, trip plans, bookings, etc.
    const userRef = `Users/${uid}`;
    
    await remove(userRef);

    res.status(200).json({
      message: "User profile and all associated data deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deleteUserProfile };
