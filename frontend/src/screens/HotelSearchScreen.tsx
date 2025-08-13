import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Calendar, Minus, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const HotelSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const handleBackClick = () => {
    navigation.goBack();
  };

  const handleSearchClick = () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    
    if (checkInDate >= checkOutDate) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    (navigation as any).navigate('SearchHotelResult', {
      city: location,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      adults: adults,
      children: children,
    });
  };

  const onCheckInDateChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckInDate(selectedDate);
      // If check-out date is before check-in date, update it
      if (checkOutDate <= selectedDate) {
        const newCheckOutDate = new Date(selectedDate);
        newCheckOutDate.setDate(newCheckOutDate.getDate() + 1);
        setCheckOutDate(newCheckOutDate);
      }
    }
  };

  const onCheckOutDateChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Background Blur Blob */}
      <View style={styles.backgroundBlob} />

      {/* Main Glass Card */}
      <View style={styles.mainCard}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackClick}>
            <ArrowLeft size={20} color="#4CBC71" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hotel Search</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Form */}
        <View style={styles.searchForm}>
          {/* Location Input */}
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#4CBC71" />
            <TextInput
              style={styles.textInput}
              placeholder="Choose Your Location"
              placeholderTextColor="#A0A0A0"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Date Inputs */}
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text style={[styles.dateLabel, { color: checkInDate ? '#6B6F7E' : '#A0A0A0' }]}>
                {checkInDate ? formatDate(checkInDate) : 'Check-in Date'}
              </Text>
              <Calendar size={20} color="#4CBC71" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text style={[styles.dateLabel, { color: checkOutDate ? '#6B6F7E' : '#A0A0A0' }]}>
                {checkOutDate ? formatDate(checkOutDate) : 'Check-out Date'}
              </Text>
              <Calendar size={20} color="#4CBC71" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Guest Selection */}
          <View style={styles.guestSection}>
            {/* Adults */}
            <View style={styles.guestRow}>
              <View style={styles.guestInfo}>
                <Text style={styles.guestTitle}>Adults</Text>
                <Text style={styles.guestSubtitle}>12+</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setAdults(Math.max(1, adults - 1))}
                >
                  <Minus size={15} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{adults}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setAdults(adults + 1)}
                >
                  <Plus size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.guestRow}>
              <View style={styles.guestInfo}>
                <Text style={styles.guestTitle}>Children</Text>
                <Text style={styles.guestSubtitle}>Under 12</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setChildren(Math.max(0, children - 1))}
                >
                  <Minus size={15} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{children}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={() => setChildren(children + 1)}
                >
                  <Plus size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchClick}>
            <Text style={styles.searchButtonText}>Search Hotels</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pickers */}
      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckInDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckOutDateChange}
          minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FCFCFC',
  },
  backgroundBlob: {
    position: 'absolute',
    width: 562,
    height: 562,
    borderRadius: 281,
    opacity: 0.6,
    left: 1,
    top: 428,
    transform: [{ rotate: '-30deg' }],
    backgroundColor: 'rgba(46, 123, 89, 0.30)',
  },
  mainCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 526,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(252, 252, 252, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#4CBC71',
  },
  placeholder: {
    width: 40,
  },
  searchForm: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#6B6F7E',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dateLabel: {
    fontSize: 16,
  },
  guestSection: {
    gap: 10,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  guestInfo: {
    flexDirection: 'column',
  },
  guestTitle: {
    fontSize: 20,
    color: '#6B6F7E',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 120,
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CBC71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 20,
    color: '#6B6F7E',
  },
  searchButton: {
    backgroundColor: '#4CBC71',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HotelSearchScreen; 