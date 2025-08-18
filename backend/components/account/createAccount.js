const { database, set } = require("../../config/firebaseconfig.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function createAccount(req, res) {
  try {
    const { username, email, password, country, phoneNumber } = req.body;

    if (!username || !email || !password || !country || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data structure
    const userData = {
      profile: {
        username,
        email,
        password: hashedPassword,
        country,
        phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Generate a unique UID (you might want to use Firebase Auth for this)
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store user data in Firebase
    await set(`Users/${uid}`, userData);

    // Generate JWT token for the new user
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ error: 'Server configuration error: JWT secret is missing' });
    }

    const payload = { uid: uid };
    console.log('🔑 Creating JWT payload:', payload);
    
    let token;
    try {
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('🔑 JWT token generated successfully, length:', token.length);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    } catch (jwtError) {
      console.error('🔑 JWT generation error:', jwtError);
      return res.status(500).json({ error: 'Failed to generate authentication token', details: jwtError.message });
    }

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        uid,
        username,
        email,
        country,
        phoneNumber
      },
      token: token
    });

  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account', details: error.message });
  }
}

module.exports = { createAccount };