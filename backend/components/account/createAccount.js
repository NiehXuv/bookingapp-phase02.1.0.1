const { auth, database } = require("../../config/firebaseconfig.js");
const { ref, set } = require("firebase/database");
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

async function createAccount(req, res) {
  const { username, password, email, country, phoneNumber } = req.body;

  if (!username || !password || !email || !country || !phoneNumber) {
    return res.status(400).json({ error: "All fields are required: username, password, email, country, phoneNumber" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!isValidCountryCode(country)) {
    return res.status(400).json({ error: "Invalid country code. Use ISO 3166-1 alpha-2 format (e.g., US, VN, GB)" });
  }

  if (!isValidPhoneNumber(phoneNumber, country)) {
    return res.status(400).json({ error: `Invalid phone number format for ${country}. Please use local format without country code.` });
  }

  try {
    // Create user in Firebase Authentication (password is hashed internally)
    // Note: Firebase Auth requires E.164 phone format, but we'll store local format in database
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
      // Don't set phoneNumber in Firebase Auth for now - we'll store it in Realtime Database
    });

    const uid = userRecord.uid;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password for database storage

    // Store user data in Realtime Database with hashed password
    const userRef = ref(database, `Users/${uid}`);
    await set(userRef, {
      profile: {
        username: username,
        password: hashedPassword, // Store the hashed password
        email: email,
        country: country,
        phoneNumber: phoneNumber,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    });

    console.log("User created with hashed password:", hashedPassword);
    res.status(201).json({ message: "Account created successfully", uid: uid });
  } catch (error) {
    console.error("Error creating account:", error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(409).json({ error: 'The email address is already in use by another account.' });
    }
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createAccount };