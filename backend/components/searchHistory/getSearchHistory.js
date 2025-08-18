const { database } = require("../../config/firebaseconfig.js");
const { ref, get } = require("firebase/database");

async function getSearchHistory(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type, limit = 50 } = req.query; // Optional filters

    const searchHistoryRef = ref(database, `Users/${uid}/searchHistory`);
    const snapshot = await get(searchHistoryRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No search history found",
        searchHistory: []
      });
    }

    let searchHistory = [];
    snapshot.forEach((childSnapshot) => {
      const searchId = childSnapshot.key;
      const searchData = childSnapshot.val();
      
      // Filter by type if provided
      if (type && searchData.type !== type) {
        return;
      }
      
      searchHistory.push({
        searchId: searchId,
        ...searchData
      });
    });

    // Sort by timestamp (newest first) and limit results
    searchHistory.sort((a, b) => b.timestamp - a.timestamp);
    searchHistory = searchHistory.slice(0, parseInt(limit));

    res.status(200).json({
      message: "Search history retrieved successfully",
      searchHistory: searchHistory,
      count: searchHistory.length
    });

  } catch (error) {
    console.error("Error getting search history:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getSearchHistory };
