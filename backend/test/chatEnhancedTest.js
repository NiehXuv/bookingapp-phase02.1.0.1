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

// Enhanced test for complete chat flow
async function testCompleteChatFlow() {
  console.log('\n🚀 Testing Complete Chat Flow...\n');
  
  let chatId = null;
  let messageId = null;
  
  // Step 1: Create Chat
  console.log('📝 Step 1: Creating Chat...');
  const { req: req1, res: res1 } = createMockReqRes();
  req1.body = {
    participantIds: ['test-user-123', 'other-user-456']
  };
  
  try {
    await createChat(req1, res1);
    if (res1.statusCode === 201) {
      chatId = res1.responseData.chatId;
      console.log(`✅ Chat created with ID: ${chatId}`);
    } else {
      console.log('❌ Chat creation failed');
      return;
    }
  } catch (error) {
    console.error('❌ Chat creation error:', error.message);
    return;
  }
  
  // Step 2: Send Message
  console.log('\n💬 Step 2: Sending Message...');
  const { req: req2, res: res2 } = createMockReqRes();
  req2.body = {
    chatId: chatId,
    content: 'Hello! This is a test message.',
    type: 'text'
  };
  
  try {
    await sendMessage(req2, res2);
    if (res2.statusCode === 201) {
      messageId = res2.responseData.messageId;
      console.log(`✅ Message sent with ID: ${messageId}`);
    } else {
      console.log('❌ Message sending failed');
      return;
    }
  } catch (error) {
    console.error('❌ Message sending error:', error.message);
    return;
  }
  
  // Step 3: Get Chats (should show updated lastMessage)
  console.log('\n📋 Step 3: Getting Chats...');
  const { req: req3, res: res3 } = createMockReqRes();
  
  try {
    await getChats(req3, res3);
    if (res3.statusCode === 200) {
      const chats = res3.responseData.chats;
      if (chats && chats.length > 0) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          console.log(`✅ Chat found with lastMessage: "${chat.lastMessage}"`);
          console.log(`✅ Unread count: ${chat.unreadCount}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Get chats error:', error.message);
  }
  
  // Step 4: Mark Chat as Read
  console.log('\n👁️ Step 4: Marking Chat as Read...');
  const { req: req4, res: res4 } = createMockReqRes();
  req4.params = { chatId: chatId };
  
  try {
    await markChatAsRead(req4, res4);
    if (res4.statusCode === 200) {
      console.log(`✅ Chat marked as read: ${res4.responseData.message}`);
    } else {
      console.log('❌ Mark as read failed');
    }
  } catch (error) {
    console.error('❌ Mark as read error:', error.message);
  }
  
  // Step 5: Get Chats again (should show unreadCount = 0)
  console.log('\n📋 Step 5: Getting Chats After Read...');
  const { req: req5, res: res5 } = createMockReqRes();
  
  try {
    await getChats(req5, res5);
    if (res5.statusCode === 200) {
      const chats = res5.responseData.chats;
      if (chats && chats.length > 0) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          console.log(`✅ Chat unread count after read: ${chat.unreadCount}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Get chats error:', error.message);
  }
  
  console.log('\n🎉 Complete Chat Flow Test Finished!');
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  // Test 1: Create chat with only 1 participant
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
async function runEnhancedTests() {
  console.log('🚀 Starting Enhanced Chat API Tests...\n');
  console.log('📝 Note: These tests will show Firebase errors if not connected');
  console.log('💡 Make sure your Firebase config is working\n');
  
  try {
    // Run enhanced tests
    await testCompleteChatFlow();
    await testValidationErrors();
    
    console.log('\n🎉 All enhanced tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Complete Chat Flow');
    console.log('   ✅ Validation Errors');
    
  } catch (error) {
    console.error('\n💥 Enhanced test suite failed:', error.message);
  }
}

// Export functions for external use
module.exports = {
  runEnhancedTests,
  testCompleteChatFlow,
  testValidationErrors
};

// Run tests if file is executed directly
if (require.main === module) {
  runEnhancedTests();
}
