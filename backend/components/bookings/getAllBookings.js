const { database, get, ref } = require("../../config/firebaseconfig.js");

async function getAllBookings(req, res) {
  try {
    const { uid } = req.user; // From JWT token
    const { type, status } = req.query; // Optional filters

    const bookingsRef = `Users/${uid}/bookings`;
    const snapshot = await get(ref(database, bookingsRef));

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
