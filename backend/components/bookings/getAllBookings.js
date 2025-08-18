const { database } = require("../../config/firebaseconfig.js");
const { ref, get } = require("firebase/database");

async function getAllBookings(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type, status } = req.query; // Optional filters

    const bookingsRef = ref(database, `Users/${uid}/bookings`);
    const snapshot = await get(bookingsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({
        message: "No bookings found",
        bookings: []
      });
    }

    let bookings = [];
    snapshot.forEach((childSnapshot) => {
      const bookingId = childSnapshot.key;
      const bookingData = childSnapshot.val();
      
      // Filter by type if provided
      if (type && bookingData.type !== type) {
        return;
      }
      
      // Filter by status if provided
      if (status && bookingData.status !== status) {
        return;
      }
      
      bookings.push({
        bookingId: bookingId,
        ...bookingData
      });
    });

    res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error("Error getting bookings:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { getAllBookings };
