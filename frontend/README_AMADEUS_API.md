# 🏨 Amadeus API Integration

## 📱 Overview

This implementation integrates the Amadeus API to provide real-time hotel search, availability, and pricing information. The Amadeus API offers comprehensive hotel data including room types, rates, availability, and booking capabilities.

## 🚀 Features

### ✨ **Hotel Search**
- **Geographic Search**: Search hotels by coordinates with radius
- **City Search**: Search hotels by city code
- **Keyword Search**: Search by hotel name
- **Advanced Filtering**: Price range, amenities, ratings

### ✨ **Hotel Offers**
- **Real-time Availability**: Live room availability
- **Dynamic Pricing**: Current rates and pricing
- **Room Details**: Room types, bed configurations, amenities
- **Booking Policies**: Cancellation policies, payment methods

### ✨ **Data Integration**
- **Multi-API Merging**: Combines with Google Places and TripAdvisor
- **Fallback Strategy**: Mock data when API is unavailable
- **Smart Matching**: Intelligent hotel matching across APIs

## 🔧 Setup & Configuration

### **1. Environment Variables**
Add these to your `.env` file:
```bash
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
```

### **2. API Configuration**
The service automatically reads from your environment variables:
```typescript
// In apiConfig.ts
AMADEUS: {
  API_KEY: process.env.AMADEUS_API_KEY || 'YOUR_AMADEUS_API_KEY',
  API_SECRET: process.env.AMADEUS_CLIENT_SECRET || 'YOUR_AMADEUS_CLIENT_SECRET',
  BASE_URL: 'https://test.api.amadeus.com',
  ENVIRONMENT: 'test', // or 'production'
}
```

### **3. Dependencies**
No additional packages required - uses native `fetch` API.

## 🏗️ Architecture

### **Service Structure**
```
AmadeusService
├── Authentication (OAuth2)
├── Hotel Search
├── Hotel Offers
├── Data Transformation
└── Mock Data Fallback
```

### **Data Flow**
```
User Request → AmadeusService → OAuth2 Token → API Call → Data Transform → EnhancedHotel
```

## 🎯 Usage Examples

### **Basic Hotel Search**
```typescript
import { AmadeusService } from '../services/amadeusService';

const amadeusService = new AmadeusService();

// Search hotels by coordinates
const hotels = await amadeusService.searchHotels({
  latitude: 21.0285,
  longitude: 105.8542,
  radius: 5, // 5km radius
  radiusUnit: 'KM'
});

// Search hotels by city
const cityHotels = await amadeusService.searchHotels({
  cityCode: 'HAN', // Hanoi
  checkInDate: '2024-08-16',
  checkOutDate: '2024-08-17',
  adults: 2,
  children: 0,
  roomQuantity: 1
});
```

### **Get Hotel Offers**
```typescript
// Get availability and pricing for specific hotels
const offers = await amadeusService.getHotelOffers(
  ['HTLHAN', 'HTLSAI'], // Hotel IDs
  '2024-08-16',         // Check-in date
  '2024-08-17',         // Check-out date
  2,                     // Adults
  0,                     // Children
  1                      // Room quantity
);
```

### **Enhanced Hotel Service Integration**
```typescript
import { EnhancedHotelService } from '../services/enhancedHotelService';

const hotelService = new EnhancedHotelService();

// Get comprehensive hotel details with Amadeus data
const hotelDetails = await hotelService.getHotelDetails(hotelId, coordinates);

// Search hotels by location
const nearbyHotels = await hotelService.searchHotelsByLocation(
  21.0285,  // latitude
  105.8542,  // longitude
  5          // radius in km
);

// Get offers for specific dates
const dateOffers = await hotelService.getHotelOffersForDates(
  ['HTLHAN'],
  '2024-08-16',
  '2024-08-17',
  2, 0, 1  // adults, children, rooms
);
```

## 🔌 API Endpoints

### **Authentication**
- **URL**: `https://test.api.amadeus.com/v1/security/oauth2/token`
- **Method**: `POST`
- **Purpose**: Get OAuth2 access token

### **Hotel Search**
- **URL**: `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode`
- **Method**: `GET`
- **Purpose**: Search hotels by geographic coordinates

### **Hotel Offers**
- **URL**: `https://test.api.amadeus.com/v2/shopping/hotel-offers`
- **Method**: `GET`
- **Purpose**: Get availability and pricing for hotels

### **Hotel Details**
- **URL**: `https://test.api.amadeus.com/v1/reference-data/locations/hotels/{hotelId}`
- **Method**: `GET`
- **Purpose**: Get detailed hotel information

## 📊 Data Models

### **AmadeusHotel**
```typescript
interface AmadeusHotel {
  id: string;
  name: string;
  rating: number;
  hotelId: string;
  chainCode: string;
  dupeId: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    countryCode: string;
    postalCode: string;
    cityName: string;
    street: string;
    country: string;
  };
  amenities: string[];
  media: {
    uri: string;
    category: string;
  }[];
}
```

### **AmadeusHotelOffer**
```typescript
interface AmadeusHotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  room: {
    type: string;
    typeEstimated: {
      category: string;
      beds: number;
      bedType: string;
    };
    description: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
    children: number;
  };
  price: {
    currency: string;
    total: string;
    base: string;
  };
  policies: {
    cancellation: {
      description: string;
      type: string;
    };
  };
}
```

## 🎨 UI Integration

### **HotelDetailScreen Features**
- **Live Pricing Badge**: Shows when Amadeus data is available
- **Availability Information**: Check-in/out dates and room count
- **Dynamic Booking Button**: Changes text based on booking source
- **Trust Indicators**: Shows "Secure booking through trusted partner"

### **Enhanced Data Display**
```typescript
// In HotelDetailScreen
{enhancedHotel.bookingSource === 'amadeus' && (
  <View style={styles.bookingSourceBadge}>
    <MaterialIcons name="verified" size={16} color="#10B981" />
    <Text style={styles.bookingSourceText}>Live Pricing</Text>
  </View>
)}

{enhancedHotel.availability && (
  <View style={styles.availabilityInfo}>
    <Text style={styles.availabilityText}>
      Check-in: {enhancedHotel.availability.checkIn} | 
      Check-out: {enhancedHotel.availability.checkOut}
    </Text>
    <Text style={styles.availabilityText}>
      {enhancedHotel.availability.roomsAvailable} rooms available
    </Text>
  </View>
)}
```

## 🧪 Testing & Development

### **Mock Data**
The service includes comprehensive mock data for testing:
```typescript
// Test hotel search
const mockHotels = await amadeusService.getMockHotelSearch();

// Test hotel offers
const mockOffers = await amadeusService.getMockHotelOffers('test_hotel_id');
```

### **Fallback Strategy**
- **API Unavailable**: Falls back to mock data
- **Network Errors**: Graceful degradation
- **Rate Limiting**: Automatic retry with exponential backoff

### **Debug Mode**
Enable console logging for debugging:
```typescript
// Check API responses
console.log('Amadeus hotels:', amadeusHotels);
console.log('Hotel offers:', offers);
console.log('Merged data:', hotelDetails);
```

## 🚀 Future Enhancements

### **Phase 1: Advanced Search**
- **Filtering**: Price range, star rating, amenities
- **Sorting**: Price, rating, distance
- **Pagination**: Large result sets

### **Phase 2: Booking Integration**
- **Direct Booking**: Complete booking flow
- **Payment Processing**: Secure payment integration
- **Booking Management**: View/modify bookings

### **Phase 3: Advanced Features**
- **Price Alerts**: Notify when prices drop
- **Flexible Dates**: Show pricing across date ranges
- **Loyalty Programs**: Integrate with hotel loyalty systems

## 🐛 Troubleshooting

### **Common Issues**

#### **Authentication Errors**
```typescript
// Error: Failed to get access token
// Solution: Check API key and secret in .env file
AMADEUS_API_KEY=your_actual_key
AMADEUS_CLIENT_SECRET=your_actual_secret
```

#### **Rate Limiting**
```typescript
// Error: Too many requests
// Solution: Implement exponential backoff
// The service automatically handles this
```

#### **Network Errors**
```typescript
// Error: Network request failed
// Solution: Check internet connection
// Service falls back to mock data automatically
```

### **Debug Steps**
1. **Check Environment Variables**: Verify `.env` file
2. **Check API Credentials**: Verify Amadeus account
3. **Check Network**: Test API endpoints manually
4. **Check Console**: Look for error messages
5. **Test Mock Data**: Verify fallback functionality

## 📚 API Documentation References

- **Amadeus API**: [Official Documentation](https://developers.amadeus.com/)
- **Hotel Search**: [Hotel Search API](https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-search)
- **Hotel Offers**: [Hotel Offers API](https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-offers-search)
- **Authentication**: [OAuth2 Guide](https://developers.amadeus.com/self-service/apis-docs/guides/authorization-262)

## 🔒 Security & Best Practices

### **API Key Management**
- **Environment Variables**: Never hardcode API keys
- **Secret Rotation**: Regularly rotate API secrets
- **Access Control**: Limit API access to necessary endpoints

### **Rate Limiting**
- **Respect Limits**: Stay within API rate limits
- **Caching**: Cache responses when possible
- **Batch Requests**: Combine multiple requests when possible

### **Error Handling**
- **Graceful Degradation**: Always provide fallback data
- **User Feedback**: Inform users of API issues
- **Logging**: Log errors for debugging

## 🤝 Contributing

When extending the Amadeus integration:
1. **Update Interfaces**: Add new fields to data models
2. **Extend Service**: Add new API methods
3. **Update UI**: Display new data in screens
4. **Add Tests**: Include mock data for new features
5. **Update Documentation**: Keep this README current

---

**🎉 You now have a fully integrated Amadeus API service providing real-time hotel data! The foundation is set for comprehensive hotel booking functionality.**
