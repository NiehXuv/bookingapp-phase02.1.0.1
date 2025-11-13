import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Percent, Star, Phone, Bell, RotateCw, Shield, Coffee, Home } from 'lucide-react-native';
import { mockMembershipBenefits, MembershipBenefit } from '../../mockdata/mockMemberships';

const { width } = Dimensions.get('window');

const MembershipBenefitsScreen = () => {
  const navigation = useNavigation();

  const getBenefitIcon = (icon: string) => {
    switch (icon) {
      case 'percent':
        return <Percent size={24} color="#50C878" />;
      case 'star':
        return <Star size={24} color="#FFD700" />;
      case 'headphones':
        return <Phone size={24} color="#3B82F6" />;
      case 'bell':
        return <Bell size={24} color="#EC4899" />;
      case 'refresh-cw':
        return <RotateCw size={24} color="#10B981" />;
      case 'shield':
        return <Shield size={24} color="#F59E0B" />;
      case 'coffee':
        return <Coffee size={24} color="#8B5CF6" />;
      case 'home':
        return <Home size={24} color="#EF4444" />;
      default:
        return <Star size={24} color="#50C878" />;
    }
  };

  const getCategoryColor = (category: MembershipBenefit['category']) => {
    switch (category) {
      case 'discount':
        return '#50C878';
      case 'points':
        return '#FFD700';
      case 'support':
        return '#3B82F6';
      case 'access':
        return '#EC4899';
      case 'exclusive':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const benefitsByCategory = mockMembershipBenefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, MembershipBenefit[]>);

  const categoryLabels: Record<string, string> = {
    discount: 'Discounts & Savings',
    points: 'Points & Rewards',
    support: 'Customer Support',
    access: 'Early Access',
    exclusive: 'Exclusive Perks',
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
        <Text style={styles.headerTitle}>Membership Benefits</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>All Membership Benefits</Text>
          <Text style={styles.heroSubtitle}>
            Discover all the amazing benefits available across our membership tiers
          </Text>
        </View>

        {/* Benefits by Category */}
        {Object.entries(benefitsByCategory).map(([category, benefits]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIconContainer, { backgroundColor: `${getCategoryColor(category)}20` }]}>
                {getBenefitIcon(benefits[0].icon)}
              </View>
              <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>
                {categoryLabels[category] || category}
              </Text>
            </View>

            <View style={styles.benefitsList}>
              {benefits.map((benefit) => (
                <View key={benefit.id} style={styles.benefitCard}>
                  <View style={[styles.benefitIconContainer, { backgroundColor: `${getCategoryColor(category)}20` }]}>
                    {getBenefitIcon(benefit.icon)}
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Unlock These Benefits?</Text>
          <Text style={styles.ctaSubtitle}>
            Choose a membership tier that fits your travel style
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>View Membership Tiers</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
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
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  benefitsList: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ctaSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#50C878',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MembershipBenefitsScreen;

