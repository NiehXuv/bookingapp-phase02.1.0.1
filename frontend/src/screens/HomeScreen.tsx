import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Bell, Percent, Stamp, Play, Gift, Grid3x3 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
	const navigation = useNavigation();
	const { user } = useAuth();
	const [activeQuickAction, setActiveQuickAction] = useState('Hotel');
	const [bannerIndex, setBannerIndex] = useState(0);

	// Mock data for banners
	const banners = [
		{
			id: '1',
			title: 'VIETNAM CULTURAL INDUSTRIES SHOW 2024',
			subtitle: 'July 11th - 13th, 2024',
			location: 'WORLD TRADE CENTER',
			image: require('../../assets/hanoi.jpg'),
		},
		{
			id: '2',
			title: 'Explore Amazing Destinations',
			subtitle: 'Discover Vietnam',
			location: 'Multiple Locations',
			image: require('../../assets/hoian.jpg'),
		},
	];

	// Mock trending destinations
	const trendingDestinations = [
		{ id: '1', name: 'Ha Giang', image: require('../../assets/sapa.jpg'), description: 'Village with cherry blossoms' },
		{ id: '2', name: 'Hoi An', image: require('../../assets/hoian.jpg'), description: 'Lanterns on water' },
		{ id: '3', name: 'Nha Trang', image: require('../../assets/nhatrang.jpg'), description: 'Coastal city' },
		{ id: '4', name: 'Sapa', image: require('../../assets/sapa.jpg'), description: 'Mountain terraces' },
	];

	// Mock featured hotels
	const featuredHotels = [
		{ id: '1', name: 'Luxury Resort', image: require('../../assets/himalaya_hotel.jpg'), rating: 4.8 },
		{ id: '2', name: 'Beach Hotel', image: require('../../assets/sunset_hotel.jpg'), rating: 4.6 },
		{ id: '3', name: 'City Center', image: require('../../assets/hanoi.jpg'), rating: 4.7 },
	];

	const username = user?.username?.toUpperCase() || 'GUEST';

	return (
		<ImageBackground 
			source={require('../../assets/background.png')} 
			style={styles.backgroundImage}
			resizeMode="cover"
		>
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Text style={styles.greeting}>HELLO, {username}!</Text>
					<Text style={styles.subGreeting}>Let's find your perfect stay</Text>
				</View>
				<View style={styles.headerRight}>
					<TouchableOpacity style={styles.notificationButton}>
						<Bell size={24} color="#50C878" />
					</TouchableOpacity>
					<TouchableOpacity 
						style={styles.profileButton}
						onPress={() => (navigation as any).navigate('Profile')}
					>
						<Image 
							source={require('../../assets/profile.jpg')} 
							style={styles.profileImage}
							resizeMode="cover"
						/>
					</TouchableOpacity>
				</View>
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<TouchableOpacity 
					style={styles.searchBar} 
					activeOpacity={0.9} 
					onPress={() => (navigation as any).navigate('UniversalSearch')}
				>
					<Search size={20} color="#9CA3AF" style={styles.searchIcon} />
					<Text style={styles.searchPlaceholder}>Find your destination</Text>
					<View style={styles.searchButton}>
						<Search size={18} color="#FFFFFF" />
					</View>
				</TouchableOpacity>
			</View>


			{/* Promotional Banner Carousel */}
			<View style={styles.bannerContainer}>
				<ScrollView
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onScroll={(event) => {
						const index = Math.round(event.nativeEvent.contentOffset.x / width);
						setBannerIndex(index);
					}}
					scrollEventThrottle={16}
				>
					{banners.map((banner) => (
						<View key={banner.id} style={styles.bannerSlide}>
							<Image 
								source={banner.image} 
								style={styles.bannerImage}
								resizeMode="cover"
							/>
							<View style={styles.bannerOverlay}>
								<View style={styles.bannerContent}>
									<Text style={styles.bannerTitle}>{banner.title}</Text>
									<Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
									<Text style={styles.bannerLocation}>{banner.location}</Text>
								</View>
							</View>
						</View>
					))}
				</ScrollView>
				<View style={styles.bannerDots}>
					{banners.map((_, index) => (
						<View
							key={index}
							style={[
								styles.bannerDot,
								bannerIndex === index && styles.bannerDotActive
							]}
						/>
					))}
				</View>
			</View>

			{/* Hub Cards */}
			<View style={styles.hubCardsContainer}>
			<TouchableOpacity 
				style={styles.hubCard}
				activeOpacity={0.8}
				onPress={() => (navigation as any).navigate('FeedScreen')}
			>
				<View style={[styles.hubIconContainer, { backgroundColor: '#50C878' }]}>
					<Grid3x3 size={24} color="#FFFFFF" />
				</View>
				<Text style={styles.hubCardTitle}>New Feed</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={styles.hubCard}
				activeOpacity={0.8}
				onPress={() => (navigation as any).navigate('StampCollectionScreen')}
			>
				<View style={[styles.hubIconContainer, { backgroundColor: '#FF6B9D' }]}>
					<Stamp size={24} color="#FFFFFF" />
				</View>
				<Text style={styles.hubCardTitle}>Stamp Collection</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={styles.hubCard}
				activeOpacity={0.8}
				onPress={() => (navigation as any).navigate('ContentScreen')}
			>
				<View style={[styles.hubIconContainer, { backgroundColor: '#50C878' }]}>
					<Play size={24} color="#FFFFFF" />
				</View>
				<Text style={styles.hubCardTitle}>Content Hub</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={styles.hubCard}
				activeOpacity={0.8}
				onPress={() => (navigation as any).navigate('RewardHub')}
			>
				<View style={[styles.hubIconContainer, { backgroundColor: '#FF6B9D' }]}>
					<Gift size={24} color="#FFFFFF" />
				</View>
				<Text style={styles.hubCardTitle}>Reward Hub</Text>
			</TouchableOpacity>
			</View>

			{/* Trending Destinations */}
			<View style={styles.sectionContainer}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Trending Destinations</Text>
					<TouchableOpacity>
						<Text style={styles.seeMoreText}>See more</Text>
					</TouchableOpacity>
				</View>
				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.horizontalScrollContent}
				>
					{trendingDestinations.map((destination) => (
						<TouchableOpacity 
							key={destination.id} 
							style={styles.destinationCard}
							activeOpacity={0.9}
						>
							<Image 
								source={destination.image} 
								style={styles.destinationImage}
								resizeMode="cover"
							/>
							<View style={styles.destinationOverlay}>
								<Text style={styles.destinationName}>{destination.name}</Text>
								<Text style={styles.destinationDescription}>{destination.description}</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Featured Hotels */}
			<View style={styles.sectionContainer}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Featured Hotels</Text>
					<TouchableOpacity>
						<Text style={styles.seeMoreText}>See more</Text>
					</TouchableOpacity>
				</View>
				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.horizontalScrollContent}
				>
					{featuredHotels.map((hotel) => (
						<TouchableOpacity 
							key={hotel.id} 
							style={styles.hotelCard}
							activeOpacity={0.9}
							onPress={() => (navigation as any).navigate('SearchHotelResult', { city: hotel.name })}
						>
							<Image 
								source={hotel.image} 
								style={styles.hotelImage}
								resizeMode="cover"
							/>
							<View style={styles.hotelInfo}>
								<Text style={styles.hotelName}>{hotel.name}</Text>
								<Text style={styles.hotelRating}>⭐ {hotel.rating}</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

				<View style={{ height: 100 }} />
			</ScrollView>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	backgroundImage: {
		flex: 1,
		width: '100%',
		height: '100%',
	},
	container: {
		flex: 1,
		paddingTop: 50,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	headerLeft: {
		flex: 1,
	},
	greeting: {
		fontSize: 20,
		fontWeight: '700',
		color: '#50C878',
		marginBottom: 4,
	},
	subGreeting: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	notificationButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#50C878',
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	searchContainer: {
		marginBottom: 20,
		paddingHorizontal: 16,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 3,
		elevation: 1,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchPlaceholder: {
		flex: 1,
		fontSize: 16,
		color: '#9CA3AF',
		fontWeight: '500',
	},
	searchButton: {
		backgroundColor: '#50C878',
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
	quickActionsContainer: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		marginBottom: 20,
		gap: 12,
	},
	quickActionButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	quickActionButtonActive: {
		backgroundColor: '#50C878',
		borderColor: '#50C878',
	},
	quickActionText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6B7280',
	},
	quickActionTextActive: {
		color: '#FFFFFF',
	},
	bannerContainer: {
		marginBottom: 20,
		position: 'relative',
	},
	bannerSlide: {
		width: width - 32,
		height: 180,
		marginHorizontal: 16,
		borderRadius: 20,
		overflow: 'hidden',
	},
	bannerImage: {
		width: '100%',
		height: '100%',
	},
	bannerOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'flex-end',
		padding: 16,
	},
	bannerContent: {
		alignItems: 'flex-start',
	},
	bannerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	bannerSubtitle: {
		fontSize: 14,
		color: '#FFFFFF',
		marginBottom: 2,
		opacity: 0.9,
	},
	bannerLocation: {
		fontSize: 12,
		color: '#FFFFFF',
		opacity: 0.8,
	},
	bannerDots: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 12,
		gap: 8,
	},
	bannerDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#E5E7EB',
	},
	bannerDotActive: {
		backgroundColor: '#50C878',
		width: 24,
	},
	hubCardsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingHorizontal: 16,
		marginBottom: 20,
		gap: 10,
		justifyContent: 'space-between',
	},
	hubCard: {
		width: '48%',
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		padding: 12,
		borderWidth: 1,
		borderColor: '#F0F0F0',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hubIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	hubCardTitle: {
		fontSize: 12,
		fontWeight: '600',
		color: '#111827',
		textAlign: 'center',
		lineHeight: 16,
	},
	sectionContainer: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#50C878',
	},
	seeMoreText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#50C878',
	},
	horizontalScrollContent: {
		paddingHorizontal: 16,
		gap: 12,
	},
	destinationCard: {
		width: 160,
		height: 200,
		borderRadius: 16,
		overflow: 'hidden',
		marginRight: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	destinationImage: {
		width: '100%',
		height: '100%',
	},
	destinationOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'flex-end',
		padding: 12,
	},
	destinationName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	destinationDescription: {
		fontSize: 12,
		color: '#FFFFFF',
		opacity: 0.9,
	},
	hotelCard: {
		width: 200,
		height: 160,
		borderRadius: 16,
		overflow: 'hidden',
		marginRight: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	hotelImage: {
		width: '100%',
		height: '70%',
	},
	hotelInfo: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		padding: 12,
		justifyContent: 'space-between',
	},
	hotelName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	hotelRating: {
		fontSize: 12,
		fontWeight: '500',
		color: '#50C878',
	},
});

export default HomeScreen;
