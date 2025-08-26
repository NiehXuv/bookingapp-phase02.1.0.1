# Booking System Implementation

## Overview
This document describes the implementation of a comprehensive booking system for hotels and places in the booking app.

## Features Implemented

### 1. Backend Booking System
- **Database Structure**: Bookings are stored under `Users/{userId}/bookings/{bookingId}`
- **API Endpoints**:
  - `POST /api/bookings` - Create a new booking
  - `GET /api/bookings` - Get all bookings for a user
  - `GET /api/bookings/:bookingId` - Get a specific booking
  - `PUT /api/bookings/:bookingId` - Update a booking
  - `DELETE /api/bookings/:bookingId` - Delete a booking

- **Booking Types Supported**:
  - Hotel bookings
  - Tour bookings
  - Transport bookings
  - Restaurant bookings

### 2. Frontend Booking Interface
- **BookingScreen**: A comprehensive booking form with:
  - Date and time selection
  - Customizable title and description
  - Price display
  - Additional notes field
  - Form validation

- **Book Now Buttons**: Added to:
  - PlaceDetailScreen (for tours and places)
  - HotelDetailScreen (for hotel rooms)

### 3. Data Flow
1. User clicks "Book Now" button on detail screen
2. Navigation to BookingScreen with pre-filled data
3. User completes booking form
4. Form submission creates booking in backend
5. Success confirmation with option to view bookings

## Technical Implementation

### Backend Components
- `backend/components/bookings/createBooking.js` - Creates new bookings
- `backend/components/bookings/getAllBookings.js` - Retrieves user bookings
- `backend/components/bookings/getBooking.js` - Gets specific booking
- `backend/components/bookings/updateBooking.js` - Updates existing bookings
- `backend/components/bookings/deleteBooking.js` - Deletes bookings

### Frontend Components
- `frontend/src/services/bookingService.ts` - API service for bookings
- `frontend/src/screens/BookingScreen.tsx` - Main booking interface
- Updated `PlaceDetailScreen.tsx` and `HotelDetailScreen.tsx` with Book Now buttons

### Database Schema
```json
{
  "Users": {
    "{userId}": {
      "bookings": {
        "{bookingId}": {
          "title": "string",
          "description": "string",
          "date": "string (YYYY-MM-DD)",
          "time": "string (HH:MM)",
          "type": "hotel|tour|transport|restaurant",
          "status": "pending|confirmed|cancelled|completed",
          "createdAt": "timestamp",
          "updatedAt": "timestamp",
          "details": {
            "hotelId": "string (for hotel bookings)",
            "tourId": "string (for tour bookings)",
            "transportId": "string (for transport bookings)",
            "price": "number",
            "currency": "string",
            "additionalData": "object"
          }
        }
      }
    }
  }
}
```

## Usage Instructions

### For Users
1. Navigate to a hotel or place detail screen
2. Click the "Book Now" button
3. Fill in the booking details (title, description, date, time)
4. Add any additional notes if needed
5. Click "Confirm Booking"
6. View your bookings in the Profile section

### For Developers
1. **Adding Book Now to new screens**:
   ```typescript
   navigation.navigate('BookingScreen', {
     type: 'hotel', // or 'tour', 'transport', 'restaurant'
     itemId: 'unique-id',
     itemName: 'Display Name',
     itemImage: 'image-url',
     price: 1000000,
     currency: 'VND',
     additionalData: { /* any extra data */ }
   });
   ```

2. **Customizing booking types**:
   - Add new types to the backend validation in `createBooking.js`
   - Update the frontend type definitions in `bookingService.ts`
   - Add corresponding icons and colors in `BookingScreen.tsx`

## Dependencies Required

### Backend
- Firebase Admin SDK
- Express.js
- JWT middleware for authentication

### Frontend
- React Native
- @react-native-community/datetimepicker
- @expo/vector-icons
- React Navigation

## Security Features
- JWT token authentication required for all booking operations
- User isolation (users can only access their own bookings)
- Input validation on both frontend and backend
- SQL injection protection through Firebase

## Future Enhancements
- Payment integration
- Booking confirmation emails
- Cancellation policies
- Refund processing
- Multi-language support
- Push notifications for booking updates

## Testing
- Test booking creation with various data types
- Verify user isolation (users can't see others' bookings)
- Test form validation
- Verify date/time picker functionality
- Test navigation flow between screens

## Troubleshooting
- Ensure Firebase configuration is correct
- Verify JWT token is being sent in request headers
- Check that all required fields are provided
- Verify date format is YYYY-MM-DD
- Ensure time format is HH:MM (24-hour)
