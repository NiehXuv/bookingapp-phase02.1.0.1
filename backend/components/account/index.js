const { createAccount } = require("./createAccount");
const { login } = require("./login");
const { resetPassword } = require("./resetpassword");
const { sendResetEmail } = require("./sendresetemail");
const { googleLogin, facebookLogin } = require("./socialLogin");
const { storeConfirmationCode, verifyConfirmationCode, sendConfirmationEmail } = require("./confirmationCode");

module.exports = {
  createAccount,
  login,
  resetpassword: resetPassword,
  sendresetemail: sendResetEmail,
  socialLogin: googleLogin, // Default to Google login
  confirmationCode: verifyConfirmationCode // Default to verification
};
