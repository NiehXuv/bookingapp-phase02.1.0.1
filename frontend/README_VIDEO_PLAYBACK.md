# Video Playback in DetailScreen

This document explains how video playback works in the DetailScreen for YouTube Shorts content.

## 🎥 Features

### **YouTube Video Player**
- **Automatic Detection**: Automatically detects YouTube Shorts content
- **Embedded Player**: Uses `react-native-youtube-iframe` for native playback
- **Controls**: Full YouTube player controls (play, pause, seek, volume)
- **Responsive**: Adapts to different screen sizes

### **Content Types**
- **YouTube Shorts**: Full video player with controls
- **Images**: Standard image display with overlay
- **Fallback**: Graceful fallback for unsupported content

## 🔧 Implementation

### **Video Detection**
```typescript
// Automatically extracts YouTube video ID from URL
const match = item.originalUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
if (match) {
  setVideoId(match[1]);
}
```

### **Player Configuration**
```typescript
<YoutubePlayer
  height={300}
  play={playing}
  videoId={videoId}
  onStateChange={onStateChange}
  initialPlayerParams={{
    controls: true,
    modestbranding: true,
    rel: false,
    showinfo: false,
  }}
/>
```

### **State Management**
- **Playing State**: Controls play/pause
- **Video ID**: Extracted from content URL
- **Error Handling**: User-friendly error messages

## 📱 User Experience

### **Video Controls**
- **Play/Pause**: Tap play button overlay
- **YouTube Controls**: Native YouTube player controls
- **Fullscreen**: YouTube player fullscreen support
- **Quality**: Automatic quality selection

### **Content Information**
- **Source Badge**: Shows "YouTube Shorts" label
- **Duration**: Displays video length (e.g., "15s")
- **Channel**: Shows creator name
- **External Link**: "View Original" button

### **Responsive Design**
- **Height**: Fixed 300px height for consistency
- **Width**: Full screen width
- **Overlay**: Engagement pills over video
- **Actions**: Like, comment, share buttons

## 🚀 Usage Examples

### **From HomeScreen**
```typescript
// Navigate to DetailScreen with content
navigation.navigate('DetailScreen', { item: contentItem });
```

### **Content Structure**
```typescript
interface ContentItem {
  id: string;
  title: string;
  source: 'YouTube Shorts' | 'TikTok' | 'Instagram' | 'Mock';
  originalUrl?: string; // YouTube URL for video detection
  duration?: string;    // Video duration
  channelTitle?: string; // Creator name
  // ... other properties
}
```

## 🛠️ Customization

### **Player Height**
```typescript
// Change video player height
<YoutubePlayer height={400} /> // Default: 300
```

### **Player Parameters**
```typescript
initialPlayerParams={{
  controls: true,        // Show controls
  modestbranding: true,  // Minimal branding
  rel: false,            // No related videos
  showinfo: false,       // Hide video info
  autoplay: false,       // Don't autoplay
}}
```

### **Error Handling**
```typescript
const onStateChange = useCallback((state: string) => {
  if (state === 'ended') setPlaying(false);
  if (state === 'error') {
    // Custom error handling
    Alert.alert('Custom Error', 'Your error message');
  }
}, []);
```

## 🔒 Privacy & Security

### **YouTube Terms**
- Follows YouTube Terms of Service
- Uses official YouTube Data API
- Respects content creator rights

### **Data Handling**
- No video content stored locally
- Streams directly from YouTube
- Minimal data collection

## 🚨 Troubleshooting

### **Common Issues**

1. **Video Not Playing**
   - Check internet connection
   - Verify YouTube API key
   - Ensure video is public

2. **Player Not Loading**
   - Check `react-native-youtube-iframe` installation
   - Verify video ID extraction
   - Check console for errors

3. **Performance Issues**
   - Reduce player height
   - Implement lazy loading
   - Add loading states

### **Debug Mode**
```typescript
// Add console logs for debugging
console.log('Video ID:', videoId);
console.log('Playing state:', playing);
console.log('Content item:', item);
```

## 📚 Dependencies

### **Required Packages**
```json
{
  "react-native-youtube-iframe": "^4.0.1"
}
```

### **Installation**
```bash
npm install react-native-youtube-iframe
# or
yarn add react-native-youtube-iframe
```

## 🚀 Future Enhancements

### **Planned Features**
- **TikTok Video Support**: Native TikTok player
- **Instagram Video**: Instagram video playback
- **Offline Support**: Cache video metadata
- **Quality Selection**: User-controlled video quality
- **Playlist Support**: Continuous video playback

### **Performance Optimizations**
- **Lazy Loading**: Load videos on demand
- **Preloading**: Preload next video
- **Caching**: Cache video thumbnails
- **Compression**: Optimize video quality

## 📖 Resources

- [react-native-youtube-iframe Documentation](https://github.com/LonelyCpp/react-native-youtube-iframe)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [YouTube Terms of Service](https://www.youtube.com/t/terms)
