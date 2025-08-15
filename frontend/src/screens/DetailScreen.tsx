import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, MoreHorizontal, Play, ExternalLink } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import YouTubeIframe from 'react-native-youtube-iframe';
import { ContentItem } from '../types/content';
import { getYouTubeApiKey, checkYouTubeQuota } from '../config/apiConfig';
import { WebView } from 'react-native-webview';
import { useContentContext } from '../context/ContentContext';
import { contentService } from '../services/contentService';

const { width } = Dimensions.get('window');

// Define styles at the top to avoid undefined reference issues
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 50,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerRight: {
		flexDirection: 'row',
		gap: 12,
	},
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageContainer: {
		position: 'relative',
		width: '100%',
		padding: 5,
		// Dynamic height based on content type - will be overridden by inline styles
	},
	mainImage: {
		width: '100%',
		height: 'auto',
		aspectRatio: 1, // Start with square, will be overridden for natural ratios
		borderRadius: 16,
		resizeMode: 'cover',
	},
	videoContainer: {
		width: '100%',
		height: 228, // Fixed height for videos
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderRadius: 16,
		position: 'relative',
		// Ensure proper YouTube iframe rendering
		zIndex: 1,
	},
	content: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	title: {
		fontSize: 24,
		fontWeight: '800',
		color: '#111827',
		marginBottom: 12,
	},
	description: {
		fontSize: 16,
		color: '#6B7280',
		lineHeight: 24,
		marginBottom: 20,
	},
	sourceInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
		flexWrap: 'wrap',
	},
	sourceText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#8B5CF6',
	},

	channelText: {
		fontSize: 14,
		color: '#6B7280',
	},
	contentActions: {
		flexDirection: 'row',
		gap: 12,
		alignItems: 'center',
	},
	exploreButton: {
		backgroundColor: '#F3F4F6',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 24,
		alignSelf: 'flex-start',
	},
	planButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	externalButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	externalButtonText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6B7280',
	},
	// Description container and show more/less
	descriptionContainer: {
		marginBottom: 20,
	},
	descriptionText: {
		fontSize: 16,
		color: '#6B7280',
		lineHeight: 24,
	},
	showMoreButton: {
		marginTop: 8,
		alignSelf: 'flex-start',
	},
	showMoreText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#8B5CF6',
	},
	// Error Handling
	errorContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 100,
	},
	errorText: {
		color: '#fff',
		fontSize: 18,
		textAlign: 'center',
		padding: 20,
	},
	retryButton: {
		backgroundColor: '#10B981',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginTop: 16,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	// Fallback for when API is unavailable
	fallbackContainer: {
		width: '100%',
		height: '100%',
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		borderRadius: 16,
	},
	fallbackThumbnail: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
		opacity: 0.7,
		borderRadius: 16,
	},
	fallbackPlayButton: {
		position: 'absolute',
		width: 80,
		height: 80,
		backgroundColor: 'rgba(255, 0, 0, 0.9)',
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	fallbackText: {
		color: '#fff',
		fontSize: 12,
		textAlign: 'center',
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
	},

	infoBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: '#F3F4F6',
		borderRadius: 12,
		marginRight: 8,
	},
	infoBadgeText: {
		color: '#6B7280',
		fontSize: 12,
		fontWeight: '500',
	},
	// Image overlay styles
	imageOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	imageOverlayText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '500',
		marginTop: 8,
		textAlign: 'center',
	},
	// Responsive image container
	responsiveImageContainer: {
		width: '100%',
		overflow: 'hidden',
		borderRadius: 16,
		// Allow natural image sizing
		alignSelf: 'flex-start',
	},
	// Related Content Section Styles
	relatedContentSection: {
		marginTop: 20,
		paddingHorizontal: 0, // Reduced from 16 to 8
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
		paddingHorizontal: 6, // Added padding to header
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
	},
	enhanceButton: {
		backgroundColor: '#F3F4F6',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	enhanceButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#8B5CF6',
	},

	// Masonry Grid Styles
	masonryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
		paddingHorizontal: 4, // Reduced from default to 4
	},
	column: {
		flex: 1,
		paddingHorizontal: 2,
		marginHorizontal: 2, // Reduced from 4 to 2
		gap: 6, // Reduced gap between items
	},
	tile: {
		marginBottom: 8, // Reduced from 12 to 8
	},
	card: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
		position: 'relative',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3, // Android shadow
	},
	cardTall: {
		height: 200, // Reduced from 228 to 200
	},
	cardShort: {
		height: 130, // Reduced from 150 to 130
	},
	cardImage: {
		width: '100%',
		height: '100%',
		borderRadius: 16,
	},
	playButtonOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	playButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	durationBadge: {
		position: 'absolute',
		top: 8,
		right: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	pill: {
		position: 'absolute',
		bottom: 8,
		left: 8,
		flexDirection: 'row',
		gap: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	pillItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	pillText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '500',
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	metaTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
		flex: 1,
	},
	sourceBadge: {
		backgroundColor: '#F3F4F6',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	sourceBadgeText: {
		fontSize: 11,
		color: '#6B7280',
		fontWeight: '500',
	},
	durationText: {
		color: 'white',
		fontSize: 11,
		fontWeight: '700',
	},
	loadMoreButton: {
		backgroundColor: '#8B5CF6',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 24,
		alignSelf: 'center',
		marginTop: 16,
	},
	loadMoreButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

const DetailScreen: React.FC = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { item } = route.params as { item: ContentItem };
	const { getRelatedContent, contentPool, addToContentPool } = useContentContext();
	
	// Related content state
	const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
	const [isLoadingRelated, setIsLoadingRelated] = useState(false);
	const [hasMoreRelated, setHasMoreRelated] = useState(true);
	const [relatedContentPage, setRelatedContentPage] = useState(1);
	
	const [videoId, setVideoId] = useState<string | null>(null);
	const [videoError, setVideoError] = useState<string | null>(null);
	const [apiAvailable, setApiAvailable] = useState<boolean>(true);
	const [isCheckingApi, setIsCheckingApi] = useState<boolean>(false);
	const [descriptionExpanded, setDescriptionExpanded] = useState<boolean>(false);
	const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);

	// Extract YouTube video ID from URL or content
	React.useEffect(() => {
		if (item.originalUrl && item.source === 'YouTube Shorts') {
			
			
			// Try multiple YouTube URL formats
			let videoId = null;
			
			// Format 1: youtube.com/shorts/VIDEO_ID
			const shortsMatch = item.originalUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
			if (shortsMatch) {
				videoId = shortsMatch[1];
				
			}
			// Format 2: youtube.com/watch?v=VIDEO_ID
			else if (item.originalUrl.includes('youtube.com/watch?v=')) {
				const watchMatch = item.originalUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
				if (watchMatch) {
					videoId = watchMatch[1];
					
				}
			}
			// Format 3: youtube.com/VIDEO_ID (direct)
			else if (item.originalUrl.includes('youtube.com/') && item.originalUrl.length > 20) {
				const urlParts = item.originalUrl.split('/');
				const lastPart = urlParts[urlParts.length - 1];
				if (lastPart && lastPart.length >= 10 && !lastPart.includes('=')) {
					videoId = lastPart;
					
				}
			}
			
			if (videoId) {
				
				setVideoId(videoId);
				setIsVideoLoading(true); // Set loading state when video ID changes
			} else {
				
			}
		}
	}, [item]);

	// Check API availability
	const checkApiAvailability = async () => {
		if (!videoId) return;
		
		setIsCheckingApi(true);
		try {
			const quotaInfo = await checkYouTubeQuota();
			if (quotaInfo && quotaInfo.remaining === 0) {
				setApiAvailable(false);
				setVideoError('YouTube API quota exceeded. Please try again tomorrow.');
			} else {
				setApiAvailable(true);
				setVideoError(null);
			}
		} catch (error) {
			console.error('Error checking API:', error);
			setApiAvailable(false);
		} finally {
			setIsCheckingApi(false);
		}
	};

	// Check if description needs truncation
	const needsTruncation = (text: string | undefined, maxLength: number = 150) => {
		return text && text.length > maxLength;
	};

	// Get truncated description
	const getTruncatedDescription = (text: string | undefined, maxLength: number = 150) => {
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength).trim() + '...';
	};

	// Get the description to display
	const getDisplayDescription = () => {
		const description = item.description || 'Hello Folks 👋 Presenting a new travel destination concept. Discover amazing places and create unforgettable memories.';
		const result = descriptionExpanded ? description : getTruncatedDescription(description);
		// Ensure we always return a string
		return result || 'No description available';
	};

	// Check if content is from TripAdvisor, Pixabay, or Pexels
	const isImageContent = () => {
		return item.source === 'TripAdvisor' || item.source === 'Pixabay' || item.source === 'Pexels';
	};

	// Get source-specific color for badges
	const getSourceColor = (source: string) => {
		switch (source) {
			case 'YouTube Shorts':
				return '#FF0000'; // YouTube red
			case 'TripAdvisor':
				return '#00AA6C'; // TripAdvisor green
			case 'Pixabay':
				return '#4CAF50'; // Pixabay green
			case 'Pexels':
				return '#05A081'; // Pexels teal
			default:
				return '#8B5CF6'; // Default purple
		}
	};

	// Handle image content display with natural sizing
	const renderImageContent = () => {
		// Add error handling for image content
		if (!item.imageUrl) {
			console.error(`❌ ${item.source} image URL is undefined:`, item);
			return (
				<View style={[styles.responsiveImageContainer, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
					<Text style={{ color: '#6b7280', fontSize: 16 }}>Image not available</Text>
				</View>
			);
		}

		return (
			<View style={styles.responsiveImageContainer}>
				<Image 
					source={{ uri: item.imageUrl }} 
					style={styles.mainImage} 
					resizeMode="cover"
					onError={(error) => {
						console.error(`❌ ${item.source} image loading error:`, error.nativeEvent, 'URL:', item.imageUrl);
					}}
					onLoad={() => {
						console.log(`✅ ${item.source} image loaded successfully:`, item.imageUrl);
					}}
				/>
			</View>
		);
	};

	// Load related content using intelligent similarity matching
	const loadRelatedContent = useCallback(async (enhance: boolean = false) => {
		try {
			setIsLoadingRelated(true);
			
			// Phase 1: Get cached related content (0 API calls)
			const cachedRelated = getRelatedContent(item, 6);
			
			if (cachedRelated.length >= 6 && !enhance) {
				// Use cache if we have enough content
				setRelatedContent(cachedRelated);
				setHasMoreRelated(cachedRelated.length >= 6);
				console.log(`✅ Related content loaded from cache: ${cachedRelated.length} items`);
				return;
			}
			
			// Phase 2: Smart content enhancement (minimal API calls only if needed)
			if (enhance && cachedRelated.length < 6) {
				console.log(`🔄 Enhancing related content with smart API calls...`);
				
				// Only fetch from the same source to minimize API calls
				const sourceToFetch = item.source === 'YouTube Shorts' ? 'YouTube Shorts' : 
									item.source === 'TripAdvisor' ? 'TripAdvisor' :
									item.source === 'Pixabay' ? 'Pixabay' : 'Pexels';
				
				try {
					const additionalContent = await contentService.fetchContent({
						sources: [sourceToFetch],
						maxResults: 10,
						refresh: false
					});
					
					if (additionalContent.length > 0) {
						// Add to content pool for future use
						addToContentPool(additionalContent);
						
						// Combine cached and new content
						const enhancedContent = [...cachedRelated, ...additionalContent]
							.filter(relatedItem => relatedItem.id !== item.id)
							.slice(0, 6);
						
						setRelatedContent(enhancedContent);
						setHasMoreRelated(enhancedContent.length >= 6);
						
						console.log(`✅ Enhanced related content: ${enhancedContent.length} items (${additionalContent.length} new)`);
					} else {
						setRelatedContent(cachedRelated);
						setHasMoreRelated(false);
					}
				} catch (error) {
					console.warn('⚠️ Failed to enhance related content, using cache:', error);
					setRelatedContent(cachedRelated);
					setHasMoreRelated(false);
				}
			} else {
				// Use cached content
				setRelatedContent(cachedRelated);
				setHasMoreRelated(cachedRelated.length >= 6);
			}
			
		} catch (error) {
			console.error('Error loading related content:', error);
			setRelatedContent([]);
			setHasMoreRelated(false);
		} finally {
			setIsLoadingRelated(false);
		}
	}, [item, getRelatedContent, addToContentPool]);

	// Load more related content
	const loadMoreRelatedContent = useCallback(async () => {
		if (isLoadingRelated || !hasMoreRelated) return;
		
		setIsLoadingRelated(true);
		try {
			// Get more related content from cache
			const moreContent = getRelatedContent(item, (relatedContentPage + 1) * 6);
			
			if (moreContent.length > relatedContent.length) {
				setRelatedContent(moreContent);
				setRelatedContentPage(prev => prev + 1);
				setHasMoreRelated(moreContent.length >= (relatedContentPage + 1) * 6);
			} else {
				setHasMoreRelated(false);
			}
		} catch (error) {
			console.error('Error loading more related content:', error);
			setHasMoreRelated(false);
		} finally {
			setIsLoadingRelated(false);
		}
	}, [isLoadingRelated, hasMoreRelated, relatedContentPage, relatedContent.length, item, getRelatedContent]);



	// Format engagement numbers (e.g., 1.2K -> 1.2K, 1K -> 1K)
	const formatEngagement = (value: number | undefined) => {
		if (value === undefined || value === null) return '0';
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toString();
	};

	React.useEffect(() => {
		if (videoId) {
			checkApiAvailability();
		}
	}, [videoId]);

	// Load related content on mount
	React.useEffect(() => {
		loadRelatedContent(false); // Start with Phase 1 (cache-based)
	}, [item.id]);

	// Load related content when item changes
	React.useEffect(() => {
		if (item.id) {
			setRelatedContentPage(1);
			loadRelatedContent(false);
		}
	}, [item.id, loadRelatedContent]);

	const handleVideoError = (error: any) => {
		console.error('❌ YouTube iframe error:', error);
		setVideoError('This video cannot be played. It may be restricted or unavailable.');
	};

	const handleVideoReady = () => {
		
		setVideoError(null);
		setIsVideoLoading(false);
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="#000" />
				</TouchableOpacity>
				<View style={styles.headerRight}>
					<TouchableOpacity style={styles.headerButton}>
						<Share2 size={20} color="#000" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerButton}>
						<MoreHorizontal size={20} color="#000" />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Main Content - Image or Video */}
				<View style={styles.imageContainer}>
					{videoId && item.source === 'YouTube Shorts' ? (
						/* YouTube Video Player */
						<View style={styles.videoContainer}>

							{!apiAvailable ? (
								/* Fallback when API is unavailable */
								<TouchableOpacity 
									style={styles.fallbackContainer}
									onPress={() => {
										if (item.originalUrl) {
											Alert.alert(
												'Open in YouTube',
												'This will open the video in the YouTube app or browser',
												[
													{ text: 'Cancel', style: 'cancel' },
													{ text: 'Open', onPress: () => {
														// You can use Linking.openURL here if you import Linking
														console.log('Opening:', item.originalUrl);
													}}
												]
											);
										}
									}}
								>
									<Image 
										source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Video+Unavailable' }} 
										style={styles.fallbackThumbnail} 
									/>
									<View style={styles.fallbackPlayButton}>
										<Play size={40} color="#fff" fill="#fff" />
									</View>
									<View>
										<Text style={styles.fallbackText}>YouTube API unavailable</Text>
										<Text style={styles.fallbackText}>Tap to open in YouTube app</Text>
									</View>
								</TouchableOpacity>
							) : videoError ? (
								<View style={styles.errorContainer}>
									<Text style={styles.errorText}>{videoError}</Text>
									<TouchableOpacity style={styles.retryButton} onPress={checkApiAvailability}>
										<Text style={styles.retryButtonText}>Retry</Text>
									</TouchableOpacity>
								</View>
							) : (
								<YouTubeIframe
									height={228}
									width={Math.round(width)}
									videoId={videoId}
									play={false}
									onReady={handleVideoReady}
									onError={handleVideoError}
									initialPlayerParams={{
										controls: true,
										modestbranding: true,
										rel: 0,
										showinfo: 0,
										playsinline: 1
									}}
									webViewProps={{
										androidLayerType: 'hardware',
										androidHardwareAccelerationDisabled: false,
									}}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										width: '100%',
										height: '100%',
										zIndex: 2,
									}}
								/>
							)}
						</View>
					) : isImageContent() ? (
						/* Image Content Display with Pinterest-style responsive sizing */
						<TouchableOpacity 
							onPress={() => {
								if (item.originalUrl) {
									Alert.alert(
										`Open in ${item.source}`,
										`This will open the content in the ${item.source} app or browser`,
										[
											{ text: 'Cancel', style: 'cancel' },
											{ text: 'Open', onPress: () => {
												console.log(`Opening ${item.source}:`, item.originalUrl);
											}}
										]
									);
								}
							}}
						>
							{renderImageContent()}
						</TouchableOpacity>
					) : (
						/* Default Image Display with natural sizing */
						<View style={styles.responsiveImageContainer}>
							<Image 
								source={{ uri: item.imageUrl }} 
								style={styles.mainImage}
								resizeMode="cover"
								onError={(error) => {
									console.error('❌ Default image loading error:', error.nativeEvent, 'URL:', item.imageUrl);
								}}
								onLoad={() => {
									console.log('✅ Default image loaded successfully:', item.imageUrl);
								}}
							/>
						</View>
					)}
				</View>

				{/* Content */}
				<View style={styles.content}>
					<Text style={styles.title}>{item.title}</Text>
					
					{/* Source and Duration Info with Enhanced Badges */}
					<View style={styles.sourceInfo}>
						<View style={[styles.sourceBadge, { backgroundColor: getSourceColor(item.source) }]}>
							<Text style={styles.sourceBadgeText}>{item.source}</Text>
						</View>
						{item.duration && item.duration.trim() !== '' && (
							<View style={styles.infoBadge}>
								<Text style={styles.infoBadgeText}>⏱️ {item.duration}</Text>
							</View>
						)}
						{item.channelTitle && item.channelTitle.trim() !== '' && (
							<View style={styles.infoBadge}>
								<Text style={styles.infoBadgeText}>👤 {item.channelTitle}</Text>
							</View>
						)}
						{isImageContent() && item.engagement && item.engagement.shares !== undefined && item.engagement.shares > 0 && (
							<View style={styles.infoBadge}>
								<Text style={styles.infoBadgeText}>📤 {item.engagement.shares} shares</Text>
							</View>
						)}
					</View>
					
					<View style={styles.descriptionContainer}>
						<Text style={styles.descriptionText}>
							{getDisplayDescription()}
						</Text>
						{needsTruncation(item.description) && (
							<TouchableOpacity 
								style={styles.showMoreButton}
								onPress={() => setDescriptionExpanded(!descriptionExpanded)}
							>
								<Text style={styles.showMoreText}>
									{descriptionExpanded ? 'Show Less' : 'Show More'}
								</Text>
							</TouchableOpacity>
						)}
					</View>
					
					{/* Action Buttons */}
					<View style={styles.contentActions}>
						<TouchableOpacity style={styles.exploreButton}>
							<Text style={styles.planButtonText}>Plan Your Trip</Text>
						</TouchableOpacity>
						
						{item.originalUrl && (
							<TouchableOpacity 
								style={styles.externalButton}
								onPress={() => {
									const platform = isImageContent() ? item.source : 'YouTube';
									Alert.alert(`Open in ${platform}`, `This will open the content in the ${platform} app or browser`);
								}}
							>
								<ExternalLink size={16} color="#6B7280" />
								<Text style={styles.externalButtonText}>
									{isImageContent() ? `Open in ${item.source}` : 'View Original'}
								</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Related Content Section */}
					{relatedContent.length > 0 && (
						<View style={styles.relatedContentSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Related Content</Text>
								{relatedContent.length < 6 && hasMoreRelated && (
									<TouchableOpacity 
										style={styles.enhanceButton}
										onPress={() => loadRelatedContent(true)}
										disabled={isLoadingRelated}
									>
										<Text style={styles.enhanceButtonText}>
											{isLoadingRelated ? 'Loading...' : 'Show More'}
										</Text>
									</TouchableOpacity>
								)}
							</View>
							
							{/* Pinterest-style Grid Layout */}
							<View style={styles.masonryRow}>
								{/* Left Column */}
								<View style={styles.column}>
									{relatedContent.filter((_, index) => index % 2 === 0).map((relatedItem, index) => (
										<View key={`related_${relatedItem.id}_${index}`} style={styles.tile}>
											<TouchableOpacity onPress={() => {
												(navigation as any).navigate('DetailScreen', { item: relatedItem });
											}}>
												<View style={[styles.card, index % 2 === 0 ? styles.cardTall : styles.cardShort]}>
													<Image 
														source={{ uri: relatedItem.imageUrl }} 
														style={styles.cardImage} 
														resizeMode="cover" 
													/>
													
													{/* Play Button for Shorts */}
													{relatedItem.playButton && (
														<View style={styles.playButtonOverlay}>
															<View style={styles.playButton}>
																<Play size={20} color="white" fill="white" />
															</View>
														</View>
													)}
													
													{/* Duration Badge */}
													{relatedItem.duration && (
														<View style={styles.durationBadge}>
															<Text style={styles.durationText}>{relatedItem.duration}</Text>
														</View>
													)}
													
													<View style={styles.pill}>
														<View style={styles.pillItem}>
															<Heart size={12} color="#fff" />
															<Text style={styles.pillText}>{formatEngagement(relatedItem.engagement.likes)}</Text>
														</View>
														<View style={styles.pillItem}>
															<MessageCircle size={12} color="#fff" />
															<Text style={styles.pillText}>{formatEngagement(relatedItem.engagement.comments)}</Text>
														</View>
													</View>
												</View>
											</TouchableOpacity>
											<View style={styles.metaRow}>
												<Text style={styles.metaTitle} numberOfLines={1}>
													{relatedItem.metaTitle || relatedItem.title}
												</Text>
												<View style={styles.sourceBadge}>
													<Text style={styles.sourceBadgeText}>
														{relatedItem.source}
													</Text>
												</View>
											</View>
										</View>
									))}
								</View>
								
								{/* Right Column */}
								<View style={styles.column}>
									{relatedContent.filter((_, index) => index % 2 === 1).map((relatedItem, index) => (
										<View key={`related_${relatedItem.id}_${index}`} style={styles.tile}>
											<TouchableOpacity onPress={() => {
												(navigation as any).navigate('DetailScreen', { item: relatedItem });
											}}>
												<View style={[styles.card, index % 2 === 1 ? styles.cardTall : styles.cardShort]}>
													<Image 
														source={{ uri: relatedItem.imageUrl }} 
														style={styles.cardImage} 
														resizeMode="cover" 
													/>
													
													{/* Play Button for Shorts */}
													{relatedItem.playButton && (
														<View style={styles.playButtonOverlay}>
															<View style={styles.playButton}>
																<Play size={20} color="white" fill="white" />
															</View>
														</View>
													)}
													
													{/* Duration Badge */}
													{relatedItem.duration && (
														<View style={styles.durationBadge}>
															<Text style={styles.durationText}>{relatedItem.duration}</Text>
														</View>
													)}
													
													<View style={styles.pill}>
														<View style={styles.pillItem}>
															<Heart size={12} color="#fff" />
															<Text style={styles.pillText}>{formatEngagement(relatedItem.engagement.likes)}</Text>
														</View>
														<View style={styles.pillItem}>
															<MessageCircle size={12} color="#fff" />
															<Text style={styles.pillText}>{formatEngagement(relatedItem.engagement.comments)}</Text>
														</View>
													</View>
												</View>
											</TouchableOpacity>
											<View style={styles.metaRow}>
												<Text style={styles.metaTitle} numberOfLines={1}>
													{relatedItem.metaTitle || relatedItem.title}
												</Text>
												<View style={styles.sourceBadge}>
													<Text style={styles.sourceBadgeText}>
														{relatedItem.source}
													</Text>
												</View>
											</View>
										</View>
								 ))}
								</View>
							</View>
							
							{/* Load More Button */}
							{hasMoreRelated && (
								<TouchableOpacity 
									style={styles.loadMoreButton}
									onPress={loadMoreRelatedContent}
									disabled={isLoadingRelated}
								>
									{isLoadingRelated ? (
										<ActivityIndicator size="small" color="#fff" />
									) : (
										<Text style={styles.loadMoreButtonText}>Load More Related Content</Text>
									)}
								</TouchableOpacity>
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default DetailScreen;
