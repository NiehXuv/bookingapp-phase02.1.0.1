import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Tag, MapPin, Calendar, Share2, CheckCircle } from 'lucide-react-native';
import { Promotion } from '../../mockdata/mockPromotions';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PromotionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { promotion } = route.params as { promotion: Promotion };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hotel':
        return '#3B82F6';
      case 'tour':
        return '#10B981';
      case 'restaurant':
        return '#EC4899';
      case 'activity':
        return '#F59E0B';
      default:
        return '#50C878';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      tour: 'Tour',
      restaurant: 'Restaurant',
      activity: 'Activity',
      general: 'General',
    };
    return labels[category] || category;
  };

  const handleBookNow = () => {
    // Navigate to booking or search screen based on category
    if (promotion.category === 'hotel') {
      (navigation as any).navigate('SearchHotelResult', { 
        city: promotion.location,
        promotionId: promotion.id 
      });
    } else if (promotion.category === 'tour') {
      (navigation as any).navigate('SearchTourResult', { 
        query: promotion.title,
        promotionId: promotion.id 
      });
    } else {
      (navigation as any).navigate('ExploreScreen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotion Details</Text>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Share2 size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Promotion Image */}
        <Image 
          source={promotion.image} 
          style={styles.promotionImage} 
          resizeMode="cover" 
        />

        {/* Discount Badge */}
        {promotion.discount && (
          <View style={styles.discountBadgeContainer}>
            <View style={[styles.discountBadge, { backgroundColor: getCategoryColor(promotion.category) }]}>
              <Tag size={20} color="#FFFFFF" />
              <Text style={styles.discountText}>{promotion.discount}</Text>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(promotion.category)}20` }]}>
            <Text style={[styles.categoryBadgeText, { color: getCategoryColor(promotion.category) }]}>
              {getCategoryLabel(promotion.category)} Promotion
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{promotion.title}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{promotion.subtitle}</Text>

          {/* Description */}
          <Text style={styles.description}>{promotion.description}</Text>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <MapPin size={20} color="#50C878" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Location</Text>
                <Text style={styles.infoCardValue}>{promotion.location}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Calendar size={20} color="#FF6B9D" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Valid Period</Text>
                <Text style={styles.infoCardValue}>
                  {new Date(promotion.validFrom).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })} - {new Date(promotion.validTo).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            {promotion.termsAndConditions.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <CheckCircle size={16} color="#50C878" />
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookNowContainer}>
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowGradient}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  promotionImage: {
    width: '100%',
    height: 250,
  },
  discountBadgeContainer: {
    position: 'absolute',
    top: 200,
    right: 16,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCards: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  termsSection: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bookNowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookNowButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookNowGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PromotionDetailScreen;

