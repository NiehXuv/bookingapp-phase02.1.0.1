# Technical Specifications - Vietnam Travel Booking App

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Express.js    │    │   Firebase      │
│   Mobile App    │◄──►│   Backend API   │◄──►│   Realtime DB   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  External APIs  │    │   JWT Auth      │    │   File Storage  │
│  • Google       │    │   • bcrypt      │    │   • Images      │
│  • YouTube      │    │   • Middleware  │    │   • Avatars     │
│  • TripAdvisor  │    │   • CORS        │    │   • Documents   │
│  • Amadeus      │    └─────────────────┘    └─────────────────┘
│  • Pexels       │
│  • Pixabay      │
└─────────────────┘
```

### 1.2 Component Architecture
- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: Firebase Realtime Database
- **Authentication**: JWT with bcrypt
- **External APIs**: Multiple content and booking APIs
- **Storage**: AsyncStorage (client) + Firebase (server)

## 2. Database Schema

### 2.1 Firebase Realtime Database Structure

```json
{
  "Users": {
    "$uid": {
      "profile": {
        "username": "string",
        "email": "string",
        "password": "hashed",
        "country": "string",
        "phoneNumber": "string",
        "avatar": "string (URL)",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "tripPlans": {
        "$planId": {
          "planName": "string",
          "destinations": ["string"],
          "tripDays": "number",
          "companion": "string",
          "preferences": {
            "vibePreferences": ["string"],
            "activityPreferences": ["string"],
            "eatingPreferences": ["string"],
            "budgetRange": "string",
            "travelStyle": "string"
          },
          "budget": "number",
          "status": "draft|active|completed|cancelled",
          "itinerary": "object"
        }
      },
      "bookings": {
        "$bookingId": {
          "title": "string",
          "description": "string",
          "date": "string",
          "time": "string",
          "type": "hotel|tour|transport|restaurant",
          "status": "pending|confirmed|cancelled|completed",
          "details": {
            "hotelId": "string",
            "tourId": "string",
            "transportId": "string",
            "price": "number",
            "currency": "string"
          }
        }
      },
      "searchHistory": {
        "$searchId": {
          "query": "string",
          "type": "hotel|place|tour|transport",
          "timestamp": "timestamp",
          "results": "number"
        }
      },
      "notifications": {
        "$notificationId": {
          "title": "string",
          "message": "string",
          "type": "booking|reminder|promotion|system",
          "read": "boolean",
          "createdAt": "timestamp",
          "data": {
            "bookingId": "string",
            "planId": "string"
          }
        }
      },
      "favorites": {
        "hotels": ["string"],
        "places": ["string"],
        "tours": ["string"]
      }
    }
  }
}
```

### 2.2 Data Models

#### User Profile
```typescript
interface UserProfile {
  uid: string;
  username: string;
  email: string;
  country: string;
  phoneNumber: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Trip Plan
```typescript
interface TripPlan {
  id: string;
  planName: string;
  destinations: string[];
  tripDays: number;
  companion: 'Solo' | 'Couple' | 'Family' | 'Group of friends';
  preferences: {
    vibePreferences: string[];
    activityPreferences: string[];
    eatingPreferences: string[];
    budgetRange: string;
    travelStyle: string;
  };
  budget: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  itinerary?: object;
}
```

#### Booking
```typescript
interface Booking {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'hotel' | 'tour' | 'transport' | 'restaurant';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details: {
    hotelId?: string;
    tourId?: string;
    transportId?: string;
    price: number;
    currency: string;
  };
}
```

## 3. API Endpoints

### 3.1 Authentication Endpoints
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/send-reset-email
POST /api/auth/reset-password
POST /api/auth/social-login
POST /api/auth/confirm-code
```

### 3.2 Trip Plans Endpoints
```
POST /api/trip-plans
GET /api/trip-plans
GET /api/trip-plans/:planId
PUT /api/trip-plans/:planId
DELETE /api/trip-plans/:planId
```

### 3.3 Bookings Endpoints
```
POST /api/bookings
GET /api/bookings
GET /api/bookings/:bookingId
PUT /api/bookings/:bookingId
DELETE /api/bookings/:bookingId
```

### 3.4 User Profile Endpoints
```
GET /api/user-profile
PUT /api/user-profile
PATCH /api/user-profile/avatar
DELETE /api/user-profile
```

### 3.5 Favorites Endpoints
```
POST /api/favorites/add
POST /api/favorites/remove
GET /api/favorites
DELETE /api/favorites
```

### 3.6 Search History Endpoints
```
POST /api/search-history
GET /api/search-history
DELETE /api/search-history/:searchId
DELETE /api/search-history
```

### 3.7 Notifications Endpoints
```
POST /api/notifications
GET /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
DELETE /api/notifications/:id
```

## 4. External API Integrations

### 4.1 Google Places API
- **Purpose**: Location search, place details, photos
- **Endpoints Used**:
  - Text Search API
  - Place Details API
  - Place Photos API
- **Rate Limits**: 50 requests/minute, 2000 requests/day
- **Authentication**: API Key

### 4.2 YouTube Data API v3
- **Purpose**: Travel video content
- **Endpoints Used**:
  - Search API
  - Videos API
- **Rate Limits**: 60 requests/minute, 10,000 requests/day
- **Authentication**: API Key

### 4.3 TripAdvisor Content API
- **Purpose**: Reviews and location data
- **Endpoints Used**:
  - Location Search API
  - Location Photos API
- **Rate Limits**: Based on subscription
- **Authentication**: API Key

### 4.4 Amadeus for Hospitality
- **Purpose**: Hotel availability and pricing
- **Endpoints Used**:
  - Hotel Search API
  - Hotel Offers API
  - Hotel Details API
- **Rate Limits**: Based on subscription
- **Authentication**: OAuth2 Client Credentials

### 4.5 Pexels API
- **Purpose**: High-quality travel photography
- **Endpoints Used**:
  - Search API
- **Rate Limits**: 200 requests/hour
- **Authentication**: API Key

### 4.6 Pixabay API
- **Purpose**: Additional image content
- **Endpoints Used**:
  - Search API
- **Rate Limits**: 5000 requests/hour
- **Authentication**: API Key

## 5. Security Specifications

### 5.1 Authentication & Authorization
- **JWT Token**: 1-hour expiration
- **Password Hashing**: bcrypt with 10 salt rounds
- **Token Refresh**: Automatic refresh mechanism
- **Role-Based Access**: User and admin roles

### 5.2 Data Protection
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection**: Prevented by Firebase
- **XSS Protection**: Input sanitization
- **CORS**: Configured for mobile app domains
- **Rate Limiting**: To be implemented

### 5.3 API Security
- **HTTPS**: Enforced for all communications
- **API Key Management**: Secure storage and rotation
- **Request Encryption**: TLS 1.2+
- **Audit Logging**: Request/response logging

## 6. Performance Requirements

### 6.1 Mobile App Performance
- **App Launch Time**: < 3 seconds
- **Screen Navigation**: < 500ms
- **Content Loading**: < 2 seconds
- **Image Loading**: < 1 second
- **Offline Functionality**: Core features available offline
- **Battery Usage**: Optimized for extended use

### 6.2 API Performance
- **Response Time**: < 200ms for most endpoints
- **Availability**: 99.9% uptime
- **Rate Limiting**: 100 requests/minute per user
- **Caching**: Implement Redis for frequently accessed data
- **CDN**: Use CDN for static assets

### 6.3 Scalability
- **Concurrent Users**: Support 10,000+ concurrent users
- **Database**: Firebase auto-scaling
- **API**: Horizontal scaling capability
- **Content**: CDN distribution for media

## 7. Frontend Architecture

### 7.1 React Native Structure
```
src/
├── components/          # Reusable UI components
│   ├── CustomTabBar.tsx
│   ├── ChatbotFAB.tsx
│   └── PlanningProgressIndicator.tsx
├── context/            # React Context for state management
│   ├── AuthContext.tsx
│   └── ContentContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── ExploreScreen.tsx
│   ├── PlanScreen.tsx
│   ├── ProfileScreen.tsx
│   └── planning/      # Trip planning screens
├── services/          # API services
│   ├── authService.ts
│   ├── agodaService.ts
│   ├── amadeusService.ts
│   ├── googlePlacesService.ts
│   ├── youtubeService.ts
│   ├── tripadvisorService.ts
│   ├── pexelsService.ts
│   ├── pixabayService.ts
│   ├── contentService.ts
│   ├── enhancedHotelService.ts
│   └── enhancedPlaceService.ts
├── types/             # TypeScript type definitions
│   ├── content.ts
│   └── explore.ts
├── utils/             # Utility functions
│   ├── airports.ts
│   ├── contentTransformer.ts
│   └── popularCities.ts
└── config/            # Configuration files
    └── apiConfig.ts
```

### 7.2 State Management
- **Global State**: React Context API
- **Local State**: React useState/useReducer
- **Persistence**: AsyncStorage
- **Caching**: In-memory and AsyncStorage

### 7.3 Navigation Structure
```
AppNavigator
├── Auth Stack
│   ├── LoginScreen
│   └── SignUpScreen
└── Main Stack
    ├── MainTabs
    │   ├── HomeScreen
    │   ├── ExploreScreen
    │   ├── PlanScreen
    │   ├── BookingScreen
    │   └── ProfileScreen
    └── Detail Screens
        ├── HotelDetailScreen
        ├── PlaceDetailScreen
        └── DetailScreen
```

## 8. Backend Architecture

### 8.1 Express.js Structure
```
backend/
├── components/         # Feature handlers
│   ├── account/       # Authentication
│   ├── bookings/      # Booking management
│   ├── favorites/     # Favorites system
│   ├── notifications/ # Notification system
│   ├── searchHistory/ # Search tracking
│   ├── tripPlans/     # Trip planning
│   └── userProfile/   # Profile management
├── config/            # Configuration
│   └── firebaseconfig.js
├── middleware/        # Express middleware
│   └── verifyToken.js
├── routes/            # API routes
│   ├── auth.js
│   ├── bookings.js
│   ├── favorites.js
│   ├── notifications.js
│   ├── searchHistory.js
│   ├── tripPlans.js
│   ├── userProfile.js
│   └── users.js
├── server.js          # Main server file
└── package.json       # Dependencies
```

### 8.2 Middleware Stack
1. **CORS**: Cross-origin resource sharing
2. **JSON Parser**: Request body parsing
3. **URL Encoded**: Form data parsing
4. **JWT Verification**: Authentication middleware
5. **Error Handler**: Global error handling
6. **404 Handler**: Route not found

## 9. Testing Strategy

### 9.1 Testing Pyramid
```
    E2E Tests (10%)
   ┌─────────────┐
   │Integration  │ (20%)
   │   Tests     │
   └─────────────┘
   ┌─────────────┐
   │   Unit      │ (70%)
   │   Tests     │
   └─────────────┘
```

### 9.2 Test Types

**Unit Tests**:
- Component testing (React Native Testing Library)
- Service layer testing (Jest)
- Utility function testing
- API endpoint testing

**Integration Tests**:
- API integration testing
- Database operations testing
- External API integration testing
- Authentication flow testing

**E2E Tests**:
- User journey testing
- Critical path testing
- Cross-platform testing
- Performance testing

### 9.3 Test Coverage Goals
- **Code Coverage**: > 80%
- **Critical Paths**: 100% coverage
- **API Endpoints**: 100% coverage
- **Authentication**: 100% coverage

## 10. Deployment & DevOps

### 10.1 Development Environment
- **Local Development**: Expo CLI + Node.js
- **Version Control**: Git with feature branches
- **Code Review**: Pull request workflow
- **CI/CD**: GitHub Actions

### 10.2 Staging Environment
- **Backend**: Heroku/DigitalOcean
- **Database**: Firebase (same project, different environment)
- **Mobile**: Expo TestFlight/Google Play Console
- **Monitoring**: Sentry for error tracking

### 10.3 Production Environment
- **Backend**: AWS EC2/Google Cloud Platform
- **Database**: Firebase Production
- **CDN**: CloudFlare/AWS CloudFront
- **Monitoring**: New Relic/DataDog
- **Logging**: Winston + ELK Stack

### 10.4 Release Strategy
- **Mobile App**: Monthly releases
- **Backend API**: Continuous deployment
- **Database**: Zero-downtime migrations
- **Rollback**: Automated rollback capability

## 11. Monitoring & Analytics

### 11.1 Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: New Relic/DataDog
- **Logging**: Winston with structured logging
- **Health Checks**: API health endpoints

### 11.2 User Analytics
- **User Behavior**: Google Analytics/Firebase Analytics
- **Crash Reporting**: Sentry crash reporting
- **Performance Metrics**: React Native Performance Monitor
- **User Feedback**: In-app feedback system

### 11.3 Business Metrics
- **User Registration**: Track signup conversion
- **Content Engagement**: Monitor content consumption
- **Booking Conversion**: Track booking completion rates
- **User Retention**: Monitor user retention rates

## 12. Security Checklist

### 12.1 Authentication Security
- [ ] JWT token expiration implemented
- [ ] Password hashing with bcrypt
- [ ] Secure password reset flow
- [ ] Account lockout after failed attempts
- [ ] Session management

### 12.2 Data Security
- [ ] HTTPS enforcement
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Data encryption at rest

### 12.3 API Security
- [ ] Rate limiting implementation
- [ ] API key management
- [ ] CORS configuration
- [ ] Request/response logging
- [ ] Error handling without sensitive data exposure

### 12.4 Privacy Compliance
- [ ] GDPR compliance measures
- [ ] Privacy policy implementation
- [ ] Data retention policies
- [ ] User data deletion capability
- [ ] Consent management
