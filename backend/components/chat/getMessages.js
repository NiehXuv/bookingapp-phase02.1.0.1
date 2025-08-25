const { database, ref, get, query, orderByChild, limitToLast } = require("../../config/firebaseconfig.js");

async function getMessages(req, res) {
  try {
    const { uid } = req.user;
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Verify user is part of this chat (but be lenient for new chats)
    let chatExists = false;
    try {
      const chatRef = ref(database, `Users/${uid}/chats/${chatId}`);
      const chatSnapshot = await get(chatRef);
      chatExists = chatSnapshot.exists();
    } catch (error) {
      console.log(`Error checking chat ${chatId} for user ${uid}:`, error.message);
      // Continue - this might be a new chat
    }

    // If chat doesn't exist, this might be a new chat - return empty messages instead of error
    if (!chatExists) {
      console.log(`Chat ${chatId} not found for user ${uid} - returning empty messages for new chat`);
      return res.status(200).json({ 
        messages: [],
        count: 0,
        message: "Chat not found - this is normal for new chats"
      });
    }

    // Get messages for this chat with comprehensive fallbacks
    let messageList = [];
    
    try {
      const messagesRef = ref(database, `Users/${uid}/messages`);
      
      // First, try to get messages with query
      try {
        const messagesQuery = query(
          messagesRef,
          orderByChild('chatId'),
          limitToLast(parseInt(limit))
        );

        const messagesSnapshot = await get(messagesQuery);

        if (messagesSnapshot.exists()) {
          const messages = messagesSnapshot.val();
          
          // Filter messages by chatId and format them
          for (const [messageId, message] of Object.entries(messages)) {
            if (message && message.chatId === chatId) {
              messageList.push({
                id: messageId,
                ...message
              });
            }
          }
        }
      } catch (queryError) {
        console.log(`Query failed for chat ${chatId}, trying direct access:`, queryError.message);
        
        // Fallback: try to get all messages and filter manually
        try {
          const messagesSnapshot = await get(messagesRef);
          if (messagesSnapshot.exists()) {
            const messages = messagesSnapshot.val();
            
            // Filter messages by chatId and format them
            for (const [messageId, message] of Object.entries(messages)) {
              if (message && message.chatId === chatId) {
                messageList.push({
                  id: messageId,
                  ...message
                });
              }
            }
          }
        } catch (directError) {
          console.log(`Direct access also failed for chat ${chatId}:`, directError.message);
        }
      }
      
      // Sort by timestamp (oldest first) if we have messages
      if (messageList.length > 0) {
        messageList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      }
      
    } catch (error) {
      console.log(`Complete failure getting messages for chat ${chatId}:`, error.message);
      // Return empty array - this is normal for new chats
    }

    // Sort by timestamp (oldest first)
    messageList.sort((a, b) => a.timestamp - b.timestamp);

    res.status(200).json({ 
      messages: messageList,
      count: messageList.length
    });

  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getMessages };
