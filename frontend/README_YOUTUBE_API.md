# YouTube Shorts API Integration

This guide explains how to set up and use the YouTube Shorts API integration in your React Native travel app.

## 🚀 Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure API Key

Open `frontend/src/config/apiConfig.ts` and replace:
```typescript
YOUTUBE_API_KEY: 'YOUR_API_KEY_HERE'
```

With your actual API key:
```typescript
YOUTUBE_API_KEY: 'AIzaSyB...' // Your actual key here
```

### 3. Test the Integration

1. Run your app
2. You should see test buttons in development mode
3. Click "🧪 Test API Key" to verify your key works
4. Click "🔄 Refresh Content" to fetch new content

## 🔧 How It Works

### Content Flow
1. **API Call**: Fetches Vietnam travel shorts from YouTube
2. **Filtering**: Only includes videos under 60 seconds
3. **Transformation**: Converts YouTube format to app format
4. **Fallback**: Uses mock data if API fails

### Search Queries
The app searches for these Vietnam-related terms:
- Vietnam travel shorts
- Hanoi food shorts
- Ho Chi Minh city shorts
- Hoi An lantern shorts
- Sapa mountain shorts
- Nha Trang beach shorts
- Vietnam culture shorts
- Vietnamese street food shorts

## 📱 Features

### Visual Indicators
- **Play Button**: Shows on all YouTube Shorts
- **Duration Badge**: Displays video length (e.g., "15s", "1:30")
- **Engagement Pills**: Shows likes and comments
- **Source Badge**: Indicates content source (YouTube Shorts)

### Content Types
- **YouTube Shorts**: Real content from YouTube API
- **Mock Data**: Fallback content when API is unavailable

## 🛠️ Customization

### Add More Search Terms
Edit `frontend/src/services/youtubeService.ts`:
```typescript
const queries = [
  'Vietnam travel shorts',
  'Your custom query here',
  // Add more queries...
];
```

### Change Content Count
Modify the `maxResults` parameter:
```typescript
const youtubeVideos = await youtubeService.fetchVietnamTravelShorts(30); // Get 30 videos
```

### Filter by Duration
Adjust the duration filter in the service:
```typescript
const isShort = duration <= 60; // Change 60 to your preferred duration
```

## 🚨 Troubleshooting

### Common Issues

1. **"API key not configured" warning**
   - Check that you've added your API key to `apiConfig.ts`

2. **No content loading**
   - Verify your API key is valid
   - Check internet connection
   - Look for error messages in the console

3. **Rate limiting errors**
   - YouTube API has quotas (10,000 requests/day)
   - Implement caching if you hit limits

### Debug Mode
In development, you'll see:
- Test buttons for API testing
- Console logs for debugging
- Error messages displayed to users

## 📊 API Quotas

- **Daily Limit**: 10,000 requests
- **Per Minute**: 60 requests
- **Cost**: Free tier available

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables in production
- Consider implementing API key rotation

## 🚀 Next Steps

After YouTube API is working:
1. Add TikTok API integration
2. Implement Instagram Basic Display API
3. Add content caching
4. Implement offline support

## 📚 Resources

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [API Quotas and Pricing](https://developers.google.com/youtube/v3/getting-started#quota)
- [React Native Fetch API](https://reactnative.dev/docs/network)
