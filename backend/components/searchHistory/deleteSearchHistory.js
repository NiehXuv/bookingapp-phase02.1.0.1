const { database } = require("../../config/firebaseconfig.js");
const { ref, remove } = require("firebase/database");

async function deleteSearchHistory(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { searchId } = req.params;

    if (!searchId) {
      return res.status(400).json({ error: "Search ID is required" });
    }

    const searchHistoryRef = ref(database, `Users/${uid}/searchHistory/${searchId}`);
    
    // Delete the search history entry
    await remove(searchHistoryRef);

    res.status(200).json({
      message: "Search history deleted successfully",
      searchId: searchId
    });

  } catch (error) {
    console.error("Error deleting search history:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { deleteSearchHistory };
