const DataValidator = require('../utils/dataValidator');

console.log('🧪 Testing Data Validation & Fallbacks...\n');

// Test 1: User Data Validation
console.log('1️⃣ Testing user data validation...');
const testUserData = {
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
  country: 'USA'
};

const validatedUser = DataValidator.validateUserData(testUserData, 'user123');
console.log('Valid user data:', validatedUser);

const invalidUser = DataValidator.validateUserData(null, 'user456');
console.log('Invalid user data:', invalidUser);

const partialUser = DataValidator.validateUserData({ email: 'partial@example.com' }, 'user789');
console.log('Partial user data:', partialUser);
console.log('✅ User data validation completed\n');

// Test 2: Chat Data Validation
console.log('2️⃣ Testing chat data validation...');
const testChatData = {
  participants: ['user1', 'user2'],
  lastMessage: 'Hello!',
  lastMessageTime: Date.now(),
  unreadCount: 2,
  createdAt: Date.now()
};

const validatedChat = DataValidator.validateChatData(testChatData, 'chat123');
console.log('Valid chat data:', validatedChat);

const invalidChat = DataValidator.validateChatData(null, 'chat456');
console.log('Invalid chat data:', invalidChat);

const partialChat = DataValidator.validateChatData({ participants: [] }, 'chat789');
console.log('Partial chat data:', partialChat);
console.log('✅ Chat data validation completed\n');

// Test 3: Message Data Validation
console.log('3️⃣ Testing message data validation...');
const testMessageData = {
  chatId: 'chat123',
  senderId: 'user1',
  content: 'Hello world!',
  type: 'text',
  timestamp: Date.now(),
  readBy: ['user1']
};

const validatedMessage = DataValidator.validateMessageData(testMessageData, 'msg123');
console.log('Valid message data:', validatedMessage);

const invalidMessage = DataValidator.validateMessageData(null, 'msg456');
console.log('Invalid message data:', invalidMessage);

const partialMessage = DataValidator.validateMessageData({ content: 'Partial message' }, 'msg789');
console.log('Partial message data:', partialMessage);
console.log('✅ Message data validation completed\n');

// Test 4: Friend Request Validation
console.log('4️⃣ Testing friend request validation...');
const testRequestData = {
  fromUserId: 'user1',
  toUserId: 'user2',
  message: 'Let\'s be friends!',
  status: 'pending',
  createdAt: Date.now()
};

const validatedRequest = DataValidator.validateFriendRequestData(testRequestData, 'req123');
console.log('Valid request data:', validatedRequest);

const invalidRequest = DataValidator.validateFriendRequestData(null, 'req456');
console.log('Invalid request data:', invalidRequest);

const partialRequest = DataValidator.validateFriendRequestData({ fromUserId: 'user1' }, 'req789');
console.log('Partial request data:', partialRequest);
console.log('✅ Friend request validation completed\n');

console.log('🎉 All data validation tests completed!');
console.log('\nKey Features:');
console.log('- Comprehensive data validation');
console.log('- Graceful fallbacks for missing data');
console.log('- Detailed missing field reporting');
console.log('- Multiple data path fallbacks');
console.log('- Health status reporting');
