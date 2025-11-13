import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, FlatList, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, Plus, Heart, MessageCircle, MoreHorizontal } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface User {
	id: string;
	name: string;
	avatar?: any;
	isOnline?: boolean;
}

interface Post {
	id: string;
	userId: string;
	userName: string;
	userAvatar?: any;
	image: any;
	title: string;
	description: string;
	likes: number;
	comments: number;
	date: string;
}

const FeedScreen: React.FC = () => {
	const navigation = useNavigation();
	const { user } = useAuth();

	const users: User[] = [
		{ id: 'add', name: 'Add new' },
		{ id: '1', name: 'Henery', isOnline: true },
		{ id: '2', name: 'Anne L' },
		{ id: '3', name: 'Angelena', isOnline: true },
		{ id: '4', name: 'Sameer' },
		{ id: '5', name: 'John' },
		{ id: '6', name: 'Sarah', isOnline: true },
	];

	const posts: Post[] = [
		{
			id: '1',
			userId: '1',
			userName: 'Andrea Jane',
			image: require('../../../assets/hanoi.jpg'),
			title: 'I am growing and will grow like you do.',
			description: 'This photo captures the beauty of growth and nature...',
			likes: 1200,
			comments: 45,
			date: 'Dec 15, 2018',
		},
		{
			id: '2',
			userId: '2',
			userName: 'Sujane Milli',
			image: require('../../../assets/hoian.jpg'),
			title: 'Yes i love photography, and here is my new toy...',
			description: 'Capturing moments with my new camera...',
			likes: 850,
			comments: 32,
			date: 'Dec 15, 2018',
		},
		{
			id: '3',
			userId: '3',
			userName: 'Danny Gbrail',
			image: require('../../../assets/nhatrang.jpg'),
			title: 'You can find composition every where. Its on you how you...',
			description: 'Finding beauty in everyday moments...',
			likes: 2100,
			comments: 89,
			date: 'Dec 15, 2018',
		},
		{
			id: '4',
			userId: '4',
			userName: 'Angel L',
			image: require('../../../assets/sapa.jpg'),
			title: 'Less say big sometime and details gives you satisfaction...',
			description: 'Appreciating the small details in life...',
			likes: 650,
			comments: 28,
			date: 'Dec 14, 2018',
		},
		{
			id: '5',
			userId: '5',
			userName: 'John Doe',
			image: require('../../../assets/hue.jpg'),
			title: 'Exploring new places and cultures...',
			description: 'Travel photography is my passion...',
			likes: 980,
			comments: 56,
			date: 'Dec 13, 2018',
		},
		{
			id: '6',
			userId: '6',
			userName: 'Sarah Smith',
			image: require('../../../assets/himalaya_hotel.jpg'),
			title: 'Beautiful sunset views from my hotel...',
			description: 'The perfect end to a perfect day...',
			likes: 1500,
			comments: 72,
			date: 'Dec 12, 2018',
		},
	];

	const handleUserPress = (userId: string) => {
		if (userId === 'add') {
			// Handle add new story
			return;
		}
		(navigation as any).navigate('UserScreen', { userId });
	};

	const handlePostPress = (post: Post) => {
		(navigation as any).navigate('PostDetailScreen', { post });
	};

	const renderUserStory = ({ item }: { item: User }) => {
		if (item.id === 'add') {
			return (
				<TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
					<View style={[styles.storyAvatar, styles.addStoryAvatar]}>
						<Plus size={24} color="#50C878" />
					</View>
					<Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
				</TouchableOpacity>
			);
		}

		return (
			<TouchableOpacity 
				style={styles.storyItem} 
				activeOpacity={0.8}
				onPress={() => handleUserPress(item.id)}
			>
				<View style={styles.storyAvatarContainer}>
					<View style={styles.storyAvatar}>
						<Text style={styles.storyAvatarText}>
							{item.name.charAt(0).toUpperCase()}
						</Text>
					</View>
					{item.isOnline && <View style={styles.onlineIndicator} />}
				</View>
				<Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
			</TouchableOpacity>
		);
	};

	const renderPost = ({ item }: { item: Post }) => (
		<TouchableOpacity
			style={styles.postCard}
			activeOpacity={0.9}
			onPress={() => handlePostPress(item)}
		>
			<Image source={item.image} style={styles.postImage} resizeMode="cover" />
			<View style={styles.postContent}>
				<View style={styles.postInfo}>
					<TouchableOpacity 
						style={styles.postUserInfo}
						onPress={() => handleUserPress(item.userId)}
						activeOpacity={0.7}
					>
						<View style={styles.postUserAvatar}>
							<Text style={styles.postUserAvatarText}>
								{item.userName.charAt(0).toUpperCase()}
							</Text>
						</View>
						<View style={styles.postUserDetails}>
							<Text style={styles.postUserName}>{item.userName}</Text>
							<Text style={styles.postDate}>{item.date}</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity style={styles.postOptions}>
						<MoreHorizontal size={20} color="#6B7280" />
					</TouchableOpacity>
				</View>
				<Text style={styles.postTitle}>{item.title}</Text>
			</View>
		</TouchableOpacity>
	);

	const formatNumber = (num: number): string => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
		return num.toString();
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
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					activeOpacity={0.7}
				>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Explore</Text>
				<TouchableOpacity style={styles.searchButton}>
					<Search size={24} color="#111827" />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* User Stories */}
				<View style={styles.storiesContainer}>
					<FlatList
						data={users}
						renderItem={renderUserStory}
						keyExtractor={(item) => item.id}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.storiesContent}
					/>
				</View>

				{/* Feed List */}
				<View style={styles.feedContainer}>
					{posts.map((post) => (
						<View key={post.id}>
							{renderPost({ item: post })}
						</View>
					))}
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
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 16,
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
	searchButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	storiesContainer: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	storiesContent: {
		paddingHorizontal: 16,
		gap: 16,
	},
	storyItem: {
		alignItems: 'center',
		width: 70,
	},
	storyAvatarContainer: {
		position: 'relative',
	},
	storyAvatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#50C878',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	addStoryAvatar: {
		backgroundColor: '#F3F4F6',
		borderColor: '#E5E7EB',
	},
	storyAvatarText: {
		fontSize: 24,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	onlineIndicator: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: '#50C878',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	storyName: {
		fontSize: 12,
		color: '#111827',
		marginTop: 6,
		fontWeight: '500',
		textAlign: 'center',
	},
	feedContainer: {
		paddingTop: 16,
	},
	postCard: {
		width: width - 32,
		alignSelf: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 4,
	},
	postImage: {
		width: '100%',
		height: width * 0.75,
	},
	postContent: {
		padding: 16,
	},
	postInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	postUserInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	postUserAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#50C878',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	postUserAvatarText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	postUserDetails: {
		flex: 1,
	},
	postUserName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 2,
	},
	postDate: {
		fontSize: 13,
		color: '#6B7280',
		fontWeight: '400',
	},
	postOptions: {
		padding: 4,
	},
	postTitle: {
		fontSize: 15,
		color: '#111827',
		fontWeight: '400',
		lineHeight: 22,
	},
});

export default FeedScreen;

