const axios = require('axios');

const TRIPADVISOR_API_KEY = '11CC8F76C2E14125B8DF907D5EF0CFFF';

async function testTripadvisorAPI() {
  console.log('🔍 Testing Tripadvisor API...\n');

  // Test 1: Basic location search
  console.log('1. Testing location search...');
  try {
    const locationResponse = await axios.get('https://api.content.tripadvisor.com/api/v1/location/search', {
      params: {
        key: TRIPADVISOR_API_KEY,
        searchQuery: 'Phu Quoc',
        language: 'en',
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HotelBookingApp/1.0',
      },
    });
    
    console.log('✅ Location search successful!');
    console.log('Status:', locationResponse.status);
    console.log('Data length:', locationResponse.data.data?.length || 0);
    
    if (locationResponse.data.data && locationResponse.data.data.length > 0) {
      const firstLocation = locationResponse.data.data[0];
      console.log('First location:', {
        location_id: firstLocation.location_id,
        name: firstLocation.name,
        location_string: firstLocation.location_string,
      });
      
      // Test 2: Try different hotel search approaches
      console.log('\n2. Testing hotel search approaches...');
      
      // Approach 1: Basic hotel search
      console.log('\n2a. Basic hotel search...');
      try {
        const hotelsResponse1 = await axios.get(`https://api.content.tripadvisor.com/api/v1/location/${firstLocation.location_id}/hotels`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: 'en',
            currency: 'USD',
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HotelBookingApp/1.0',
          },
        });
        
        console.log('✅ Basic hotel search successful!');
        console.log('Status:', hotelsResponse1.status);
        console.log('Hotels found:', hotelsResponse1.data.data?.length || 0);
        
      } catch (hotelsError1) {
        console.log('❌ Basic hotel search failed:');
        console.log('Status:', hotelsError1.response?.status);
        console.log('Error:', hotelsError1.response?.data);
      }

      // Approach 2: Try with different endpoint format
      console.log('\n2b. Alternative endpoint format...');
      try {
        const hotelsResponse2 = await axios.get(`https://api.content.tripadvisor.com/api/v1/location/${firstLocation.location_id}/hotels`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: 'en',
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HotelBookingApp/1.0',
            'Authorization': `Bearer ${TRIPADVISOR_API_KEY}`,
          },
        });
        
        console.log('✅ Alternative format successful!');
        console.log('Status:', hotelsResponse2.status);
        console.log('Hotels found:', hotelsResponse2.data.data?.length || 0);
        
      } catch (hotelsError2) {
        console.log('❌ Alternative format failed:');
        console.log('Status:', hotelsError2.response?.status);
        console.log('Error:', hotelsError2.response?.data);
      }

      // Approach 3: Try location details instead
      console.log('\n2c. Location details approach...');
      try {
        const locationDetailsResponse = await axios.get(`https://api.content.tripadvisor.com/api/v1/location/${firstLocation.location_id}/details`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: 'en',
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HotelBookingApp/1.0',
          },
        });
        
        console.log('✅ Location details successful!');
        console.log('Status:', locationDetailsResponse.status);
        console.log('Location type:', locationDetailsResponse.data.location_type);
        
      } catch (detailsError) {
        console.log('❌ Location details failed:');
        console.log('Status:', detailsError.response?.status);
        console.log('Error:', detailsError.response?.data);
      }

      // Approach 4: Try search for hotels in the area
      console.log('\n2d. Search for hotels in area...');
      try {
        const hotelsSearchResponse = await axios.get('https://api.content.tripadvisor.com/api/v1/location/search', {
          params: {
            key: TRIPADVISOR_API_KEY,
            searchQuery: 'hotels in Phu Quoc',
            language: 'en',
            category: 'hotels',
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HotelBookingApp/1.0',
          },
        });
        
        console.log('✅ Hotel search successful!');
        console.log('Status:', hotelsSearchResponse.status);
        console.log('Results found:', hotelsSearchResponse.data.data?.length || 0);
        
        if (hotelsSearchResponse.data.data) {
          console.log('Sample results:');
          hotelsSearchResponse.data.data.slice(0, 3).forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} (${item.location_id})`);
          });
        }
        
      } catch (searchError) {
        console.log('❌ Hotel search failed:');
        console.log('Status:', searchError.response?.status);
        console.log('Error:', searchError.response?.data);
      }
    }
    
  } catch (locationError) {
    console.log('❌ Location search failed:');
    console.log('Status:', locationError.response?.status);
    console.log('Error:', locationError.response?.data);
  }

  console.log('\n📋 Analysis:');
  console.log('- Location search works ✅');
  console.log('- Hotel-specific endpoints seem to have authentication issues ❌');
  console.log('- This suggests the hotels endpoint might require:');
  console.log('  1. Different API key permissions');
  console.log('  2. Additional authentication headers');
  console.log('  3. Different endpoint structure');
  console.log('  4. Or the hotels endpoint might not be available in the free tier');
  
  console.log('\n💡 Recommendations:');
  console.log('1. Check Tripadvisor API documentation for hotel endpoints');
  console.log('2. Verify your API key has hotel search permissions');
  console.log('3. Consider using location search with hotel category filter');
  console.log('4. Or use a different API (like Booking.com, Hotels.com, etc.)');
}

testTripadvisorAPI().catch(console.error); 