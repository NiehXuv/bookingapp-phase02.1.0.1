const { database, get, set } = require("../../config/firebaseconfig.js");

async function removeFromFavorites(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const {
      type,
      itemId
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

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "No favorites found" });
    }

    let favorites = snapshot.val() || {};

    // Check if type exists in favorites
    if (!favorites[type] || !Array.isArray(favorites[type])) {
      return res.status(404).json({ error: "Favorite type not found" });
    }

    // Check if item is in favorites
    if (type === "content") {
      const existingIndex = favorites[type].findIndex(item => item.id === itemId);
      if (existingIndex === -1) {
        return res.status(404).json({ error: "Item not found in favorites" });
      }
      
      // Remove content item from favorites
      favorites[type].splice(existingIndex, 1);
    } else {
      if (!favorites[type].includes(itemId)) {
        return res.status(404).json({ error: "Item not found in favorites" });
      }
      
      // Remove item from favorites
      favorites[type] = favorites[type].filter(id => id !== itemId);
    }

    // Update favorites in database
    await set(favoritesRef, favorites);

    res.status(200).json({
      message: "Item removed from favorites successfully",
      favorites: favorites
    });

  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { removeFromFavorites };
