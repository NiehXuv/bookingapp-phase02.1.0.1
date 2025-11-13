import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Crown, Award, Star, Gem, Medal, Check, ChevronRight } from 'lucide-react-native';
import { mockMembershipTiers, MembershipTier } from '../../mockdata/mockMemberships';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MembershipScreen = () => {
  const navigation = useNavigation();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const getTierIcon = (level: MembershipTier['level']) => {
    switch (level) {
      case 'Bronze':
        return <Medal size={24} color="#CD7F32" />;
      case 'Silver':
        return <Award size={24} color="#C0C0C0" />;
      case 'Gold':
        return <Star size={24} color="#FFD700" />;
      case 'Platinum':
        return <Crown size={24} color="#E5E4E2" />;
      case 'Diamond':
        return <Gem size={24} color="#B9F2FF" />;
      default:
        return <Medal size={24} color="#CD7F32" />;
    }
  };

  const handleTierPress = (tier: MembershipTier) => {
    (navigation as any).navigate('MembershipDetailScreen', { tier });
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
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Choose Your Membership</Text>
          <Text style={styles.heroSubtitle}>
            Unlock exclusive benefits, discounts, and rewards with our membership tiers
          </Text>
        </View>

        {/* Membership Tiers */}
        <View style={styles.tiersContainer}>
          {mockMembershipTiers.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                tier.popular && styles.popularTierCard,
                selectedTier === tier.id && styles.selectedTierCard
              ]}
              activeOpacity={0.9}
              onPress={() => handleTierPress(tier)}
            >
              {tier.popular && (
                <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}
              
              <View style={styles.tierHeader}>
                <View style={[styles.tierIconContainer, { backgroundColor: `${tier.color}20` }]}>
                  {getTierIcon(tier.level)}
                </View>
                <View style={styles.tierHeaderText}>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                  <Text style={styles.tierLevel}>{tier.level}</Text>
                </View>
              </View>

              <Text style={styles.tierDescription}>{tier.description}</Text>

              <View style={styles.tierPricing}>
                {tier.price === 0 ? (
                  <Text style={styles.freePrice}>FREE</Text>
                ) : (
                  <>
                    <Text style={styles.tierPrice}>
                      {tier.price.toLocaleString()} {tier.currency}
                    </Text>
                    <Text style={styles.tierDuration}>/ {tier.duration} months</Text>
                  </>
                )}
              </View>

              <View style={styles.tierHighlights}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightValue}>{tier.discount}%</Text>
                  <Text style={styles.highlightLabel}>Discount</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightValue}>{tier.pointsMultiplier}x</Text>
                  <Text style={styles.highlightLabel}>Points</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightValue}>{tier.benefits.length}</Text>
                  <Text style={styles.highlightLabel}>Benefits</Text>
                </View>
              </View>

              <View style={styles.benefitsPreview}>
                {tier.benefits.slice(0, 3).map((benefit, index) => (
                  <View key={index} style={styles.benefitPreviewItem}>
                    <Check size={14} color={tier.color} />
                    <Text style={styles.benefitPreviewText} numberOfLines={1}>{benefit}</Text>
                  </View>
                ))}
                {tier.benefits.length > 3 && (
                  <Text style={styles.moreBenefitsText}>
                    +{tier.benefits.length - 3} more benefits
                  </Text>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.viewDetailsButton, { borderColor: tier.color }]}
                onPress={() => handleTierPress(tier)}
              >
                <Text style={[styles.viewDetailsText, { color: tier.color }]}>
                  View Details
                </Text>
                <ChevronRight size={16} color={tier.color} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Overview */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Membership Benefits</Text>
          <TouchableOpacity 
            style={styles.viewAllBenefitsButton}
            onPress={() => (navigation as any).navigate('MembershipBenefitsScreen')}
          >
            <Text style={styles.viewAllBenefitsText}>View All Benefits</Text>
            <ChevronRight size={16} color="#50C878" />
          </TouchableOpacity>
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  tiersContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularTierCard: {
    borderColor: '#50C878',
    borderWidth: 3,
  },
  selectedTierCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tierIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierHeaderText: {
    flex: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierLevel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tierPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  freePrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  tierDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tierHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  highlightDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  benefitsPreview: {
    marginBottom: 16,
    gap: 8,
  },
  benefitPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitPreviewText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  moreBenefitsText: {
    fontSize: 13,
    color: '#50C878',
    fontWeight: '600',
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  viewAllBenefitsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#50C878',
    gap: 8,
  },
  viewAllBenefitsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#50C878',
  },
});

export default MembershipScreen;

