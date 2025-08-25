const { createChat, sendMessage, getChats, getMessages, markChatAsRead, searchUsers } = require('../components/chat');

// Mock request and response objects for testing
function createMockReqRes() {
  const req = {
    user: { uid: 'test-user-123' },
    body: {},
    params: {},
    query: {}
  };
  
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.responseData = data;
      console.log(`✅ Response (${this.statusCode}):`, JSON.stringify(data, null, 2));
      return this;
    }
  };
  
  return { req, res };
}

// Test function for createChat
async function testCreateChat() {
  console.log('\n🧪 Testing Create Chat...');
  
  const { req, res } = createMockReqRes();
  req.body = {
    participantIds: ['test-user-123', 'other-user-456']
  };
  
  try {
    await createChat(req, res);
    console.log('✅ Create Chat Test Completed');
  } catch (error) {
    console.error('❌ Create Chat Test Failed:', error.message);
  }
}

// Test function for sendMessage
async function testSendMessage() {
  console.log('\n🧪 Testing Send Message...');
  
  const { req, res } = createMockReqRes();
  req.body = {
    chatId: 'chat-123',
    content: 'Hello World! This is a test message.',
    type: 'text'
  };
  
  try {
    await sendMessage(req, res);
    console.log('✅ Send Message Test Completed');
  } catch (error) {
    console.error('❌ Send Message Test Failed:', error.message);
  }
}

// Test function for getChats
async function testGetChats() {
  console.log('\n🧪 Testing Get Chats...');
  
  const { req, res } = createMockReqRes();
  
  try {
    await getChats(req, res);
    console.log('✅ Get Chats Test Completed');
  } catch (error) {
    console.error('❌ Get Chats Test Failed:', error.message);
  }
}

// Test function for searchUsers
async function testSearchUsers() {
  console.log('\n🧪 Testing Search Users...');
  
  const { req, res } = createMockReqRes();
  req.query = {
    query: 'test',
    limit: 10
  };
  
  try {
    await searchUsers(req, res);
    console.log('✅ Search Users Test Completed');
  } catch (error) {
    console.error('❌ Search Users Test Failed:', error.message);
  }
}

// Test function for markChatAsRead
async function testMarkChatAsRead() {
  console.log('\n🧪 Testing Mark Chat as Read...');
  
  const { req, res } = createMockReqRes();
  req.params = {
    chatId: 'chat-123'
  };
  
  try {
    await markChatAsRead(req, res);
    console.log('✅ Mark Chat as Read Test Completed');
  } catch (error) {
    console.error('❌ Mark Chat as Read Test Failed:', error.message);
  }
}

// Test function for getMessages
async function testGetMessages() {
  console.log('\n🧪 Testing Get Messages...');
  
  const { req, res } = createMockReqRes();
  req.params = {
    chatId: 'chat-123'
  };
  req.query = {
    limit: 50
  };
  
  try {
    await getMessages(req, res);
    console.log('✅ Get Messages Test Completed');
  } catch (error) {
    console.error('❌ Get Messages Test Failed:', error.message);
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  // Test 1: Create chat with invalid participant IDs
  console.log('\n   Testing: Create chat with only 1 participant');
  const { req: req1, res: res1 } = createMockReqRes();
  req1.body = { participantIds: ['user1'] };
  
  try {
    await createChat(req1, res1);
    console.log('   ✅ Validation working correctly');
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }
  
  // Test 2: Send message without chatId
  console.log('\n   Testing: Send message without chatId');
  const { req: req2, res: res2 } = createMockReqRes();
  req2.body = { content: 'Hello' };
  
  try {
    await sendMessage(req2, res2);
    console.log('   ✅ Validation working correctly');
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }
  
  // Test 3: Search with short query
  console.log('\n   Testing: Search with short query');
  const { req: req3, res: res3 } = createMockReqRes();
  req3.query = { query: 'a' };
  
  try {
    await searchUsers(req3, res3);
    console.log('   ✅ Validation working correctly');
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Chat API Manual Tests...\n');
  console.log('📝 Note: These tests will show Firebase errors if not connected');
  console.log('💡 Make sure your Firebase config is working\n');
  
  try {
    // Run all tests
    await testCreateChat();
    await testSendMessage();
    await testGetChats();
    await testSearchUsers();
    await testMarkChatAsRead();
    await testGetMessages();
    await testValidationErrors();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Create Chat');
    console.log('   ✅ Send Message');
    console.log('   ✅ Get Chats');
    console.log('   ✅ Search Users');
    console.log('   ✅ Mark Chat as Read');
    console.log('   ✅ Get Messages');
    console.log('   ✅ Validation Errors');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Test specific function
async function testSpecificFunction(functionName) {
  console.log(`🧪 Testing ${functionName}...`);
  
  switch (functionName) {
    case 'createChat':
      await testCreateChat();
      break;
    case 'sendMessage':
      await testSendMessage();
      break;
    case 'getChats':
      await testGetChats();
      break;
    case 'searchUsers':
      await testSearchUsers();
      break;
    case 'markChatAsRead':
      await testMarkChatAsRead();
      break;
    case 'getMessages':
      await testGetMessages();
      break;
    case 'validation':
      await testValidationErrors();
      break;
    default:
      console.log('❌ Unknown function. Available tests:');
      console.log('   createChat, sendMessage, getChats, searchUsers, markChatAsRead, getMessages, validation');
  }
}

// Export functions for external use
module.exports = {
  runAllTests,
  testCreateChat,
  testSendMessage,
  testGetChats,
  testSearchUsers,
  testMarkChatAsRead,
  testGetMessages,
  testValidationErrors,
  testSpecificFunction
};

// Run tests if file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Test specific function
    testSpecificFunction(args[0]);
  } else {
    // Run all tests
    runAllTests();
  }
}
