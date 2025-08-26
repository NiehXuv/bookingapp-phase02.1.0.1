const { database, ref, set, push, get } = require("../../config/firebaseconfig.js");

async function createChat(req, res) {
  try {
    const { uid } = req.user;
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length !== 2) {
      return res.status(400).json({ error: "Exactly 2 participant IDs are required" });
    }

    // Ensure current user is one of the participants
    if (!participantIds.includes(uid)) {
      return res.status(400).json({ error: "You must be one of the participants" });
    }

    // Sort participant IDs for consistent chat ID generation
    const sortedParticipantIds = participantIds.sort();
    const chatKey = `${sortedParticipantIds[0]}_${sortedParticipantIds[1]}`;

    // Check if chat already exists for current user with fallbacks
    let existingChat = null;
    
    try {
      const existingChatsRef = ref(database, `Users/${uid}/chats`);
      const existingChats = await get(existingChatsRef);
      
      if (existingChats.exists()) {
        const chats = existingChats.val();
        if (chats && typeof chats === 'object') {
          Object.entries(chats).forEach(([chatId, chat]) => {
            if (chat && chat.participants && Array.isArray(chat.participants)) {
              if (chat.participants.includes(participantIds.find(id => id !== uid))) {
                existingChat = { chatId, ...chat };
              }
            }
          });
        }
      }
    } catch (error) {
      console.log(`Error checking existing chats for user ${uid}:`, error.message);
      // Continue with chat creation even if check fails
    }

    if (existingChat) {
      return res.status(200).json({
        message: "Chat already exists",
        chat: existingChat
      });
    }

    // Create new chat with consistent ID
    const chatData = {
      participants: participantIds,
      lastMessage: "",
      lastMessageTime: Date.now(),
      unreadCount: 0,
      createdAt: Date.now(),
      chatKey: chatKey // Store the consistent chat key
    };

    // Create chat for both participants using the same chat ID
    const otherParticipantId = participantIds.find(id => id !== uid);
    
    await Promise.all([
      set(ref(database, `Users/${uid}/chats/${chatKey}`), chatData),
      set(ref(database, `Users/${otherParticipantId}/chats/${chatKey}`), chatData)
    ]);

    res.status(201).json({
      message: "Chat created successfully",
      chatId: chatKey,
      chat: chatData
    });

  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { createChat };
