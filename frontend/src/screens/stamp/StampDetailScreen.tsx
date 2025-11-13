import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Utensils, Activity, Calendar, Award, Share2, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
// Stamp dimensions: 304x220 pixels (aspect ratio: 1.382)
const STAMP_ASPECT_RATIO = 304 / 220; // 1.382
const STAMP_DETAIL_WIDTH = width - 32; // 16 padding on each side
const STAMP_DETAIL_HEIGHT = STAMP_DETAIL_WIDTH / STAMP_ASPECT_RATIO; // Maintain stamp aspect ratio

interface Stamp {
	id: string;
	label: string;
	image: any;
	category: 'Location' | 'Activity' | 'Food';
	description?: string;
	location?: string;
	points?: number;
	dateCollected?: string;
}

const StampDetailScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { stamp } = route.params as { stamp: Stamp };

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'Location':
				return <MapPin size={24} color="#50C878" />;
			case 'Activity':
				return <Activity size={24} color="#50C878" />;
			case 'Food':
				return <Utensils size={24} color="#50C878" />;
			default:
				return null;
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'Location':
				return '#F0FDF4';
			case 'Activity':
				return '#FFF1F5';
			case 'Food':
				return '#FEF3C7';
			default:
				return '#F3F4F6';
		}
	};

	return (
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
				<Text style={styles.headerTitle}>Stamp Details</Text>
				<TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
					<Share2 size={24} color="#111827" />
				</TouchableOpacity>
			</View>

			<ScrollView 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Stamp Image */}
				<View style={styles.stampImageContainer}>
					<Image 
						source={stamp.image} 
						style={styles.stampImage} 
						resizeMode="cover" 
					/>
				</View>

				{/* Stamp Content */}
				<View style={styles.content}>
					{/* Category Badge */}
					<View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(stamp.category) }]}>
						{getCategoryIcon(stamp.category)}
						<Text style={[styles.categoryBadgeText, { color: '#50C878' }]}>
							{stamp.category} Reward
						</Text>
					</View>

					{/* Title */}
					<Text style={styles.title}>{stamp.label}</Text>

					{/* Description */}
					{stamp.description && (
						<Text style={styles.description}>{stamp.description}</Text>
					)}

					{/* Info Cards */}
					<View style={styles.infoCards}>
						{stamp.location && (
							<View style={styles.infoCard}>
								<MapPin size={20} color="#50C878" />
								<View style={styles.infoCardContent}>
									<Text style={styles.infoCardLabel}>Location</Text>
									<Text style={styles.infoCardValue}>{stamp.location}</Text>
								</View>
							</View>
						)}

						{stamp.points && (
							<View style={styles.infoCard}>
								<Award size={20} color="#FF6B9D" />
								<View style={styles.infoCardContent}>
									<Text style={styles.infoCardLabel}>Points Earned</Text>
									<Text style={[styles.infoCardValue, { color: '#FF6B9D' }]}>
										{stamp.points} pts
									</Text>
								</View>
							</View>
						)}

						{stamp.dateCollected && (
							<View style={styles.infoCard}>
								<Calendar size={20} color="#50C878" />
								<View style={styles.infoCardContent}>
									<Text style={styles.infoCardLabel}>Collected On</Text>
									<Text style={styles.infoCardValue}>{stamp.dateCollected}</Text>
								</View>
							</View>
						)}
					</View>

					{/* Activity Reward Section */}
					{stamp.category === 'Activity' && (
						<View style={styles.activitySection}>
							<Text style={styles.sectionTitle}>Activity Reward</Text>
							<Text style={styles.sectionDescription}>
								Congratulations! You've completed this activity and earned a special stamp. 
								This stamp represents your participation in a unique cultural experience.
							</Text>
							<View style={styles.rewardBadge}>
								<Award size={32} color="#50C878" />
								<Text style={styles.rewardText}>Activity Completed</Text>
							</View>
						</View>
					)}

					{/* Action Buttons */}
					<View style={styles.actions}>
						<TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
							<MapPin size={20} color="#FFFFFF" />
							<Text style={styles.primaryButtonText}>View on Map</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
							<Heart size={20} color="#FF6B9D" />
							<Text style={styles.secondaryButtonText}>Save to Favorites</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={{ height: 100 }} />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingTop: 50,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 16,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
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
	shareButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollContent: {
		paddingBottom: 100,
	},
	stampImageContainer: {
		width: '100%',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
	},
	stampImage: {
		width: STAMP_DETAIL_WIDTH,
		height: STAMP_DETAIL_HEIGHT,
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	content: {
		padding: 16,
	},
	categoryBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		gap: 6,
		marginBottom: 16,
	},
	categoryBadgeText: {
		fontSize: 14,
		fontWeight: '700',
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 12,
		lineHeight: 36,
	},
	description: {
		fontSize: 16,
		color: '#6B7280',
		lineHeight: 24,
		marginBottom: 24,
	},
	infoCards: {
		gap: 12,
		marginBottom: 24,
	},
	infoCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F9FAFB',
		padding: 16,
		borderRadius: 12,
		gap: 12,
	},
	infoCardContent: {
		flex: 1,
	},
	infoCardLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: '#6B7280',
		marginBottom: 4,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	infoCardValue: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
	},
	activitySection: {
		backgroundColor: '#F0FDF4',
		padding: 20,
		borderRadius: 16,
		marginBottom: 24,
		borderWidth: 2,
		borderColor: '#50C878',
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: '#6B7280',
		lineHeight: 20,
		marginBottom: 16,
	},
	rewardBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 12,
	},
	rewardText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#50C878',
	},
	actions: {
		gap: 12,
	},
	primaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#50C878',
		paddingVertical: 16,
		borderRadius: 16,
		gap: 8,
	},
	primaryButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	secondaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFF1F5',
		paddingVertical: 16,
		borderRadius: 16,
		gap: 8,
		borderWidth: 2,
		borderColor: '#FF6B9D',
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FF6B9D',
	},
});

export default StampDetailScreen;

