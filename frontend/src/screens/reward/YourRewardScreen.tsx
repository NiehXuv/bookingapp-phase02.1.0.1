import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Gift, Coins, CheckCircle2, Clock, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface UserReward {
	id: string;
	title: string;
	description: string;
	points: number;
	status: 'active' | 'used' | 'expired';
	expiryDate?: string;
	code?: string;
}

const YourRewardScreen: React.FC = () => {
	const navigation = useNavigation();
	const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');

	const userRewards: UserReward[] = [
		{
			id: '1',
			title: 'Hotel Discount Voucher',
			description: '20% off on your next hotel booking',
			points: 500,
			status: 'active',
			expiryDate: '2024-02-15',
			code: 'HOTEL20',
		},
		{
			id: '2',
			title: 'Restaurant Gift Card',
			description: '$50 gift card for premium restaurants',
			points: 800,
			status: 'active',
			expiryDate: '2024-03-01',
			code: 'REST50',
		},
		{
			id: '3',
			title: 'Shopping Voucher',
			description: '15% off on all purchases',
			points: 400,
			status: 'used',
			expiryDate: '2024-01-10',
		},
		{
			id: '4',
			title: 'Coffee Shop Card',
			description: '$25 gift card for coffee lovers',
			points: 300,
			status: 'expired',
			expiryDate: '2024-01-05',
		},
		{
			id: '5',
			title: 'Spa Experience',
			description: 'Relaxing spa day for two',
			points: 1200,
			status: 'active',
			expiryDate: '2024-04-20',
			code: 'SPA2024',
		},
	];

	const filteredRewards = selectedFilter === 'all'
		? userRewards
		: userRewards.filter(reward => reward.status === selectedFilter);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return <CheckCircle2 size={20} color="#10B981" />;
			case 'used':
				return <CheckCircle2 size={20} color="#6B7280" />;
			case 'expired':
				return <X size={20} color="#EF4444" />;
			default:
				return null;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return '#10B981';
			case 'used':
				return '#6B7280';
			case 'expired':
				return '#EF4444';
			default:
				return '#6B7280';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'active':
				return 'Active';
			case 'used':
				return 'Used';
			case 'expired':
				return 'Expired';
			default:
				return '';
		}
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Your rewards</Text>
				<View style={styles.headerSpacer} />
			</View>

			{/* Filter Tabs */}
			<View style={styles.filterContainer}>
				<TouchableOpacity
					style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('all')}
				>
					<Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
						All
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.filterTab, selectedFilter === 'active' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('active')}
				>
					<Text style={[styles.filterText, selectedFilter === 'active' && styles.filterTextActive]}>
						Active
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.filterTab, selectedFilter === 'used' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('used')}
				>
					<Text style={[styles.filterText, selectedFilter === 'used' && styles.filterTextActive]}>
						Used
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.filterTab, selectedFilter === 'expired' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('expired')}
				>
					<Text style={[styles.filterText, selectedFilter === 'expired' && styles.filterTextActive]}>
						Expired
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{filteredRewards.map((reward) => (
					<View key={reward.id} style={styles.rewardCard}>
						<View style={styles.rewardHeader}>
							<View style={styles.rewardIconContainer}>
								<Gift size={32} color="#50C878" />
							</View>
							<View style={styles.rewardInfo}>
								<Text style={styles.rewardTitle}>{reward.title}</Text>
								<Text style={styles.rewardDescription}>{reward.description}</Text>
							</View>
							<View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(reward.status)}20` }]}>
								{getStatusIcon(reward.status)}
								<Text style={[styles.statusText, { color: getStatusColor(reward.status) }]}>
									{getStatusText(reward.status)}
								</Text>
							</View>
						</View>

						{reward.status === 'active' && reward.code && (
							<View style={styles.codeContainer}>
								<Text style={styles.codeLabel}>Code:</Text>
								<Text style={styles.codeValue}>{reward.code}</Text>
							</View>
						)}

						{reward.expiryDate && (
							<View style={styles.expiryContainer}>
								<Clock size={14} color="#6B7280" />
								<Text style={styles.expiryText}>
									{reward.status === 'active' ? 'Expires' : reward.status === 'used' ? 'Used on' : 'Expired on'}: {reward.expiryDate}
								</Text>
							</View>
						)}

						{reward.status === 'active' && (
							<TouchableOpacity style={styles.useButton}>
								<Text style={styles.useButtonText}>Use Now</Text>
							</TouchableOpacity>
						)}
					</View>
				))}

				{filteredRewards.length === 0 && (
					<View style={styles.emptyContainer}>
						<Gift size={64} color="#D1D5DB" />
						<Text style={styles.emptyText}>No rewards found</Text>
						<Text style={styles.emptySubtext}>
							Start earning points to unlock amazing rewards!
						</Text>
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
	filterContainer: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		gap: 8,
	},
	filterTab: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
	},
	filterTabActive: {
		backgroundColor: '#50C878',
	},
	filterText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#6B7280',
	},
	filterTextActive: {
		color: '#FFFFFF',
	},
	scrollView: {
		flex: 1,
	},
	rewardCard: {
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
	rewardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	rewardIconContainer: {
		width: 56,
		height: 56,
		borderRadius: 16,
		backgroundColor: '#F0FDF4',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	rewardInfo: {
		flex: 1,
	},
	rewardTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 4,
	},
	rewardDescription: {
		fontSize: 14,
		color: '#6B7280',
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
	},
	codeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F3F4F6',
		padding: 12,
		borderRadius: 12,
		marginBottom: 12,
		gap: 8,
	},
	codeLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6B7280',
	},
	codeValue: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
		letterSpacing: 2,
	},
	expiryContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 12,
	},
	expiryText: {
		fontSize: 12,
		color: '#6B7280',
	},
	useButton: {
		backgroundColor: '#50C878',
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
	},
	useButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#111827',
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 8,
		textAlign: 'center',
		paddingHorizontal: 40,
	},
});

export default YourRewardScreen;

