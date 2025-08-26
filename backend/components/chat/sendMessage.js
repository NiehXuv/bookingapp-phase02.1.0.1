const { database, ref, set, push, get, update } = require("../../config/firebaseconfig.js");

async function sendMessage(req, res) {
  try {
    const { uid } = req.user;
    const { chatId, content, type = "text" } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ error: "Chat ID and content are required" });
    }

    // Validate message type
    const validTypes = ["text", "image", "file", "location"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid message type" });
    }

    // First, verify the chat exists and get participants with fallbacks
    let chat = null;
    let otherParticipantId = null;
    
    try {
      const chatRef = ref(database, `Users/${uid}/chats/${chatId}`);
      const chatSnapshot = await get(chatRef);
      
      if (chatSnapshot.exists()) {
        chat = chatSnapshot.val();
        if (chat && chat.participants && Array.isArray(chat.participants)) {
          otherParticipantId = chat.participants.find(id => id !== uid);
        }
      }
    } catch (error) {
      console.log(`Error getting chat ${chatId} for user ${uid}:`, error.message);
    }
    
    // If chat not found, try to create it automatically
    if (!chat || !otherParticipantId) {
      try {
        // Try to extract participant ID from chatId (assuming format: user1_user2)
        const participantIds = chatId.split('_');
        if (participantIds.length === 2) {
          otherParticipantId = participantIds.find(id => id !== uid);
          
          if (otherParticipantId) {
            // Create basic chat structure
            chat = {
              participants: [uid, otherParticipantId],
              lastMessage: "",
              lastMessageTime: Date.now(),
              unreadCount: 0,
              createdAt: Date.now()
            };
            
            // Create chat for both participants
            await Promise.all([
              set(ref(database, `Users/${uid}/chats/${chatId}`), chat),
              set(ref(database, `Users/${otherParticipantId}/chats/${chatId}`), chat)
            ]);
            
            console.log(`Auto-created chat ${chatId} for users ${uid} and ${otherParticipantId}`);
          }
        }
      } catch (createError) {
        console.error('Failed to auto-create chat:', createError);
        return res.status(404).json({ error: "Chat not found and could not be created" });
      }
    }
    
    if (!chat || !otherParticipantId) {
      return res.status(404).json({ error: "Chat not found and could not be created" });
    }

    const messageData = {
      chatId,
      senderId: uid,
      content,
      type,
      timestamp: Date.now(),
      readBy: [uid] // Sender has read their own message
    };

    // Create message in sender's messages
    const newMessageRef = push(ref(database, `Users/${uid}/messages`));
    const messageId = newMessageRef.key;

    await set(ref(database, `Users/${uid}/messages/${messageId}`), messageData);

    // Create message in other participant's messages (for consistency)
    await set(ref(database, `Users/${otherParticipantId}/messages/${messageId}`), messageData);

    // Update chat metadata for both participants
    const chatUpdate = {
      lastMessage: content,
      lastMessageTime: Date.now(),
      unreadCount: 0 // Reset for sender
    };

    // Update sender's chat
    await update(ref(database, `Users/${uid}/chats/${chatId}`), chatUpdate);

    // Update other participant's chat with incremented unread count
    await update(ref(database, `Users/${otherParticipantId}/chats/${chatId}`), {
      lastMessage: content,
      lastMessageTime: Date.now(),
      unreadCount: (chat.unreadCount || 0) + 1
    });

    // Create notification for other participant
    // Get sender's username for the notification
    let senderUsername = uid; // Fallback to UID if username not found
    
    try {
      const senderProfileRef = ref(database, `Users/${uid}/profile`);
      const senderProfileSnapshot = await get(senderProfileRef);
      if (senderProfileSnapshot.exists()) {
        const senderProfile = senderProfileSnapshot.val();
        senderUsername = senderProfile.username || uid;
      }
    } catch (profileError) {
      console.log('Could not fetch sender profile, using UID as fallback');
    }
    
    const notificationData = {
      title: "New message",
      message: `You have a new message from ${senderUsername}`,
      type: "chat",
      read: false,
      createdAt: Date.now(),
      data: {
        chatId,
        senderId: uid,
        senderUsername: senderUsername,
        actionUrl: `/chat/${chatId}`,
        priority: "high"
      }
    };

    const notificationRef = push(ref(database, `Users/${otherParticipantId}/notifications`));
    await set(ref(database, `Users/${otherParticipantId}/notifications/${notificationRef.key}`), notificationData);

    res.status(201).json({
      message: "Message sent successfully",
      messageId,
      data: messageData
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { sendMessage };
