# Booking App API Documentation

This document describes all the API endpoints available in the Booking App backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Authentication (`/auth`)
- `POST /auth/signup` - Create a new account
- `POST /auth/login` - User login
- `POST /auth/send-reset-email` - Send password reset email
- `POST /auth/reset-password` - Reset password
- `POST /auth/social-login` - Social media login
- `POST /auth/confirm-code` - Confirm verification code

**User Profile Structure:**
```json
{
  "username": "string",
  "email": "string",
  "country": "string (ISO 3166-1 alpha-2)",
  "phoneNumber": "string (local format)",
  "password": "string",
  "avatar": "string (URL)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Country Codes (ISO 3166-1 alpha-2):**
- `US` - United States
- `VN` - Vietnam
- `GB` - United Kingdom
- `CA` - Canada
- `AU` - Australia
- `DE` - Germany
- `FR` - France
- `JP` - Japan
- `KR` - South Korea
- `CN` - China

**Phone Number Examples by Country:**
- **US**: `5551234567` (10 digits)
- **VN**: `912345678` (9 digits)
- **GB**: `7911123456` (10-11 digits)
- **CA**: `4165551234` (10 digits)

### 2. Trip Plans (`/trip-plans`)
- `POST /trip-plans` - Create a new trip plan
- `GET /trip-plans` - Get all trip plans for the authenticated user
- `GET /trip-plans/:planId` - Get a specific trip plan
- `PUT /trip-plans/:planId` - Update a trip plan
- `DELETE /trip-plans/:planId` - Delete a trip plan

**Trip Plan Structure:**
```json
{
  "planName": "string",
  "destinations": ["string"],
  "tripDays": "number",
  "companion": "Solo|Couple|Family|Group of friends",
  "preferences": {
    "vibePreferences": ["string"],
    "activityPreferences": ["string"],
    "eatingPreferences": ["string"],
    "budgetRange": "string",
    "travelStyle": "string"
  },
  "budget": "number",
  "status": "draft|active|completed|cancelled"
}
```

### 3. Bookings (`/bookings`)
- `POST /bookings` - Create a new booking
- `GET /bookings` - Get all bookings for the authenticated user
- `GET /bookings/:bookingId` - Get a specific booking
- `PUT /bookings/:bookingId` - Update a booking
- `DELETE /bookings/:bookingId` - Delete a booking

**Booking Structure:**
```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "type": "hotel|tour|transport|restaurant",
  "details": {
    "hotelId": "string (if hotel booking)",
    "tourId": "string (if tour booking)",
    "transportId": "string (if transport booking)",
    "price": "number",
    "currency": "string"
  }
}
```

### 4. Search History (`/search-history`)
- `POST /search-history` - Create a new search history entry
- `GET /search-history` - Get search history for the authenticated user
- `DELETE /search-history/:searchId` - Delete a specific search history entry
- `DELETE /search-history` - Clear all search history

**Search History Structure:**
```json
{
  "query": "string",
  "type": "hotel|place|tour|transport",
  "results": "number"
}
```

### 5. Notifications (`/notifications`)
- `POST /notifications` - Create a new notification
- `GET /notifications` - Get notifications for the authenticated user
- `PATCH /notifications/:notificationId/read` - Mark a notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:notificationId` - Delete a specific notification

**Notification Structure:**
```json
{
  "title": "string",
  "message": "string",
  "type": "booking|reminder|promotion|system",
  "data": {
    "bookingId": "string",
    "planId": "string"
  }
}
```

### 6. Favorites (`/favorites`)
- `POST /favorites/add` - Add item to favorites
- `POST /favorites/remove` - Remove item from favorites
- `GET /favorites` - Get favorites for the authenticated user
- `DELETE /favorites` - Clear favorites (all or specific type)

**Favorites Structure:**
```json
{
  "type": "hotels|places|tours",
  "itemId": "string"
}
```

### 7. User Profile (`/user-profile`)
- `GET /user-profile` - Get user profile
- `PUT /user-profile` - Update user profile
- `PATCH /user-profile/avatar` - Update user avatar
- `DELETE /user-profile` - Delete user profile and all associated data

**User Profile Structure:**
```json
{
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "avatar": "string (URL)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 8. Users (`/users`)
- `GET /users` - Get all users (admin only)
- `GET /users/:userId` - Get a specific user
- `PUT /users/:userId` - Update a user (admin only)
- `DELETE /users/:userId` - Delete a user (admin only)

## Query Parameters

### Trip Plans
- `status` - Filter by status (draft, active, completed, cancelled)

### Bookings
- `type` - Filter by booking type (hotel, tour, transport, restaurant)
- `status` - Filter by status (pending, confirmed, cancelled, completed)

### Search History
- `type` - Filter by search type (hotel, place, tour, transport)
- `limit` - Limit number of results (default: 50)

### Notifications
- `type` - Filter by notification type (booking, reminder, promotion, system)
- `read` - Filter by read status (true/false)
- `limit` - Limit number of results (default: 50)

### Favorites
- `type` - Filter by favorite type (hotels, places, tours)

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "message": "Operation completed successfully",
  "data": {...}
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Database Structure

The Firebase Realtime Database follows this structure:

```
Users/
  $uid/
    profile/
      username, email, phoneNumber, password, avatar, createdAt, updatedAt
    tripPlans/
      $planId/
        planName, destinations, tripDays, companion, preferences, budget, status, itinerary
    bookings/
      $bookingId/
        title, description, date, time, type, status, details
    searchHistory/
      $searchId/
        query, type, timestamp, results
    notifications/
      $notificationId/
        title, message, type, read, createdAt, data
    favorites/
      hotels: [$hotelId],
      places: [$placeId],
      tours: [$tourId]
```

## Security Features

1. **JWT Authentication** - All protected routes require valid JWT tokens
2. **User Isolation** - Users can only access their own data
3. **Input Validation** - All inputs are validated before processing
4. **Password Hashing** - Passwords are hashed using bcrypt
5. **CORS Protection** - Cross-origin requests are properly handled

## Error Handling

The API includes comprehensive error handling for:
- Invalid input data
- Authentication failures
- Database errors
- Network issues
- Validation errors

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse.

## Testing

Test all endpoints using tools like Postman or curl. Ensure proper authentication headers are included for protected routes.
