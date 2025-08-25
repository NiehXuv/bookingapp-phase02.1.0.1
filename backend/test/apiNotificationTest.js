const axios = require('axios');

async function testNotificationAPI() {
  try {
    console.log('🧪 Testing Notification API Endpoint...\n');

    // Test the notification endpoint (you'll need to provide a valid token)
    const baseURL = 'http://localhost:5000/api';
    
    console.log('1. Testing GET /notifications endpoint...');
    console.log('Note: This test requires a valid JWT token');
    console.log('You can get a token by logging in through your app first\n');
    
    // Example of how to test with a token
    console.log('To test with a token, run:');
    console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/notifications\n');
    
    console.log('2. Testing notification creation...');
    console.log('To test creating a notification, run:');
    console.log('curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d \'{"title":"Test","message":"Test message","type":"system"}\' http://localhost:5000/api/notifications\n');
    
    console.log('3. Testing with different filters...');
    console.log('Get only unread notifications:');
    console.log('curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/notifications?read=false"\n');
    
    console.log('Get only chat notifications:');
    console.log('curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/notifications?type=chat"\n');
    
    console.log('Get limited results:');
    console.log('curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/notifications?limit=5"\n');
    
    console.log('✅ API test instructions completed!');
    console.log('📝 Use the curl commands above to test your notification endpoints');
    console.log('🔑 Remember to replace YOUR_TOKEN with an actual JWT token from your app');

  } catch (error) {
    console.error('❌ Error testing notification API:', error.message);
  }
}

// Run the test
testNotificationAPI();

