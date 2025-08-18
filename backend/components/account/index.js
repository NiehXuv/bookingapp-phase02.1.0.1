const { createAccount } = require('./createAccount');
const { login } = require('./login');
const { resetPassword } = require('./resetpassword');
const { sendResetEmail } = require('./sendresetemail');
const { handleSocialLogin } = require('./socialLogin');
const { storeConfirmationCode, verifyConfirmationCode } = require('./confirmationCode');

module.exports = {
  createAccount,
  login,
  resetpassword: resetPassword,
  sendresetemail: sendResetEmail,
  socialLogin: handleSocialLogin,
  confirmationCode: verifyConfirmationCode,
  // Additional functions for completeness
  storeConfirmationCode,
  verifyConfirmationCode
};
