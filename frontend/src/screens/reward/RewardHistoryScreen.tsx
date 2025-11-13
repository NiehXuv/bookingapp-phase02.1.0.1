import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Coins, TrendingUp, TrendingDown } from 'lucide-react-native';

interface HistoryItem {
	id: string;
	type: 'earned' | 'spent';
	title: string;
	description: string;
	points: number;
	date: string;
	time: string;
}

const RewardHistoryScreen: React.FC = () => {
	const navigation = useNavigation();
	const [selectedFilter, setSelectedFilter] = useState<'all' | 'earned' | 'spent'>('all');

	const historyData: HistoryItem[] = [
		{
			id: '1',
			type: 'earned',
			title: 'Daily Check-in',
			description: 'Completed daily check-in mission',
			points: 30,
			date: '2024-01-15',
			time: '09:30 AM',
		},
		{
			id: '2',
			type: 'earned',
			title: 'Watch Video',
			description: 'Watched promotional video',
			points: 15,
			date: '2024-01-15',
			time: '08:15 AM',
		},
		{
			id: '3',
			type: 'spent',
			title: 'Redeemed Voucher',
			description: 'Used points for discount voucher',
			points: 50,
			date: '2024-01-14',
			time: '03:45 PM',
		},
		{
			id: '4',
			type: 'earned',
			title: 'Mini Game',
			description: 'Completed puzzle game',
			points: 25,
			date: '2024-01-14',
			time: '02:20 PM',
		},
		{
			id: '5',
			type: 'earned',
			title: 'Daily Rotation',
			description: 'Completed daily rotation tasks',
			points: 100,
			date: '2024-01-14',
			time: '10:00 AM',
		},
		{
			id: '6',
			type: 'spent',
			title: 'Gift Card',
			description: 'Redeemed gift card',
			points: 200,
			date: '2024-01-13',
			time: '05:30 PM',
		},
	];

	const filteredHistory = selectedFilter === 'all' 
		? historyData 
		: historyData.filter(item => item.type === selectedFilter);

	const groupedHistory = filteredHistory.reduce((acc, item) => {
		const date = item.date;
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(item);
		return acc;
	}, {} as Record<string, HistoryItem[]>);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>History</Text>
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
					style={[styles.filterTab, selectedFilter === 'earned' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('earned')}
				>
					<Text style={[styles.filterText, selectedFilter === 'earned' && styles.filterTextActive]}>
						Earned
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.filterTab, selectedFilter === 'spent' && styles.filterTabActive]}
					onPress={() => setSelectedFilter('spent')}
				>
					<Text style={[styles.filterText, selectedFilter === 'spent' && styles.filterTextActive]}>
						Spent
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{Object.entries(groupedHistory).map(([date, items]) => (
					<View key={date} style={styles.dateSection}>
						<Text style={styles.dateHeader}>{date}</Text>
						{items.map((item) => (
							<View key={item.id} style={styles.historyItem}>
								<View style={[styles.iconContainer, item.type === 'earned' ? styles.iconEarned : styles.iconSpent]}>
									{item.type === 'earned' ? (
										<TrendingUp size={20} color="#10B981" />
									) : (
										<TrendingDown size={20} color="#EF4444" />
									)}
								</View>
								<View style={styles.itemContent}>
									<Text style={styles.itemTitle}>{item.title}</Text>
									<Text style={styles.itemDescription}>{item.description}</Text>
									<Text style={styles.itemTime}>{item.time}</Text>
								</View>
								<View style={styles.pointsContainer}>
									<Text style={[styles.pointsText, item.type === 'earned' ? styles.pointsEarned : styles.pointsSpent]}>
										{item.type === 'earned' ? '+' : '-'}{item.points}
									</Text>
									<Coins size={16} color={item.type === 'earned' ? '#10B981' : '#EF4444'} />
								</View>
							</View>
						))}
					</View>
				))}

				{filteredHistory.length === 0 && (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No history found</Text>
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
		paddingHorizontal: 16,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
	},
	filterTabActive: {
		backgroundColor: '#50C878',
	},
	filterText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6B7280',
	},
	filterTextActive: {
		color: '#FFFFFF',
	},
	scrollView: {
		flex: 1,
	},
	dateSection: {
		marginTop: 20,
		paddingHorizontal: 16,
	},
	dateHeader: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 12,
	},
	historyItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 2,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	iconEarned: {
		backgroundColor: '#D1FAE5',
	},
	iconSpent: {
		backgroundColor: '#FEE2E2',
	},
	itemContent: {
		flex: 1,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	itemDescription: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 4,
	},
	itemTime: {
		fontSize: 12,
		color: '#9CA3AF',
	},
	pointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	pointsText: {
		fontSize: 18,
		fontWeight: '700',
	},
	pointsEarned: {
		color: '#10B981',
	},
	pointsSpent: {
		color: '#EF4444',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		color: '#6B7280',
	},
});

export default RewardHistoryScreen;

