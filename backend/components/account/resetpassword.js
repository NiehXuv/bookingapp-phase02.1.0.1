const { database, get, update } = require("../../config/firebaseconfig.js");
const bcrypt = require("bcrypt");

async function resetPassword(req, res) {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    // Get all users and search for the email
    const snapshot = await get('Users');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No users found in database' });
    }

    let uid = null;
    let userData = null;

    // Search through all users to find the one with matching email
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      if (user && user.profile && user.profile.email === email) {
        uid = childSnapshot.key;
        userData = user;
        return; // Found the user, stop searching
      }
    });

    if (!uid || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if reset code exists and is valid
    if (!userData.resetCode || userData.resetCode !== resetCode) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if reset code has expired
    if (userData.resetExpiry && Date.now() > userData.resetExpiry) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove reset code
    await update(`Users/${uid}`, {
      'profile/password': hashedPassword,
      resetCode: null,
      resetExpiry: null
    });

    res.status(200).json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
}

module.exports = { resetPassword };