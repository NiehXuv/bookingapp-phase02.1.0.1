const { database, get, ref } = require("../../config/firebaseconfig.js");

async function getUserProfile(req, res) {
  try {
    const { uid } = req.user; // From JWT token

    const userProfileRef = `Users/${uid}/profile`;
    const snapshot = await get(ref(database, userProfileRef));

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userProfile = snapshot.val();
    
    // Remove sensitive information before sending
    const { password, ...safeProfile } = userProfile;

    res.status(200).json({
      message: "User profile retrieved successfully",
      profile: safeProfile
    });

  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getUserProfile };
