import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { ArrowLeft, Plane, Clock, Target, Star, Calendar, Users, MapPin, Phone, Globe } from 'lucide-react-native';

const { width: sw, height: sh } = Dimensions.get('window');

interface TransportDetailScreenProps {
  route: {
    params: {
      transportData: any;
      searchParams: any;
    };
  };
  navigation: any;
}

const TransportDetailScreen: React.FC<TransportDetailScreenProps> = ({ route, navigation }) => {
  const { transportData, searchParams } = route.params;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleBack = () => navigation.goBack();

  const handleBooking = () => {
    Alert.alert(
      'Booking',
      'Booking functionality will be implemented soon. For now, you can contact the transport provider directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Provider', onPress: contactProvider }
      ]
    );
  };

  const contactProvider = () => {
    Alert.alert(
      'Contact Provider',
      'Contact information will be available when booking is implemented.',
      [{ text: 'OK' }]
    );
  };

  const openWebsite = () => {
    Alert.alert(
      'Website',
      'Website information will be available when booking is implemented.',
      [{ text: 'OK' }]
    );
  };

  const getDirections = () => {
    // Open Google Maps with departure/arrival locations
    const departureCoords = searchParams.departureCoords || '21.0285,105.8542'; // Default to Hanoi
    const arrivalCoords = searchParams.arrivalCoords || '16.0544,108.2022'; // Default to Da Nang
    
    const url = `https://www.google.com/maps/dir/${departureCoords}/${arrivalCoords}`;
    Linking.openURL(url);
  };

  const formatDuration = (duration: string) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+)H(\d+)?M?/);
    if (match) {
      const hours = match[1];
      const minutes = match[2] || '0';
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  const getTransportIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return <Plane size={24} color="#4CBC71" />;
      case 'bus':
        return <Target size={24} color="#4CBC71" />;
      case 'train':
        return <Clock size={24} color="#4CBC71" />;
      case 'car':
        return <MapPin size={24} color="#4CBC71" />;
      case 'motorbike':
        return <Target size={24} color="#4CBC71" />;
      case 'boat':
        return <Globe size={24} color="#4CBC71" />;
      default:
        return <Plane size={24} color="#4CBC71" />;
    }
  };

  const getTransportTypeName = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return 'Flight';
      case 'bus':
        return 'Bus';
      case 'train':
        return 'Train';
      case 'car':
        return 'Car Rental';
      case 'motorbike':
        return 'Motorbike Rental';
      case 'boat':
        return 'Boat';
      default:
        return 'Transport';
    }
  };

  if (!transportData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No transport data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTransportTypeName(searchParams?.transportType)} Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transport Card */}
        <View style={styles.transportCard}>
          {/* Transport Header */}
          <View style={styles.transportHeader}>
            <View style={styles.transportIcon}>
              {getTransportIcon(searchParams?.transportType)}
            </View>
            <View style={styles.transportInfo}>
              <Text style={styles.transportType}>{getTransportTypeName(searchParams?.transportType)}</Text>
              <Text style={styles.transportProvider}>{transportData.airline || 'Transport Provider'}</Text>
            </View>
            <View style={styles.transportClass}>
              <Text style={styles.transportClassText}>{transportData.flightClass || 'Standard'}</Text>
            </View>
          </View>

          {/* Route Information */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>Route</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTime}>{transportData.departure?.time || '--:--'}</Text>
                <Text style={styles.routeLocation}>{transportData.departure?.city || searchParams?.from || 'Departure'}</Text>
                <Text style={styles.routeCode}>{transportData.departure?.airport || searchParams?.from}</Text>
              </View>
              
              <View style={styles.routeArrow}>
                <Plane size={20} color="#4CBC71" />
                <Text style={styles.routeDuration}>{formatDuration(transportData.duration || 'PT1H30M')}</Text>
              </View>
              
              <View style={styles.routeInfo}>
                <Text style={styles.routeTime}>{transportData.arrival?.time || '--:--'}</Text>
                <Text style={styles.routeLocation}>{transportData.arrival?.city || searchParams?.to || 'Arrival'}</Text>
                <Text style={styles.routeCode}>{transportData.arrival?.airport || searchParams?.to}</Text>
              </View>
            </View>
          </View>

          {/* Transport Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{formatDuration(transportData.duration || 'PT1H30M')}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Target size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Stops</Text>
                <Text style={styles.detailValue}>
                  {transportData.isDirect ? 'Direct' : `${transportData.stops || 0} stop${(transportData.stops || 0) > 1 ? 's' : ''}`}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{searchParams?.departureDate || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Users size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Passengers</Text>
                <Text style={styles.detailValue}>
                  {searchParams?.adults || 1} adult{(searchParams?.adults || 1) > 1 ? 's' : ''}
                  {searchParams?.children && searchParams.children > 0 ? `, ${searchParams.children} child${searchParams.children > 1 ? 'ren' : ''}` : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingContainer}>
              <View style={styles.priceInfo}>
                <Text style={styles.originalPrice}>{transportData.originalPrice || '$0'}</Text>
                <Text style={styles.discountedPrice}>{transportData.discountedPrice || '$0'}</Text>
                <Text style={styles.pricePerPerson}>per person</Text>
              </View>
              <View style={styles.totalPrice}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  ${Math.round(parseFloat(transportData.discountedPrice?.replace('$', '') || '0') * (searchParams?.adults || 1))}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalItems}>
              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>Baggage Allowance</Text>
                <Text style={styles.additionalValue}>7kg carry-on + 20kg checked</Text>
              </View>
              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>Cancellation Policy</Text>
                <Text style={styles.additionalValue}>Free cancellation up to 24h before departure</Text>
              </View>
              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>Change Policy</Text>
                <Text style={styles.additionalValue}>Changes allowed with fee</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBooking}>
            <Text style={styles.primaryButtonText}>Book Now</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={getDirections}>
              <MapPin size={16} color="#4CBC71" />
              <Text style={styles.secondaryButtonText}>Get Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={contactProvider}>
              <Phone size={16} color="#4CBC71" />
              <Text style={styles.secondaryButtonText}>Contact</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={openWebsite}>
              <Globe size={16} color="#4CBC71" />
              <Text style={styles.secondaryButtonText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  transportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transportInfo: {
    flex: 1,
  },
  transportType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  transportProvider: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  transportClass: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  transportClassText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  routeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeInfo: {
    alignItems: 'center',
    flex: 1,
  },
  routeTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  routeLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  routeCode: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  routeArrow: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  routeDuration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInfo: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
    marginBottom: 4,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  pricePerPerson: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  totalPrice: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  additionalSection: {
    marginBottom: 24,
  },
  additionalItems: {
    gap: 12,
  },
  additionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  additionalValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  actionSection: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4CBC71',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '30%',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#4CBC71',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CBC71',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransportDetailScreen;
