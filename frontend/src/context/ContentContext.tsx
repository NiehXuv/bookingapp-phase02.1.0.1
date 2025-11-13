import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ContentItem } from '../types/content';

interface ContentContextType {
  // Content pool from HomeScreen
  contentPool: ContentItem[];
  setContentPool: (content: ContentItem[]) => void;
  
  // Related content cache
  relatedContentCache: Map<string, ContentItem[]>;
  cacheRelatedContent: (itemId: string, relatedItems: ContentItem[]) => void;
  getCachedRelatedContent: (itemId: string) => ContentItem[] | undefined;
  
  // Content similarity scoring
  calculateSimilarity: (item1: ContentItem, item2: ContentItem) => number;
  
  // Smart content filtering
  getRelatedContent: (currentItem: ContentItem, count?: number) => ContentItem[];
  
  // Content pool management
  addToContentPool: (content: ContentItem[]) => void;
  clearContentPool: () => void;
  
  // ContentScreen state persistence
  contentScreenData: {
    content: ContentItem[];
    activeTab: string;
    seenContentIds: string[]; // Store as array since Set can't be serialized
  } | null;
  setContentScreenData: (data: { content: ContentItem[]; activeTab: string; seenContentIds: string[] } | null) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContentContext = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentContext must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [contentPool, setContentPool] = useState<ContentItem[]>([]);
  const [relatedContentCache, setRelatedContentCache] = useState<Map<string, ContentItem[]>>(new Map());
  const [contentScreenData, setContentScreenData] = useState<{
    content: ContentItem[];
    activeTab: string;
    seenContentIds: string[]; // Store as array since Set can't be serialized
  } | null>(null);

  // Cache related content for an item
  const cacheRelatedContent = (itemId: string, relatedItems: ContentItem[]) => {
    setRelatedContentCache(prev => new Map(prev).set(itemId, relatedItems));
  };

  // Get cached related content
  const getCachedRelatedContent = (itemId: string) => {
    return relatedContentCache.get(itemId);
  };

  // Calculate similarity score between two content items
  const calculateSimilarity = (item1: ContentItem, item2: ContentItem): number => {
    let score = 0;
    
    // Source-based matching (highest weight)
    if (item1.source === item2.source) {
      score += 40;
    }
    
    // Location-based matching (for TripAdvisor)
    if (item1.locationString && item2.locationString) {
      const location1 = item1.locationString.toLowerCase();
      const location2 = item2.locationString.toLowerCase();
      
      if (location1 === location2) {
        score += 35;
      } else if (location1.includes(location2.split(',')[0]) || 
                 location2.includes(location1.split(',')[0])) {
        score += 25;
      }
    }
    
    // Tag-based matching
    if (item1.tags && item2.tags) {
      const commonTags = item1.tags.filter(tag => 
        item2.tags!.some(t => t.toLowerCase().includes(tag.toLowerCase()) || 
                              tag.toLowerCase().includes(t.toLowerCase()))
      );
      score += commonTags.length * 10;
    }
    
    // Title similarity
    const title1 = item1.title.toLowerCase();
    const title2 = item2.title.toLowerCase();
    const titleWords1 = title1.split(' ');
    const titleWords2 = title2.split(' ');
    
    const commonWords = titleWords1.filter(word => 
      titleWords2.some(w => w.includes(word) || word.includes(w))
    );
    score += commonWords.length * 5;
    
    // Description similarity
    if (item1.description && item2.description) {
      const desc1 = item1.description.toLowerCase();
      const desc2 = item2.description.toLowerCase();
      const descWords1 = desc1.split(' ');
      const descWords2 = desc2.split(' ');
      
      const commonDescWords = descWords1.filter(word => 
        descWords2.some(w => w.includes(word) || word.includes(w))
      );
      score += commonDescWords.length * 2;
    }
    
    return score;
  };

  // Get related content using intelligent similarity matching
  const getRelatedContent = (currentItem: ContentItem, count: number = 6): ContentItem[] => {
    // First check cache
    const cached = getCachedRelatedContent(currentItem.id);
    if (cached && cached.length >= count) {
      return cached.slice(0, count);
    }
    
    // Filter out current item and calculate similarity scores
    const relatedItems = contentPool
      .filter(item => item.id !== currentItem.id)
      .map(item => ({
        item,
        similarity: calculateSimilarity(currentItem, item)
      }))
      .filter(({ similarity }) => similarity > 15) // Only items with meaningful similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count * 2) // Get more items for variety
      .map(({ item }) => item);
    
    // Cache the results
    if (relatedItems.length > 0) {
      cacheRelatedContent(currentItem.id, relatedItems);
    }
    
    return relatedItems.slice(0, count);
  };

  // Add content to the pool
  const addToContentPool = (content: ContentItem[]) => {
    setContentPool(prev => {
      const newPool = [...prev, ...content];
      // Remove duplicates based on ID
      const uniquePool = newPool.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      return uniquePool;
    });
  };

  // Clear content pool
  const clearContentPool = () => {
    setContentPool([]);
    setRelatedContentCache(new Map());
  };

  const value: ContentContextType = {
    contentPool,
    setContentPool,
    relatedContentCache,
    cacheRelatedContent,
    getCachedRelatedContent,
    calculateSimilarity,
    getRelatedContent,
    addToContentPool,
    clearContentPool,
    contentScreenData,
    setContentScreenData,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};
