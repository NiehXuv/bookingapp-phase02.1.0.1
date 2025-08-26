const { database, ref, get, update } = require("../../config/firebaseconfig.js");

async function markChatAsRead(req, res) {
  try {
    const { uid } = req.user;
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Verify user is part of this chat
    const chatRef = ref(database, `Users/${uid}/chats/${chatId}`);
    const chatSnapshot = await get(chatRef);

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Mark all messages in this chat as read for the current user
    const messagesRef = ref(database, `Users/${uid}/messages`);
    const messagesSnapshot = await get(messagesRef);

    if (messagesSnapshot.exists()) {
      const messages = messagesSnapshot.val();
      const updates = {};
      let hasUnreadMessages = false;

      // Handle case where messages might be null or undefined
      if (messages && typeof messages === 'object') {
        for (const [messageId, message] of Object.entries(messages)) {
          // Add safety checks for message structure
          if (message && 
              message.chatId === chatId && 
              message.readBy && 
              Array.isArray(message.readBy) && 
              !message.readBy.includes(uid)) {
            updates[`${messageId}/readBy`] = [...message.readBy, uid];
            hasUnreadMessages = true;
          }
        }
      }

      if (hasUnreadMessages) {
        try {
          // Update messages to mark as read
          await update(ref(database, `Users/${uid}/messages`), updates);
          
          // Reset unread count for this chat
          await update(ref(database, `Users/${uid}/chats/${chatId}`), {
            unreadCount: 0
          });

          res.status(200).json({ 
            message: "Chat marked as read",
            messagesUpdated: Object.keys(updates).length
          });
        } catch (updateError) {
          console.error("Error updating messages/chat:", updateError);
          res.status(500).json({ error: "Failed to update chat status" });
          return;
        }
      } else {
        res.status(200).json({ 
          message: "Chat already marked as read",
          messagesUpdated: 0
        });
      }
    } else {
      // No messages found, just reset unread count
      try {
        await update(ref(database, `Users/${uid}/chats/${chatId}`), {
          unreadCount: 0
        });
        
        res.status(200).json({ 
          message: "Chat marked as read (no messages)",
          messagesUpdated: 0
        });
      } catch (updateError) {
        console.error("Error updating chat unread count:", updateError);
        res.status(500).json({ error: "Failed to update chat status" });
        return;
      }
    }

  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { markChatAsRead };
