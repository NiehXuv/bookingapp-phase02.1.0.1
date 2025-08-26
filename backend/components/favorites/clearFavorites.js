const { database, remove } = require("../../config/firebaseconfig.js");

async function clearFavorites(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type } = req.query; // Optional: clear specific type or all

    if (type) {
      // Clear specific type
      const validTypes = ["hotels", "places", "tours", "content"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid favorite type" });
      }

      const favoritesRef = `Users/${uid}/favorites/${type}`;
      await remove(favoritesRef);

      res.status(200).json({
        message: `${type} favorites cleared successfully`
      });
    } else {
      // Clear all favorites
      const favoritesRef = `Users/${uid}/favorites`;
      await remove(favoritesRef);

      res.status(200).json({
        message: "All favorites cleared successfully"
      });
    }

  } catch (error) {
    console.error("Error clearing favorites:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { clearFavorites };
