# Booking App Backend

Express.js backend for the React Native booking application.

## Features

- User authentication (register/login)
- Booking management (CRUD operations)
- User management
- JWT token authentication
- RESTful API design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookingapp
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (placeholder)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/user/:userId` - Get bookings by user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/profile` - Get user profile

## Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Doctor Appointment",
    "description": "Annual checkup",
    "date": "2024-01-15",
    "time": "10:00 AM",
    "userId": "user_id_here"
  }'
```

## Development

- The server runs on port 5000 by default
- Uses nodemon for automatic restart during development
- Mock data storage (replace with MongoDB for production)
- CORS enabled for frontend integration

## Production Notes

- Replace mock data with MongoDB/MongoDB Atlas
- Implement proper JWT middleware
- Add input validation
- Add rate limiting
- Add logging
- Add error monitoring 