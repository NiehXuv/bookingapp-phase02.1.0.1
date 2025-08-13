import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, MoreHorizontal } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const DetailScreen: React.FC = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { item } = route.params as { item: any };
	const [isLiked, setIsLiked] = useState(false);
	const [isSaved, setIsSaved] = useState(false);

	const relatedContent = [
		{ id: '1', image: require('../../assets/hanoi.jpg'), title: 'Hanoi Reflections' },
		{ id: '2', image: require('../../assets/hoian.jpg'), title: 'Hoi An Boats' },
		{ id: '3', image: require('../../assets/sapa.jpg'), title: 'Sapa Mountains' },
		{ id: '4', image: require('../../assets/hue.jpg'), title: 'Hue Imperial City' },
		{ id: '5', image: require('../../assets/nhatrang.jpg'), title: 'Nha Trang Coast' },
		{ id: '6', image: require('../../assets/himalaya_hotel.jpg'), title: 'Resort Views' },
	];

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
				{/* Main Image */}
				<View style={styles.imageContainer}>
					<Image source={item.image} style={styles.mainImage} resizeMode="cover" />
					<View style={styles.imageOverlay}>
						<View style={styles.overlayPill}>
							<Heart size={16} color="#fff" />
							<Text style={styles.overlayText}>{item.likes}</Text>
						</View>
						<View style={styles.overlayPill}>
							<MessageCircle size={16} color="#fff" />
							<Text style={styles.overlayText}>{item.comments}</Text>
						</View>
					</View>
				</View>

				{/* Action Bar */}
				<View style={styles.actionBar}>
					<View style={styles.leftActions}>
						<TouchableOpacity 
							style={styles.actionButton} 
							onPress={() => setIsLiked(!isLiked)}
						>
							<Heart size={24} color={isLiked ? "#EF4444" : "#000"} fill={isLiked ? "#EF4444" : "none"} />
							<Text style={styles.actionText}>{item.likes}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionButton}>
							<MessageCircle size={24} color="#000" />
							<Text style={styles.actionText}>{item.comments}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionButton}>
							<Share2 size={24} color="#000" />
						</TouchableOpacity>
					</View>
					<TouchableOpacity 
						style={styles.saveButton} 
						onPress={() => setIsSaved(!isSaved)}
					>
						<Bookmark size={20} color="#fff" fill={isSaved ? "#fff" : "none"} />
						<Text style={styles.saveButtonText}>Save</Text>
					</TouchableOpacity>
				</View>

				{/* Content */}
				<View style={styles.content}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.description}>
						Hello Folks 👋 Presenting a new travel destination concept. Discover amazing places and create unforgettable memories.
					</Text>
					<TouchableOpacity style={styles.exploreButton}>
						<Text style={styles.planButtonText}>Plan Your Trip</Text>
					</TouchableOpacity>
				</View>

				{/* Related Content */}
				<View style={styles.relatedSection}>
					<Text style={styles.relatedTitle}>Related Content</Text>
					<View style={styles.relatedGrid}>
						{relatedContent.map((relatedItem) => (
							<TouchableOpacity key={relatedItem.id} style={styles.relatedCard}>
								<Image source={relatedItem.image} style={styles.relatedImage} resizeMode="cover" />
								<Text style={styles.relatedCardTitle} numberOfLines={2}>{relatedItem.title}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

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
		height: 400,
	},
	mainImage: {
		width: '100%',
		height: '100%',
	},
	imageOverlay: {
		position: 'absolute',
		bottom: 16,
		left: 16,
		flexDirection: 'row',
		gap: 8,
	},
	overlayPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: 'rgba(17, 24, 39, 0.7)',
	},
	overlayText: {
		fontSize: 14,
		color: '#fff',
		fontWeight: '600',
	},
	actionBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	leftActions: {
		flexDirection: 'row',
		gap: 16,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	actionText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	saveButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: '#10B981',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 24,
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
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
	relatedSection: {
		padding: 16,
	},
	relatedTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 16,
	},
	relatedGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	relatedCard: {
		width: (width - 44) / 2,
		marginBottom: 16,
	},
	relatedImage: {
		width: '100%',
		height: 120,
		borderRadius: 16,
		marginBottom: 8,
	},
	relatedCardTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
		lineHeight: 18,
	},
});

export default DetailScreen;
