# TrackAsia API Integration Guide

## Overview
The Explore screen integrates with TrackAsia API to provide real-time location data, hotel search, and directions for Vietnam. TrackAsia is a Vietnamese mapping platform that offers comprehensive location services similar to Google Maps but focused on Vietnam and Southeast Asia.

## Features Implemented

### 🗺️ Interactive Map
- **Vietnam-focused**: Centered on Hanoi with detailed landmarks
- **Water bodies**: West Lake (Hồ Tây) and Red River (Sông Hồng)
- **Major roads**: Ring Road 2 (Đ. Vành Đai 2)
- **Area labels**: NGỌC THỤY and other districts
- **Dynamic markers**: Hotels and attractions with popup information

### 🏨 Hotel Search & Display
- **Real-time search**: Using TrackAsia Places API v2
- **Vietnam hotels**: Focused on Hanoi and surrounding areas
- **Detailed information**: Prices, ratings, amenities, locations
- **Interactive markers**: Click for hotel details and directions

### 🏛️ Places & Attractions
- **Tourist attractions**: Historical sites, lakes, cultural areas
- **Categorized types**: Lakes, Historical Sites, Cultural Areas, Monuments
- **Rating system**: User ratings and reviews
- **Location data**: Precise coordinates and addresses

### 🧭 Navigation & Directions
- **Route calculation**: Using TrackAsia Directions API v2
- **Multiple modes**: Driving, walking, cycling
- **Distance & time**: Accurate estimates for Vietnam roads
- **Turn-by-turn**: Detailed navigation instructions

### 🔍 Search Functionality
- **Smart search**: Vietnamese text normalization
- **Location-based**: Search within specific areas of Vietnam
- **Category filtering**: Hotels, places, or attractions
- **Real-time results**: Live API responses

## API Endpoints Used

### Places API v2
```
GET /v2/places/search
- q: Search query
- key: API key
- limit: Results limit (default: 20)
- new_admin: true (new administrative boundaries)
- include_old_admin: true (backward compatibility)
- near: Location context
- radius: Search radius in meters
- type: Place category (lodging for hotels)
```

### Geocoding API v2
```
GET /v2/geocode/reverse
- lat: Latitude
- lng: Longitude
- key: API key
- new_admin: true
```

### Directions API v2
```
GET /v2/directions
- origin: Starting coordinates
- destination: End coordinates
- mode: Transportation mode
- key: API key
```

## Configuration

### 1. API Key Setup
```typescript
// In apiConfig.ts
export const API_CONFIG = {
  TRACKASIA: {
    API_KEY: 'your_actual_api_key_here', // Replace with your TrackAsia API key
    BASE_URL: 'https://api.track-asia.com',
    MAX_RESULTS: 20,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 30,
      REQUESTS_PER_DAY: 5000
    }
  }
};

// Helper function to get API key
export const getTrackAsiaApiKey = (): string => {
  const apiKey = API_CONFIG.TRACKASIA.API_KEY;
  if (apiKey === 'YOUR_TRACKASIA_API_KEY') {
    console.warn('⚠️ TrackAsia API key not configured. Please add your API key to apiConfig.ts');
    return '';
  }
  return apiKey;
};
```

### 2. Service Integration
```typescript
// In trackasiaService.ts
import { API_CONFIG, getTrackAsiaApiKey } from '../config/apiConfig';

class TrackAsiaService {
  constructor() {
    this.apiKey = getTrackAsiaApiKey();
    this.baseUrl = API_CONFIG.TRACKASIA.BASE_URL;
  }
}
```

### 3. API Key Management
- **Centralized configuration**: All API keys managed in `apiConfig.ts`
- **Automatic fallback**: Service falls back to mock data if API key not configured
- **Console warnings**: Clear guidance when API key is missing
- **No UI complexity**: Simple configuration file management

## Vietnam-Specific Features

### Administrative Boundaries
- **New boundaries**: Updated as of July 10, 2025
- **Backward compatibility**: Supports both old and new boundaries
- **Automatic detection**: API handles boundary changes

### Local Content
- **Vietnamese names**: Proper diacritics and local naming
- **Cultural context**: Vietnam-specific place categories
- **Regional focus**: Hanoi, Ho Chi Minh City, and major cities

### Map Customization
- **Local landmarks**: Famous Vietnamese sites
- **Cultural icons**: Traditional architecture markers
- **Language support**: Vietnamese and English labels

## Usage Examples

### Search for Hotels
```typescript
const hotels = await trackasiaService.searchHotels(
  'Hanoi',           // Query
  'Hanoi, Vietnam',  // Location context
  50000              // Radius in meters
);
```

### Find Attractions
```typescript
const places = await trackasiaService.searchPlaces(
  'attractions',     // Query
  'Hanoi, Vietnam',  // Location context
  50000              // Radius in meters
);
```

### Get Directions
```typescript
const directions = await trackasiaService.getDirections(
  { lat: 21.0285, lng: 105.8542 },  // Origin (Hanoi)
  { lat: 21.0245, lng: 105.8412 },  // Destination
  'driving'                          // Mode
);
```

## Error Handling

### API Key Issues
- **Invalid key**: Falls back to mock data
- **Rate limiting**: Automatic retry with exponential backoff
- **Network errors**: Graceful degradation to cached data

### Fallback Data
- **Mock hotels**: Sample Vietnam hotel data
- **Mock places**: Popular Hanoi attractions
- **Offline support**: Basic functionality without internet

## Performance Optimization

### Caching Strategy
- **Search results**: Cache recent searches
- **Hotel data**: Store frequently accessed information
- **Map tiles**: Optimize map rendering

### API Quota Management
- **Smart batching**: Combine multiple requests
- **Rate limiting**: Respect API quotas
- **Efficient queries**: Minimize unnecessary API calls

## Troubleshooting

### Common Issues
1. **API key not working**: Check key validity in `apiConfig.ts` and verify permissions
2. **No results**: Verify search query and location context
3. **Map not loading**: Check internet connection and WebView setup
4. **Slow performance**: Optimize search radius and result limits

### Debug Information
- **Console logs**: Detailed API request/response logging
- **Configuration warnings**: Clear console messages when API key is missing
- **Error messages**: User-friendly error descriptions
- **Fallback behavior**: Automatic switch to mock data when API unavailable

## Future Enhancements

### Planned Features
- **Real-time traffic**: Live traffic data integration
- **Public transport**: Bus and train route planning
- **Offline maps**: Downloadable map data
- **Multi-language**: Additional Southeast Asian languages

### API Improvements
- **WebSocket support**: Real-time updates
- **Batch operations**: Multiple location queries
- **Advanced filtering**: More search parameters
- **Analytics**: Usage statistics and insights

## Support & Resources

### Documentation
- **TrackAsia API Docs**: [https://docs.track-asia.com/vi/](https://docs.track-asia.com/vi/)
- **Developer Portal**: API key management and quotas
- **Code Examples**: Sample implementations

### Community
- **Developer Forum**: Technical discussions
- **GitHub Repository**: Open source contributions
- **Support Team**: Direct assistance for integration

---

**Note**: This integration provides a comprehensive Vietnam-focused exploration experience using TrackAsia's powerful mapping and location services. The API supports both Vietnamese and English interfaces, making it ideal for local and international users exploring Vietnam.
