const { database } = require("../config/firebaseconfig.js");
const { ref, get, query, orderByChild, equalTo } = require("firebase/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersRef = ref(database, 'Users');
    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userData = null;
    let uid = null;
    snapshot.forEach((childSnapshot) => {
      uid = childSnapshot.key;
      userData = childSnapshot.val();
      console.log("Retrieved user data:", userData);
    });
    if (!uid || !userData) {
      return res.status(500).json({ error: 'Could not retrieve user details from database.' });
    }

    if (!userData.password || typeof userData.password !== 'string') {
      console.error("Password issue:", userData.password);
      return res.status(500).json({ error: 'Password data is invalid or missing' });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
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
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber, // Fixed typo
      },
      token: token,
    });
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
}

module.exports = { login };