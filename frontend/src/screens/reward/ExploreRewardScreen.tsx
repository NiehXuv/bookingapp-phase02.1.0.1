import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, Gift, Coins, Star, Ticket, CreditCard, Sparkles, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Reward {
	id: string;
	title: string;
	description: string;
	points: number;
	image?: any;
	category: string;
	popular?: boolean;
}

const ExploreRewardScreen: React.FC = () => {
	const navigation = useNavigation();
	const [selectedCategory, setSelectedCategory] = useState<string>('Products');
	const [searchQuery, setSearchQuery] = useState('');

	const categories = ['all', 'Vouchers', 'Gift Cards', 'Experiences', 'Products'];

	const rewards: Reward[] = [
		{
			id: '1',
			title: 'Hotel Discount Voucher',
			description: 'Get 20% off on your next hotel booking',
			points: 500,
			category: 'Vouchers',
			popular: true,
		},
		{
			id: '2',
			title: 'Restaurant Gift Card',
			description: '$50 gift card for premium restaurants',
			points: 800,
			category: 'Gift Cards',
			popular: true,
		},
		{
			id: '3',
			title: 'Spa Experience',
			description: 'Relaxing spa day for two',
			points: 1200,
			category: 'Experiences',
		},
		{
			id: '4',
			title: 'Travel Accessories',
			description: 'Premium travel kit with luggage tag',
			points: 600,
			category: 'Products',
		},
		{
			id: '5',
			title: 'Flight Upgrade',
			description: 'Upgrade to business class',
			points: 2000,
			category: 'Experiences',
			popular: true,
		},
		{
			id: '6',
			title: 'Shopping Voucher',
			description: '15% off on all purchases',
			points: 400,
			category: 'Vouchers',
		},
		{
			id: '7',
			title: 'Coffee Shop Card',
			description: '$25 gift card for coffee lovers',
			points: 300,
			category: 'Gift Cards',
		},
		{
			id: '8',
			title: 'Adventure Tour',
			description: 'Half-day adventure experience',
			points: 1500,
			category: 'Experiences',
		},
	];

	const filteredRewards = rewards.filter(reward => {
		const matchesCategory = selectedCategory === 'all' || selectedCategory === 'All' || reward.category === selectedCategory;
		const matchesSearch = searchQuery === '' || reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			reward.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	const getRewardIcon = (category: string) => {
		switch (category) {
			case 'Vouchers':
				return <Ticket size={40} color="#50C878" strokeWidth={2} />;
			case 'Gift Cards':
				return <CreditCard size={40} color="#50C878" strokeWidth={2} />;
			case 'Experiences':
				return <Sparkles size={40} color="#50C878" strokeWidth={2} />;
			case 'Products':
				return <ShoppingBag size={40} color="#50C878" strokeWidth={2} />;
			default:
				return <Gift size={40} color="#50C878" strokeWidth={2} />;
		}
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Explore rewards</Text>
				<View style={styles.headerSpacer} />
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<Search size={20} color="#9CA3AF" style={styles.searchIcon} />
				<TextInput
					style={styles.searchInput}
					placeholder="Search rewards..."
					placeholderTextColor="#9CA3AF"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			{/* Category Filter */}
			<ScrollView 
				horizontal 
				showsHorizontalScrollIndicator={false}
				style={styles.categoryScroll}
				contentContainerStyle={styles.categoryScrollContent}
			>
				{categories.map((category) => {
					const displayName = category === 'all' ? 'All' : category;
					return (
						<TouchableOpacity
							key={category}
							style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
							onPress={() => setSelectedCategory(category)}
						>
							<Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
								{displayName}
							</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				<View style={styles.rewardsList}>
					{filteredRewards.map((reward) => (
						<TouchableOpacity
							key={reward.id}
							style={styles.rewardCard}
							activeOpacity={0.8}
						>
							<View style={styles.rewardIconContainer}>
								{getRewardIcon(reward.category)}
							</View>
							<View style={styles.rewardContent}>
								<Text style={styles.rewardTitle}>{reward.title}</Text>
								<Text style={styles.rewardDescription} numberOfLines={2}>
									{reward.description}
								</Text>
								<View style={styles.rewardPointsContainer}>
									<Coins size={16} color="#F59E0B" />
									<Text style={styles.rewardPoints}>{reward.points} points</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</View>

				{filteredRewards.length === 0 && (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No rewards found</Text>
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
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 12,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: '#111827',
		padding: 0,
	},
	categoryScroll: {
		marginTop: 12,
		maxHeight: 50,
	},
	categoryScrollContent: {
		paddingHorizontal: 16,
		paddingVertical: 4,
		gap: 8,
		alignItems: 'center',
		flexDirection: 'row',
	},
	categoryButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E5E7EB',
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
	scrollView: {
		flex: 1,
	},
	rewardsList: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 12,
	},
	rewardCard: {
		width: '100%',
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
	},
	rewardIconContainer: {
		width: 70,
		height: 70,
		backgroundColor: '#F3F4F6',
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
		flexShrink: 0,
	},
	rewardContent: {
		flex: 1,
		justifyContent: 'space-between',
	},
	rewardTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 4,
	},
	rewardDescription: {
		fontSize: 13,
		color: '#6B7280',
		marginBottom: 8,
		lineHeight: 18,
	},
	rewardPointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	rewardPoints: {
		fontSize: 16,
		fontWeight: '700',
		color: '#F59E0B',
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

export default ExploreRewardScreen;

