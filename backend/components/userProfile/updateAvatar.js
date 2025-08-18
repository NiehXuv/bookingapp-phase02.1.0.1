const { database } = require("../../config/firebaseconfig.js");
const { ref, get, set } = require("firebase/database");

async function updateAvatar(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: "Avatar URL is required" });
    }

    // Validate URL format (basic validation)
    try {
      new URL(avatar);
    } catch (error) {
      return res.status(400).json({ error: "Invalid avatar URL format" });
    }

    // Get existing profile
    const userProfileRef = ref(database, `Users/${uid}/profile`);
    const snapshot = await get(userProfileRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const existingProfile = snapshot.val();

    // Update avatar
    const updatedProfile = {
      ...existingProfile,
      avatar: avatar,
      updatedAt: Date.now()
    };

    await set(userProfileRef, updatedProfile);

    // Remove sensitive information before sending response
    const { password, ...safeProfile } = updatedProfile;

    res.status(200).json({
      message: "Avatar updated successfully",
      profile: safeProfile
    });

  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { updateAvatar };
