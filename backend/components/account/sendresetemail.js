const { database, get, update } = require("../../config/firebaseconfig.js");

async function sendResetEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get all users and search for the email
    const snapshot = await get('Users');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No users found in database' });
    }

    let uid = null;

    // Search through all users to find the one with matching email
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      if (user && user.profile && user.profile.email === email) {
        uid = childSnapshot.key;
        return; // Found the user, stop searching
      }
    });

    if (!uid) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a simple reset code (in production, use a more secure method)
    const resetCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const resetExpiry = Date.now() + (60 * 60 * 1000); // 1 hour from now

    // Store reset code in database
    await update(`Users/${uid}`, {
      resetCode: resetCode,
      resetExpiry: resetExpiry
    });

    // In production, send email here
    console.log(`Reset code for ${email}: ${resetCode}`);

    res.status(200).json({
      message: 'Password reset code sent to your email',
      resetCode: resetCode // Remove this in production
    });

  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Failed to send reset email', details: error.message });
  }
}

module.exports = { sendResetEmail };