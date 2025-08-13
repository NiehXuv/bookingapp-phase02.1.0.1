# Booking App

A full-stack booking application with React Native frontend and Express.js backend.

## 🚀 Features

- **User Authentication**: Register, login, and logout functionality
- **Booking Management**: Create, view, update, and delete bookings
- **User Profile**: Manage user information and settings
- **Modern UI**: Beautiful and intuitive user interface
- **Real-time Updates**: Live booking status updates
- **Cross-platform**: Works on iOS, Android, and Web

## 📱 Screenshots

- Login/Register screens with form validation
- Home dashboard with quick actions
- Booking list with status indicators
- Create booking form
- User profile with settings

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Axios** for API calls
- **AsyncStorage** for local storage
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **MongoDB** (ready for integration)

## 📁 Project Structure

```
bookingapp-phase02.1.0.1/
├── frontend/           # React Native app
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── screens/
│   │   ├── services/
│   │   └── utils/
│   ├── App.tsx
│   └── package.json
├── backend/            # Express.js server
│   ├── routes/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookingapp
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Booking Endpoints

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/user/:userId` - Get bookings by user

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Development

### Backend Development

- The server uses nodemon for automatic restart
- Mock data storage (replace with MongoDB for production)
- CORS enabled for frontend integration
- JWT authentication ready

### Frontend Development

- Hot reloading enabled with Expo
- TypeScript for better development experience
- Context API for global state management
- AsyncStorage for persistent data

## 🚀 Production Deployment

### Backend Deployment

1. Set up MongoDB Atlas or local MongoDB
2. Update environment variables
3. Deploy to platforms like:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS

### Frontend Deployment

1. Configure app.json with your app details
2. Build for different platforms:
```bash
# Android
expo build:android

# iOS
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify both frontend and backend are running
3. Ensure all dependencies are installed
4. Check network connectivity between frontend and backend

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Push notifications
- [ ] Calendar integration
- [ ] Payment processing
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode 