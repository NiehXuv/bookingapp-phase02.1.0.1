import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, FlatList, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Grid3x3, Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 16 padding on each side + 16 gap between photos

interface User {
	id: string;
	name: string;
	bio: string;
	avatar?: any;
	isVerified?: boolean;
	photos: number;
	followers: number;
	following: number;
}

interface Photo {
	id: string;
	image: any;
}

interface Video {
	id: string;
	thumbnail: any;
	duration: string;
}

const UserScreen: React.FC = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { userId } = route.params as { userId: string };

	const [user] = useState<User>({
		id: userId,
		name: 'Anne L',
		bio: 'I am a professional photographer. Food photography is something which is really passionate me.',
		isVerified: true,
		photos: 356,
		followers: 860,
		following: 1200,
	});

	const photos: Photo[] = [
		{ id: '1', image: require('../../../assets/hanoi.jpg') },
		{ id: '2', image: require('../../../assets/hoian.jpg') },
		{ id: '3', image: require('../../../assets/nhatrang.jpg') },
		{ id: '4', image: require('../../../assets/sapa.jpg') },
		{ id: '5', image: require('../../../assets/hue.jpg') },
		{ id: '6', image: require('../../../assets/himalaya_hotel.jpg') },
		{ id: '7', image: require('../../../assets/sunset_hotel.jpg') },
		{ id: '8', image: require('../../../assets/hanoi.jpg') },
		{ id: '9', image: require('../../../assets/hoian.jpg') },
	];

	const videos: Video[] = [
		{ id: '1', thumbnail: require('../../../assets/nhatrang.jpg'), duration: '2:30' },
		{ id: '2', thumbnail: require('../../../assets/sapa.jpg'), duration: '1:45' },
		{ id: '3', thumbnail: require('../../../assets/hue.jpg'), duration: '3:15' },
		{ id: '4', thumbnail: require('../../../assets/himalaya_hotel.jpg'), duration: '4:20' },
	];

	const formatNumber = (num: number): string => {
		if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
		return num.toString();
	};

	const renderPhoto = ({ item }: { item: Photo }) => (
		<TouchableOpacity style={styles.photoItem} activeOpacity={0.9}>
			<Image source={item.image} style={styles.photoImage} resizeMode="cover" />
		</TouchableOpacity>
	);

	const renderVideo = ({ item }: { item: Video }) => (
		<TouchableOpacity style={styles.videoItem} activeOpacity={0.9}>
			<Image source={item.thumbnail} style={styles.videoThumbnail} resizeMode="cover" />
			<View style={styles.videoOverlay}>
				<Play size={24} color="#FFFFFF" fill="#FFFFFF" />
			</View>
			<View style={styles.videoDuration}>
				<Text style={styles.videoDurationText}>{item.duration}</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<ImageBackground 
			source={require('../../../assets/background.png')} 
			style={styles.backgroundImage}
			resizeMode="cover"
		>
			<View style={styles.container}>
				{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Profile Section */}
				<View style={styles.profileSection}>
					<View style={styles.avatarContainer}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{user.name.charAt(0).toUpperCase()}
							</Text>
						</View>
					</View>
					<View style={styles.nameContainer}>
						<Text style={styles.userName}>{user.name}</Text>
						{user.isVerified && (
							<CheckCircle2 size={20} color="#50C878" fill="#50C878" />
						)}
					</View>
					<Text style={styles.bio}>{user.bio}</Text>
				</View>

				{/* Stats Section */}
				<View style={styles.statsSection}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{formatNumber(user.photos)}</Text>
						<Text style={styles.statLabel}>Photos</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{formatNumber(user.followers)}</Text>
						<Text style={styles.statLabel}>Followers</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{formatNumber(user.following)}</Text>
						<Text style={styles.statLabel}>Following</Text>
					</View>
				</View>

				{/* Photos Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Photos</Text>
						<TouchableOpacity>
							<Text style={styles.viewAllText}>View All</Text>
						</TouchableOpacity>
					</View>
					<FlatList
						data={photos}
						renderItem={renderPhoto}
						keyExtractor={(item) => item.id}
						numColumns={3}
						scrollEnabled={false}
						contentContainerStyle={styles.photosGrid}
						columnWrapperStyle={styles.photosRow}
					/>
				</View>

				{/* Videos Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Videos</Text>
						<TouchableOpacity>
							<Text style={styles.viewAllText}>View All</Text>
						</TouchableOpacity>
					</View>
					<FlatList
						data={videos}
						renderItem={renderVideo}
						keyExtractor={(item) => item.id}
						numColumns={3}
						scrollEnabled={false}
						contentContainerStyle={styles.videosGrid}
						columnWrapperStyle={styles.videosRow}
					/>
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
		paddingTop: 50,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileSection: {
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	avatarContainer: {
		marginBottom: 16,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#50C878',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: {
		fontSize: 40,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	nameContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	userName: {
		fontSize: 24,
		fontWeight: '700',
		color: '#111827',
	},
	bio: {
		fontSize: 14,
		color: '#6B7280',
		textAlign: 'center',
		lineHeight: 20,
		paddingHorizontal: 20,
	},
	statsSection: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 24,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#F3F4F6',
		marginHorizontal: 16,
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '500',
	},
	section: {
		paddingTop: 24,
		paddingHorizontal: 16,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
	},
	viewAllText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#50C878',
	},
	photosGrid: {
		paddingBottom: 16,
	},
	photosRow: {
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	photoItem: {
		width: PHOTO_SIZE,
		height: PHOTO_SIZE,
		borderRadius: 8,
		overflow: 'hidden',
	},
	photoImage: {
		width: '100%',
		height: '100%',
	},
	videosGrid: {
		paddingBottom: 16,
	},
	videosRow: {
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	videoItem: {
		width: PHOTO_SIZE,
		height: PHOTO_SIZE,
		borderRadius: 8,
		overflow: 'hidden',
		position: 'relative',
	},
	videoThumbnail: {
		width: '100%',
		height: '100%',
	},
	videoOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoDuration: {
		position: 'absolute',
		bottom: 8,
		right: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	videoDurationText: {
		fontSize: 10,
		fontWeight: '600',
		color: '#FFFFFF',
	},
});

export default UserScreen;

