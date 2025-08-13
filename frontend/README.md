# Booking App Frontend

React Native mobile application built with Expo for the booking app.

## Features

- User authentication (login/register)
- Booking management (create, view, update, delete)
- User profile management
- Modern UI with smooth navigation
- Offline support with AsyncStorage
- TypeScript for type safety

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for local storage
- Context API for state management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on different platforms:
```bash
# Android
npm run android

# iOS (requires macOS)
npm run ios

# Web
npm run web
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context for state management
├── screens/        # Screen components
├── services/       # API services
└── utils/          # Utility functions
```

## Screens

- **LoginScreen**: User authentication
- **RegisterScreen**: User registration
- **HomeScreen**: Dashboard with quick actions
- **BookingsScreen**: List and manage bookings
- **ProfileScreen**: User profile and settings
- **CreateBookingScreen**: Create new bookings

## API Integration

The app connects to the Express.js backend running on `http://localhost:5000`. Make sure the backend is running before testing the app.

## Development

- Uses Expo for easy development and testing
- Hot reloading enabled
- TypeScript for better development experience
- ESLint and Prettier for code formatting

## Building for Production

1. Configure app.json with your app details
2. Build for different platforms:
```bash
# Android
expo build:android

# iOS
expo build:ios
```

## Environment Variables

Create a `.env` file in the frontend directory:
```
API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

- If you encounter navigation issues, make sure all navigation dependencies are installed
- For API connection issues, verify the backend is running on the correct port
- For build issues, try clearing the cache: `expo r -c` 