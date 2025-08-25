const friends = require('../components/friends');
const { database, ref, get } = require('../config/firebaseconfig');

// Mock request and response objects
const createMockReq = (user, body = {}, query = {}) => ({
  user,
  body,
  query
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

// Test user UID (we'll find this by searching for the email)
const TEST_EMAIL = 'emyeunuocmy@gmail.com';

async function testFriendSystem() {
  try {
    console.log('🔍 Finding test user in database...');
    
    // Find user by email in the database
    let testUser = null;
    let testUserId = null;
    
    try {
      // Search through all users to find the one with matching email
      const usersRef = ref(database, 'Users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        for (const [uid, userData] of Object.entries(users)) {
          if (userData && userData.email === TEST_EMAIL) {
            testUserId = uid;
            testUser = { uid, ...userData };
            break;
          }
          // Also check in profile subpath
          if (userData && userData.profile && userData.profile.email === TEST_EMAIL) {
            testUserId = uid;
            testUser = { uid, ...userData.profile };
            break;
          }
        }
      }
    } catch (error) {
      console.log('Error searching for user:', error.message);
    }
    
    if (!testUserId) {
      console.log('❌ Test user not found in database. Creating test user structure...');
      // Create a test user structure for testing
      testUserId = 'test_user_' + Date.now();
      testUser = { uid: testUserId, email: TEST_EMAIL, username: 'TestUser' };
    }
    
    console.log(`✅ Using test user: ${testUser.email || 'Unknown'} (UID: ${testUserId})\n`);
    
    // Test 1: Check Friend Status (with a dummy target user)
    console.log('1️⃣ Testing checkFriendStatus...');
    const req1 = createMockReq({ uid: testUserId }, {}, { 
      currentUserId: testUserId, 
      targetUserId: 'dummy_target_user_123' 
    });
    const res1 = createMockRes();
    
    await friends.checkFriendStatus(req1, res1);
    console.log('Status:', res1.statusCode, res1.data);
    console.log('✅ Friend status check completed\n');
    
    // Test 2: Get Friend Requests (incoming)
    console.log('2️⃣ Testing getFriendRequests (incoming)...');
    const req2 = createMockReq({ uid: testUserId }, {}, { type: 'incoming' });
    const res2 = createMockRes();
    
    await friends.getFriendRequests(req2, res2);
    console.log('Status:', res2.statusCode);
    if (res2.data && res2.data.requests) {
      console.log(`Found ${res2.data.requests.length} incoming friend requests`);
      res2.data.requests.forEach((req, index) => {
        console.log(`  ${index + 1}. From: ${req.fromUserId}, Message: "${req.message || 'No message'}"`);
      });
    }
    console.log('✅ Friend requests retrieval completed\n');
    
    // Test 3: Get Friend Requests (outgoing)
    console.log('3️⃣ Testing getFriendRequests (outgoing)...');
    const req3 = createMockReq({ uid: testUserId }, {}, { type: 'outgoing' });
    const res3 = createMockRes();
    
    await friends.getFriendRequests(req3, res3);
    console.log('Status:', res3.statusCode);
    if (res3.data && res3.data.requests) {
      console.log(`Found ${res3.data.requests.length} outgoing friend requests`);
      res3.data.requests.forEach((req, index) => {
        console.log(`  ${index + 1}. To: ${req.toUserId}, Message: "${req.message || 'No message'}"`);
      });
    }
    console.log('✅ Outgoing friend requests retrieval completed\n');
    
    // Test 4: Get Friends List
    console.log('4️⃣ Testing getFriends...');
    const req4 = createMockReq({ uid: testUserId });
    const res4 = createMockRes();
    
    await friends.getFriends(req4, res4);
    console.log('Status:', res4.statusCode);
    if (res4.data && res4.data.friends) {
      console.log(`Found ${res4.data.friends.length} friends`);
      res4.data.friends.forEach((friend, index) => {
        console.log(`  ${index + 1}. ${friend.username || friend.uid} (${friend.email || 'No email'})`);
      });
    }
    console.log('✅ Friends list retrieval completed\n');
    
    // Test 5: Check if we can send a friend request to ourselves (should fail)
    console.log('5️⃣ Testing sendFriendRequest to self (should fail)...');
    const req5 = createMockReq({ uid: testUserId }, {
      fromUserId: testUserId,
      toUserId: testUserId,
      message: 'Test message to self'
    });
    const res5 = createMockRes();
    
    await friends.sendFriendRequest(req5, res5);
    console.log('Status:', res5.statusCode, res5.data);
    console.log('✅ Self-friend request test completed\n');
    
    console.log('🎉 All friend system tests completed successfully!');
    console.log(`\nTest user: ${testUser.email || 'Unknown'}`);
    console.log(`User UID: ${testUserId}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// Run the test
testFriendSystem();
