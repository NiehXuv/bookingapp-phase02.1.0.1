const { database, set, get, update } = require("../../config/firebaseconfig.js");

async function storeConfirmationCode(uid, code) {
  try {
    const confirmationData = {
      code: code,
      createdAt: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
      used: false
    };

    await set(`ConfirmationCodes/${uid}`, confirmationData);
    return true;
  } catch (error) {
    console.error('Error storing confirmation code:', error);
    return false;
  }
}

async function verifyConfirmationCode(uid, code) {
  try {
    const snapshot = await get(`ConfirmationCodes/${uid}`);
    
    if (!snapshot.exists()) {
      return { valid: false, message: 'Confirmation code not found' };
    }

    const confirmationData = snapshot.val();
    
    if (confirmationData.used) {
      return { valid: false, message: 'Confirmation code already used' };
    }

    if (Date.now() > confirmationData.expiresAt) {
      return { valid: false, message: 'Confirmation code expired' };
    }

    if (confirmationData.code !== code) {
      return { valid: false, message: 'Invalid confirmation code' };
    }

    // Mark code as used
    await update(`ConfirmationCodes/${uid}`, { used: true });

    return { valid: true, message: 'Confirmation code verified successfully' };
  } catch (error) {
    console.error('Error verifying confirmation code:', error);
    return { valid: false, message: 'Error verifying confirmation code' };
  }
}

module.exports = { storeConfirmationCode, verifyConfirmationCode };