# Chat API Tests

This directory contains tests for the chat functionality in your booking app backend.

## 🧪 Test Files

### 1. `chatManualTest.js` - Simple Manual Tests
- **No dependencies required** - runs with Node.js only
- **Easy to understand** - shows exactly what's being tested
- **Good for development** - test individual functions quickly

### 2. `chat.test.js` - Jest Unit Tests
- **Requires Jest** - for proper unit testing
- **Mocked Firebase** - tests logic without database connection
- **Good for CI/CD** - automated testing

## 🚀 How to Run Tests

### Quick Start (Recommended)
```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Or run specific test
npm run test:create    # Test createChat only
npm run test:message   # Test sendMessage only
npm run test:search    # Test searchUsers only
```

### Manual Testing
```bash
# Test all functions
node test/chatManualTest.js

# Test specific function
node test/chatManualTest.js createChat
node test/chatManualTest.js sendMessage
node test/chatManualTest.js getChats
node test/chatManualTest.js searchUsers
node test/chatManualTest.js markChatAsRead
node test/chatManualTest.js getMessages
node test/chatManualTest.js validation
```

### Jest Tests (if Jest is installed)
```bash
# Install Jest first
npm install --save-dev jest supertest

# Run Jest tests
npx jest test/chat.test.js
```

## 📋 What Gets Tested

### ✅ **Create Chat**
- Creates new chat between 2 users
- Prevents duplicate chats
- Validates participant IDs

### ✅ **Send Message**
- Sends text messages
- Updates chat metadata
- Creates notifications
- Validates message types

### ✅ **Get Chats**
- Retrieves user's chat list
- Includes participant information
- Sorts by recent activity

### ✅ **Search Users**
- Finds users by username/email
- Validates search queries
- Returns relevant results

### ✅ **Mark as Read**
- Marks messages as read
- Updates unread counts
- Validates chat existence

### ✅ **Get Messages**
- Retrieves chat messages
- Supports pagination
- Validates chat access

### ✅ **Validation**
- Input validation
- Error handling
- Edge cases

## 🔧 Test Setup

### Prerequisites
1. **Backend server running** on port 5000
2. **Firebase connection** working
3. **Chat routes** added to server.js

### Environment
- Node.js 14+ recommended
- No additional packages required for manual tests
- Jest + supertest for unit tests

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   ```
   ❌ Error: Firebase connection failed
   ```
   - Check Firebase config
   - Verify network connectivity
   - Ensure Firebase project is active

2. **Module Not Found**
   ```
   ❌ Error: Cannot find module '../components/chat'
   ```
   - Check file paths
   - Ensure chat components exist
   - Verify import/export syntax

3. **Authentication Errors**
   ```
   ❌ Error: User not authenticated
   ```
   - Check JWT middleware
   - Verify token validation
   - Test with valid user session

### Debug Mode
```bash
# Run with more verbose output
DEBUG=* node test/chatManualTest.js

# Or add console.log to specific functions
```

## 📝 Adding New Tests

### Manual Test
```javascript
// Add new test function
async function testNewFeature() {
  console.log('\n🧪 Testing New Feature...');
  
  const { req, res } = createMockReqRes();
  req.body = { /* test data */ };
  
  try {
    await newFeature(req, res);
    console.log('✅ New Feature Test Completed');
  } catch (error) {
    console.error('❌ New Feature Test Failed:', error.message);
  }
}

// Add to runAllTests function
await testNewFeature();
```

### Jest Test
```javascript
test('should test new feature', async () => {
  // Test implementation
  expect(result).toBe(expected);
});
```

## 🎯 Test Results

### Success Output
```
🚀 Starting Chat API Manual Tests...

🧪 Testing Create Chat...
✅ Response (201): {
  "message": "Chat created successfully",
  "chatId": "chat-123",
  "chat": { ... }
}
✅ Create Chat Test Completed

🎉 All tests completed!
```

### Error Output
```
❌ Create Chat Test Failed: Firebase connection error
```

## 💡 Tips

1. **Start with manual tests** - easier to debug
2. **Test one function at a time** - isolate issues
3. **Check Firebase console** - monitor database operations
4. **Use real data** - test with actual user IDs
5. **Test edge cases** - invalid inputs, missing data

## 🔗 Related Files

- `../components/chat/` - Chat functionality
- `../routes/chat.js` - Chat API routes
- `../server.js` - Main server file
- `../config/firebaseconfig.js` - Firebase configuration

---

**Happy Testing! 🚀**
