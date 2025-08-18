// components/Account/socialLogin.js
const { auth, database, set, get } = require("../../config/firebaseconfig.js");

async function handleSocialLogin(req, res) {
  try {
    const { provider, accessToken, email, displayName, photoURL } = req.body;

    if (!provider || !accessToken || !email) {
      return res.status(400).json({ error: 'Provider, access token, and email are required' });
    }

    // Check if user already exists
    const snapshot = await get('Users');
    let uid = null;
    let userData = null;

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user && user.profile && user.profile.email === email) {
          uid = childSnapshot.key;
          userData = user;
          return; // Found the user, stop searching
        }
      });
    }

    if (uid && userData) {
      // User exists, return success
      res.status(200).json({
        message: 'Social login successful',
        user: {
          uid,
          username: userData.profile.username,
          email: userData.profile.email,
          country: userData.profile.country,
          phoneNumber: userData.profile.phoneNumber,
        }
      });
    } else {
      // Create new user
      const newUid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const userData = {
        profile: {
          username: displayName || email.split('@')[0],
          email: email,
          photoURL: photoURL || null,
          provider: provider,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await set(`Users/${newUid}`, userData);

      res.status(201).json({
        message: 'Social login successful - new account created',
        user: {
          uid: newUid,
          username: userData.profile.username,
          email: userData.profile.email,
          photoURL: userData.profile.photoURL,
          provider: userData.profile.provider
        }
      });
    }

  } catch (error) {
    console.error('Error in social login:', error);
    res.status(500).json({ error: 'Failed to process social login', details: error.message });
  }
}

module.exports = { handleSocialLogin };