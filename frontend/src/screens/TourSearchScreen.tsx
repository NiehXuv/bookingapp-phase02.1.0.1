import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, Platform, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Calendar, Compass, Star, Users, Globe, Plus, Minus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const tourCategories = [
  { name: 'Nature', icon: MapPin, color: '#4CBC71' },
  { name: 'Culture', icon: Star, color: '#6B6F7E' },
  { name: 'Food', icon: Star, color: '#6B6F7E' },
  { name: 'Local life', icon: Users, color: '#6B6F7E' },
  { name: 'Adventure', icon: Compass, color: '#6B6F7E' },
];

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Spanish', code: 'es' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
];

const TourSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('Nature');
  const [selectedLanguage, setSelectedLanguage] = useState('English (Default)');
  const [adults, setAdults] = useState(5);
  const [children, setChildren] = useState(2);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleBackClick = () => {
    navigation.goBack();
  };

  const handleSearchClick = () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    (navigation as any).navigate('SearchTourResult', {
      destination: destination,
      departureDate: departureDate.toISOString().split('T')[0],
      category: selectedCategory,
      language: selectedLanguage,
      adults: adults,
      children: children,
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguagePicker(false);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={25} style={styles.glassCard} tint="light">
        {/* Back Button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackClick}>
            <ArrowLeft size={22} color="#4CBC71" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Tour</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Destination Input */}
        <View style={styles.inputRow}>
          <MapPin size={18} color="#4CBC71" />
          <TextInput
            placeholder="Choose Where You Want To Explore"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* Departure Date */}
        <View style={styles.inputRow}>
          <Calendar size={18} color="#6B6F7E" />
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(departureDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tour Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionLabel}>Tour Categories</Text>
          <View style={styles.categoriesGrid}>
            {tourCategories.map(category => {
              const isActive = selectedCategory === category.name;
              const Icon = category.icon;
              return (
                <TouchableOpacity
                  key={category.name}
                  style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Icon size={16} color={isActive ? '#fff' : category.color} />
                  <Text style={[styles.categoryBtnText, isActive && styles.categoryBtnTextActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <Text style={styles.sectionLabel}>Language</Text>
          <TouchableOpacity 
            style={styles.languageInput}
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text style={styles.languageText}>{selectedLanguage}</Text>
            <Globe size={18} color="#4CBC71" />
          </TouchableOpacity>
        </View>

        {/* Participant Selection */}
        <View style={styles.participantsContainer}>
          <View style={styles.participantCol}>
            <Text style={styles.participantLabel}>Adults</Text>
            <Text style={styles.participantSubtext}>12+</Text>
            <View style={styles.participantControl}>
              <TouchableOpacity style={styles.participantBtn} onPress={() => setAdults(Math.max(1, adults - 1))}>
                <Minus size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{adults}</Text>
              <TouchableOpacity style={styles.participantBtn} onPress={() => setAdults(adults + 1)}>
                <Plus size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.participantCol}>
            <Text style={styles.participantLabel}>Children</Text>
            <Text style={styles.participantSubtext}>Under 12</Text>
            <View style={styles.participantControl}>
              <TouchableOpacity style={styles.participantBtn} onPress={() => setChildren(Math.max(0, children - 1))}>
                <Minus size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{children}</Text>
              <TouchableOpacity style={styles.participantBtn} onPress={() => setChildren(children + 1)}>
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

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Language Picker Modal */}
      {showLanguagePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <ScrollView style={styles.languageList}>
              {languages.map(language => (
                <TouchableOpacity
                  key={language.code}
                  style={styles.languageItem}
                  onPress={() => selectLanguage(language.name)}
                >
                  <Text style={styles.languageItemText}>{language.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setShowLanguagePicker(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  dateInput: {
    flex: 1,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#6B6F7E',
  },
  categoriesContainer: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#6B6F7E',
    marginBottom: 8,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryBtn: {
    width: '48%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  categoryBtnActive: {
    backgroundColor: '#4CBC71',
    borderColor: '#4CBC71',
  },
  categoryBtnText: {
    fontSize: 14,
    color: '#6B6F7E',
    fontWeight: '500',
  },
  categoryBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  languageContainer: {
    marginBottom: 14,
  },
  languageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12,
  },
  languageText: {
    fontSize: 16,
    color: '#6B6F7E',
  },
  participantsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    justifyContent: 'center',
  },
  participantCol: {
    alignItems: 'center',
    flex: 1,
  },
  participantLabel: {
    fontSize: 16,
    color: '#6B6F7E',
    marginBottom: 2,
    fontWeight: '500',
  },
  participantSubtext: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 6,
  },
  participantControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  participantBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CBC71',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  participantCount: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width - 60,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CBC71',
    textAlign: 'center',
    marginBottom: 16,
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languageItemText: {
    fontSize: 16,
    color: '#6B6F7E',
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#4CBC71',
    fontWeight: '500',
  },
});

export default TourSearchScreen; 