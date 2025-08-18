// Account functions
const accountFunctions = require("./account");

// Trip Plans functions
const tripPlanFunctions = require("./tripPlans");

// Bookings functions
const bookingFunctions = require("./bookings");

// Search History functions
const searchHistoryFunctions = require("./searchHistory");

// Notifications functions
const notificationFunctions = require("./notifications");

// Favorites functions
const favoriteFunctions = require("./favorites");

// User Profile functions
const userProfileFunctions = require("./userProfile");

module.exports = {
  // Account
  ...accountFunctions,
  
  // Trip Plans
  ...tripPlanFunctions,
  
  // Bookings
  ...bookingFunctions,
  
  // Search History
  ...searchHistoryFunctions,
  
  // Notifications
  ...notificationFunctions,
  
  // Favorites
  ...favoriteFunctions,
  
  // User Profile
  ...userProfileFunctions
};
