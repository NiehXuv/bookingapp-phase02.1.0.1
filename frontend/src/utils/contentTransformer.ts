import { ContentItem, YouTubeVideo } from '../types/content';
import { TikTokVideo } from '../services/tiktokService';

// Transform YouTube video to ContentItem
export const transformYouTubeToContent = (video: YouTubeVideo): ContentItem => {
  return {
    id: `youtube_${video.id}`,
    imageUrl: video.thumbnailUrl,
    title: video.title,
    source: 'YouTube Shorts',
    originalUrl: `https://youtube.com/shorts/${video.id}`,
    engagement: {
      likes: parseInt(video.likeCount || '0'),
      comments: parseInt(video.commentCount || '0'),
      views: parseInt(video.viewCount || '0')
    },
    isShort: video.isShort,
    duration: video.duration,
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt,
    description: video.description,
    playButton: true,
    optionsBtn: true,
    metaTitle: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title
  };
};

// Transform TikTok video to ContentItem
export const transformTikTokToContent = (video: TikTokVideo): ContentItem => {
  return {
    id: `tiktok_${video.id}`,
    imageUrl: video.thumbnailUrl,
    title: video.title,
    source: 'TikTok',
    originalUrl: video.videoUrl || `https://tiktok.com/@user/video/${video.id}`,
    engagement: {
      likes: parseInt(video.likeCount || '0'),
      comments: parseInt(video.commentCount || '0'),
      views: parseInt(video.viewCount || '0'),
      shares: parseInt(video.shareCount || '0')
    },
    isShort: video.isShort,
    duration: video.duration,
    channelTitle: video.authorName,
    publishedAt: video.publishedAt,
    description: video.description,
    playButton: true,
    optionsBtn: true,
    metaTitle: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title
  };
};

// Transform mock data to ContentItem (for fallback)
export const transformMockToContent = (mockItem: any): ContentItem => {
  return {
    id: mockItem.id,
    imageUrl: mockItem.imageUrl,
    title: mockItem.title,
    source: 'Mock',
    engagement: {
      likes: mockItem.engagement.likes,
      comments: mockItem.engagement.comments
    },
    isShort: false,
    optionsBtn: true,
    metaTitle: mockItem.title
  };
};

// Format engagement numbers (1.2k, 500, etc.)
export const formatEngagement = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// Format relative time (2 hours ago, 3 days ago, etc.)
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
};

// Generate random height for masonry layout
export const generateRandomHeight = (min: number = 200, max: number = 400): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Sort content by engagement
export const sortByEngagement = (content: ContentItem[]): ContentItem[] => {
  return [...content].sort((a, b) => {
    const aScore = (a.engagement.likes * 2) + a.engagement.comments + (a.engagement.views || 0);
    const bScore = (b.engagement.likes * 2) + b.engagement.comments + (b.engagement.views || 0);
    return bScore - aScore;
  });
};

// Filter content by source
export const filterBySource = (content: ContentItem[], sources: string[]): ContentItem[] => {
  if (!sources || sources.length === 0) return content;
  return content.filter(item => sources.includes(item.source));
};

// Search content by title or description
export const searchContent = (content: ContentItem[], query: string): ContentItem[] => {
  if (!query.trim()) return content;
  
  const searchTerm = query.toLowerCase();
  return content.filter(item => 
    item.title.toLowerCase().includes(searchTerm) ||
    (item.description && item.description.toLowerCase().includes(searchTerm)) ||
    (item.channelTitle && item.channelTitle.toLowerCase().includes(searchTerm))
  );
};
