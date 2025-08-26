const { database, ref, get } = require("../../config/firebaseconfig.js");

async function getChats(req, res) {
  try {
    const { uid } = req.user;

    // Get user's chats
    const chatsRef = ref(database, `Users/${uid}/chats`);
    const chatsSnapshot = await get(chatsRef);

    if (!chatsSnapshot.exists()) {
      return res.status(200).json({ chats: [] });
    }

    const chats = chatsSnapshot.val();
    const chatList = [];

    // Get chat details and participant information
    for (const [chatId, chat] of Object.entries(chats)) {
      const otherParticipantId = chat.participants.find(id => id !== uid);
      
      if (otherParticipantId) {
        // Get other participant's profile
        const userProfileRef = ref(database, `Users/${otherParticipantId}/profile`);
        const userProfileSnapshot = await get(userProfileRef);
        
        let participantInfo = {
          uid: otherParticipantId,
          username: 'Unknown User',
          avatar: null
        };

        if (userProfileSnapshot.exists()) {
          const profile = userProfileSnapshot.val();
          participantInfo = {
            uid: otherParticipantId,
            username: profile.username || 'Unknown User',
            avatar: profile.avatar || null
          };
        }

        chatList.push({
          id: chatId,
          ...chat,
          participant: participantInfo
        });
      }
    }

    // Sort by last message time (most recent first)
    chatList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    res.status(200).json({ chats: chatList });

  } catch (error) {
    console.error("Error getting chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getChats };
