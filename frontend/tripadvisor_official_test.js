const axios = require('axios');

const TRIPADVISOR_API_KEY = '11CC8F76C2E14125B8DF907D5EF0CFFF'; // Replace with your official Tripadvisor API key
const CITY_NAME = 'New York';

async function getLocationId(cityName) {
  try {
    const response = await axios.get(
      'https://api.content.tripadvisor.com/api/v1/location/search',
      {
        params: {
          key: TRIPADVISOR_API_KEY,
          searchQuery: cityName,
          language: 'en',
        },
      }
    );
    const locations = response.data.data || [];
    if (locations.length > 0) {
      const locationId = locations[0].location_id;
      console.log(`Found location_id for ${cityName}:`, locationId);
      return locationId;
    } else {
      console.log('No location found for', cityName);
      return null;
    }
  } catch (error) {
    console.error('Location search error:', error.response?.data || error.message);
    return null;
  }
}

async function getLocationPhotos(locationId) {
  try {
    const response = await axios.get(
      `https://api.content.tripadvisor.com/api/v1/location/${locationId}/photos`,
      {
        params: {
          key: TRIPADVISOR_API_KEY,
          language: 'en',
        },
      }
    );
    const photos = response.data.data || [];
    console.log('Tripadvisor API returned', photos.length, 'photos');
    photos.slice(0, 3).forEach((photo, idx) => {
      if (photo.images && photo.images.large && photo.images.large.url) {
        console.log(`Photo #${idx + 1}:`, photo.images.large.url);
      } else {
        console.log(`Photo #${idx + 1}: No large image available`);
      }
    });
  } catch (error) {
    console.error('Photo fetch error:', error.response?.data || error.message);
  }
}

async function testTripadvisorOfficial() {
  const locationId = await getLocationId(CITY_NAME);
  if (locationId) {
    await getLocationPhotos(locationId);
  }
}

testTripadvisorOfficial(); 