const { database, get } = require("../../config/firebaseconfig.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get all users and search for the email
    const snapshot = await get('Users');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No users found in database' });
    }

    let userData = null;
    let uid = null;

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

    console.log("Retrieved user data:", userData);

    // Check if user data is stored under profile sub-object
    const profileData = userData.profile || userData;

    if (!profileData.password || typeof profileData.password !== 'string') {
      console.error("Password issue:", profileData.password);
      return res.status(500).json({ error: 'Password data is invalid or missing' });
    }

    const isPasswordValid = await bcrypt.compare(password, profileData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ error: 'Server configuration error: JWT secret is missing' });
    }

    const payload = { uid: uid };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: uid,
        username: profileData.username,
        email: profileData.email,
        country: profileData.country,
        phoneNumber: profileData.phoneNumber,
      },
      token: token,
    });
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
}

module.exports = { login };