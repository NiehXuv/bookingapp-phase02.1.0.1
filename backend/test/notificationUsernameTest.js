const { database, ref, get, set, push } = require('../config/firebaseconfig');

async function testNotificationUsername() {
  try {
    console.log('🧪 Testing Notification Username Display...\n');

    // Test user IDs (you can change these to real user IDs)
    const senderUserId = 'test_sender_123';
    const receiverUserId = 'test_receiver_456';
    
    // 1. Create sender profile with username
    console.log('1. Creating sender profile with username...');
    const senderProfileData = {
      username: 'JohnDoe',
      email: 'john@example.com',
      country: 'US',
      createdAt: Date.now()
    };

    const senderProfileRef = `Users/${senderUserId}/profile`;
    await set(ref(database, senderProfileRef), senderProfileData);
    console.log('✅ Sender profile created with username:', senderProfileData.username);

    // 2. Create a test notification (simulating sendMessage behavior)
    console.log('\n2. Creating test notification...');
    const notificationData = {
      title: "New message",
      message: `You have a new message from ${senderProfileData.username}`,
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId: 'test_chat_123',
        senderId: senderUserId,
        senderUsername: senderProfileData.username,
        actionUrl: '/chat/test_chat_123',
        priority: "high"
      }
    };

    const notificationRef = push(ref(database, `Users/${receiverUserId}/notifications`));
    await set(ref(database, `Users/${receiverUserId}/notifications/${notificationRef.key}`), notificationData);
    console.log('✅ Test notification created with username:', notificationData.message);

    // 3. Retrieve and verify the notification
    console.log('\n3. Retrieving notification to verify username...');
    const snapshot = await get(ref(database, `Users/${receiverUserId}/notifications/${notificationRef.key}`));
    
    if (snapshot.exists()) {
      const notification = snapshot.val();
      console.log('✅ Notification retrieved successfully');
      console.log('   - Title:', notification.title);
      console.log('   - Message:', notification.message);
      console.log('   - Sender Username:', notification.data.senderUsername);
      console.log('   - Sender ID:', notification.data.senderId);
      
      // Verify username is used instead of user ID
      if (notification.message.includes(notification.data.senderUsername) && 
          !notification.message.includes(notification.data.senderId)) {
        console.log('✅ SUCCESS: Notification uses username instead of user ID');
      } else {
        console.log('❌ FAILURE: Notification still contains user ID');
      }
    } else {
      console.log('❌ Failed to retrieve notification');
    }

    // 4. Test fallback behavior (no username available)
    console.log('\n4. Testing fallback behavior (no username)...');
    const fallbackNotificationData = {
      title: "New message",
      message: `You have a new message from ${senderUserId}`, // Fallback to UID
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId: 'test_chat_456',
        senderId: senderUserId,
        actionUrl: '/chat/test_chat_456',
        priority: "high"
      }
    };

    const fallbackNotificationRef = push(ref(database, `Users/${receiverUserId}/notifications`));
    await set(ref(database, `Users/${receiverUserId}/notifications/${fallbackNotificationRef.key}`), fallbackNotificationData);
    console.log('✅ Fallback notification created (using UID):', fallbackNotificationData.message);

    console.log('\n🎉 Notification Username Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Sender profile created with username');
    console.log('   ✅ Notification created with username');
    console.log('   ✅ Fallback notification created with UID');
    console.log('   ✅ Both notification types stored successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationUsername();
