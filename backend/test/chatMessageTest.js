const { database, ref, get, set, push } = require('../config/firebaseconfig');

async function testChatMessage() {
  try {
    console.log('💬 Testing Chat Message System...\n');

    // Test user IDs (you can change these to real user IDs)
    const user1Id = 'test_user_1';
    const user2Id = 'test_user_2';
    
    // 1. Test creating a chat
    console.log('1. Creating test chat...');
    const chatId = `${user1Id}_${user2Id}`;
    
    const chatData = {
      participants: [user1Id, user2Id],
      lastMessage: "",
      lastMessageTime: Date.now(),
      unreadCount: 0,
      createdAt: Date.now()
    };

    // Create chat for both participants
    await Promise.all([
      set(ref(database, `Users/${user1Id}/chats/${chatId}`), chatData),
      set(ref(database, `Users/${user2Id}/chats/${chatId}`), chatData)
    ]);
    
    console.log('✅ Test chat created with ID:', chatId);

    // 2. Test sending a message
    console.log('\n2. Sending test message...');
    const messageData = {
      chatId,
      senderId: user1Id,
      content: "Hello! This is a test message.",
      type: "text",
      timestamp: Date.now(),
      readBy: [user1Id]
    };

    // Create message in sender's messages
    const newMessageRef = push(ref(database, `Users/${user1Id}/messages`));
    const messageId = newMessageRef.key;

    await set(ref(database, `Users/${user1Id}/messages/${messageId}`), messageData);
    console.log('✅ Message created in sender\'s messages with ID:', messageId);

    // Create message in other participant's messages
    await set(ref(database, `Users/${user2Id}/messages/${messageId}`), messageData);
    console.log('✅ Message created in receiver\'s messages');

    // 3. Test updating chat metadata
    console.log('\n3. Updating chat metadata...');
    const chatUpdate = {
      lastMessage: messageData.content,
      lastMessageTime: messageData.timestamp,
      unreadCount: 0
    };

    // Update sender's chat
    await set(ref(database, `Users/${user1Id}/chats/${chatId}`), {
      ...chatData,
      ...chatUpdate
    });

    // Update receiver's chat with incremented unread count
    await set(ref(database, `Users/${user2Id}/chats/${chatId}`), {
      ...chatData,
      lastMessage: messageData.content,
      lastMessageTime: messageData.timestamp,
      unreadCount: 1
    });

    console.log('✅ Chat metadata updated for both users');

    // 4. Test creating notification
    console.log('\n4. Creating notification for receiver...');
    const notificationData = {
      title: "New message",
      message: `You have a new message from ${user1Id}`,
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId,
        senderId: user1Id,
        actionUrl: `/chat/${chatId}`,
        priority: "high"
      }
    };

    const notificationRef = push(ref(database, `Users/${user2Id}/notifications`));
    await set(ref(database, `Users/${user2Id}/notifications/${notificationRef.key}`), notificationData);
    console.log('✅ Notification created for receiver');

    // 5. Verify the data
    console.log('\n5. Verifying data...');
    
    // Check chat
    const chatSnapshot = await get(ref(database, `Users/${user1Id}/chats/${chatId}`));
    if (chatSnapshot.exists()) {
      const chat = chatSnapshot.val();
      console.log('✅ Chat verified:');
      console.log(`   - Participants: ${chat.participants.join(', ')}`);
      console.log(`   - Last message: ${chat.lastMessage}`);
      console.log(`   - Unread count: ${chat.unreadCount}`);
    }

    // Check message
    const messageSnapshot = await get(ref(database, `Users/${user1Id}/messages/${messageId}`));
    if (messageSnapshot.exists()) {
      const message = messageSnapshot.val();
      console.log('✅ Message verified:');
      console.log(`   - Content: ${message.content}`);
      console.log(`   - Sender: ${message.senderId}`);
      console.log(`   - Chat ID: ${message.chatId}`);
    }

    // Check notification
    const notificationSnapshot = await get(ref(database, `Users/${user2Id}/notifications/${notificationRef.key}`));
    if (notificationSnapshot.exists()) {
      const notification = notificationSnapshot.val();
      console.log('✅ Notification verified:');
      console.log(`   - Title: ${notification.title}`);
      console.log(`   - Type: ${notification.type}`);
      console.log(`   - Read: ${notification.read}`);
    }

    console.log('\n🎉 Chat message system test completed successfully!');
    console.log(`💬 Created chat: ${chatId}`);
    console.log(`📝 Sent message: ${messageId}`);
    console.log(`🔔 Created notification for user: ${user2Id}`);

  } catch (error) {
    console.error('❌ Error testing chat message system:', error);
  }
}

// Run the test
testChatMessage();

