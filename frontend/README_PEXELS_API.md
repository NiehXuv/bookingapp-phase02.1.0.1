# Pexels API Integration

## Getting Your Pexels API Key

### 1. Visit Pexels Developer Portal
- Go to [https://www.pexels.com/api/](https://www.pexels.com/api/)
- Click "Get Started" or "Sign Up"

### 2. Create an Account
- Sign up with your email or use GitHub/Google OAuth
- Verify your email address

### 3. Get Your API Key
- After logging in, you'll see your API key
- Copy the API key (it looks like: `563492ad6f91700001000001...`)

### 4. Configure in Your App
- Open `frontend/src/config/apiConfig.ts`
- Replace `'YOUR_PEXELS_API_KEY_HERE'` with your actual API key:

```typescript
PEXELS: {
  API_KEY: '563492ad6f91700001000001...', // Your actual API key here
  BASE_URL: 'https://api.pexels.com/v1',
  MAX_RESULTS: 25
}
```

## API Features

### Free Tier Benefits
- **5,000 requests per hour** (very generous!)
- **High-quality photos** from professional photographers
- **No attribution required** for most photos
- **Multiple image sizes** (small, medium, large, original)

### Search Capabilities
- **Query-based search** (e.g., "vietnam travel", "hanoi food")
- **Orientation filtering** (portrait, landscape, square)
- **Size filtering** (small, medium, large, original)
- **Color filtering** (by hex color codes)

### Vietnam Travel Queries
The app automatically searches for:
- `vietnam travel`
- `vietnamese food`
- `hanoi vietnam`
- `ho chi minh city`
- `hoi an vietnam`
- `sapa vietnam`
- `ha long bay`
- `vietnam culture`
- `vietnam temple`
- `vietnam street food`
- `vietnam landscape`
- `vietnam architecture`

## API Response Format

Each photo includes:
- **ID**: Unique identifier
- **Title**: Generated from alt text
- **Description**: Vietnam travel context
- **Image URLs**: Multiple sizes available
- **Photographer**: Author attribution
- **Dimensions**: Width and height
- **Average Color**: Hex color code
- **Tags**: Relevant keywords

## Error Handling

The app includes robust error handling:
- **API key validation**
- **Network error fallbacks**
- **Mock data generation** when API is unavailable
- **Image loading error handling**

## Rate Limiting

- **5,000 requests per hour** (free tier)
- **Automatic retry logic** for failed requests
- **Smart caching** to minimize API calls

## Testing Your API Key

You can test your Pexels API key by:
1. Running the app
2. Checking console logs for "✅ Pexels API is working"
3. Viewing content from the Pexels source

## Support

- **Pexels API Documentation**: [https://www.pexels.com/api/documentation/](https://www.pexels.com/api/documentation/)
- **API Status**: [https://status.pexels.com/](https://status.pexels.com/)
- **Community**: [https://www.pexels.com/community/](https://www.pexels.com/community/)

## Notes

- Pexels is completely **free** with generous limits
- **No credit card required**
- **High-quality, curated content**
- **Perfect for travel and lifestyle apps**
- **Vietnamese content available** through search queries
