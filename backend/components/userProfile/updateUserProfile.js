const { database, get, set, ref } = require("../../config/firebaseconfig.js");
const bcrypt = require("bcrypt");

// Simple validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidCountryCode = (country) => {
  // ISO 3166-1 alpha-2 country codes (2 letters)
  const countryRegex = /^[A-Z]{2}$/;
  return countryRegex.test(country);
};

const isValidPhoneNumber = (phoneNumber, country) => {
  // Remove any spaces, dashes, or parentheses
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Basic validation - just numbers, no country code
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(cleanPhone);
};

async function updateUserProfile(req, res) {
  try {
    console.log('Update profile request received:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });
    
    if (!req.user || !req.user.uid) {
      console.error('No user data in request:', req.user);
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { uid } = req.user; // From JWT token
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Get existing profile
    const userProfileRef = `Users/${uid}/profile`;
    const snapshot = await get(ref(database, userProfileRef));

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const existingProfile = snapshot.val();

    // Validate email if updating
    if (updateData.email && !isValidEmail(updateData.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate country code if updating
    if (updateData.country && !isValidCountryCode(updateData.country)) {
      return res.status(400).json({ error: "Invalid country code. Use ISO 3166-1 alpha-2 format (e.g., US, VN, GB)" });
    }

    // Validate phone number if updating (requires country for validation)
    if (updateData.phoneNumber) {
      const countryToUse = updateData.country || existingProfile.country;
      if (countryToUse && !isValidPhoneNumber(updateData.phoneNumber, countryToUse)) {
        return res.status(400).json({ error: `Invalid phone number format for ${countryToUse}. Please use local format without country code.` });
      }
    }

    // Hash password if updating
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Prepare updated profile
    const updatedProfile = {
      ...existingProfile,
      ...updateData,
      updatedAt: Date.now()
    };

    // Ensure required fields are preserved
    if (!updatedProfile.username || !updatedProfile.email || !updatedProfile.country || !updatedProfile.phoneNumber) {
      return res.status(400).json({ error: "Username, email, country, and phone number are required" });
    }

    // Update the profile
    await set(ref(database, userProfileRef), updatedProfile);

    // Remove sensitive information before sending response
    const { password, ...safeProfile } = updatedProfile;

    console.log('Profile updated successfully for user:', uid);
    
    res.status(200).json({
      message: "User profile updated successfully",
      profile: safeProfile
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { updateUserProfile };
