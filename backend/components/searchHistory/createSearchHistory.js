const { database, ref, set, push } = require("../../config/firebaseconfig.js");

async function createSearchHistory(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      query,
      type,
      results
    } = req.body;

    if (!query || !type) {
      return res.status(400).json({ error: "Query and type are required" });
    }

    // Validate search type
    const validTypes = ["hotel", "place", "tour", "transport"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid search type" });
    }

    const searchHistoryData = {
      query,
      type,
      timestamp: Date.now(),
      results: results || 0
    };

    // Create new search history entry with auto-generated ID
    const searchHistoryRef = `Users/${uid}`/searchHistory;
    const newSearchRef = push(searchHistoryRef);
    const searchId = newSearchRef.key;

    await set(newSearchRef, searchHistoryData);

    res.status(201).json({
      message: "Search history created successfully",
      searchId: searchId,
      searchHistory: searchHistoryData
    });

  } catch (error) {
    console.error("Error creating search history:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { createSearchHistory };
