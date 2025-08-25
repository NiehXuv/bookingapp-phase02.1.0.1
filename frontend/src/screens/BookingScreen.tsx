import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import bookingService, { BookingData } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const { width: sw, height: sh } = Dimensions.get('window');

interface BookingScreenProps {
  route: {
    params: {
      type: 'hotel' | 'tour' | 'transport' | 'restaurant';
      itemId: string;
      itemName: string;
      itemImage?: string;
      price: number;
      currency?: string;
      additionalData?: any;
    };
  };
  navigation: any;
}

const BookingScreen: React.FC<BookingScreenProps> = ({ route, navigation }) => {
  const { type, itemId, itemName, itemImage, price, currency = 'VND', additionalData } = route.params;
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<BookingData>>({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Booking - ${itemName}`,
    description: `Booking for ${itemName}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: type,
    guestsNumber: 1,
    details: {
      price: price,
      currency: currency,
      [type === 'hotel' ? 'hotelId' : type === 'tour' ? 'tourId' : 'transportId']: itemId,
      ...additionalData,
    },
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({
      title: `Book ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      headerBackTitle: 'Back',
    });
  }, [navigation, type]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      setFormData(prev => ({
        ...prev,
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Please log in to make a booking');
      setShowErrorModal(true);
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.guestsNumber) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const bookingData: BookingData = {
        title: formData.title!,
        description: formData.description!,
        date: formData.date!,
        time: formData.time!,
        type: formData.type!,
        guestsNumber: formData.guestsNumber!,
        details: formData.details!,
      };

      const result = await bookingService.createBooking(bookingData);
      
      setSuccessMessage(`Your ${type} booking has been created successfully!`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Booking error:', error);
      setErrorMessage('Failed to create booking. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'hotel':
        return 'hotel';
      case 'tour':
        return 'explore';
      case 'transport':
        return 'directions-car';
      case 'restaurant':
        return 'restaurant';
      default:
        return 'place';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'hotel':
        return '#3B82F6';
      case 'tour':
        return '#10B981';
      case 'transport':
        return '#F59E0B';
      case 'restaurant':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#FFF5F5', '#FFE5F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.typeIconContainer}
              >
                <MaterialIcons name={getTypeIcon() as any} size={28} color={getTypeColor()} />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <View style={styles.typeRow}>
                  <Text style={styles.itemType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Available</Text>
                  </View>
                </View>
                <Text style={styles.itemName} numberOfLines={2}>{itemName}</Text>
              </View>
            </View>
            {itemImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: itemImage }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.imageOverlay} />
              </View>
            )}
          </View>
          
          {/* Quick Info Bar */}
          <View style={styles.quickInfoBar}>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={16} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1}>Flexible Booking</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Feather name="shield" size={16} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1}>Save Payment</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Feather name="clock" size={16} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1}>Instant Confirmation</Text>
            </View>
          </View>
        </View>

        {/* Price Display */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>
            {currency} {price.toLocaleString()}
          </Text>
        </View>

        {/* Booking Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Booking Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter booking title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter booking description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Guest Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Guests</Text>
            <View style={styles.guestNumberContainer}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => {
                  const current = formData.guestsNumber || 1;
                  if (current > 1) {
                    handleInputChange('guestsNumber', current - 1);
                  }
                }}
              >
                <Feather name="minus" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.guestNumber}>{formData.guestsNumber || 1}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => {
                  const current = formData.guestsNumber || 1;
                  handleInputChange('guestsNumber', current + 1);
                }}
              >
                <Feather name="plus" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                {formData.date || 'Select Date'}
              </Text>
              <Feather name="calendar" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                {formData.time || 'Select Time'}
              </Text>
              <Feather name="clock" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Additional Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Any special requests or notes?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By proceeding with this booking, you agree to our terms and conditions.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Feather name="check-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Confirm Booking</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successIconGradient}
              >
                <Feather name="check" size={32} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>OK</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Profile');
                }}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#FF8E53']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonPrimaryGradient}
                >
                  <Text style={styles.modalButtonPrimaryText}>View Bookings</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.errorIconGradient}
              >
                <Feather name="alert-circle" size={32} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={() => setShowErrorModal(false)}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButtonPrimaryGradient}
              >
                <Text style={styles.modalButtonPrimaryText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0, // Prevents text overflow
  },
  imageContainer: {
    position: 'relative',
    marginLeft: 8,
    flexShrink: 0, // Prevents image from shrinking
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
  },
  quickInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    flexShrink: 1,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: -0.2,
    lineHeight: 22,
    flexShrink: 1,
  },
  itemType: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  priceSection: {
    backgroundColor: 'white',
    padding: 24,
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
  },
  formSection: {
    backgroundColor: 'white',
    padding: 24,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  guestNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guestNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  termsSection: {
    padding: 24,
    marginTop: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  submitSection: {
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalButtonPrimaryGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingScreen;
