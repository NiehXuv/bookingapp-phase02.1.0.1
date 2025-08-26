const { database, get, set } = require("../../config/firebaseconfig.js");

async function addToFavorites(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      type,
      itemId,
      contentData
    } = req.body;

    if (!type || !itemId) {
      return res.status(400).json({ error: "Type and item ID are required" });
    }

    // Validate favorite type
    const validTypes = ["hotels", "places", "tours", "content"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid favorite type" });
    }

    // Get existing favorites
    const favoritesRef = `Users/${uid}/favorites`;
    const snapshot = await get(favoritesRef);

    let favorites = {};
    if (snapshot.exists()) {
      favorites = snapshot.val() || {};
    }

    // Initialize arrays if they don't exist
    if (!favorites[type]) {
      favorites[type] = [];
    }

    // For content type, store the full content data
    if (type === "content") {
      // Check if item is already in favorites
      const existingIndex = favorites[type].findIndex(item => item.id === itemId);
      if (existingIndex !== -1) {
        return res.status(400).json({ error: "Item is already in favorites" });
      }
      
      // Add content data to favorites
      favorites[type].push(contentData || { id: itemId });
    } else {
      // Check if item is already in favorites
      if (favorites[type].includes(itemId)) {
        return res.status(400).json({ error: "Item is already in favorites" });
      }
      
      // Add item to favorites
      favorites[type].push(itemId);
    }

    // Update favorites in database
    await set(favoritesRef, favorites);

    res.status(200).json({
      message: "Item added to favorites successfully",
      favorites: favorites
    });

  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { addToFavorites };
