# Backend Components Structure

This document outlines the complete structure of the backend components and their functions.

## Folder Structure

```
backend/
├── components/
│   ├── account/                    # User authentication functions
│   │   ├── createAccount.js       # Create new user account
│   │   ├── login.js               # User login
│   │   ├── resetpassword.js       # Reset user password
│   │   ├── sendresetemail.js      # Send password reset email
│   │   ├── socialLogin.js         # Social media login
│   │   ├── confirmationCode.js    # Confirm verification code
│   │   └── index.js               # Export all account functions
│   │
│   ├── tripPlans/                 # Trip planning functions
│   │   ├── createTripPlan.js      # Create new trip plan
│   │   ├── getTripPlan.js         # Get specific trip plan
│   │   ├── getAllTripPlans.js     # Get all trip plans for user
│   │   ├── updateTripPlan.js      # Update trip plan
│   │   ├── deleteTripPlan.js      # Delete trip plan
│   │   └── index.js               # Export all trip plan functions
│   │
│   ├── bookings/                  # Booking management functions
│   │   ├── createBooking.js       # Create new booking
│   │   ├── getBooking.js          # Get specific booking
│   │   ├── getAllBookings.js      # Get all bookings for user
│   │   ├── updateBooking.js       # Update booking
│   │   ├── deleteBooking.js       # Delete booking
│   │   └── index.js               # Export all booking functions
│   │
│   ├── searchHistory/             # Search history functions
│   │   ├── createSearchHistory.js # Create search history entry
│   │   ├── getSearchHistory.js    # Get search history
│   │   ├── deleteSearchHistory.js # Delete specific entry
│   │   ├── clearSearchHistory.js  # Clear all search history
│   │   └── index.js               # Export all search history functions
│   │
│   ├── notifications/             # Notification functions
│   │   ├── createNotification.js  # Create new notification
│   │   ├── getNotifications.js    # Get notifications
│   │   ├── markAsRead.js          # Mark notification as read
│   │   ├── markAllAsRead.js       # Mark all as read
│   │   ├── deleteNotification.js  # Delete notification
│   │   └── index.js               # Export all notification functions
│   │
│   ├── favorites/                 # Favorites management functions
│   │   ├── addToFavorites.js      # Add item to favorites
│   │   ├── removeFromFavorites.js # Remove item from favorites
│   │   ├── getFavorites.js        # Get user favorites
│   │   ├── clearFavorites.js      # Clear favorites
│   │   └── index.js               # Export all favorites functions
│   │
│   ├── userProfile/               # User profile functions
│   │   ├── getUserProfile.js      # Get user profile
│   │   ├── updateUserProfile.js   # Update user profile
│   │   ├── updateAvatar.js        # Update user avatar
│   │   ├── deleteUserProfile.js   # Delete user profile
│   │   └── index.js               # Export all profile functions
│   │
│   └── index.js                   # Main components index
│
├── routes/                         # API route definitions
│   ├── auth.js                    # Authentication routes
│   ├── tripPlans.js               # Trip plans routes
│   ├── bookings.js                # Bookings routes
│   ├── searchHistory.js           # Search history routes
│   ├── notifications.js           # Notifications routes
│   ├── favorites.js               # Favorites routes
│   ├── userProfile.js             # User profile routes
│   └── users.js                   # User management routes
│
├── middleware/                     # Middleware functions
│   └── verifyToken.js             # JWT token verification
│
├── config/                         # Configuration files
│   └── firebaseconfig.js          # Firebase configuration
│
├── server.js                       # Main server file
├── API_DOCUMENTATION.md            # Complete API documentation
└── COMPONENTS_STRUCTURE.md         # This file
```

## Component Functions Summary

### Account Functions
- **createAccount**: Create new user account with validation
- **login**: Authenticate user and return JWT token
- **resetpassword**: Reset user password
- **sendresetemail**: Send password reset email
- **socialLogin**: Handle social media authentication
- **confirmationCode**: Verify user confirmation codes

### Trip Plans Functions
- **createTripPlan**: Create new trip plan with preferences
- **getTripPlan**: Retrieve specific trip plan by ID
- **getAllTripPlans**: Get all trip plans with optional filtering
- **updateTripPlan**: Update existing trip plan
- **deleteTripPlan**: Remove trip plan

### Bookings Functions
- **createBooking**: Create new booking for hotels/tours/transport
- **getBooking**: Retrieve specific booking by ID
- **getAllBookings**: Get all bookings with optional filtering
- **updateBooking**: Update existing booking
- **deleteBooking**: Remove booking

### Search History Functions
- **createSearchHistory**: Log user search queries
- **getSearchHistory**: Retrieve search history with filtering
- **deleteSearchHistory**: Remove specific search entry
- **clearSearchHistory**: Clear all search history

### Notifications Functions
- **createNotification**: Create new notification
- **getNotifications**: Retrieve notifications with filtering
- **markAsRead**: Mark notification as read
- **markAllAsRead**: Mark all notifications as read
- **deleteNotification**: Remove notification

### Favorites Functions
- **addToFavorites**: Add item to user favorites
- **removeFromFavorites**: Remove item from favorites
- **getFavorites**: Retrieve user favorites
- **clearFavorites**: Clear all or specific type favorites

### User Profile Functions
- **getUserProfile**: Retrieve user profile information
- **updateUserProfile**: Update user profile data
- **updateAvatar**: Update user avatar image
- **deleteUserProfile**: Delete user and all associated data

## Key Features

1. **CRUD Operations**: Complete Create, Read, Update, Delete functionality for all entities
2. **Input Validation**: Comprehensive validation for all user inputs
3. **Error Handling**: Proper error handling and status codes
4. **Security**: JWT authentication and user data isolation
5. **Flexibility**: Optional filtering and pagination support
6. **Consistency**: Uniform API response format across all endpoints

## Database Integration

All functions integrate with Firebase Realtime Database using the structure defined in the database schema. Each function properly handles:
- Data validation before database operations
- Error handling for database failures
- Proper data formatting and sanitization
- User authentication and authorization

## Usage

To use these components:

1. Import the required functions from their respective folders
2. Ensure proper middleware (verifyToken) is applied to protected routes
3. Handle responses and errors appropriately in your frontend
4. Follow the API documentation for proper request/response formats

## Testing

Test all endpoints using:
- Postman or similar API testing tools
- Proper authentication headers
- Valid and invalid input data
- Edge cases and error conditions
