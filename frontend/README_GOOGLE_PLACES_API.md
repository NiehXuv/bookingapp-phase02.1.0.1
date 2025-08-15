# Google Places API Integration Guide

## Overview
The Explore screen now integrates with **Google Places API** to provide comprehensive location data, hotel search, and POI information for Vietnam. Google Places API offers superior coverage of Vietnamese points of interest compared to TrackAsia, with detailed business listings, photos, reviews, and real-time data.

## 🎯 **Why Google Places API over TrackAsia?**

### **Coverage Comparison:**
- **TrackAsia**: Limited POI coverage, mostly major landmarks
- **Google Places API**: Comprehensive coverage including:
  - 🏨 **Hotels**: 1000+ hotels in Hanoi alone
  - 🍽️ **Restaurants**: 2000+ dining options
  - 🏛️ **Attractions**: 500+ tourist sites
  - 🛍️ **Shopping**: 1000+ retail locations
  - 🏥 **Services**: Banks, hospitals, pharmacies
  - 🚇 **Transport**: Bus stops, train stations

### **Data Quality:**
- **Real-time updates**: Business hours, prices, availability
- **Rich content**: Photos, reviews, ratings, user photos
- **Vietnamese language**: Full local language support
- **Local business data**: Small businesses, family restaurants, local shops

## Features Implemented

### 🗺️ Interactive Map
- **Vietnam-focused**: Centered on Hanoi with detailed landmarks
- **Dynamic markers**: Hotels and attractions with popup information
- **Real-time data**: Live POI information from Google
- **Vietnamese support**: Local language and business names

### 🏨 Hotel Search & Display
- **Comprehensive search**: All hotels in Vietnam (not just major chains)
- **Detailed information**: Prices, ratings, amenities, photos
- **Real-time data**: Opening hours, availability, current prices
- **Local insights**: User reviews, photos, local recommendations

### 🏛️ Places & Attractions
- **Tourist attractions**: Historical sites, museums, cultural centers
- **Local businesses**: Family restaurants, local shops, markets
- **Cultural sites**: Temples, pagodas, traditional craft villages
- **Modern venues**: Shopping malls, entertainment centers, sports facilities

### 🔍 Search Functionality
- **Smart search**: Vietnamese text normalization and local search
- **Category filtering**: Hotels, restaurants, attractions, services
- **Location-based**: Search within specific areas of Vietnam
- **Real-time results**: Live API responses with current data

## API Endpoints Used

### Places Text Search
```
GET /maps/api/place/textsearch/json
- query: Search query with location context
- key: API key
- type: establishment (for places) or lodging (for hotels)
- language: vi (Vietnamese)
- region: vn (Vietnam bias)
- radius: Search radius in meters
```

### Place Details
```
GET /maps/api/place/details/json
- place_id: Unique place identifier
- key: API key
- language: vi (Vietnamese)
- fields: Specific data fields to retrieve
```

### Place Photos
```
GET /maps/api/place/photo
- photoreference: Photo reference from place details
- maxwidth: Maximum photo width
- key: API key
```

## Configuration

### 1. API Key Setup
```typescript
// In apiConfig.ts
export const API_CONFIG = {
  GOOGLE_PLACES: {
    API_KEY: 'your_actual_google_places_api_key_here',
    BASE_URL: 'https://maps.googleapis.com/maps/api/place',
    MAX_RESULTS: 20,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 50,
      REQUESTS_PER_DAY: 2000
    }
  }
};

// Helper function to get API key
export const getGooglePlacesApiKey = (): string => {
  const apiKey = API_CONFIG.GOOGLE_PLACES.API_KEY;
  if (apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
    console.warn('⚠️ Google Places API key not configured. Please add your API key to apiConfig.ts');
    return '';
  }
  return apiKey;
};
```

### 2. Service Integration
```typescript
// In googlePlacesService.ts
import { API_CONFIG, getGooglePlacesApiKey } from '../config/apiConfig';

class GooglePlacesService {
  constructor() {
    this.apiKey = getGooglePlacesApiKey();
    this.baseUrl = API_CONFIG.GOOGLE_PLACES.BASE_URL;
  }
}
```

### 3. API Key Management
- **Centralized configuration**: All API keys managed in `apiConfig.ts`
- **Automatic fallback**: Service falls back to mock data if API key not configured
- **Console warnings**: Clear guidance when API key is missing
- **No UI complexity**: Simple configuration file management

## Getting Your Google Places API Key

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API** and **Maps JavaScript API**

### Step 2: Create API Key
1. Go to **Credentials** → **Create Credentials** → **API Key**
2. Restrict the key to **Places API** only
3. Set usage quotas to control costs

### Step 3: Configure Billing
1. Enable billing for your project
2. Set up budget alerts
3. Monitor API usage

## Vietnam-Specific Features

### Language Support
- **Vietnamese language**: Full local language support
- **Local business names**: Proper Vietnamese diacritics
- **Address formatting**: Vietnamese address standards
- **Cultural context**: Vietnam-specific place categories

### Regional Focus
- **Hanoi coverage**: 5000+ POIs in Hanoi metropolitan area
- **Major cities**: Ho Chi Minh City, Da Nang, Hue, Hoi An
- **Tourist areas**: Sapa, Ha Long Bay, Mekong Delta
- **Local neighborhoods**: Old Quarter, French Quarter, modern districts

### Business Categories
- **Traditional**: Pho restaurants, local markets, craft villages
- **Modern**: International hotels, shopping malls, entertainment
- **Cultural**: Temples, museums, historical sites
- **Practical**: Banks, pharmacies, transportation hubs

## Usage Examples

### Search for Hotels
```typescript
const hotels = await googlePlacesService.searchHotels(
  'Hanoi',           // Query
  'Hanoi, Vietnam',  // Location context
  50000              // Radius in meters
);
```

### Find Attractions
```typescript
const places = await googlePlacesService.searchPlaces(
  'attractions',     // Query
  'Hanoi, Vietnam',  // Location context
  50000              // Radius in meters
);
```

### Get Place Details
```typescript
const placeDetails = await googlePlacesService.getPlaceDetails(
  'place_id_here'    // Place ID from search results
);
```

## Error Handling

### API Key Issues
- **Invalid key**: Falls back to mock data with console warnings
- **Rate limiting**: Automatic retry with exponential backoff
- **Network errors**: Graceful degradation to cached data

### Fallback Data
- **Mock hotels**: Sample Vietnam hotel data
- **Mock places**: Popular Hanoi attractions
- **Offline support**: Basic functionality without internet

## Performance Optimization

### Caching Strategy
- **Search results**: Cache recent searches
- **Place details**: Store frequently accessed information
- **Photos**: Optimize image loading and caching

### API Quota Management
- **Smart batching**: Combine multiple requests
- **Rate limiting**: Respect API quotas (50 req/min, 2000 req/day)
- **Efficient queries**: Minimize unnecessary API calls

## Cost Management

### Free Tier
- **2000 requests/month**: Generous free tier
- **Text search**: $0.017 per request
- **Place details**: $0.017 per request
- **Photos**: $0.007 per request

### Cost Optimization
- **Cache results**: Avoid duplicate API calls
- **Batch requests**: Combine multiple searches
- **Monitor usage**: Set up budget alerts
- **Efficient queries**: Use specific search terms

## Troubleshooting

### Common Issues
1. **API key not working**: Check key validity and API enablement
2. **No results**: Verify search query and location context
3. **Rate limiting**: Check API quotas and usage
4. **High costs**: Monitor API usage and optimize queries

### Debug Information
- **Console logs**: Detailed API request/response logging
- **Configuration warnings**: Clear console messages when API key is missing
- **Error messages**: User-friendly error descriptions
- **Fallback behavior**: Automatic switch to mock data when API unavailable

## Future Enhancements

### Planned Features
- **Real-time updates**: Live business hours and availability
- **Photo galleries**: Rich image content from users
- **Reviews integration**: User ratings and feedback
- **Offline maps**: Downloadable map data

### API Improvements
- **WebSocket support**: Real-time updates
- **Batch operations**: Multiple place queries
- **Advanced filtering**: More search parameters
- **Analytics**: Usage statistics and insights

## Support & Resources

### Documentation
- **Google Places API Docs**: [https://developers.google.com/maps/documentation/places/web-service](https://developers.google.com/maps/documentation/places/web-service)
- **Google Cloud Console**: API key management and quotas
- **Code Examples**: Sample implementations and tutorials

### Community
- **Google Maps Platform**: Developer community and support
- **Stack Overflow**: Technical discussions and solutions
- **GitHub**: Open source implementations and examples

---

**Note**: This integration provides comprehensive Vietnam-focused exploration using Google Places API's extensive POI database. With 5000+ POIs in Hanoi alone and full Vietnamese language support, it offers significantly better coverage than TrackAsia for discovering local businesses, attractions, and services throughout Vietnam.
