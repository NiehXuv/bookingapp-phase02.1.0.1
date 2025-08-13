const { auth, database } = require("../config/firebaseconfig.js");
const { ref, set } = require("firebase/database");
const bcrypt = require("bcrypt");

// Simple validation functions
const isValidE164PhoneNumber = (phoneNumber) => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

async function createAccount(req, res) {
  const { username, password, email, phoneNumber } = req.body;

  if (!username || !password || !email || !phoneNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!isValidE164PhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: "Phone number must be in E.164 format (e.g., +12345678901)" });
  }

  try {
    // Create user in Firebase Authentication (password is hashed internally)
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
      phoneNumber: phoneNumber,
    });

    const uid = userRecord.uid;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password for database storage

    // Store user data in Realtime Database with hashed password
    const userRef = ref(database, `Users/${uid}`);
    await set(userRef, {
      username: username,
      password: hashedPassword, // Store the hashed password
      email: email,
      phoneNumber: phoneNumber,
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