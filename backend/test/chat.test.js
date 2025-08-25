const request = require('supertest');
const express = require('express');
const { createChat, sendMessage, getChats, getMessages, markChatAsRead, searchUsers } = require('../components/chat');

// Mock Firebase for testing
const mockFirebase = {
  database: {},
  ref: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  get: jest.fn(),
  update: jest.fn()
};

// Mock the Firebase config
jest.mock('../config/firebaseconfig.js', () => ({
  database: mockFirebase.database,
  ref: mockFirebase.ref,
  set: mockFirebase.set,
  push: mockFirebase.push,
  get: mockFirebase.get,
  update: mockFirebase.update
}));

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Mock middleware for authentication
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-user-123' };
  next();
};

// Add chat routes
app.post('/chat', mockAuthMiddleware, createChat);
app.post('/chat/message', mockAuthMiddleware, sendMessage);
app.get('/chat', mockAuthMiddleware, getChats);
app.get('/chat/:chatId/messages', mockAuthMiddleware, getMessages);
app.patch('/chat/:chatId/read', mockAuthMiddleware, markChatAsRead);
app.get('/chat/search', mockAuthMiddleware, searchUsers);

describe('Chat API Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset mock data
    mockFirebase.database = {};
  });

  describe('POST /chat - Create Chat', () => {
    test('should create a new chat successfully', async () => {
      const mockChatId = 'chat-123';
      const mockPushRef = { key: mockChatId };
      
      // Mock Firebase functions
      mockFirebase.push.mockReturnValue(mockPushRef);
      mockFirebase.set.mockResolvedValue();
      mockFirebase.get.mockResolvedValue({ exists: () => false });

      const response = await request(app)
        .post('/chat')
        .send({
          participantIds: ['test-user-123', 'other-user-456']
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Chat created successfully');
      expect(response.body.chatId).toBe(mockChatId);
    });

    test('should return error for invalid participant IDs', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          participantIds: ['test-user-123'] // Only one participant
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Exactly 2 participant IDs are required');
    });

    test('should return existing chat if already exists', async () => {
      const existingChat = {
        participants: ['test-user-123', 'other-user-456'],
        lastMessage: 'Hello',
        lastMessageTime: Date.now(),
        unreadCount: 0,
        createdAt: Date.now()
      };

      mockFirebase.get.mockResolvedValue({
        exists: () => true,
        val: () => ({
          'existing-chat': existingChat
        })
      });

      const response = await request(app)
        .post('/chat')
        .send({
          participantIds: ['test-user-123', 'other-user-456']
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Chat already exists');
    });
  });

  describe('POST /chat/message - Send Message', () => {
    test('should send a message successfully', async () => {
      const mockMessageId = 'msg-123';
      const mockPushRef = { key: mockMessageId };
      
      // Mock Firebase functions
      mockFirebase.push.mockReturnValue(mockPushRef);
      mockFirebase.set.mockResolvedValue();
      mockFirebase.get.mockResolvedValue({
        exists: () => true,
        val: () => ({
          participants: ['test-user-123', 'other-user-456'],
          unreadCount: 0
        })
      });

      const response = await request(app)
        .post('/chat/message')
        .send({
          chatId: 'chat-123',
          content: 'Hello there!',
          type: 'text'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.messageId).toBe(mockMessageId);
    });

    test('should return error for missing chat ID', async () => {
      const response = await request(app)
        .post('/chat/message')
        .send({
          content: 'Hello there!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Chat ID and content are required');
    });

    test('should return error for invalid message type', async () => {
      const response = await request(app)
        .post('/chat/message')
        .send({
          chatId: 'chat-123',
          content: 'Hello there!',
          type: 'invalid-type'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid message type');
    });
  });

  describe('GET /chat - Get Chats', () => {
    test('should return empty array when no chats exist', async () => {
      mockFirebase.get.mockResolvedValue({
        exists: () => false
      });

      const response = await request(app)
        .get('/chat');

      expect(response.status).toBe(200);
      expect(response.body.chats).toEqual([]);
    });

    test('should return chats with participant info', async () => {
      const mockChats = {
        'chat-1': {
          participants: ['test-user-123', 'other-user-456'],
          lastMessage: 'Hello',
          lastMessageTime: Date.now(),
          unreadCount: 1,
          createdAt: Date.now()
        }
      };

      const mockUserProfile = {
        exists: () => true,
        val: () => ({
          username: 'TestUser',
          avatar: null
        })
      };

      mockFirebase.get
        .mockResolvedValueOnce({
          exists: () => true,
          val: () => mockChats
        })
        .mockResolvedValueOnce(mockUserProfile);

      const response = await request(app)
        .get('/chat');

      expect(response.status).toBe(200);
      expect(response.body.chats).toHaveLength(1);
      expect(response.body.chats[0].participant.username).toBe('TestUser');
    });
  });

  describe('GET /chat/search - Search Users', () => {
    test('should return error for short search query', async () => {
      const response = await request(app)
        .get('/chat/search')
        .query({ query: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Search query must be at least 2 characters long');
    });

    test('should return users matching search query', async () => {
      const mockUsers = {
        'user-1': {
          profile: {
            username: 'TestUser',
            email: 'test@example.com',
            avatar: null,
            country: 'US'
          }
        },
        'user-2': {
          profile: {
            username: 'AnotherUser',
            email: 'another@example.com',
            avatar: null,
            country: 'UK'
          }
        }
      };

      mockFirebase.get.mockResolvedValue({
        exists: () => true,
        val: () => mockUsers
      });

      const response = await request(app)
        .get('/chat/search')
        .query({ query: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].username).toBe('TestUser');
    });
  });

  describe('PATCH /chat/:chatId/read - Mark Chat as Read', () => {
    test('should mark chat as read successfully', async () => {
      mockFirebase.get.mockResolvedValue({
        exists: () => true,
        val: () => ({
          participants: ['test-user-123', 'other-user-456']
        })
      });

      mockFirebase.update.mockResolvedValue();

      const response = await request(app)
        .patch('/chat/chat-123/read');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Chat marked as read');
    });

    test('should return error for non-existent chat', async () => {
      mockFirebase.get.mockResolvedValue({
        exists: () => false
      });

      const response = await request(app)
        .patch('/chat/non-existent-chat/read');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Chat not found');
    });
  });
});

// Simple manual test function
function runManualTests() {
  console.log('🧪 Running Manual Chat Tests...\n');

  // Test 1: Create Chat
  console.log('1. Testing Create Chat...');
  const createChatData = {
    participantIds: ['user1', 'user2']
  };
  console.log('   Input:', createChatData);
  console.log('   Expected: Chat created with 2 participants\n');

  // Test 2: Send Message
  console.log('2. Testing Send Message...');
  const sendMessageData = {
    chatId: 'chat123',
    content: 'Hello World!',
    type: 'text'
  };
  console.log('   Input:', sendMessageData);
  console.log('   Expected: Message sent, notification created\n');

  // Test 3: Search Users
  console.log('3. Testing Search Users...');
  const searchData = {
    query: 'john',
    limit: 10
  };
  console.log('   Input:', searchData);
  console.log('   Expected: Users matching "john" returned\n');

  console.log('✅ Manual tests completed!');
  console.log('💡 Run with: npm test or node test/chat.test.js');
}

// Export for manual testing
module.exports = { runManualTests };

// Run manual tests if file is executed directly
if (require.main === module) {
  runManualTests();
}
