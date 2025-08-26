import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Modal, Pressable, Share as RnShare, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Heart, MessageCircle, MoreHorizontal, Share2, Pin as PinIcon, UserPlus, Flag, Play } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { contentService } from '../services/contentService';
import { transformMockToContent, formatEngagement } from '../utils/contentTransformer';
import { ContentItem } from '../types/content';
import { useContentContext } from '../context/ContentContext';
import savedContentService from '../services/savedContentService';

const { width } = Dimensions.get('window');

const masonryData = [
	{ id: '1', image: require('../../assets/hanoi.jpg'), likes: '2.2k', comments: '90+', title: 'Hanoi Reflections' },
	{ id: '2', image: require('../../assets/hoian.jpg'), likes: '1.2k', comments: '20+', title: 'Hoi An Boats at Sunset' },
	{ id: '3', image: require('../../assets/nhatrang.jpg'), likes: '1.4k', comments: '30+', title: 'Nha Trang Aerial' },
	{ id: '4', image: require('../../assets/sapa.jpg'), likes: '2.0k', comments: '50+', title: 'Sapa Mountain Fog' },
	{ id: '5', image: require('../../assets/hue.jpg'), likes: '1.1k', comments: '15+', title: 'Hue Ancient Gate' },
	{ id: '6', image: require('../../assets/himalaya_hotel.jpg'), likes: '980', comments: '12+', title: 'Resort by the Pool' },
	{ id: '7', image: require('../../assets/sunset_hotel.jpg'), likes: '1.9k', comments: '40+', title: 'Sunset Hotel Lights' },
	{ id: '8', image: require('../../assets/hanoi.jpg'), likes: '2.4k', comments: '100+', title: 'Old Quarter Vibes' },
	{ id: '9', image: require('../../assets/hoian.jpg'), likes: '1.8k', comments: '28+', title: 'Lanterns on the River' },
	{ id: '10', image: require('../../assets/nhatrang.jpg'), likes: '1.5k', comments: '33+', title: 'Coastal Cityscape' },
	{ id: '11', image: require('../../assets/sapa.jpg'), likes: '2.1k', comments: '60+', title: 'Clouds over Terraces' },
	{ id: '12', image: require('../../assets/hue.jpg'), likes: '1.0k', comments: '11+', title: 'Imperial City Walls' },
	{ id: '13', image: require('../../assets/himalaya_hotel.jpg'), likes: '1.2k', comments: '18+', title: 'Poolside Morning' },
	{ id: '14', image: require('../../assets/sunset_hotel.jpg'), likes: '1.6k', comments: '24+', title: 'Golden Hour Stay' },
	{ id: '15', image: require('../../assets/hanoi.jpg'), likes: '2.7k', comments: '130+', title: 'Temple Lake Mirror' },
	{ id: '16', image: require('../../assets/hoian.jpg'), likes: '1.9k', comments: '35+', title: 'Old Town Colors' },
	{ id: '17', image: require('../../assets/nhatrang.jpg'), likes: '1.3k', comments: '22+', title: 'Harbor Morning' },
	{ id: '18', image: require('../../assets/sapa.jpg'), likes: '2.3k', comments: '72+', title: 'Peak Trails' },
	{ id: '19', image: require('../../assets/hue.jpg'), likes: '1.4k', comments: '19+', title: 'Citadel Entry' },
	{ id: '20', image: require('../../assets/sunset_hotel.jpg'), likes: '1.1k', comments: '14+', title: 'Rooftop Dusk' },
];

const tabs = ['For you', 'Popular', 'New', 'Near me', 'Beach'];

const HomeScreen: React.FC = () => {
	const { user, token } = useAuth();
	const navigation = useNavigation();
	const { setContentPool, addToContentPool } = useContentContext();
	const [activeTab, setActiveTab] = useState('For you');
	const [optionsVisible, setOptionsVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
	
	// YouTube API state
	const [content, setContent] = useState<ContentItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Track seen content IDs to prevent duplicates
	const [seenContentIds, setSeenContentIds] = useState<Set<string>>(new Set());
	
	// Fetch saved content IDs
	const fetchSavedContentIds = async () => {
		if (!token) return;
		
		try {
			const response = await savedContentService.getSavedContent(token);
			if (response.success && response.favorites?.content) {
				const savedIds = new Set(response.favorites.content.map(item => item.id));
				setSavedContentIds(savedIds);
			}
		} catch (error) {
			console.error('Error fetching saved content IDs:', error);
		}
	};
	
	// Handle saving content
	const handleSaveContent = async (content: ContentItem) => {
		if (!token) {
			Alert.alert('Error', 'Please log in to save content');
			return;
		}
		
		try {
			const isSaved = savedContentIds.has(content.id);
			
			if (isSaved) {
				// Remove from saved
				await savedContentService.removeSavedContent(content.id, token);
				setSavedContentIds(prev => {
					const newSet = new Set(prev);
					newSet.delete(content.id);
					return newSet;
				});
				// Show toast-like feedback instead of alert
				console.log('Content removed from saved');
			} else {
				// Add to saved
				await savedContentService.saveContent(content, token);
				setSavedContentIds(prev => new Set(prev).add(content.id));
				// Show toast-like feedback instead of alert
				console.log('Content saved successfully');
			}
		} catch (error) {
			console.error('Error saving/removing content:', error);
			Alert.alert('Error', 'Failed to save content. Please try again.');
		}
	};
	
	// Infinite scroll and bottom tracking
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMoreContent, setHasMoreContent] = useState(true);
	const [lastLoadTime, setLastLoadTime] = useState(0);
	const [hasReachedBottom, setHasReachedBottom] = useState(false);
	const [bottomScrollCount, setBottomScrollCount] = useState(0);
	const [isAtBottom, setIsAtBottom] = useState(false);
	
	// Scroll position tracking for infinite scroll
	const scrollViewRef = useRef<ScrollView>(null);
	
	// Saved content tracking
	const [savedContentIds, setSavedContentIds] = useState<Set<string>>(new Set());
  

	// Fetch saved content IDs
	useEffect(() => {
		if (token) {
			fetchSavedContentIds();
		}
	}, [token]);
	
	// Fetch content from multiple sources using contentService
	const fetchContent = async (refresh = false) => {
		if (refresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);

		try {
			// Smart quota management: use different strategies for refresh vs initial load
			const maxResults = getQuotaEfficientMaxResults(refresh, activeTab);
			
			// Smart source selection to reduce YouTube API calls
			let sourcesToFetch: ('YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels')[] = ['TripAdvisor', 'Pixabay', 'Pexels'];
			
			// Use smart YouTube inclusion logic
			if (refresh || shouldIncludeYouTube()) {
				sourcesToFetch.unshift('YouTube Shorts');
			}
			
			console.log(`🚀 Initial load: Fetching from ${sourcesToFetch.join(', ')} with maxResults ${maxResults}`);
			
			// Fetch content from selected sources
			const allContent = await contentService.fetchContent({
				sources: sourcesToFetch,
				maxResults,
				refresh
			});
			
			if (allContent.length > 0) {
				// Remove duplicates first, then apply tab filtering
				const deduplicatedContent = removeDuplicates(allContent, refresh);
				const filteredContent = filterContentByTab(deduplicatedContent, activeTab);
				
				// Populate content pool for related content functionality
				addToContentPool(allContent);
				
				// Log content distribution
				const contentBreakdown = {
					youtube: filteredContent.filter(item => item.source === 'YouTube Shorts').length,
					tripadvisor: filteredContent.filter(item => item.source === 'TripAdvisor').length,
					pixabay: filteredContent.filter(item => item.source === 'Pixabay').length,
					pexels: filteredContent.filter(item => item.source === 'Pexels').length
				};
				console.log(`📊 Content distribution: YouTube: ${contentBreakdown.youtube}, TripAdvisor: ${contentBreakdown.tripadvisor}, Pixabay: ${contentBreakdown.pixabay}, Pexels: ${contentBreakdown.pexels}`);
				console.log(`📈 Content efficiency: ${filteredContent.length}/${allContent.length} items used (${((filteredContent.length / allContent.length) * 100).toFixed(1)}%)`);
				console.log(`🚀 Displaying all ${filteredContent.length} items (no artificial limits)`);
				
				if (refresh) {
					// On refresh, use smart merging to maintain content quality
					setContent(prevContent => mergeContentSmartly(prevContent, filteredContent));
			} else {
					// On initial load, replace content
					setContent(filteredContent);
				}
			} else {
				// Fallback to mock data if no content
				const mockContent = masonryData.map(transformMockToContent);
				const deduplicatedMockContent = removeDuplicates(mockContent, refresh);
				const filteredMockContent = filterContentByTab(deduplicatedMockContent, activeTab);
				
				// Add mock content to pool as well
				addToContentPool(mockContent);
				
				if (refresh) {
					setContent(prevContent => mergeContentSmartly(prevContent, filteredMockContent));
				} else {
					setContent(filteredMockContent);
				}
			}
		} catch (err) {
			console.error('Error fetching content:', err);
			setError('Failed to load content. Using mock data.');
			
			// Fallback to mock data
			const mockContent = masonryData.map(transformMockToContent);
			const filteredMockContent = filterContentByTab(mockContent, activeTab);
			setContent(filteredMockContent);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	};

	// Load content on mount and tab change only
	useEffect(() => {
		if (content.length === 0 || activeTab !== prevActiveTab.current) {
			fetchContent();
			prevActiveTab.current = activeTab;
		}
	}, [activeTab]);
	
	// Track previous active tab to prevent unnecessary reloads
	const prevActiveTab = useRef(activeTab);

	// Refresh content
	const handleRefresh = async () => {
		setIsRefreshing(true);
		
		// Reset content change tracking for fresh start
		// setLastContentCount(0); // Removed as per edit hint
		// setContentChangeThreshold(5); // Removed as per edit hint
		// setScrollThreshold(100); // Removed as per edit hint
		// setLastScrollPosition(0); // Removed as per edit hint
		
		// Reset content hash to allow fresh fetches
		// setLastContentHash(''); // Removed as per edit hint
		
		// Only refresh if not already refreshing
		if (!isRefreshing) {
			await fetchContent();
		}
		
		setIsRefreshing(false);
	};

	// Clear seen content IDs (useful for testing or when switching tabs)
	const clearSeenContent = () => {
		setSeenContentIds(new Set());
	};

	// Smart content rotation: clear old content when we have too many items
	const smartContentRotation = () => {
		// Clear some old content when we have too much
		if (content.length > 100) {
			console.log('🔄 Smart rotation: Content pool too large (' + content.length + '), clearing oldest items');
			setContent(prevContent => {
				// Keep the most recent 70% of content
				const keepCount = Math.floor(prevContent.length * 0.7);
				return prevContent.slice(-keepCount);
			});
			return true;
		}
		
		return false;
	};

	// Check if new content is too similar to existing content
	const isContentTooSimilar = (newContent: ContentItem[]): boolean => {
		if (content.length === 0) return false;
		
		// Simple similarity check - only check for exact duplicates
		const existingIds = new Set(content.map(item => item.id));
		const duplicateCount = newContent.filter(item => existingIds.has(item.id)).length;
		
		const duplicateRatio = duplicateCount / newContent.length;
		const isTooSimilar = duplicateRatio > 0.8; // If 80%+ are exact duplicates, skip
		
		if (isTooSimilar) {
			console.log(`⚠️ Too many exact duplicates: ${(duplicateRatio * 100).toFixed(1)}%, skipping load`);
		}
		
		return isTooSimilar;
	};

	// Smooth reset when user scrolls away from bottom
	const smoothResetFromBottom = () => {
		if (isAtBottom) {
			console.log('📱 User scrolled away from bottom, starting smooth reset...');
			
			// Gradually reset states for smoother experience
			setTimeout(() => {
				if (!isAtBottom) {
					setHasReachedBottom(false);
					setBottomScrollCount(0);
					console.log('📱 Smooth reset completed');
				}
			}, 500); // 500ms delay for smooth transition
		}
	};

	// Smooth bottom detection for infinite scroll
	const checkIfReachedBottom = (layoutMeasurement: any, contentOffset: any, contentSize: any): boolean => {
		const paddingToBottom = 150; // Increased threshold for smoother detection
		const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
		
		if (reachedBottom) {
			if (!isAtBottom) {
				console.log('📱 User reached bottom area, starting bottom scroll tracking');
				setIsAtBottom(true);
				setBottomScrollCount(0);
			}
			
			// Increment bottom scroll count
			setBottomScrollCount(prev => prev + 1);
			
			// Enable infinite scroll after 3 scroll events at bottom
			if (bottomScrollCount >= 2 && !hasReachedBottom) {
				console.log('📱 User kept scrolling at bottom, enabling infinite scroll trigger');
				setHasReachedBottom(true);
			}
		} else {
			// Only reset if user scrolled significantly away from bottom
			if (isAtBottom && contentOffset.y < contentSize.height - layoutMeasurement.height - 300) {
				console.log('📱 User scrolled significantly away from bottom, starting smooth reset');
				setIsAtBottom(false);
				smoothResetFromBottom();
			}
		}
		
		return reachedBottom;
	};

	// Load more content for infinite scroll
	const loadMoreContent = async () => {
		if (isLoadingMore || !hasMoreContent) return;
		
		console.log(`🔄 Infinite scroll: loadMoreContent triggered (content: ${content.length}, hasMore: ${hasMoreContent})`);
		
		// Content length guard: don't load more if we already have plenty
		if (content.length > 120) { // Reduced from 150 to be more conservative
			console.log('📊 Content limit reached, stopping infinite scroll');
			setHasMoreContent(false);
			return;
		}
		
		// Enhanced debounce: prevent rapid successive calls (minimum 3 seconds between calls)
		const now = Date.now();
		if (now - lastLoadTime < 3000) { // Increased from 1500ms to 3000ms
			console.log('⏱️ Debounce: Too soon since last load, waiting...');
			return;
		}
		
		// Prevent multiple simultaneous calls
		if (isLoadingMore) {
			console.log('🚫 Already loading more content, skipping duplicate call');
			return;
		}
		
		// Set loading state immediately to prevent duplicate calls
		setIsLoadingMore(true);
		setLastLoadTime(now);
		
		// Reset bottom scroll count to allow for next trigger
		setBottomScrollCount(0);
		
		try {
			// Smart source selection for infinite scroll
			const currentContentCount = content.length;
			
			// Progressive batch sizing: start smaller and increase gradually
			const batchSize = Math.min(10 + Math.floor(currentContentCount / 40), 20); // Reduced from 15+ to 10+ and max from 25 to 20
			
			// Simple source selection - always include variety
			const sourcesToFetch: ('YouTube Shorts' | 'TripAdvisor' | 'Pixabay' | 'Pexels')[] = [
				'TripAdvisor', 'Pixabay', 'Pexels'
			];
			
			// Conditionally include YouTube based on current balance
			if (shouldIncludeYouTube() && currentContentCount < 80) { // Reduced from 100 to 80
				sourcesToFetch.unshift('YouTube Shorts');
			}
			
			console.log(`🔄 Infinite scroll: Fetching from ${sourcesToFetch.join(', ')} with batch size ${batchSize}`);
			
			const additionalContent = await contentService.fetchContent({
				sources: sourcesToFetch,
				maxResults: batchSize,
				refresh: true // Force refresh to get fresh content
			});
			
			console.log(`📥 Infinite scroll: Received ${additionalContent.length} items from API`);
			
			if (additionalContent.length > 0) {
				// Remove duplicates and filter by tab
				const deduplicatedContent = removeDuplicates(additionalContent, false);
				const filteredAdditionalContent = filterContentByTab(deduplicatedContent, activeTab);
				
				// Check if new content is too similar to existing content
				if (isContentTooSimilar(filteredAdditionalContent)) {
					console.log('🔄 Too many duplicates, trying to clear some old content and retry...');
					if (smartContentRotation()) {
						console.log('🔄 Cleared old content, will retry on next scroll');
						setHasMoreContent(true);
					} else {
						console.log('⚠️ Too many duplicates, stopping infinite scroll');
						setHasMoreContent(false);
					}
					return;
				}
				
				// Additional duplicate check to prevent same key errors
				const existingIds = new Set(content.map(item => item.id));
				const trulyUniqueContent = filteredAdditionalContent.filter(item => {
					// Check if ID already exists
					if (existingIds.has(item.id)) {
						console.warn(`⚠️ Duplicate ID detected: ${item.id}, skipping item`);
						return false;
					}
					// Additional safety: ensure ID is not empty or undefined
					if (!item.id || item.id.trim() === '') {
						console.warn(`⚠️ Empty ID detected, skipping item`);
						return false;
					}
					return true;
				});
				
				if (trulyUniqueContent.length > 0) {
					// Merge with existing content
					setContent(prevContent => {
						const merged = mergeContentSmartly(prevContent, trulyUniqueContent);
						// Return all merged content (no artificial limits)
						return merged;
					});
					
					console.log(`✅ Added ${trulyUniqueContent.length} new unique items`);
					
					// Check if we should continue loading more
					setHasMoreContent(additionalContent.length >= batchSize * 0.7); // More conservative threshold
				} else {
					console.log('⚠️ All new content was duplicate, but will continue infinite scroll');
					// Don't stop infinite scroll completely, just try to clear some old content
					if (smartContentRotation()) {
						console.log('🔄 Cleared old content, infinite scroll will continue');
						setHasMoreContent(true);
					} else {
						console.log('🔄 No content rotation needed, infinite scroll continues');
						setHasMoreContent(true);
					}
				}
				
				// Don't set content hash - let it fetch fresh content next time
				// setLastContentHash(contentHash); // Removed as per edit hint
			} else {
				setHasMoreContent(false);
			}
		} catch (error) {
			console.error('Error loading more content:', error);
			
			// Better error handling: don't stop infinite scroll on temporary errors
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
				console.log('⚠️ API quota/rate limit reached, stopping infinite scroll');
				setHasMoreContent(false);
			} else {
				console.log('🔄 Temporary error, will retry on next scroll');
				// Keep hasMoreContent true for retry
			}
		} finally {
			setIsLoadingMore(false);
		}
	};

	// Quota-aware content fetching strategy
	const getQuotaEfficientMaxResults = (refresh: boolean, activeTab: string): number => {
		// Different strategies based on context
		if (refresh) {
			// On refresh, be conservative with quota
			return 15; // Reduced from 20
		}
		
		// On initial load, fetch exactly what we display
		switch (activeTab) {
			case 'For you':
			case 'Popular':
				return 15; // Reduced from 20
			case 'New':
				return 15; // Reduced from 20
			case 'Near me':
			case 'Beach':
				return 15; // Reduced from 20
			default:
				return 15; // Reduced from 20
		}
	};

	// Get content statistics
	const getContentStats = () => {
		const totalSeen = seenContentIds.size;
		const currentDisplayed = content.length;
		const freshnessRate = totalSeen > 0 ? ((totalSeen - currentDisplayed) / totalSeen * 100).toFixed(1) : '0';
		return { totalSeen, currentDisplayed, freshnessRate };
	};

	// Quota usage estimation
	const estimateQuotaUsage = (maxResults: number): { youtube: number; tripadvisor: number; pixabay: number; pexels: number } => {
		// Distribute content more efficiently based on source capabilities
		const itemsPerSource = Math.ceil(maxResults / 4);
		return {
			youtube: Math.ceil(itemsPerSource * 1.2), // YouTube is most reliable
			tripadvisor: Math.ceil(itemsPerSource * 0.8), // TripAdvisor has good content
			pixabay: Math.ceil(itemsPerSource * 0.8),  // Pixabay has good content
			pexels: Math.ceil(itemsPerSource * 0.8)   // Pexels has good content
		};
	};

	// YouTube quota monitoring for infinite scroll
	const shouldIncludeYouTube = (): boolean => {
		const currentYouTubeCount = content.filter(item => item.source === 'YouTube Shorts').length;
		const totalContentCount = content.length;
		
		// Only include YouTube if:
		// 1. We have very few videos (< 8) - reduced from 10
		// 2. Or if videos are less than 20% of total content - reduced from 25%
		// 3. Or if it's a refresh request
		return currentYouTubeCount < 8 || (currentYouTubeCount / totalContentCount) < 0.20;
	};

	// Removed scroll position restoration to prevent infinite loops

	const openOptions = (item: ContentItem) => {
		setSelectedItem(item);
		setOptionsVisible(true);
	};

	const closeOptions = () => setOptionsVisible(false);

	const onShare = async () => {
		try {
			await RnShare.share({
				message: `Check this out: ${selectedItem?.title}`,
			});
		} catch (e) {}
		closeOptions();
	};

	const openDetailScreen = (item: ContentItem) => {
		(navigation as any).navigate('DetailScreen', { item });
	};

	// Remove duplicate content based on seen IDs
	const removeDuplicates = (content: ContentItem[], refresh: boolean): ContentItem[] => {
		

		if (refresh) {
			// On refresh, only add new content we haven't seen before
			const newContent = content.filter(item => !seenContentIds.has(item.id));
			
			// Track new content IDs
			if (newContent.length > 0) {
				const newIds = new Set(newContent.map(item => item.id));
				setSeenContentIds(prev => new Set([...prev, ...newIds]));
			}
			
			return newContent;
		} else {
			// On initial load, track all content IDs
			const newIds = new Set(content.map(item => item.id));
			setSeenContentIds(prev => new Set([...prev, ...newIds]));
			return content;
		}
	};

	// Smart content merging to maintain variety
	const mergeContentSmartly = (existingContent: ContentItem[], newContent: ContentItem[]): ContentItem[] => {
		if (newContent.length === 0) return existingContent;
		
		// Combine content and sort by engagement
		const combined = [...existingContent, ...newContent];
		
		// Enhanced duplicate removal: check ID, title similarity, and image URL
		const uniqueContent = combined.filter((item, index, self) => {
			const firstIndex = self.findIndex(t => {
				// Check exact ID match
				if (t.id === item.id) return true;
				
				// Check title similarity (fuzzy matching)
				const titleSimilarity = t.title.toLowerCase() === item.title.toLowerCase();
				if (titleSimilarity) return true;
				
				// Check image URL similarity
				if (t.imageUrl === item.imageUrl && t.imageUrl !== '') return true;
				
				return false;
			});
			return index === firstIndex;
		});
		
		// Enhanced sorting: prioritize new content and engagement
		const sortedContent = uniqueContent.sort((a, b) => {
			// Boost new content (first 15 items get priority)
			const aIsNew = newContent.some(item => item.id === a.id);
			const bIsNew = newContent.some(item => item.id === b.id);
			
			if (aIsNew && !bIsNew) return -1;
			if (!aIsNew && bIsNew) return 1;
			
			// Then sort by engagement score
			const aScore = (a.engagement.likes * 2) + a.engagement.comments + (a.engagement.views || 0);
			const bScore = (b.engagement.likes * 2) + b.engagement.comments + (b.engagement.views || 0);
			return bScore - aScore;
		});
		
		// Return all merged content (no artificial limits)
		return sortedContent;
	};

	// Filter content based on active tab
	const filterContentByTab = (content: ContentItem[], tab: string): ContentItem[] => {
		
		
		let filteredContent: ContentItem[] = [];
		
		switch (tab) {
			case 'For you':
				// Personal recommendations - mix of all sources with engagement-based sorting
				filteredContent = content.sort((a, b) => {
					const aScore = (a.engagement.likes * 2) + a.engagement.comments + (a.engagement.views || 0);
					const bScore = (b.engagement.likes * 2) + b.engagement.comments + (b.engagement.views || 0);
					return bScore - aScore;
				});
				
				break;
			
			case 'Popular':
				// High engagement content
				filteredContent = content
					.filter(item => (item.engagement.likes + item.engagement.comments) > 10)
					.sort((a, b) => {
						const aScore = a.engagement.likes + a.engagement.comments;
						const bScore = b.engagement.likes + b.engagement.comments;
						return bScore - aScore;
					});
				
				break;
			
			case 'New':
				// Recently published content
				filteredContent = content
					.filter(item => item.publishedAt)
					.sort((a, b) => {
						const dateA = new Date(a.publishedAt || 0);
						const dateB = new Date(b.publishedAt || 0);
						return dateB.getTime() - dateA.getTime();
					});
				
				break;
			
			case 'Near me':
				// Location-based content (TripAdvisor and Pixabay with Vietnam focus)
				filteredContent = content.filter(item => 
					item.source === 'TripAdvisor' || 
					item.source === 'Pixabay'
				);
				
				break;
			
			case 'Beach':
				// Beach and coastal content
				filteredContent = content.filter(item => {
					const beachKeywords = ['beach', 'coast', 'sea', 'ocean', 'island', 'phu quoc', 'nha trang', 'ha long', 'vung tau', 'con dao'];
					const title = item.title.toLowerCase();
					const description = (item.description || '').toLowerCase();
					return beachKeywords.some(keyword => 
						title.includes(keyword) || description.includes(keyword)
					);
				});
				
				break;
			
			default:
				filteredContent = content;
				
		}
		
		// Final safety check: ensure no duplicate IDs in filtered content
		const seenIds = new Set<string>();
		const uniqueFilteredContent = filteredContent.filter(item => {
			if (seenIds.has(item.id)) {
				console.warn(`⚠️ Duplicate ID in filtered content: ${item.id}, removing duplicate`);
				return false;
			}
			seenIds.add(item.id);
			return true;
		});
		
		// Return all filtered content (no artificial limits)
		return uniqueFilteredContent;
	};

	return (
		<View style={styles.container}>
			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={() => (navigation as any).navigate('UniversalSearch')}>
					<TextInput
						style={styles.searchInput}
						placeholder="Search for content, stay, tour and transport"
						placeholderTextColor="#9CA3AF"
						editable={false}
						pointerEvents="none"
					/>
					<View style={styles.searchButton}>
						<Search size={18} color="#FFFFFF" />
					</View>
				</TouchableOpacity>
			</View>

			{/* Main Navigation Tabs */}
			<View style={styles.tabsRow}>
				{tabs.map((tab) => (
					<TouchableOpacity 
						key={tab} 
						onPress={() => {
							setActiveTab(tab);
							if (tab !== activeTab) {
								clearSeenContent();
								setHasMoreContent(true);
							}
							setTimeout(() => fetchContent(), 100);
						}}
					>
						<Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Loading State */}
			{isLoading && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#8B5CF6" />
					<Text style={styles.loadingText}>Loading {activeTab.toLowerCase()} content...</Text>
				</View>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Masonry Grid */}
			{!isLoading && content.length > 0 && (
				<ScrollView 
					ref={scrollViewRef}
					showsVerticalScrollIndicator={false} 
					contentContainerStyle={{ paddingBottom: 40 }}
					refreshControl={
						<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
					}
					onScroll={({ nativeEvent }) => {
						const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
						const reachedBottom = checkIfReachedBottom(layoutMeasurement, contentOffset, contentSize);
						if (reachedBottom && isAtBottom && !isLoadingMore && hasMoreContent) {
							if (bottomScrollCount >= 2) {
								// showing animation only
							}
						}
						if (reachedBottom && hasReachedBottom && !isLoadingMore && hasMoreContent) {
							const now = Date.now();
							const timeSinceLastLoad = now - lastLoadTime;
							if (timeSinceLastLoad < 3000) return;
							setTimeout(() => {
								if (!isLoadingMore && hasMoreContent && hasReachedBottom) {
									const currentTime = Date.now();
									if (currentTime - lastLoadTime >= 3000) {
										loadMoreContent();
									}
								}
							}, 500);
						}
					}}
					scrollEventThrottle={32}
				>
					<View style={styles.masonryRow}>
						<View style={styles.column}>
							{content.filter((_, i) => i % 2 === 0).map((item, idx) => (
								<View key={`col0_${item.id}_${idx}`} style={styles.tile}>
									<TouchableOpacity onPress={() => openDetailScreen(item)}>
										<View style={[styles.card, idx % 2 === 0 ? styles.cardTall : styles.cardShort]}>
											<Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
											{item.playButton && (
												<View style={styles.playButtonOverlay}>
													<View style={styles.playButton}>
														<Play size={20} color="white" fill="white" />
													</View>
												</View>
											)}
											{item.duration && (
												<View style={styles.durationBadge}>
													<Text style={styles.durationText}>{item.duration}</Text>
												</View>
											)}
											<View style={styles.pill}>
												<View style={styles.pillItem}>
													<Heart size={12} color="#fff" />
													<Text style={styles.pillText}>{formatEngagement(item.engagement.likes)}</Text>
												</View>
												<View style={styles.pillItem}>
													<MessageCircle size={12} color="#fff" />
													<Text style={styles.pillText}>{formatEngagement(item.engagement.comments)}</Text>
												</View>
											</View>
										</View>
									</TouchableOpacity>
									<View style={styles.metaRow}>
										<Text style={styles.metaTitle} numberOfLines={1}>{item.metaTitle || item.title}</Text>
										<View style={styles.metaActions}>
											<TouchableOpacity 
												style={[styles.saveButton, savedContentIds.has(item.id) && styles.savedButton]} 
												onPress={() => handleSaveContent(item)}
											>
												<Heart 
													size={16} 
													color={savedContentIds.has(item.id) ? "#FF6B9D" : "#666"} 
													fill={savedContentIds.has(item.id) ? "#FF6B9D" : "none"} 
												/>
											</TouchableOpacity>
											<TouchableOpacity style={styles.optionsBtn} onPress={() => openOptions(item)}>
												<MoreHorizontal size={18} color="#111827" />
											</TouchableOpacity>
										</View>
									</View>
								</View>
							))}
						</View>
						<View style={styles.column}>
							{content.filter((_, i) => i % 2 !== 0).map((item, idx) => (
								<View key={`col1_${item.id}_${idx}`} style={styles.tile}>
									<TouchableOpacity onPress={() => openDetailScreen(item)}>
										<View style={[styles.card, idx % 2 === 1 ? styles.cardTall : styles.cardShort]}>
											<Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
											{item.playButton && (
												<View style={styles.playButtonOverlay}>
													<View style={styles.playButton}>
														<Play size={20} color="white" fill="white" />
													</View>
												</View>
											)}
											{item.duration && (
												<View style={styles.durationBadge}>
													<Text style={styles.durationText}>{item.duration}</Text>
												</View>
											)}
											<View style={styles.pill}>
												<View style={styles.pillItem}>
													<Heart size={12} color="#fff" />
													<Text style={styles.pillText}>{formatEngagement(item.engagement.likes)}</Text>
												</View>
												<View style={styles.pillItem}>
													<MessageCircle size={12} color="#fff" />
													<Text style={styles.pillText}>{formatEngagement(item.engagement.comments)}</Text>
												</View>
											</View>
										</View>
									</TouchableOpacity>
									<View style={styles.metaRow}>
										<Text style={styles.metaTitle} numberOfLines={1}>{item.metaTitle || item.title}</Text>
										<View style={styles.metaActions}>
											<TouchableOpacity 
												style={[styles.saveButton, savedContentIds.has(item.id) && styles.savedButton]} 
												onPress={() => handleSaveContent(item)}
											>
												<Heart 
													size={16} 
													color={savedContentIds.has(item.id) ? "#FF6B9D" : "#666"} 
													fill={savedContentIds.has(item.id) ? "#FF6B9D" : "none"} 
												/>
											</TouchableOpacity>
											<TouchableOpacity style={styles.optionsBtn} onPress={() => openOptions(item)}>
												<MoreHorizontal size={18} color="#111827" />
											</TouchableOpacity>
										</View>
									</View>
								</View>
							))}
						</View>
					</View>

					{/* Infinite Scroll Loading Indicator */}
					{isLoadingMore && (
						<View style={styles.loadingMoreContainer}>
							<View style={styles.loadingSpinner}>
								<ActivityIndicator size="large" color="#8B5CF6" />
							</View>
							<Text style={styles.loadingMoreText}>Loading more content...</Text>
						</View>
					)}

					{/* Bottom indicator with loading animation */}
					{!isLoadingMore && hasMoreContent && (
						<View style={styles.bottomIndicator}>
							{isAtBottom ? (
								<View style={styles.bottomProgressContainer}>
									{bottomScrollCount >= 2 ? (
										<View style={styles.bottomLoadingContainer}>
											<ActivityIndicator size="small" color="#8B5CF6" style={styles.bottomLoadingSpinner} />
											<Text style={styles.bottomLoadingText}>Keep scrolling to load more...</Text>
										</View>
									) : (
										<View style={styles.bottomProgressIndicator}>
											<View style={[styles.progressBar, { width: `${(bottomScrollCount / 2) * 100}%` }]} />
											<Text style={styles.bottomProgressText}>
												Scroll {bottomScrollCount}/2 times to load more
											</Text>
										</View>
									)}
								</View>
							) : (
								<Text style={styles.bottomIndicatorText}>
									{hasReachedBottom ? 'Scroll to load more' : 'Scroll to bottom to load more'}
								</Text>
							)}
						</View>
					)}

					{/* No more content indicator */}
					{!hasMoreContent && (
						<View style={styles.noMoreContentContainer}>
							<Text style={styles.noMoreContentText}>No more content available</Text>
						</View>
					)}
				</ScrollView>
			)}

			{/* Options Modal */}
			<Modal transparent visible={optionsVisible} animationType="fade" onRequestClose={closeOptions}>
				<Pressable style={styles.modalBackdrop} onPress={closeOptions} />
				<View style={styles.modalSheet}>
					<View style={styles.modalHandle} />
					<View style={styles.modalPreviewRow}>
						{selectedItem && (
							<Image source={{ uri: selectedItem.imageUrl }} style={styles.modalThumb} />
						)}
						<Text style={styles.modalTitle} numberOfLines={1}>{selectedItem?.title || 'Item'}</Text>
					</View>
					<TouchableOpacity style={styles.modalAction} onPress={onShare}>
						<Share2 size={18} color="#111827" />
						<Text style={styles.modalActionText}>Share</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.modalAction} onPress={closeOptions}>
						<PinIcon size={18} color="#111827" />
						<Text style={styles.modalActionText}>Pin</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.modalAction} onPress={closeOptions}>
						<UserPlus size={18} color="#111827" />
						<Text style={styles.modalActionText}>Follow</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.modalAction} onPress={closeOptions}>
						<Flag size={18} color="#DC2626" />
						<Text style={[styles.modalActionText, { color: '#DC2626' }]}>Report</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
};

const CARD_RADIUS = 24;
const GAP = 8;
const COLUMN_WIDTH = (width - 32 - GAP) / 2; // 16 padding on both sides, GAP between columns

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F3F4F6',
		paddingTop: 50,
		marginBottom: 100, // Add margin to avoid tab bar hiding content
	},
	tabsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	tabText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '600',
	},
	tabTextActive: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '800',
		backgroundColor: '#FF6B9D',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		overflow: 'hidden',
	},
	masonryRow: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		gap: GAP,
	},
	column: {
		flex: 1,
		gap: GAP,
	},
	tile: {
	},
	card: {
		borderRadius: CARD_RADIUS,
		overflow: 'hidden',
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
	},
	cardTall: {
		height: COLUMN_WIDTH * 1.3,
	},
	cardShort: {
		height: COLUMN_WIDTH * 0.9,
	},
	cardImage: {
		width: '100%',
		height: '100%',
	},
	pill: {
		position: 'absolute',
		bottom: 8,
		left: 8,
		right: 8,
		flexDirection: 'row',
		gap: 6,
	},
	pillItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: 'rgba(17, 24, 39, 0.55)',
	},
	pillText: {
		fontSize: 11,
		color: '#fff',
		fontWeight: '700',
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 4,
		marginTop: 6,
	},
	metaTitle: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
		color: '#111827',
		marginRight: 8,
	},
	metaActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	saveButton: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 6,
		borderRadius: 16,
		backgroundColor: '#f8f8f8',
	},
	savedButton: {
		backgroundColor: '#fff0f5',
	},
	optionsBtn: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 4,
	},
	modalBackdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.4)'
	},
	modalSheet: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 16,
	},
	modalHandle: {
		alignSelf: 'center',
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#E5E7EB',
		marginBottom: 8,
	},
	modalPreviewRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12,
	},
	modalThumb: {
		width: 42,
		height: 42,
		borderRadius: 8,
	},
	modalTitle: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	modalAction: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 14,
		borderTopWidth: 1,
		borderTopColor: '#F3F4F6',
	},
	modalActionText: {
		fontSize: 16,
		color: '#111827',
		fontWeight: '600',
	},
	
	// Loading and Error States
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 40,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#6B7280',
		fontWeight: '500',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
		paddingVertical: 40,
	},
	errorText: {
		fontSize: 16,
		color: '#DC2626',
		textAlign: 'center',
		marginBottom: 16,
		lineHeight: 24,
	},
	retryButton: {
		backgroundColor: '#8B5CF6',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	
	// Play Button and Duration Badge
	playButtonOverlay: {
		position: 'absolute',
		top: 12,
		right: 12,
		zIndex: 2,
	},
	playButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	durationBadge: {
		position: 'absolute',
		bottom: 12,
		right: 12,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		zIndex: 2,
	},
	durationText: {
		color: 'white',
		fontSize: 11,
		fontWeight: '700',
	},
	
	// Test Buttons (Development Only)
	testContainer: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	testButton: {
		backgroundColor: '#10B981',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	testButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	// Content summary styles
	contentSummary: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#F9FAFB',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	contentSummaryText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
		textAlign: 'center',
	},

	// Search styles
	searchContainer: {
		marginBottom: 16,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		paddingHorizontal: 6,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		elevation: 1,
		marginHorizontal: 'auto',
		width: '94%',
		height: 60,
	},
	searchInput: {
		flex: 1,
		marginLeft: 12,
		fontSize: 16,
		color: '#111827',
		fontWeight: '500',
	},
	clearButton: {
		padding: 4,
		borderRadius: 12,
		backgroundColor: '#F3F4F6',
	},
	searchButton: {
		backgroundColor: '#50C878',
		paddingHorizontal: 6,
		paddingVertical: 6,
		borderRadius: 36,
		marginRight: 8,
		marginLeft: 8,
	},
	searchButtonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '600',
	},
	searchFilters: {
		marginTop: 16,
		gap: 16,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
	},
	filterChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	filterChipActive: {
		backgroundColor: '#8B5CF6',
		borderColor: '#8B5CF6',
	},
	filterChipText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	filterChipTextActive: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	sortRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	sortLabel: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	sortChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	sortChipActive: {
		backgroundColor: '#8B5CF6',
		borderColor: '#8B5CF6',
	},
	sortChipText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	sortChipTextActive: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	searchSummary: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	searchSummaryLeft: {
		flex: 1,
		marginRight: 16,
	},
	searchLoading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	searchLoadingText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	searchSummaryText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	clearSearchButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
	},
	clearSearchText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	noResultsContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
		paddingVertical: 60,
	},
	noResultsTitle: {
		fontSize: 20,
		color: '#111827',
		fontWeight: '600',
		marginBottom: 8,
		textAlign: 'center',
	},
	noResultsText: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 24,
	},
	loadingMoreContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 20,
	},
	loadingSpinner: {
		marginBottom: 8,
	},
	loadingMoreText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	noMoreContentContainer: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	noMoreContentText: {
		fontSize: 14,
		color: '#9CA3AF',
		fontWeight: '500',
	},

  searchingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  bottomIndicator: {
		paddingVertical: 10,
		alignItems: 'center',
	},
	bottomIndicatorText: {
		fontSize: 12,
		color: '#9CA3AF',
		fontWeight: '500',
	},
	bottomLoadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	bottomLoadingSpinner: {
		marginBottom: 4,
	},
	bottomLoadingText: {
		fontSize: 12,
		color: '#6B7280',
		fontWeight: '500',
	},
	bottomProgressContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
	},
	bottomProgressIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: '#E5E7EB',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
		backgroundColor: '#8B5CF6',
	},
	bottomProgressText: {
		fontSize: 12,
		color: '#6B7280',
		fontWeight: '500',
	},
});

export default HomeScreen;