import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, Platform, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, MapPin, ArrowUpDown, Calendar, Plane, Train, Bus, Car, Plus, Minus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import airports, { searchAirports } from '../utils/airports';

const { width } = Dimensions.get('window');

const transportTypes = [
  { name: 'Flight', icon: Plane },
  { name: 'Train', icon: Train },
  { name: 'Bus', icon: Bus },
  { name: 'Ferry', icon: Car },
  { name: 'Car', icon: Car },
];

const TransportSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isOneWay, setIsOneWay] = useState(true);
  const [selectedTransport, setSelectedTransport] = useState('Flight');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const handleBackClick = () => {
    navigation.goBack();
  };

  const validateAirportCode = (code: string): string | null => {
    const upperCode = code.toUpperCase();
    const airport = airports.find(a => a.code === upperCode);
    return airport ? upperCode : null;
  };

  const handleSearchClick = () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please enter both origin and destination');
      return;
    }

    // Validate airport codes
    const validFrom = validateAirportCode(from);
    const validTo = validateAirportCode(to);

    if (!validFrom) {
      Alert.alert('Invalid Origin', `"${from}" is not a valid airport code. Please select from the suggestions or enter a valid 3-letter airport code.`);
      return;
    }

    if (!validTo) {
      Alert.alert('Invalid Destination', `"${to}" is not a valid airport code. Please select from the suggestions or enter a valid 3-letter airport code.`);
      return;
    }

    if (!isOneWay && arrivalDate >= returnDate) {
      Alert.alert('Error', 'Return date must be after arrival date');
      return;
    }

    (navigation as any).navigate('SearchTransportResult', {
      from: validFrom,
      to: validTo,
      departureDate: arrivalDate.toISOString().split('T')[0],
      returnDate: isOneWay ? null : returnDate.toISOString().split('T')[0],
      adults: adults,
      children: children,
      transportType: selectedTransport,
    });
  };

  const onArrivalDateChange = (event: any, selectedDate?: Date) => {
    setShowArrivalPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setArrivalDate(selectedDate);
      // If return date is before arrival date, update it
      if (returnDate <= selectedDate) {
        const newReturnDate = new Date(selectedDate);
        newReturnDate.setDate(newReturnDate.getDate() + 1);
        setReturnDate(newReturnDate);
      }
    }
  };

  const onReturnDateChange = (event: any, selectedDate?: Date) => {
    setShowReturnPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReturnDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };



  const handleFromChange = (text: string) => {
    // Convert to uppercase for airport codes
    const upperText = text.toUpperCase();
    setFrom(upperText);
    if (upperText.length >= 2) {
      const suggestions = searchAirports(upperText);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(true);
    } else {
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = (text: string) => {
    // Convert to uppercase for airport codes
    const upperText = text.toUpperCase();
    setTo(upperText);
    if (upperText.length >= 2) {
      const suggestions = searchAirports(upperText);
      setToSuggestions(suggestions);
      setShowToSuggestions(true);
    } else {
      setShowToSuggestions(false);
    }
  };

  const selectFromAirport = (airport: any) => {
    setFrom(airport.code);
    setShowFromSuggestions(false);
  };

  const selectToAirport = (airport: any) => {
    setTo(airport.code);
    setShowToSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={25} style={styles.glassCard} tint="light">
        {/* Back Button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackClick}>
            <ArrowLeft size={22} color="#4CBC71" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Transport</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* From/To Fields */}
        <View style={styles.row}>
          <View style={styles.fromToCol}>
            <View style={styles.inputRow}>
              <Home size={18} color="#4CBC71" />
              <TextInput
                placeholder="From (Airport Code)"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={from}
                onChangeText={handleFromChange}
                onFocus={() => {
                  if (from.length >= 2) {
                    setShowFromSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow selection
                  setTimeout(() => setShowFromSuggestions(false), 200);
                }}
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
            {from.length > 0 && from.length < 3 && (
              <Text style={styles.helpText}>Type 3-letter airport code or city name</Text>
            )}
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={fromSuggestions}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectFromAirport(item)}
                    >
                      <Text style={styles.suggestionCode}>{item.code}</Text>
                      <Text style={styles.suggestionCity}>{item.city}</Text>
                      <Text style={styles.suggestionCountry}>{item.country}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              </View>
            )}
            <View style={styles.inputRow}>
              <MapPin size={18} color="#6B6F7E" />
              <TextInput
                placeholder="To (Airport Code)"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={to}
                onChangeText={handleToChange}
                onFocus={() => {
                  if (to.length >= 2) {
                    setShowToSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow selection
                  setTimeout(() => setShowToSuggestions(false), 200);
                }}
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
            {to.length > 0 && to.length < 3 && (
              <Text style={styles.helpText}>Type 3-letter airport code or city name</Text>
            )}
            {showToSuggestions && toSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={toSuggestions}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectToAirport(item)}
                    >
                      <Text style={styles.suggestionCode}>{item.code}</Text>
                      <Text style={styles.suggestionCity}>{item.city}</Text>
                      <Text style={styles.suggestionCountry}>{item.country}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.swapBtn} onPress={handleSwapLocations}>
            <ArrowUpDown size={18} color="#4CBC71" />
          </TouchableOpacity>
        </View>
        {/* Trip Type Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isOneWay && styles.toggleBtnActive]}
            onPress={() => setIsOneWay(true)}
          >
            <Text style={[styles.toggleText, isOneWay && styles.toggleTextActive]}>One-way</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isOneWay && styles.toggleBtnActive]}
            onPress={() => setIsOneWay(false)}
          >
            <Text style={[styles.toggleText, !isOneWay && styles.toggleTextActive]}>Round-trip</Text>
          </TouchableOpacity>
        </View>
        {/* Date Pickers */}
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowArrivalPicker(true)}
          >
            <Text style={styles.dateText}>Arrival Date</Text>
            <Calendar size={18} color="#6B6F7E" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateInput, isOneWay && { opacity: 0.3 }]}
            onPress={() => !isOneWay && setShowReturnPicker(true)}
            disabled={isOneWay}
          >
            <Text style={styles.dateText}>Return Date</Text>
            <Calendar size={18} color="#6B6F7E" />
          </TouchableOpacity>
        </View>
        {/* Transport Type Selection */}
        <View style={styles.transportTypeContainer}>
          <Text style={styles.transportTypeLabel}>Transport Type</Text>
          <View style={styles.transportTypeGrid}>
          {transportTypes.map(t => {
            const isActive = selectedTransport === t.name;
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.name}
                style={[styles.transportBtn, isActive && styles.transportBtnActive]}
                onPress={() => setSelectedTransport(t.name)}
              >
                  <Icon size={16} color={isActive ? '#fff' : '#4CBC71'} />
                <Text style={[styles.transportBtnText, isActive && styles.transportBtnTextActive]}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
          </View>
        </View>
        {/* Passenger Selection */}
        <View style={styles.passengerRow}>
          <View style={styles.passengerCol}>
            <Text style={styles.passengerLabel}>Adults</Text>
            <View style={styles.passengerControl}>
              <TouchableOpacity style={styles.passengerBtn} onPress={() => setAdults(Math.max(1, adults - 1))}>
                <Minus size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.passengerCount}>{adults}</Text>
              <TouchableOpacity style={styles.passengerBtn} onPress={() => setAdults(adults + 1)}>
                <Plus size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.passengerCol}>
            <Text style={styles.passengerLabel}>Children</Text>
            <View style={styles.passengerControl}>
              <TouchableOpacity style={styles.passengerBtn} onPress={() => setChildren(Math.max(0, children - 1))}>
                <Minus size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.passengerCount}>{children}</Text>
              <TouchableOpacity style={styles.passengerBtn} onPress={() => setChildren(children + 1)}>
                <Plus size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Search Button */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchClick}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </BlurView>

      {/* Date Pickers */}
      {showArrivalPicker && (
        <DateTimePicker
          value={arrivalDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onArrivalDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showReturnPicker && (
        <DateTimePicker
          value={returnDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onReturnDateChange}
          minimumDate={new Date(arrivalDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    width: width - 32,
    borderRadius: 32,
    padding: 24,
    backgroundColor: 'rgba(252,252,252,0.8)',
    shadowColor: '#001C08',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CBC71',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fromToCol: {
    flex: 1,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    marginRight: 8,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
  },
  toggleText: {
    fontSize: 14,
    color: '#6B6F7E',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#6B6F7E',
  },
  transportTypeContainer: {
    marginBottom: 14,
  },
  transportTypeLabel: {
    fontSize: 16,
    color: '#6B6F7E',
    marginBottom: 8,
    fontWeight: '500',
  },
  transportTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  transportBtn: {
    width: '18%', // Back to two columns
    aspectRatio: 1.3, // Make buttons more compact
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  transportBtnActive: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
  },
  transportBtnText: {
    fontSize: 11,
    color: '#4CBC71',
    marginTop: 3,
    fontWeight: '500',
  },
  transportBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  passengerRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    justifyContent: 'center',
  },
  passengerCol: {
    alignItems: 'center',
    flex: 1,
  },
  passengerLabel: {
    fontSize: 16,
    color: '#6B6F7E',
    marginBottom: 6,
    fontWeight: '500',
  },
  passengerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  passengerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CBC71',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  passengerCount: {
    fontSize: 16,
    color: '#4CBC71',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  searchBtn: {
    marginTop: 10,
    backgroundColor: '#4CBC71',
    borderRadius: 20,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CBC71',
  },
  suggestionCity: {
    fontSize: 14,
    color: '#6B6F7E',
    marginTop: 2,
  },
  suggestionCountry: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#6B6F7E',
    marginTop: 4,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});

export default TransportSearchScreen; 