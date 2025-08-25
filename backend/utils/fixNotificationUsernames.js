const { database, ref, get, set, update } = require("../config/firebaseconfig.js");

/**
 * Utility to fix existing notifications that contain user IDs instead of usernames
 * This script will:
 * 1. Find all notifications with user IDs in the message
 * 2. Fetch the actual username from the user's profile
 * 3. Update the notification with the proper username
 */
async function fixNotificationUsernames() {
  try {
    console.log('🔧 Starting Notification Username Fix...\n');

    // Get all users
    const usersRef = ref(database, 'Users');
    const usersSnapshot = await get(usersRef);

    if (!usersSnapshot.exists()) {
      console.log('❌ No users found in database');
      return;
    }

    const users = usersSnapshot.val();
    let totalNotificationsFixed = 0;
    let totalNotificationsChecked = 0;

    // Iterate through each user
    for (const [userId, userData] of Object.entries(users)) {
      console.log(`\n👤 Processing user: ${userId}`);
      
      // Check if user has notifications
      if (!userData.notifications) {
        console.log('   ⏭️  No notifications found');
        continue;
      }

      const notifications = userData.notifications;
      let userNotificationsFixed = 0;

      // Check each notification
      for (const [notificationId, notification] of Object.entries(notifications)) {
        totalNotificationsChecked++;
        
        // Check if notification message contains user ID pattern
        if (notification.message && notification.message.includes('user_')) {
          console.log(`   🔍 Found notification with user ID: ${notification.message}`);
          
          try {
            // Extract user ID from message (assuming format: "You have a new message from user_123...")
            const userIDMatch = notification.message.match(/user_[a-zA-Z0-9_]+/);
            if (userIDMatch) {
              const extractedUserId = userIDMatch[0];
              console.log(`   📝 Extracted user ID: ${extractedUserId}`);
              
              // Fetch the actual username from the user's profile
              const profileRef = ref(database, `Users/${extractedUserId}/profile`);
              const profileSnapshot = await get(profileRef);
              
              if (profileSnapshot.exists()) {
                const profile = profileSnapshot.val();
                const username = profile.username || extractedUserId;
                
                // Update the notification message
                const updatedMessage = notification.message.replace(
                  /user_[a-zA-Z0-9_]+/g, 
                  username
                );
                
                // Update notification data
                const updatedNotification = {
                  ...notification,
                  message: updatedMessage,
                  data: {
                    ...notification.data,
                    senderUsername: username
                  }
                };
                
                // Save updated notification
                await set(ref(database, `Users/${userId}/notifications/${notificationId}`), updatedNotification);
                
                console.log(`   ✅ Fixed: "${notification.message}" → "${updatedMessage}"`);
                userNotificationsFixed++;
                totalNotificationsFixed++;
              } else {
                console.log(`   ⚠️  User profile not found for ${extractedUserId}, keeping original message`);
              }
            }
          } catch (error) {
            console.error(`   ❌ Error fixing notification ${notificationId}:`, error.message);
          }
        }
      }
      
      if (userNotificationsFixed > 0) {
        console.log(`   🎯 Fixed ${userNotificationsFixed} notifications for this user`);
      }
    }

    console.log('\n🎉 Notification Username Fix Completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total notifications checked: ${totalNotificationsChecked}`);
    console.log(`   - Total notifications fixed: ${totalNotificationsFixed}`);
    
    if (totalNotificationsFixed > 0) {
      console.log('\n💡 All existing notifications have been updated with proper usernames!');
    } else {
      console.log('\n✨ No notifications needed fixing - all are already using usernames!');
    }

  } catch (error) {
    console.error('❌ Error during notification fix:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixNotificationUsernames();
}

module.exports = { fixNotificationUsernames };
