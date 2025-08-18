const { database, remove } = require("../../config/firebaseconfig.js");

async function clearSearchHistory(req, res) {
  try {
    const { uid } = req.user; // From JWT token

    const searchHistoryRef = `Users/${uid}`/searchHistory;
    
    // Clear all search history
    await remove(searchHistoryRef);

    res.status(200).json({
      message: "Search history cleared successfully"
    });

  } catch (error) {
    console.error("Error clearing search history:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { clearSearchHistory };
