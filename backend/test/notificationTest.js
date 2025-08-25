const { database, ref, get, set, push } = require('../config/firebaseconfig');

async function testNotifications() {
  try {
    console.log('🧪 Testing Notification System...\n');

    // Test user ID (you can change this to a real user ID)
    const testUserId = 'test_user_123';
    
    // 1. Test creating a notification
    console.log('1. Creating test notification...');
    const notificationData = {
      title: 'Test Notification',
      message: 'This is a test notification message',
      type: 'system',
      read: false,
      createdAt: Date.now(),
      data: {
        priority: 'normal'
      }
    };

    const notificationsRef = `Users/${testUserId}/notifications`;
    const newNotificationRef = push(ref(database, notificationsRef));
    const notificationId = newNotificationRef.key;

    await set(ref(database, `${notificationsRef}/${notificationId}`), notificationData);
    console.log('✅ Test notification created with ID:', notificationId);

    // 2. Test retrieving notifications
    console.log('\n2. Retrieving notifications...');
    const snapshot = await get(ref(database, notificationsRef));
    
    if (snapshot.exists()) {
      const notifications = snapshot.val();
      console.log('✅ Found notifications:', Object.keys(notifications).length);
      
      // Display notification details
      Object.entries(notifications).forEach(([id, notification]) => {
        console.log(`   - ID: ${id}`);
        console.log(`     Title: ${notification.title}`);
        console.log(`     Message: ${notification.message}`);
        console.log(`     Type: ${notification.type}`);
        console.log(`     Read: ${notification.read}`);
        console.log(`     Created: ${new Date(notification.createdAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No notifications found');
    }

    // 3. Test notification types
    console.log('3. Testing different notification types...');
    const testTypes = ['booking', 'reminder', 'promotion', 'system', 'chat'];
    
    for (const type of testTypes) {
      const typeNotificationData = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        message: `This is a ${type} notification`,
        type: type,
        read: false,
        createdAt: Date.now(),
        data: {
          priority: type === 'chat' ? 'high' : 'normal'
        }
      };

      const typeNotificationRef = push(ref(database, notificationsRef));
      const typeNotificationId = typeNotificationRef.key;
      
      await set(ref(database, `${notificationsRef}/${typeNotificationId}`), typeNotificationData);
      console.log(`✅ Created ${type} notification: ${typeNotificationId}`);
    }

    console.log('\n🎉 Notification system test completed successfully!');
    console.log(`📱 Created ${testTypes.length + 1} test notifications for user: ${testUserId}`);

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }
}

// Run the test
testNotifications();

