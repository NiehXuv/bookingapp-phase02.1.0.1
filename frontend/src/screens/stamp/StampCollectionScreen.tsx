import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Utensils, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');
// Stamp dimensions: 304x220 pixels (aspect ratio: 1.382)
const STAMP_ASPECT_RATIO = 304 / 220; // 1.382
const STAMP_WIDTH = (width - 48) / 2; // 16 padding on each side + 16 gap between stamps
const STAMP_HEIGHT = STAMP_WIDTH / STAMP_ASPECT_RATIO; // Maintain stamp aspect ratio

interface Stamp {
	id: string;
	label: string;
	image: any;
	category: 'Location' | 'Activity' | 'Food';
	description?: string;
	location?: string;
	points?: number;
}

const stampData: Stamp[] = [
	{ 
		id: '1',
		label: 'NINH BINH', 
		image: require('../../../assets/stamp/ninhbinh.jpg'), 
		category: 'Location',
		description: 'Explore the stunning limestone karsts and ancient temples',
		location: 'Ninh Binh, Vietnam',
		points: 100,
	},
	{ 
		id: '2',
		label: 'HA GIANG', 
		image: require('../../../assets/stamp/hagiang.jpg'), 
		category: 'Location',
		description: 'Discover the breathtaking mountain landscapes',
		location: 'Ha Giang, Vietnam',
		points: 150,
	},
	{ 
		id: '3',
		label: 'BAMBOO TUBE RICE', 
		image: require('../../../assets/stamp/bamboo.jpg'), 
		category: 'Food',
		description: 'Traditional Vietnamese rice cooked in bamboo tubes',
		location: 'Various locations',
		points: 50,
	},
	{ 
		id: '4',
		label: 'MAKING BAT TRANG POTTERY', 
		image: require('../../../assets/stamp/pottery.jpg'), 
		category: 'Activity',
		description: 'Learn the ancient art of pottery making',
		location: 'Bat Trang Village, Hanoi',
		points: 200,
	},
	{ 
		id: '5',
		label: 'LUNG CU FLAGPOLE', 
		image: require('../../../assets/stamp/flagpole.jpg'), 
		category: 'Location',
		description: 'Visit the northernmost point of Vietnam',
		location: 'Lung Cu, Ha Giang',
		points: 120,
	},
	{ 
		id: '6',
		label: 'BUFFALO JERKY', 
		image: require('../../../assets/stamp/buffalo.jpg'), 
		category: 'Food',
		description: 'Taste the unique local specialty',
		location: 'Various locations',
		points: 50,
	},
	{ 
		id: '7',
		label: 'FIRE DANCING FESTIVAL', 
		image: require('../../../assets/stamp/firedancing.jpg'), 
		category: 'Activity',
		description: 'Experience the traditional fire dancing performance',
		location: 'Various locations',
		points: 180,
	},
	{ 
		id: '8',
		label: 'FARMING WITH THE LOCALS', 
		image: require('../../../assets/stamp/farming.jpg'), 
		category: 'Activity',
		description: 'Join local farmers in traditional farming activities',
		location: 'Rural Vietnam',
		points: 150,
	},
];

const categories = ['All', 'Location', 'Activity', 'Food'];

const StampCollectionScreen = () => {
	const navigation = useNavigation();
	const [selectedCategory, setSelectedCategory] = useState('All');

	const filteredStamps = selectedCategory === 'All'
		? stampData
		: stampData.filter(stamp => stamp.category === selectedCategory);

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'Location':
				return <MapPin size={16} color="#50C878" />;
			case 'Activity':
				return <Activity size={16} color="#50C878" />;
			case 'Food':
				return <Utensils size={16} color="#50C878" />;
			default:
				return null;
		}
	};

	const handleStampPress = (stamp: Stamp) => {
		(navigation as any).navigate('StampDetailScreen', { stamp });
	};

	return (
		<ImageBackground 
			source={require('../../../assets/background.png')} 
			style={styles.backgroundImage}
			resizeMode="cover"
		>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
				<TouchableOpacity 
					onPress={() => navigation.goBack()} 
					style={styles.backButton}
					activeOpacity={0.7}
				>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Stamp Collection</Text>
				<View style={styles.headerSpacer} />
			</View>

			{/* Category Filter */}
			<View style={styles.filterContainer}>
				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false} 
					contentContainerStyle={styles.categoryScroll}
				>
					{categories.map(cat => (
						<TouchableOpacity
							key={cat}
							style={[
								styles.categoryButton, 
								selectedCategory === cat && styles.categoryButtonActive
							]}
							onPress={() => setSelectedCategory(cat)}
							activeOpacity={0.7}
						>
							<Text style={[
								styles.categoryText, 
								selectedCategory === cat && styles.categoryTextActive
							]}>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Stamp Grid */}
			<ScrollView 
				contentContainerStyle={styles.stampGrid}
				showsVerticalScrollIndicator={false}
			>
				{filteredStamps.map((stamp) => (
					<TouchableOpacity
						key={stamp.id}
						style={styles.stampCard}
						activeOpacity={0.9}
						onPress={() => handleStampPress(stamp)}
					>
						<Image 
							source={stamp.image} 
							style={styles.stampImage} 
							resizeMode="cover" 
						/>
						<View style={styles.stampOverlay}>
							<View style={styles.categoryBadge}>
								{getCategoryIcon(stamp.category)}
								<Text style={styles.categoryBadgeText}>{stamp.category}</Text>
							</View>
						</View>
						<View style={styles.stampInfo}>
							<Text style={styles.stampLabel} numberOfLines={2}>{stamp.label}</Text>
							{stamp.points && (
								<View style={styles.pointsContainer}>
									<Text style={styles.pointsText}>{stamp.points} pts</Text>
								</View>
							)}
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Map View Button */}
			<TouchableOpacity 
				style={styles.mapViewButton}
				activeOpacity={0.8}
			>
				<MapPin size={20} color="#FFFFFF" />
				<Text style={styles.mapViewText}>Map View</Text>
			</TouchableOpacity>
			</View>
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
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
	},
	headerSpacer: {
		width: 40,
	},
	filterContainer: {
		paddingVertical: 12,
	},
	categoryScroll: {
		paddingHorizontal: 16,
		gap: 8,
	},
	categoryButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		borderWidth: 1,
		borderColor: '#E5E7EB',
		marginRight: 8,
	},
	categoryButtonActive: {
		backgroundColor: '#50C878',
		borderColor: '#50C878',
	},
	categoryText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6B7280',
	},
	categoryTextActive: {
		color: '#FFFFFF',
	},
	stampGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 100,
	},
	stampCard: {
		width: STAMP_WIDTH,
		height: STAMP_HEIGHT + 60, // Image height + info section
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	stampImage: {
		width: '100%',
		height: STAMP_HEIGHT,
	},
	stampOverlay: {
		position: 'absolute',
		top: 8,
		right: 8,
	},
	categoryBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	categoryBadgeText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#50C878',
	},
	stampInfo: {
		padding: 12,
	},
	stampLabel: {
		fontSize: 14,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 6,
		lineHeight: 20,
	},
	pointsContainer: {
		alignSelf: 'flex-start',
		backgroundColor: '#F0FDF4',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	pointsText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#50C878',
	},
	mapViewButton: {
		position: 'absolute',
		bottom: 20,
		left: 16,
		right: 16,
		backgroundColor: '#50C878',
		borderRadius: 16,
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	mapViewText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 16,
	},
});

export default StampCollectionScreen;
