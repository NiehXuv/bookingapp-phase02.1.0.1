# Gemini API Integration Setup

This backend now includes AI-powered travel plan generation using Google's Gemini 2.0 API via direct REST API calls.

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" or go to [API Keys](https://aistudio.google.com/app/apikey)
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` (if not already done)
2. Add your Gemini API key:

```bash
# Google AI (Gemini) Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Dependencies

The service uses `axios` for HTTP requests (already included in your dependencies). No additional packages needed.

### 4. API Endpoint

The service uses the official Gemini 2.0 REST API endpoint:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

### 5. Test the Integration

The service is ready to use once you add your Gemini API key to the `.env` file.

## API Response Structure

The Gemini API generates comprehensive travel plans in this JSON format:

```json
{
  "planName": "Your Trip to [Destinations]",
  "summary": "Brief overview of the trip",
  "itinerary": {
    "days": [
      {
        "day": 1,
        "date": "Day 1",
        "title": "Day title",
        "description": "Brief description of the day",
        "activities": [
          {
            "time": "09:00",
            "activity": "Activity description",
            "location": "Location name",
            "duration": "2 hours",
            "cost": "Cost estimate",
            "notes": "Additional notes"
          }
        ],
        "meals": {
          "breakfast": "Breakfast suggestion",
          "lunch": "Lunch suggestion", 
          "dinner": "Dinner suggestion"
        },
        "accommodation": "Accommodation details",
        "transportation": "Transportation details",
        "estimatedCost": "Total cost for the day"
      }
    ]
  },
  "totalEstimatedCost": "Total trip cost estimate",
  "travelTips": ["Tip 1", "Tip 2"],
  "packingList": ["Essential item 1", "Essential item 2"],
  "emergencyContacts": {
    "localEmergency": "Local emergency number",
    "embassy": "Nearest embassy info"
  }
}
```

## Features

- **AI-Generated Itineraries**: Creates detailed day-by-day travel plans
- **Smart Recommendations**: Suggests activities, restaurants, and attractions
- **Budget-Aware Planning**: Considers budget constraints in recommendations
- **Cultural Sensitivity**: Provides culturally appropriate suggestions
- **Comprehensive Details**: Includes meals, transportation, accommodation, and costs
- **Travel Tips & Packing Lists**: Additional helpful information for travelers
- **Direct REST API**: Uses official Gemini 2.0 endpoint for best performance

## Error Handling

The service includes comprehensive error handling for:
- Missing API key
- API rate limits (429 errors)
- Invalid API key (403 errors)
- Bad request format (400 errors)
- Server errors (5xx errors)
- Network timeouts
- Invalid responses

## Security

- API key is stored in environment variables
- All endpoints require JWT authentication
- User data is isolated by user ID
- Safety settings configured for content filtering

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY is required"**
   - Check that your `.env` file has the correct API key
   - Restart the server after adding the key

2. **"Access denied to Gemini API"**
   - Verify your API key is valid
   - Check if billing is enabled for your Google Cloud project
   - Ensure the Gemini API is enabled in your project

3. **"Rate limit exceeded"**
   - Wait a few minutes before trying again
   - Check your API quota in Google AI Studio

4. **"Invalid request to Gemini API"**
   - Check the request format in the service
   - Verify your API key format

5. **"No response from Gemini API"**
   - Check your internet connection
   - Verify the API endpoint is accessible
   - Check if there are any firewall restrictions

### Testing

To test the integration:
1. Ensure your backend is running with a valid Gemini API key
2. Make a request to `POST /tripPlans/generate` with valid planning data
3. Check the response and verify the generated content
4. Check Firebase to ensure the plan was saved

## API Configuration

The service includes optimized generation settings:
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Output Tokens**: 8192 (sufficient for detailed itineraries)
- **Safety Settings**: Configured to filter inappropriate content
- **Timeout**: 30 seconds for reliable operation

This implementation provides a robust, production-ready AI travel planning service using the latest Gemini 2.0 API.
