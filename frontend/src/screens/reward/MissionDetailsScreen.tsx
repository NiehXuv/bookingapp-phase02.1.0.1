import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Coins, CheckCircle2, RotateCw, Gamepad2, Video, Play, X } from 'lucide-react-native';

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

const MissionDetailsScreen: React.FC = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { mission } = route.params as { mission: Mission };
	const [isCompleted, setIsCompleted] = useState(mission.completed);

	const getMissionIcon = (iconName: string) => {
		switch (iconName) {
			case 'checkin':
				return <CheckCircle2 size={48} color="#3B82F6" />;
			case 'rotation':
				return <RotateCw size={48} color="#F59E0B" />;
			case 'games':
				return <Gamepad2 size={48} color="#A855F7" />;
			case 'video':
				return <Video size={48} color="#EC4899" />;
			case 'card':
				return <Coins size={48} color="#3B82F6" />;
			case 'review':
				return <Coins size={48} color="#F59E0B" />;
			default:
				return <Coins size={48} color="#3B82F6" />;
		}
	};

	const handleComplete = () => {
		Alert.alert(
			'Mission Complete!',
			`You've earned ${mission.points}${mission.multiplier ? ` x ${mission.multiplier}` : ''} points!`,
			[
				{
					text: 'OK',
					onPress: () => {
						setIsCompleted(true);
						// Navigate back after a delay
						setTimeout(() => {
							navigation.goBack();
						}, 1500);
					},
				},
			]
		);
	};

	const handleStart = () => {
		if (mission.icon === 'games') {
			Alert.alert('Mini Games', 'Game feature coming soon!');
		} else if (mission.icon === 'video') {
			Alert.alert('Watch Video', 'Video player coming soon!');
		} else if (mission.icon === 'checkin') {
			handleComplete();
		} else if (mission.icon === 'rotation') {
			Alert.alert('Daily Rotation', 'Complete your daily rotation tasks to earn points!');
		} else {
			handleComplete();
		}
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Mission Details</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{/* Mission Card */}
				<View style={[styles.missionCard, { backgroundColor: mission.backgroundColor }]}>
					<View style={styles.missionIconContainer}>
						{getMissionIcon(mission.icon)}
					</View>
					<Text style={styles.missionTitle}>{mission.title}</Text>
					<View style={styles.pointsContainer}>
						<Coins size={24} color="#F59E0B" />
						<Text style={styles.pointsText}>
							{mission.points} {mission.multiplier ? `x ${mission.multiplier}` : ''} points
						</Text>
					</View>
				</View>

				{/* Mission Description */}
				<View style={styles.descriptionCard}>
					<Text style={styles.descriptionTitle}>About this mission</Text>
					<Text style={styles.descriptionText}>{mission.description}</Text>
				</View>

				{/* Mission Details */}
				<View style={styles.detailsCard}>
					<Text style={styles.detailsTitle}>Mission Details</Text>
					<View style={styles.detailRow}>
						<Text style={styles.detailLabel}>Points Reward:</Text>
						<Text style={styles.detailValue}>
							{mission.points}{mission.multiplier ? ` x ${mission.multiplier}` : ''} points
						</Text>
					</View>
					<View style={styles.detailRow}>
						<Text style={styles.detailLabel}>Status:</Text>
						<Text style={[styles.detailValue, isCompleted && styles.completedText]}>
							{isCompleted ? 'Completed' : 'In Progress'}
						</Text>
					</View>
					{mission.multiplier && (
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Multiplier:</Text>
							<Text style={styles.detailValue}>x {mission.multiplier}</Text>
						</View>
					)}
				</View>

				{/* Instructions */}
				<View style={styles.instructionsCard}>
					<Text style={styles.instructionsTitle}>How to complete</Text>
					{mission.icon === 'checkin' && (
						<>
							<Text style={styles.instructionText}>1. Tap the "Complete" button below</Text>
							<Text style={styles.instructionText}>2. Confirm your check-in</Text>
							<Text style={styles.instructionText}>3. Earn your points instantly!</Text>
						</>
					)}
					{mission.icon === 'rotation' && (
						<>
							<Text style={styles.instructionText}>1. Complete all daily rotation tasks</Text>
							<Text style={styles.instructionText}>2. Tasks reset every 24 hours</Text>
							<Text style={styles.instructionText}>3. Earn bonus points with multiplier!</Text>
						</>
					)}
					{mission.icon === 'games' && (
						<>
							<Text style={styles.instructionText}>1. Play the mini game</Text>
							<Text style={styles.instructionText}>2. Achieve the target score</Text>
							<Text style={styles.instructionText}>3. Earn points based on your performance</Text>
						</>
					)}
					{mission.icon === 'video' && (
						<>
							<Text style={styles.instructionText}>1. Watch the full video</Text>
							<Text style={styles.instructionText}>2. Video must play to completion</Text>
							<Text style={styles.instructionText}>3. Points will be credited automatically</Text>
						</>
					)}
					{mission.icon === 'card' && (
						<>
							<Text style={styles.instructionText}>1. Connect your payment card</Text>
							<Text style={styles.instructionText}>2. Complete the verification process</Text>
							<Text style={styles.instructionText}>3. Earn bonus points instantly!</Text>
						</>
					)}
					{mission.icon === 'review' && (
						<>
							<Text style={styles.instructionText}>1. Find a recent purchase</Text>
							<Text style={styles.instructionText}>2. Write a detailed review</Text>
							<Text style={styles.instructionText}>3. Submit and earn points!</Text>
						</>
					)}
				</View>

				{/* Action Button */}
				{!isCompleted ? (
					<TouchableOpacity
						style={[styles.actionButton, { backgroundColor: mission.backgroundColor }]}
						onPress={handleStart}
						activeOpacity={0.8}
					>
						{mission.icon === 'games' || mission.icon === 'video' ? (
							<>
								<Play size={20} color="#111827" />
								<Text style={styles.actionButtonText}>Start Mission</Text>
							</>
						) : (
							<>
								<CheckCircle2 size={20} color="#111827" />
								<Text style={styles.actionButtonText}>Complete Mission</Text>
							</>
						)}
					</TouchableOpacity>
				) : (
					<View style={[styles.completedButton, { backgroundColor: mission.backgroundColor }]}>
						<CheckCircle2 size={20} color="#10B981" />
						<Text style={styles.completedButtonText}>Mission Completed</Text>
					</View>
				)}

				<View style={{ height: 100 }} />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F3F4F6',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 16,
		backgroundColor: '#FFFFFF',
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#111827',
	},
	headerSpacer: {
		width: 40,
	},
	scrollView: {
		flex: 1,
	},
	missionCard: {
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 20,
		padding: 32,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	missionIconContainer: {
		marginBottom: 16,
	},
	missionTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 12,
		textAlign: 'center',
	},
	pointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	pointsText: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
	},
	descriptionCard: {
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
	descriptionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 12,
	},
	descriptionText: {
		fontSize: 16,
		color: '#6B7280',
		lineHeight: 24,
	},
	detailsCard: {
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 16,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	detailsTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 16,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	detailLabel: {
		fontSize: 16,
		color: '#6B7280',
	},
	detailValue: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
	},
	completedText: {
		color: '#10B981',
	},
	instructionsCard: {
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 16,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	instructionsTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 16,
	},
	instructionText: {
		fontSize: 16,
		color: '#6B7280',
		marginBottom: 12,
		lineHeight: 24,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 16,
		marginTop: 24,
		paddingVertical: 16,
		borderRadius: 16,
		gap: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	actionButtonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
	},
	completedButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 16,
		marginTop: 24,
		paddingVertical: 16,
		borderRadius: 16,
		gap: 8,
		opacity: 0.7,
	},
	completedButtonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#10B981',
	},
});

export default MissionDetailsScreen;

