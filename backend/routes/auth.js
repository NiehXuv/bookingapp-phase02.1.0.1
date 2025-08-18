const express = require('express');
const router = express.Router();
const { 
  createAccount, 
  login, 
  resetpassword, 
  sendresetemail, 
  socialLogin, 
  confirmationCode 
} = require('../components/account');

// Register route
router.post('/signup', createAccount);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/send-reset-email', sendresetemail);
router.post('/reset-password', resetpassword);

// Social login
router.post('/social-login', socialLogin);

// Confirm verification code
router.post('/confirm-code', confirmationCode);

module.exports = router; 