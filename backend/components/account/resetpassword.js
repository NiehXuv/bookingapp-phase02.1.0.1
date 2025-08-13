const { database } = require("../config/firebaseconfig.js");
const { ref, update, get, query, orderByChild, equalTo } = require("firebase/database");
const bcrypt = require("bcrypt");

async function resetPassword(req, res) {
  try {
    const { email, code, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Email, code, new password, and confirm password are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Find user by email to get UID
    const usersRef = ref(database, 'Users');
    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    let uid;
    snapshot.forEach((childSnapshot) => {
      uid = childSnapshot.key;
    });

    if (!uid) {
      return res.status(500).json({ error: 'Could not retrieve user ID' });
    }

    const userRef = ref(database, `Users/${uid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    // Check if the reset code exists and is valid
    if (!userData.resetCode || !userData.expirationTime || userData.used) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const currentTime = Date.now();
    if (userData.expirationTime < currentTime || userData.resetCode !== code) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the Realtime Database
    await update(userRef, {
      password: hashedPassword,
      used: true,
      resetCode: null,
      expirationTime: null,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
}

module.exports = { resetPassword };