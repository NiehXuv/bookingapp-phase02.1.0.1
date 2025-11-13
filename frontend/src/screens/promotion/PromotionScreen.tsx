import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Tag, MapPin, Calendar } from 'lucide-react-native';
import { mockPromotions, Promotion } from '../../mockdata/mockPromotions';

const { width } = Dimensions.get('window');

const categories: (Promotion['category'] | 'all')[] = ['all', 'hotel', 'tour', 'restaurant', 'activity', 'general'];

const PromotionScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | Promotion['category']>('all');

  const filteredPromotions = selectedCategory === 'all'
    ? mockPromotions
    : mockPromotions.filter(promo => promo.category === selectedCategory);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'All',
      hotel: 'Hotels',
      tour: 'Tours',
      restaurant: 'Restaurants',
      activity: 'Activities',
      general: 'General',
    };
    return labels[category] || category;
  };

  const handlePromotionPress = (promotion: Promotion) => {
    (navigation as any).navigate('PromotionDetailScreen', { promotion });
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
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton, 
                selectedCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Promotions List */}
      <ScrollView 
        contentContainerStyle={styles.promotionsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredPromotions.map((promotion) => (
          <TouchableOpacity
            key={promotion.id}
            style={styles.promotionCard}
            activeOpacity={0.9}
            onPress={() => handlePromotionPress(promotion)}
          >
            <Image 
              source={promotion.image} 
              style={styles.promotionImage} 
              resizeMode="cover" 
            />
            <View style={styles.promotionOverlay}>
              {promotion.discount && (
                <View style={styles.discountBadge}>
                  <Tag size={16} color="#FFFFFF" />
                  <Text style={styles.discountText}>{promotion.discount}</Text>
                </View>
              )}
            </View>
            <View style={styles.promotionContent}>
              <Text style={styles.promotionTitle} numberOfLines={2}>{promotion.title}</Text>
              <Text style={styles.promotionSubtitle}>{promotion.subtitle}</Text>
              <View style={styles.promotionInfo}>
                <View style={styles.infoItem}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{promotion.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {new Date(promotion.validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(promotion.validTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 8,
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
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
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
  promotionsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  promotionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionImage: {
    width: '100%',
    height: 200,
  },
  promotionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promotionContent: {
    padding: 16,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 24,
  },
  promotionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  promotionInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
});

export default PromotionScreen;

