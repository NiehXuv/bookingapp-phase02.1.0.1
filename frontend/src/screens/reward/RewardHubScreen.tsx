import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, HelpCircle, Calendar, Search, Gift, Coins, Play, Gamepad2, Video, RotateCw, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface Mission {
	id: string;
	title: string;
	description: string;
	points: number;
	multiplier?: number;
	icon: string;
	backgroundColor: string;
	completed: boolean;
}

const RewardHubScreen: React.FC = () => {
	const navigation = useNavigation();
	const { user } = useAuth();
	const [currentPoints, setCurrentPoints] = useState(50);
	const [totalPoints, setTotalPoints] = useState(500);

	const progressPercentage = (currentPoints / totalPoints) * 100; // 50/500 = 10%

	const missions: Mission[] = [
		{
			id: '1',
			title: 'Daily Check-in',
			description: 'Check in daily to earn points',
			points: 10,
			multiplier: 3,
			icon: 'checkin',
			backgroundColor: '#F0FDF4',
			completed: false,
		},
		{
			id: '2',
			title: 'Daily Rotation',
			description: 'Complete daily rotation tasks',
			points: 10,
			multiplier: 10,
			icon: 'rotation',
			backgroundColor: '#FFF1F5',
			completed: false,
		},
		{
			id: '3',
			title: 'Mini Games',
			description: 'Play mini games and win rewards',
			points: 25,
			icon: 'games',
			backgroundColor: '#F0FDF4',
			completed: false,
		},
		{
			id: '4',
			title: 'Watch Video',
			description: 'Watch videos to earn points',
			points: 15,
			icon: 'video',
			backgroundColor: '#FFF1F5',
			completed: false,
		},
		{
			id: '5',
			title: 'Connect Card',
			description: 'Connect a card and earn',
			points: 10,
			multiplier: 3,
			icon: 'card',
			backgroundColor: '#F0FDF4',
			completed: false,
		},
		{
			id: '6',
			title: 'Review Purchase',
			description: 'Review what you bought',
			points: 10,
			multiplier: 10,
			icon: 'review',
			backgroundColor: '#FFF1F5',
			completed: false,
		},
	];

	const getMissionIcon = (iconName: string) => {
		switch (iconName) {
			case 'checkin':
				return <CheckCircle2 size={32} color="#50C878" />;
			case 'rotation':
				return <RotateCw size={32} color="#FF6B9D" />;
			case 'games':
				return <Gamepad2 size={32} color="#50C878" />;
			case 'video':
				return <Video size={32} color="#FF6B9D" />;
			case 'card':
				return <Coins size={32} color="#50C878" />;
			case 'review':
				return <Gift size={32} color="#FF6B9D" />;
			default:
				return <Coins size={32} color="#50C878" />;
		}
	};

	const handleMissionPress = (mission: Mission) => {
		(navigation as any).navigate('MissionDetails', { mission });
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
				<View style={styles.headerContent}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<ArrowLeft size={24} color="#111827" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Rewards club</Text>
					<TouchableOpacity style={styles.helpButton}>
						<HelpCircle size={24} color="#111827" />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{/* Your Points Section */}
				<TouchableOpacity 
					style={styles.pointsCard}
					activeOpacity={0.9}
				>
					<View style={styles.pointsContent}>
						<View style={styles.progressContainer}>
							{/* Background Circle */}
							<View style={styles.progressCircleBackground} />
							{/* Progress Arc - Simple rotating arc */}
							{progressPercentage > 0 && (
								<View style={styles.progressArcWrapper}>
									<View style={[styles.progressArc, {
										transform: [{ rotate: `${(progressPercentage / 100) * 360 - 90}deg` }],
										borderRightColor: progressPercentage > 25 ? '#FF6B9D' : (progressPercentage > 0 ? '#FF6B9D' : 'transparent'),
										borderBottomColor: progressPercentage > 50 ? '#FF6B9D' : 'transparent',
										borderLeftColor: progressPercentage > 75 ? '#FF6B9D' : 'transparent',
									}]} />
								</View>
							)}
							{/* Coin Icon Overlay */}
							<View style={styles.coinIcon}>
								<Coins size={40} color="#FF6B9D" />
							</View>
						</View>
						<View style={styles.pointsTextContainer}>
							<Text style={styles.pointsLabel}>Your points</Text>
							<Text style={styles.pointsValue}>{currentPoints} / {totalPoints}</Text>
						</View>
						<View style={styles.arrowButton}>
							<ArrowLeft size={20} color="#111827" style={{ transform: [{ rotate: '180deg' }] }} />
						</View>
					</View>
				</TouchableOpacity>

				{/* Navigation Cards */}
				<View style={styles.navCardsContainer}>
					<TouchableOpacity 
						style={styles.navCard}
						onPress={() => (navigation as any).navigate('RewardHistory')}
						activeOpacity={0.8}
					>
						<View style={[styles.navIconContainer, { backgroundColor: '#F0FDF4' }]}>
							<Calendar size={28} color="#50C878" />
						</View>
						<Text style={styles.navCardText}>History</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.navCard}
						onPress={() => (navigation as any).navigate('ExploreReward')}
						activeOpacity={0.8}
					>
						<View style={[styles.navIconContainer, { backgroundColor: '#FFF1F5' }]}>
							<Search size={28} color="#FF6B9D" />
						</View>
						<Text style={styles.navCardText}>Explore rewards</Text>
					</TouchableOpacity>

					<TouchableOpacity 
						style={styles.navCard}
						onPress={() => (navigation as any).navigate('YourReward')}
						activeOpacity={0.8}
					>
						<View style={[styles.navIconContainer, { backgroundColor: '#F0FDF4' }]}>
							<Gift size={28} color="#50C878" />
						</View>
						<Text style={styles.navCardText}>Your rewards</Text>
					</TouchableOpacity>
				</View>

				{/* Discover Today's Top Deals Banner */}
				<TouchableOpacity 
					style={styles.dealsBanner}
					activeOpacity={0.9}
				>
					<View style={styles.dealsContent}>
						<Text style={styles.dealsTitle}>Discover today's top deals</Text>
						<Text style={styles.dealsSubtitle}>Treat yourself and collect more points while you're at it.</Text>
						<TouchableOpacity style={styles.shopNowButton}>
							<Text style={styles.shopNowText}>Shop now</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.dealsImageContainer}>
						<Image 
							source={require('../../../assets/topdeal.jpg')} 
							style={styles.dealsImage}
							resizeMode="cover"
						/>
					</View>
				</TouchableOpacity>

				{/* Missions Section */}
				<View style={styles.missionsSection}>
					<Text style={styles.missionsTitle}>Missions</Text>
					<View style={styles.missionsGrid}>
						{missions.map((mission) => (
							<TouchableOpacity
								key={mission.id}
								style={[styles.missionCard, { backgroundColor: mission.backgroundColor }]}
								onPress={() => handleMissionPress(mission)}
								activeOpacity={0.8}
							>
								<View style={styles.missionIconContainer}>
									{getMissionIcon(mission.icon)}
								</View>
								<View style={styles.missionPointsContainer}>
									<Coins size={16} color="#FF6B9D" />
									<Text style={styles.missionPoints}>
										{mission.points} {mission.multiplier ? `x${mission.multiplier}` : ''}
									</Text>
								</View>
								<Text style={styles.missionDescription} numberOfLines={2}>
									{mission.description}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

			<View style={{ height: 100 }} />
		</ScrollView>
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
	},
	header: {
		paddingTop: 50,
		paddingBottom: 16,
	},
	headerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 12,
	},
	time: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	statusIcons: {
		flexDirection: 'row',
		gap: 4,
	},
	statusIcon: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#111827',
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: '700',
		color: '#111827',
		flex: 1,
		textAlign: 'center',
	},
	helpButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollView: {
		flex: 1,
	},
	pointsCard: {
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	pointsContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	progressContainer: {
		width: 80,
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	progressCircleBackground: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 8,
		borderColor: '#E5E7EB',
		position: 'absolute',
	},
	progressArcWrapper: {
		width: 80,
		height: 80,
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
	},
	progressArc: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 8,
		borderColor: '#FF6B9D',
		borderTopColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: 'transparent',
		borderLeftColor: 'transparent',
	},
	coinIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#FFF1F5',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	pointsTextContainer: {
		flex: 1,
		marginLeft: 16,
	},
	pointsLabel: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 4,
	},
	pointsValue: {
		fontSize: 32,
		fontWeight: '700',
		color: '#111827',
	},
	arrowButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	navCardsContainer: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		marginTop: 20,
		gap: 12,
	},
	navCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	navIconContainer: {
		width: 56,
		height: 56,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	navCardText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#111827',
		textAlign: 'center',
	},
	dealsBanner: {
		flexDirection: 'row',
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 20,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
		minHeight: 160,
	},
	dealsContent: {
		flex: 1,
		backgroundColor: '#FFF1F5',
		padding: 20,
		justifyContent: 'center',
		paddingRight: 16,
	},
	dealsTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 8,
		lineHeight: 28,
	},
	dealsSubtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 16,
		lineHeight: 20,
	},
	shopNowButton: {
		alignSelf: 'flex-start',
	},
	shopNowText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#50C878',
		textDecorationLine: 'underline',
	},
	dealsImageContainer: {
		width: 140,
		height: 180,
		backgroundColor: '#E5E7EB',
		overflow: 'hidden',
	},
	dealsImage: {
		width: '100%',
		height: '100%',
	},
	missionsSection: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	missionsTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 16,
	},
	missionsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	missionCard: {
		width: (width - 44) / 2,
		aspectRatio: 1,
		borderRadius: 16,
		padding: 16,
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	missionIconContainer: {
		marginBottom: 8,
	},
	missionPointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginBottom: 8,
	},
	missionPoints: {
		fontSize: 14,
		fontWeight: '700',
		color: '#111827',
	},
	missionDescription: {
		fontSize: 12,
		color: '#6B7280',
		fontWeight: '500',
	},
});

export default RewardHubScreen;

