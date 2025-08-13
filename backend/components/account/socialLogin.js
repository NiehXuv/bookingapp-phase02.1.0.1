// components/Account/socialLogin.js
const { auth, database } = require("../config/firebaseconfig.js");
const { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } = require("firebase/auth");
const { ref, set, get } = require("firebase/database");

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Add scopes (optional)
googleProvider.addScope('email profile');
facebookProvider.addScope('email public_profile');

async function handleSocialLogin(req, res, provider) {
  try {
    const { idToken } = req.body; // Client sends ID token after Firebase Auth

    // Verify ID token on the server (optional, for added security)
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user exists in Realtime Database
    const userRef = ref(database, `Users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // Create new user in Realtime Database
      await set(userRef, {
        username: uid,
        email: email || '',
        displayName: name || '',
        provider: provider.providerId, // e.g., 'google.com' or 'facebook.com'
        createdAt: Date.now(),
      });
    }

    // Generate a custom token for the client (optional)
    const customToken = await auth.createCustomToken(uid);

    res.status(200).json({
      message: 'Login successful',
      user: { uid, email, displayName: name },
      token: customToken,
    });
  } catch (err) {
    console.error('Error in social login:', err.message);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
}

// Google Login
async function googleLogin(req, res) {
  await handleSocialLogin(req, res, googleProvider);
}

// Facebook Login
async function facebookLogin(req, res) {
  await handleSocialLogin(req, res, facebookProvider);
}

module.exports = { googleLogin, facebookLogin };