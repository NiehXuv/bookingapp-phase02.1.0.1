const { database, get } = require("../../config/firebaseconfig.js");

async function getFavorites(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type } = req.query; // Optional filter by type

    const favoritesRef = `Users/${uid}`/favorites;
    const snapshot = await get(favoritesRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No favorites found",
        favorites: {
          hotels: [],
          places: [],
          tours: []
        }
      });
    }

    let favorites = snapshot.val();

    // Initialize arrays if they don't exist
    if (!favorites.hotels) favorites.hotels = [];
    if (!favorites.places) favorites.places = [];
    if (!favorites.tours) favorites.tours = [];

    // Filter by type if provided
    if (type) {
      if (!favorites[type]) {
        return res.status(400).json({ error: "Invalid favorite type" });
      }
      
      favorites = {
        [type]: favorites[type]
      };
    }

    res.status(200).json({
      message: "Favorites retrieved successfully",
      favorites: favorites,
      counts: {
        hotels: favorites.hotels ? favorites.hotels.length : 0,
        places: favorites.places ? favorites.places.length : 0,
        tours: favorites.tours ? favorites.tours.length : 0
      }
    });

  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getFavorites };
