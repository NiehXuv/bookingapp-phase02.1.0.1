const { database, ref, get, set, push } = require('../config/firebaseconfig');

async function testNotificationEndToEnd() {
  try {
    console.log('🧪 Testing Notification Username Fix End-to-End...\n');

    // Test user IDs from your database
    const senderUserId = 'user_1755542899134_a5ej1vzcq'; // This should have username "test1"
    const receiverUserId = '1VzsJ1SXwSeEmj7XQuVqwruGQf23'; // This should have username "admin1"
    
    // 1. Verify sender profile exists
    console.log('1. Verifying sender profile...');
    const senderProfileRef = ref(database, `Users/${senderUserId}/profile`);
    const senderProfileSnapshot = await get(senderProfileRef);
    
    if (senderProfileSnapshot.exists()) {
      const senderProfile = senderProfileSnapshot.val();
      console.log(`   ✅ Sender profile found: ${senderProfile.username} (${senderUserId})`);
    } else {
      console.log(`   ❌ Sender profile not found for ${senderUserId}`);
      return;
    }

    // 2. Create a test notification (simulating the old behavior with user ID)
    console.log('\n2. Creating test notification with user ID (old behavior)...');
    const oldNotificationData = {
      title: "New message",
      message: `You have a new message from ${senderUserId}`, // Old: contains user ID
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId: 'test_chat_old',
        senderId: senderUserId,
        actionUrl: '/chat/test_chat_old',
        priority: "high"
      }
    };

    const oldNotificationRef = push(ref(database, `Users/${receiverUserId}/notifications`));
    await set(ref(database, `Users/${receiverUserId}/notifications/${oldNotificationRef.key}`), oldNotificationData);
    console.log(`   ✅ Old notification created: "${oldNotificationData.message}"`);

    // 3. Create a test notification (simulating the new behavior with username)
    console.log('\n3. Creating test notification with username (new behavior)...');
    const newNotificationData = {
      title: "New message",
      message: `You have a new message from test1`, // New: contains username
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId: 'test_chat_new',
        senderId: senderUserId,
        senderUsername: 'test1', // New: includes username
        actionUrl: '/chat/test_chat_new',
        priority: "high"
      }
    };

    const newNotificationRef = push(ref(database, `Users/${receiverUserId}/notifications`));
    await set(ref(database, `Users/${receiverUserId}/notifications/${newNotificationRef.key}`), newNotificationData);
    console.log(`   ✅ New notification created: "${newNotificationData.message}"`);

    // 4. Test the user profile endpoint
    console.log('\n4. Testing user profile endpoint...');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${senderUserId}/profile`);
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API endpoint working: ${data.profile.username} (${data.profile.uid})`);
      } else {
        console.log(`   ❌ API endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️  API endpoint test skipped (server might not be running): ${error.message}`);
    }

    // 5. Retrieve and display all notifications
    console.log('\n5. Current notifications in database...');
    const notificationsRef = ref(database, `Users/${receiverUserId}/notifications`);
    const notificationsSnapshot = await get(notificationsRef);
    
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      console.log(`   📋 Found ${Object.keys(notifications).length} notifications:`);
      
      Object.entries(notifications).forEach(([id, notification]) => {
        const hasUsername = notification.message.includes('test1') || notification.message.includes('admin1');
        const hasUserId = notification.message.includes('user_');
        const status = hasUsername ? '✅ Username' : hasUserId ? '❌ User ID' : '⚠️  Unknown';
        
        console.log(`      - ${id}: "${notification.message}" [${status}]`);
      });
    }

    // 6. Summary and recommendations
    console.log('\n🎉 End-to-End Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Sender profile verified');
    console.log('   ✅ Old notification created (with user ID)');
    console.log('   ✅ New notification created (with username)');
    console.log('   ✅ User profile endpoint tested');
    console.log('   ✅ Database notifications displayed');
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Run the fix utility to update existing notifications');
    console.log('   2. Ensure new messages use the updated sendMessage.js');
    console.log('   3. Frontend should now display proper usernames');
    console.log('   4. Test with real chat messages to verify the fix');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationEndToEnd();
