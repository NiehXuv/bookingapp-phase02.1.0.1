import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Modal, Pressable, Share as RnShare } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Heart, MessageCircle, MoreHorizontal, Share2, Pin as PinIcon, UserPlus, Flag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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
	const { user } = useAuth();
	const navigation = useNavigation();
	const [activeTab, setActiveTab] = useState('For you');
	const [optionsVisible, setOptionsVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<any>(null);

	const openOptions = (item: any) => {
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

	const openDetailScreen = (item: any) => {
		(navigation as any).navigate('DetailScreen', { item });
	};

	return (
		<View style={styles.container}>
		
			{/* Tabs */}
			<View style={styles.tabsRow}>
				{tabs.map((tab) => (
					<TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
						<Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Masonry Grid */}
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
				<View style={styles.masonryRow}>
					<View style={styles.column}>
						{masonryData.filter((_, i) => i % 2 === 0).map((item, idx) => (
							<View key={item.id} style={styles.tile}>
								<TouchableOpacity onPress={() => openDetailScreen(item)}>
									<View style={[styles.card, idx % 2 === 0 ? styles.cardTall : styles.cardShort]}>
										<Image source={item.image} style={styles.cardImage} resizeMode="cover" />
										<View style={styles.pill}>
											<View style={styles.pillItem}>
												<Heart size={12} color="#fff" />
												<Text style={styles.pillText}>{item.likes}</Text>
											</View>
											<View style={styles.pillItem}>
												<MessageCircle size={12} color="#fff" />
												<Text style={styles.pillText}>{item.comments}</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
								<View style={styles.metaRow}>
									<Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
									<TouchableOpacity style={styles.optionsBtn} onPress={() => openOptions(item)}>
										<MoreHorizontal size={18} color="#111827" />
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
					<View style={styles.column}>
						{masonryData.filter((_, i) => i % 2 !== 0).map((item, idx) => (
							<View key={item.id} style={styles.tile}>
								<TouchableOpacity onPress={() => openDetailScreen(item)}>
									<View style={[styles.card, idx % 2 === 1 ? styles.cardTall : styles.cardShort]}>
										<Image source={item.image} style={styles.cardImage} resizeMode="cover" />
										<View style={styles.pill}>
											<View style={styles.pillItem}>
												<Heart size={12} color="#fff" />
												<Text style={styles.pillText}>{item.likes}</Text>
											</View>
											<View style={styles.pillItem}>
												<MessageCircle size={12} color="#fff" />
												<Text style={styles.pillText}>{item.comments}</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
								<View style={styles.metaRow}>
									<Text style={styles.metaTitle} numberOfLines={1}>{item.title}</Text>
									<TouchableOpacity style={styles.optionsBtn} onPress={() => openOptions(item)}>
										<MoreHorizontal size={18} color="#111827" />
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>

			{/* Options Modal */}
			<Modal transparent visible={optionsVisible} animationType="fade" onRequestClose={closeOptions}>
				<Pressable style={styles.modalBackdrop} onPress={closeOptions} />
				<View style={styles.modalSheet}>
					<View style={styles.modalHandle} />
					<View style={styles.modalPreviewRow}>
						{selectedItem && (
							<Image source={selectedItem.image} style={styles.modalThumb} />
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
		color: '#111827',
		fontSize: 18,
		fontWeight: '800',
		textDecorationLine: 'underline',
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
});

export default HomeScreen;