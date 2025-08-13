import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const AMADEUS_CLIENT_ID = 'xTCqf89AlcUFoUzg15AfGbYDgxh4WFDW';
const AMADEUS_CLIENT_SECRET = 'Fk4KhjJsdWFEkqOg';

// Simple static mapping for demo (expand as needed)
const cityGeo = {
  'Hanoi': { latitude: 21.0285, longitude: 105.8542 },
  'Ho Chi Minh City': { latitude: 10.7769, longitude: 106.7009 },
  'Da Nang': { latitude: 16.0544, longitude: 108.2022 },
  'Hoi An': { latitude: 15.8801, longitude: 108.3380 },
  'Hue': { latitude: 16.4637, longitude: 107.5909 },
  'Nha Trang': { latitude: 12.2388, longitude: 109.1967 },
};

async function getAmadeusToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
  });
  const data = await response.json();
  return data.access_token;
}

async function searchAmadeusExperiences({ latitude, longitude, radius = 30, startDate, endDate, token }: {
  latitude: number;
  longitude: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  token: string;
}) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
  });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`https://test.api.amadeus.com/v1/shopping/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

const SearchTourResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { destination: keyof typeof cityGeo; departureDate?: string };
  const { destination, departureDate } = params || {};

  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let geo = cityGeo[destination];
        if (!geo) {
          setError('Unknown destination. Please choose a major city in Vietnam.');
          setTours([]);
          setLoading(false);
          return;
        }
        const token = await getAmadeusToken();
        const data = await searchAmadeusExperiences({ latitude: geo.latitude, longitude: geo.longitude, startDate: departureDate, token });
        if (data && data.data) {
          setTours(data.data);
        } else {
          setTours([]);
          setError('No tours found.');
        }
      } catch (e) {
        setError('Failed to fetch tours.');
      } finally {
        setLoading(false);
      }
    })();
  }, [destination, departureDate]);

  const handleBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.headerCard} tint="light">
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <ArrowLeft size={22} color="#4CBC71" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tour Results</Text>
      </BlurView>
      {/* Filter/Search Controls */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputRow}>
          <MapPin size={20} color="#6B6F7E" />
          <Text style={styles.searchInput} numberOfLines={1}>{destination}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Filter coming soon!')}>
          <Star size={22} color="#4CBC71" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Sort coming soon!')}>
          <Star size={22} color="#4CBC71" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => alert('Change date coming soon!')}>
          <Star size={16} color="#4CBC71" />
          <Text style={styles.filterBtnText}>Change Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => alert('Map coming soon!')}>
          <MapPin size={16} color="#4CBC71" />
          <Text style={styles.filterBtnText}>Map</Text>
        </TouchableOpacity>
      </View>
      {/* Results Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CBC71" />
          <Text style={styles.loadingText}>Searching for tours...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsScroll} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.resultsCount}>{tours.length} tours found</Text>
          {tours.map((tour: any) => (
            <View key={tour.id} style={styles.tourCard}>
              <Image source={{ uri: tour.pictures?.[0] }} style={styles.tourImage} resizeMode="cover" />
              <View style={styles.tourInfo}>
                <Text style={styles.tourTitle}>{tour.name}</Text>
                <View style={styles.tourMeta}>
                  <MapPin size={14} color="#4CBC71" />
                  <Text style={styles.tourLocation}>{tour.geoCode?.city || destination}</Text>
                  <Star size={14} color="#FFACC6" style={{ marginLeft: 10 }} />
                  <Text style={styles.tourRating}>{tour.rating || 'N/A'}</Text>
                </View>
                <Text style={styles.tourDescription}>{tour.shortDescription || 'No description.'}</Text>
                <Text style={styles.tourPrice}>{tour.price?.amount ? `$${tour.price.amount}` : 'See details'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  headerCard: {
    width: width,
    alignSelf: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(252,252,252,0.9)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 54,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    zIndex: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#4CBC71', alignSelf: 'center', marginLeft: 60 },
  searchBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10, gap: 8, paddingHorizontal: 20 },
  searchInputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 15, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#000', marginLeft: 10 },
  iconBtn: { width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6E6E6' },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 10, paddingHorizontal: 20 },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 30, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'rgba(255,255,255,0.5)', gap: 8 },
  filterBtnText: { fontSize: 14, color: '#4CBC71', fontWeight: '500', marginLeft: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B6F7E' },
  resultsScroll: { flex: 1, paddingHorizontal: 20 },
  resultsCount: { fontSize: 20, color: '#4CBC71', fontWeight: '700', marginBottom: 16, marginTop: 8 },
  tourCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tourImage: { width: 120, height: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  tourInfo: { flex: 1, padding: 16, justifyContent: 'space-between' },
  tourTitle: { fontSize: 18, fontWeight: '600', color: '#6B6F7E', marginBottom: 4 },
  tourMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tourLocation: { fontSize: 14, color: '#4CBC71', marginLeft: 4 },
  tourRating: { fontSize: 14, color: '#FFACC6', marginLeft: 2 },
  tourDescription: { fontSize: 14, color: '#6B6F7E', marginBottom: 6 },
  tourPrice: { color: '#4CBC71', fontSize: 18, fontWeight: '700', marginTop: 4 },
});

export default SearchTourResultScreen; 