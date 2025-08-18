# 🚀 Booking App Backend API

A comprehensive backend API for a travel booking application built with Node.js, Express, and Firebase.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Data Structure](#-data-structure)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

- 🔐 **Authentication System**: JWT-based auth with Firebase Admin
- 👥 **User Management**: Registration, login, profile management
- 🏨 **Booking System**: Create, read, update, delete bookings
- ❤️ **Favorites**: Add/remove items to favorites
- 🔔 **Notifications**: Real-time notification system
- 📍 **Trip Planning**: Create and manage travel plans
- 🔍 **Search History**: Track user search patterns
- 🎯 **Social Login**: Google and Facebook integration
- 📧 **Email Services**: Password reset and confirmation emails

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Realtime Database enabled
- Firebase Admin SDK service account key
- Resend API key for email services

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Add Firebase service account key**
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it in the `backend/` directory

5. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=ai-planner-booking
FIREBASE_DATABASE_URL=https://ai-planner-booking-default-rtdb.asia-southeast1.firebasedatabase.app/

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
```

## 🌐 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/signup` | User registration | ❌ |
| `POST` | `/login` | User login | ❌ |
| `POST` | `/send-reset-email` | Send password reset email | ❌ |
| `POST` | `/reset-password` | Reset password with token | ❌ |
| `POST` | `/social-login` | Social media login (Google/Facebook) | ❌ |
| `POST` | `/confirm-code` | Verify confirmation code | ❌ |

### 🏨 Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create new booking | ✅ |
| `GET` | `/` | Get all user bookings | ✅ |
| `GET` | `/:bookingId` | Get specific booking | ✅ |
| `PUT` | `/:bookingId` | Update booking | ✅ |
| `DELETE` | `/:bookingId` | Delete booking | ✅ |

### ❤️ Favorites (`/api/favorites`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/add` | Add item to favorites | ✅ |
| `POST` | `/remove` | Remove item from favorites | ✅ |
| `GET` | `/` | Get user favorites | ✅ |
| `DELETE` | `/` | Clear all favorites | ✅ |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create notification | ✅ |
| `GET` | `/` | Get user notifications | ✅ |
| `PATCH` | `/:notificationId/read` | Mark notification as read | ✅ |
| `PATCH` | `/read-all` | Mark all notifications as read | ✅ |
| `DELETE` | `/:notificationId` | Delete notification | ✅ |

### 🔍 Search History (`/api/search-history`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create search history entry | ✅ |
| `GET` | `/` | Get user search history | ✅ |
| `DELETE` | `/:searchId` | Delete specific search entry | ✅ |
| `DELETE` | `/` | Clear all search history | ✅ |

### 🗺️ Trip Plans (`/api/trip-plans`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create new trip plan | ✅ |
| `GET` | `/` | Get all user trip plans | ✅ |
| `GET` | `/:planId` | Get specific trip plan | ✅ |
| `PUT` | `/:planId` | Update trip plan | ✅ |
| `DELETE` | `/:planId` | Delete trip plan | ✅ |

### 👤 User Profile (`/api/user-profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get user profile | ✅ |
| `PUT` | `/` | Update user profile | ✅ |
| `PATCH` | `/avatar` | Update user avatar | ✅ |
| `DELETE` | `/` | Delete user profile | ✅ |

### 👥 Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Get all users (public info only) | ❌ |
| `GET` | `/:id` | Get user by ID (public info only) | ❌ |
| `GET` | `/:id/profile` | Get user profile (public info only) | ❌ |
| `PUT` | `/:id` | Update user | ❌ |
| `DELETE` | `/:id` | Delete user | ❌ |

### 🏥 Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Welcome message | ❌ |
| `GET` | `/api/health` | Health check status | ❌ |

## 📊 Data Structure

### User Data Structure
```json
{
  "Users": {
    "$uid": {
      "profile": {
        "username": "string",
        "password": "hashed_string",
        "email": "string",
        "country": "string",
        "phoneNumber": "string",
        "role": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
  }
}
```

### Booking Data Structure
```json
{
  "bookings": {
    "$bookingId": {
      "UserID": "string",
      "hotelName": "string",
      "checkIn": "date",
      "checkOut": "date",
      "guests": "number",
      "totalPrice": "number",
      "status": "string",
      "createdAt": "timestamp"
    }
  }
}
```

## 🔒 Security

### Authentication
- **JWT Tokens**: All protected routes require valid JWT tokens
- **Token Verification**: Middleware validates tokens on protected routes
- **Password Hashing**: bcrypt with salt rounds of 10

### Data Protection
- **User Isolation**: Users can only access their own data
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data stored in .env

### Firebase Security Rules
```json
{
  "rules": {
    ".read": "now < 1750006800000",
    ".write": "now < 1750006800000",
    "Users": {
      ".indexOn": ["email"],
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "bookings": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": "UserID"
    }
  }
}
```

## ⚠️ Important Notes

### 🔑 Critical Security Points
1. **JWT_SECRET**: Must be a strong, unique secret key
2. **Service Account Key**: Keep `serviceAccountKey.json` secure and never commit to git
3. **Environment Variables**: All sensitive data must be in `.env` file
4. **Firebase Rules**: Database rules must be properly configured

### 🚨 Known Issues & Solutions
1. **Firebase URL**: Must use `.firebasedatabase.app` NOT `.firebaseio.com`
2. **Service Account**: Regenerate if you get "Invalid JWT Signature" errors
3. **Database Rules**: Ensure rules allow Admin SDK operations

### 📝 Development Notes
1. **User Schema**: All user data stored under `Users/$uid/profile/`
2. **Password Storage**: Passwords hashed with bcrypt before storage
3. **UID Consistency**: Firebase Auth UID used as primary key everywhere
4. **Error Handling**: Comprehensive error handling with user-friendly messages

### 🧪 Testing
- **Example Users**: 3 admin users created for testing
- **Credentials**: See test data below
- **Health Check**: Use `/api/health` to verify server status

## 🚨 Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## 🛠️ Development

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server (if configured)
npm test           # Run tests (if configured)
```

### File Structure
```
backend/
├── components/          # Business logic components
├── config/             # Configuration files
├── middleware/         # Express middleware
├── routes/             # API route definitions
├── server.js           # Main server file
├── .env.example        # Environment variables template
└── serviceAccountKey.json  # Firebase service account
```

### Adding New Endpoints
1. Create component in `components/` directory
2. Add route in appropriate `routes/` file
3. Mount route in `server.js`
4. Add authentication middleware if needed
5. Update this README

## 🔧 Troubleshooting

### Common Issues

#### 1. Firebase Authentication Errors
**Error**: `invalid_grant: Invalid JWT Signature`
**Solution**: Regenerate Firebase service account key

#### 2. Database Connection Issues
**Error**: `pathString.replace is not a function`
**Solution**: Check database URL format (use `.firebasedatabase.app`)

#### 3. JWT Token Issues
**Error**: `jwt malformed` or `invalid token`
**Solution**: Verify JWT_SECRET in .env file

#### 4. Port Already in Use
**Error**: `EADDRINUSE`
**Solution**: Change PORT in .env or kill existing process

### Debug Steps
1. Check `.env` file configuration
2. Verify Firebase service account key
3. Check Firebase database rules
4. Review server logs for detailed errors
5. Test individual components

### Support
- Check Firebase Console for project status
- Verify environment variables
- Review error logs in terminal
- Test with minimal data first

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/) - JWT token debugging
- [Firebase Realtime Database Rules](https://firebase.google.com/docs/database/security)

## 🎯 Next Steps

1. **Test all endpoints** with the created example users
2. **Configure frontend** to use these API endpoints
3. **Set up monitoring** and logging
4. **Implement rate limiting** for production
5. **Add comprehensive testing** suite

---

**⚠️ Remember**: Never commit sensitive files like `serviceAccountKey.json` or `.env` to version control! 