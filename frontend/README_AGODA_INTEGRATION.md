# Agoda Integration Guide

This guide explains how to integrate Agoda hotel data into your booking app, both for development and production use.

## 🚀 Quick Start

The Agoda service is already set up with mock data for development. You can start using it immediately:

```typescript
import agodaService from '../services/agodaService';

// Search for hotels
const searchResult = await agodaService.searchHotels('Hanoi', 'Hanoi, Vietnam');

// Get hotel details
const hotelDetails = await agodaService.getHotelDetails('agoda_001');

// Check service status
const status = agodaService.getServiceStatus();
console.log(status); // { status: 'development', message: 'Using mock data...' }
```

## 🔧 Development Mode

Currently, the service runs in development mode with realistic mock data:

- **Mock Hotels**: 2 sample hotels in Hanoi with full details
- **Realistic Data**: Prices in VND, Vietnamese locations, proper amenities
- **Full Structure**: Complete hotel information including room types, policies, photos

## 🌐 Production Integration

To get real Agoda data, you need to join their affiliate program:

### Step 1: Join Agoda Affiliate Program

1. Visit [Agoda Affiliate Network](https://www.agoda.com/affiliate)
2. Apply for an affiliate account
3. Provide your app details and expected traffic
4. Wait for approval (usually 1-2 weeks)

### Step 2: Get API Credentials

Once approved, you'll receive:
- **Affiliate ID**: Unique identifier for your account
- **API Key**: Authentication key for API access
- **API Documentation**: Endpoints and data formats

### Step 3: Update Environment Variables

Create or update your `.env` file:

```env
AGODA_AFFILIATE_ID=your_affiliate_id_here
AGODA_API_KEY=your_api_key_here
```

### Step 4: Update API Configuration

The service will automatically detect your credentials and switch to production mode.

## 📊 Data Structure

The Agoda service provides comprehensive hotel data:

### Hotel Information
- Basic details (name, location, rating)
- Pricing (original price, discounted price, discount percentage)
- Amenities and facilities
- Photos and media
- Policies (check-in/out, children, pets)

### Room Types
- Room categories and descriptions
- Pricing per room type
- Capacity and bed configurations
- Room-specific amenities

### Search and Filtering
- Location-based search
- Price range filtering
- Rating and amenity filters
- Multiple sorting options

## 💰 Revenue Model

With Agoda affiliate integration:

- **Commission**: Earn commission on every booking
- **No Upfront Costs**: Free to join and integrate
- **Performance Based**: Higher commissions for more bookings
- **Global Reach**: Access to Agoda's worldwide hotel inventory

## 🔄 API Endpoints

When you get production access, these endpoints will be available:

### Search Hotels
```
GET /hotels/search
Query params: q, location, checkIn, checkOut, guests, rooms
```

### Hotel Details
```
GET /hotels/{hotelId}
Query params: affiliateId, apiKey
```

### Room Availability
```
GET /hotels/{hotelId}/availability
Query params: checkIn, checkOut, guests, rooms
```

## 🚨 Rate Limits

Production API limits:
- **Requests per minute**: 100
- **Requests per day**: 10,000
- **Concurrent requests**: 10

## 🧪 Testing

### Mock Data Testing
```typescript
// Test search functionality
const result = await agodaService.searchHotels('Hanoi');
console.log(`Found ${result.total} hotels`);

// Test hotel details
const hotel = await agodaService.getHotelDetails('agoda_001');
console.log(`Hotel: ${hotel?.name}, Price: ${hotel?.discountedPrice} VND`);
```

### Production Testing
```typescript
// Check if service is production ready
if (agodaService.isProductionReady()) {
  console.log('✅ Connected to Agoda API');
} else {
  console.log('⚠️ Using mock data - configure credentials for production');
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Using mock data" message**
   - Solution: Set environment variables for Agoda credentials

2. **API errors in production**
   - Check rate limits
   - Verify API key and affiliate ID
   - Check API documentation for endpoint changes

3. **No hotels returned**
   - Verify search parameters
   - Check location format
   - Ensure API quota not exceeded

### Debug Mode

Enable debug logging:
```typescript
// Add to your app initialization
if (__DEV__) {
  console.log('Agoda Service Status:', agodaService.getServiceStatus());
}
```

## 📱 Integration Examples

### Hotel Search Screen
```typescript
import React, { useState, useEffect } from 'react';
import agodaService from '../services/agodaService';

const HotelSearchScreen = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchHotels = async (query: string) => {
    setLoading(true);
    try {
      const result = await agodaService.searchHotels(query);
      setHotels(result.hotels);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

### Hotel Detail Screen
```typescript
import React, { useState, useEffect } from 'react';
import agodaService from '../services/agodaService';

const HotelDetailScreen = ({ hotelId }: { hotelId: string }) => {
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const loadHotel = async () => {
      const details = await agodaService.getHotelDetails(hotelId);
      setHotel(details);
    };
    loadHotel();
  }, [hotelId]);

  // ... rest of component
};
```

## 🔗 Related Services

Your app already has these hotel-related services:
- **Google Places**: Local business and hotel information
- **TripAdvisor**: Reviews and ratings
- **Amadeus**: Flight and hotel booking

Consider integrating them together for a comprehensive booking experience.

## 📞 Support

- **Agoda Affiliate Support**: Contact through your affiliate dashboard
- **API Documentation**: Provided when you join the affiliate program
- **Community**: Check Agoda affiliate forums and communities

## 🎯 Next Steps

1. **Start Development**: Use the mock data to build your UI
2. **Apply for Affiliate Program**: Begin the approval process
3. **Test Integration**: Ensure your app works with mock data
4. **Go Live**: Switch to production API when approved
5. **Optimize**: Monitor performance and optimize for conversions

---

**Note**: This service is designed to work seamlessly in both development and production modes. The mock data provides a realistic development experience while the production integration gives you access to real-time hotel data and revenue opportunities.
