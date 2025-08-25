const friends = require('../components/friends');

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

console.log('🧪 Testing Error Handling & Edge Cases...\n');

// Test 1: Missing Required Fields
console.log('1️⃣ Testing missing required fields...');
const req1 = createMockReq({ uid: 'test_user' }, {});
const res1 = createMockRes();

friends.sendFriendRequest(req1, res1);
console.log('Status:', res1.statusCode, res1.data);
console.log('✅ Missing fields test completed\n');

// Test 2: Invalid User IDs
console.log('2️⃣ Testing invalid user IDs...');
const req2 = createMockReq({ uid: 'test_user' }, {
  fromUserId: 'invalid_user_1',
  toUserId: 'invalid_user_2'
});
const res2 = createMockRes();

friends.sendFriendRequest(req2, res2);
console.log('Status:', res2.statusCode, res2.data);
console.log('✅ Invalid user IDs test completed\n');

// Test 3: Unauthorized Access
console.log('3️⃣ Testing unauthorized access...');
const req3 = createMockReq({ uid: 'user_1' }, {
  fromUserId: 'user_2', // Different from authenticated user
  toUserId: 'user_3'
});
const res3 = createMockRes();

friends.sendFriendRequest(req3, res3);
console.log('Status:', res3.statusCode, res3.data);
console.log('✅ Unauthorized access test completed\n');

// Test 4: Missing Request ID
console.log('4️⃣ Testing missing request ID...');
const req4 = createMockReq({ uid: 'test_user' }, {});
const res4 = createMockRes();

friends.acceptFriendRequest(req4, res4);
console.log('Status:', res4.statusCode, res4.data);
console.log('✅ Missing request ID test completed\n');

// Test 5: Invalid Friend ID
console.log('5️⃣ Testing invalid friend ID...');
const req5 = createMockReq({ uid: 'test_user' }, { friendId: 'invalid_friend' });
const res5 = createMockRes();

friends.removeFriend(req5, res5);
console.log('Status:', res5.statusCode, res5.data);
console.log('✅ Invalid friend ID test completed\n');

console.log('🎉 All error handling tests completed!');
console.log('\nExpected Results:');
console.log('- Missing fields: 400 Bad Request');
console.log('- Invalid users: 404 Not Found');
console.log('- Unauthorized: 403 Forbidden');
console.log('- Missing IDs: 400 Bad Request');
console.log('- Invalid friend: 404 Not Found');
