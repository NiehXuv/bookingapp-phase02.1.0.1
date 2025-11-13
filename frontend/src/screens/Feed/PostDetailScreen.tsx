import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

const PostDetailScreen: React.FC = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { post } = route.params as { post: Post };
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likes);

	const handleLike = () => {
		setIsLiked(!isLiked);
		setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
	};

	const handleUserPress = () => {
		(navigation as any).navigate('UserScreen', { userId: post.userId });
	};

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
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Post</Text>
				<TouchableOpacity style={styles.optionsButton}>
					<MoreHorizontal size={24} color="#111827" />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Post Image */}
				<Image source={post.image} style={styles.postImage} resizeMode="cover" />

				{/* Post Content */}
				<View style={styles.postContent}>
					{/* User Info */}
					<TouchableOpacity 
						style={styles.userInfo}
						onPress={handleUserPress}
						activeOpacity={0.7}
					>
						<View style={styles.userAvatar}>
							<Text style={styles.userAvatarText}>
								{post.userName.charAt(0).toUpperCase()}
							</Text>
						</View>
						<View style={styles.userDetails}>
							<View style={styles.userNameRow}>
								<Text style={styles.userName}>{post.userName}</Text>
								<CheckCircle2 size={16} color="#50C878" fill="#50C878" />
							</View>
							<Text style={styles.postDate}>{post.date}</Text>
						</View>
					</TouchableOpacity>

					{/* Post Title */}
					<Text style={styles.postTitle}>{post.title}</Text>

					{/* Post Description */}
					<Text style={styles.postDescription}>{post.description}</Text>

					{/* Actions */}
					<View style={styles.actionsRow}>
						<TouchableOpacity 
							style={styles.actionButton}
							onPress={handleLike}
							activeOpacity={0.7}
						>
							<Heart 
								size={24} 
								color={isLiked ? "#FF6B9D" : "#6B7280"} 
								fill={isLiked ? "#FF6B9D" : "none"} 
							/>
							<Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
								{formatNumber(likesCount)}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
							<MessageCircle size={24} color="#6B7280" />
							<Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
							<Share2 size={24} color="#6B7280" />
							<Text style={styles.actionText}>Share</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Comments Section */}
				<View style={styles.commentsSection}>
					<Text style={styles.commentsTitle}>Comments ({post.comments})</Text>
					<View style={styles.commentItem}>
						<View style={styles.commentAvatar}>
							<Text style={styles.commentAvatarText}>J</Text>
						</View>
						<View style={styles.commentContent}>
							<Text style={styles.commentAuthor}>John Doe</Text>
							<Text style={styles.commentText}>Amazing photo! Love the composition.</Text>
						</View>
					</View>
					<View style={styles.commentItem}>
						<View style={styles.commentAvatar}>
							<Text style={styles.commentAvatarText}>S</Text>
						</View>
						<View style={styles.commentContent}>
							<Text style={styles.commentAuthor}>Sarah Smith</Text>
							<Text style={styles.commentText}>Beautiful work! Keep it up.</Text>
						</View>
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
		paddingTop: 50,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
	},
	optionsButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	postImage: {
		width: '100%',
		height: width,
	},
	postContent: {
		padding: 16,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	userAvatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#50C878',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	userAvatarText: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	userDetails: {
		flex: 1,
	},
	userNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	userName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#111827',
	},
	postDate: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 2,
	},
	postTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 12,
		lineHeight: 28,
	},
	postDescription: {
		fontSize: 16,
		color: '#6B7280',
		lineHeight: 24,
		marginBottom: 20,
	},
	actionsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 24,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: '#F3F4F6',
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	actionText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6B7280',
	},
	actionTextLiked: {
		color: '#FF6B9D',
	},
	commentsSection: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: '#F3F4F6',
	},
	commentsTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 16,
	},
	commentItem: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	commentAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#50C878',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	commentAvatarText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	commentContent: {
		flex: 1,
	},
	commentAuthor: {
		fontSize: 14,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 4,
	},
	commentText: {
		fontSize: 14,
		color: '#6B7280',
		lineHeight: 20,
	},
});

export default PostDetailScreen;

