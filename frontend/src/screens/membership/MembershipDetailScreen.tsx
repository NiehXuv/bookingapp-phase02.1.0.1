import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Crown, Award, Star, Gem, Medal, Check, Share2 } from 'lucide-react-native';
import { MembershipTier } from '../../mockdata/mockMemberships';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MembershipDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tier } = route.params as { tier: MembershipTier };

  const getTierIcon = (level: MembershipTier['level']) => {
    switch (level) {
      case 'Bronze':
        return <Medal size={32} color="#CD7F32" />;
      case 'Silver':
        return <Award size={32} color="#C0C0C0" />;
      case 'Gold':
        return <Star size={32} color="#FFD700" />;
      case 'Platinum':
        return <Crown size={32} color="#E5E4E2" />;
      case 'Diamond':
        return <Gem size={32} color="#B9F2FF" />;
      default:
        return <Medal size={32} color="#CD7F32" />;
    }
  };

  const handleSubscribe = () => {
    Alert.alert(
      'Subscribe to Membership',
      `Would you like to subscribe to ${tier.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: () => {
            Alert.alert('Success', 'Membership subscription will be processed. This feature will be implemented soon.');
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Membership Details</Text>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Share2 size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tier Header Card */}
        <View style={[styles.tierHeaderCard, { borderColor: tier.color }]}>
          <View style={[styles.tierIconContainer, { backgroundColor: `${tier.color}20` }]}>
            {getTierIcon(tier.level)}
          </View>
          <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
          <Text style={styles.tierLevel}>{tier.level} Membership</Text>
          {tier.popular && (
            <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
              <Text style={styles.popularBadgeText}>POPULAR CHOICE</Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Membership Pricing</Text>
          {tier.price === 0 ? (
            <Text style={styles.freePrice}>FREE</Text>
          ) : (
            <View style={styles.pricingRow}>
              <Text style={styles.price}>
                {tier.price.toLocaleString()} {tier.currency}
              </Text>
              <Text style={styles.duration}>per {tier.duration} months</Text>
            </View>
          )}
          <Text style={styles.pricingNote}>
            {tier.price === 0 
              ? 'Lifetime membership with no recurring fees'
              : 'Auto-renewal available. Cancel anytime.'}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>About This Membership</Text>
          <Text style={styles.description}>{tier.description}</Text>
        </View>

        {/* Key Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.cardTitle}>Key Benefits</Text>
          <View style={styles.benefitsList}>
            {tier.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.checkIcon, { backgroundColor: `${tier.color}20` }]}>
                  <Check size={18} color={tier.color} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Membership Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureValue}>{tier.discount}%</Text>
              <Text style={styles.featureLabel}>Discount</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureValue}>{tier.pointsMultiplier}x</Text>
              <Text style={styles.featureLabel}>Points Multiplier</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureValue}>
                {tier.prioritySupport ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.featureLabel}>Priority Support</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureValue}>{tier.benefits.length}</Text>
              <Text style={styles.featureLabel}>Total Benefits</Text>
            </View>
          </View>
        </View>

        {/* Exclusive Access */}
        {tier.exclusiveAccess.length > 0 && (
          <View style={styles.exclusiveCard}>
            <Text style={styles.cardTitle}>Exclusive Access</Text>
            <View style={styles.exclusiveList}>
              {tier.exclusiveAccess.map((access, index) => (
                <View key={index} style={styles.exclusiveItem}>
                  <Crown size={16} color={tier.color} />
                  <Text style={styles.exclusiveText}>{access}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={tier.price === 0 
              ? ['#10B981', '#059669']
              : [tier.color, tier.color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeText}>
              {tier.price === 0 ? 'Activate Free Membership' : `Subscribe - ${tier.price.toLocaleString()} ${tier.currency}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tierHeaderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tierIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  tierLevel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  popularBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  freePrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
  },
  duration: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  pricingNote: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  featureItem: {
    width: (width - 64) / 2 - 5, // Account for padding and gap
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  featureValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  exclusiveCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  exclusiveList: {
    gap: 12,
  },
  exclusiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  exclusiveText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  subscribeContainer: {
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
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MembershipDetailScreen;

