const { database, ref, get, query, orderByChild, startAt, endAt } = require("../../config/firebaseconfig.js");

async function searchUsers(req, res) {
  try {
    const { uid } = req.user;
    const { query: searchQuery, limit = 20 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters long" });
    }

    const searchTerm = searchQuery.trim().toLowerCase();
    
    // Get all users (in a real app, you'd want to implement proper search indexing)
    const usersRef = ref(database, 'Users');
    const usersSnapshot = await get(usersRef);

    if (!usersSnapshot.exists()) {
      return res.status(200).json({ users: [] });
    }

    const users = usersSnapshot.val();
    const userList = [];

    for (const [userId, userData] of Object.entries(users)) {
      // Skip current user
      if (userId === uid) continue;

      // Check if user has profile data
      if (userData.profile) {
        const profile = userData.profile;
        const username = profile.username || '';
        const email = profile.email || '';

        // Check if search term matches username or email
        if (username.toLowerCase().includes(searchTerm) || 
            email.toLowerCase().includes(searchTerm)) {
          
          userList.push({
            uid: userId,
            username: username,
            email: email,
            avatar: profile.avatar || null,
            country: profile.country || null
          });
        }
      }
    }

    // Sort by relevance (username matches first, then email matches)
    userList.sort((a, b) => {
      const aUsernameMatch = a.username.toLowerCase().includes(searchTerm);
      const bUsernameMatch = b.username.toLowerCase().includes(searchTerm);
      
      if (aUsernameMatch && !bUsernameMatch) return -1;
      if (!aUsernameMatch && bUsernameMatch) return 1;
      
      return a.username.localeCompare(b.username);
    });

    // Limit results
    const limitedResults = userList.slice(0, parseInt(limit));

    res.status(200).json({ users: limitedResults });

  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { searchUsers };
